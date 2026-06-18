import { inngest } from "@/lib/inngest/client";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
function getOpenAI()    { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram: "Instagram: visual-first, 2200 char caption max, 3–5 relevant hashtags, strong first line hooks the scroll. Reels perform best.",
  tiktok:    "TikTok: hook in first 3 seconds, conversational caption under 150 chars, 3 trending hashtags, vertical video. Script should feel spontaneous.",
  facebook:  "Facebook: longer copy works (up to 500 chars), storytelling tone, one clear CTA, image or video with emotional pull.",
  news:      "Website news post: editorial article for the label's website. Well-structured, informative, 400–700 words. Use markdown. No hashtags.",
};

// image_needed is not persisted in content_pieces — approximate from content_type.
// Diverges from initial generation where Claude's plan flag is used per-piece.
function needsImage(contentType: string): boolean {
  return contentType === "image_post" || contentType === "story" || contentType === "reel";
}

export const regenerateCampaignPiece = inngest.createFunction(
  {
    id: "regenerate-campaign-piece",
    triggers: [{ event: "campaign/regenerate-piece.requested" }],
    retries: 2,
    onFailure: async ({ error, event }) => {
      const data = (event.data as unknown as { event: { data: { pieceId: string } } }).event.data;
      const supabase = createServiceClient();
      await supabase
        .from("content_pieces")
        .update({ status: "failed", error: `Regeneration failed: ${error.message}` })
        .eq("id", data.pieceId);
    },
  },
  async ({ event, step }) => {
    const { pieceId, campaignId } = event.data as { pieceId: string; campaignId: string | null };
    if (!campaignId) throw new Error(`Missing campaignId in event data for piece ${pieceId}`);

    // ── Step 1: Load piece + campaign ────────────────────────────────────────
    const context = await step.run("load-context", async () => {
      const supabase = createServiceClient();
      const [{ data: piece, error: pErr }, { data: campaign, error: cErr }] = await Promise.all([
        supabase.from("content_pieces").select("id, platform, content_type, video_mode").eq("id", pieceId).single(),
        supabase.from("content_campaigns").select("id, source_content, source_type").eq("id", campaignId).single(),
      ]);
      if (pErr || !piece) throw new Error(`Piece not found: ${pieceId}`);
      if (cErr || !campaign) throw new Error(`Campaign not found: ${campaignId}`);
      return { piece, campaign };
    });

    const { piece, campaign } = context;
    // Derived once from the memoised step-1 result; shared across derive-angle and generate-content
    const platformGuide = PLATFORM_GUIDELINES[piece.platform] ?? piece.platform;

    // ── Step 2: Mark as generating ───────────────────────────────────────────
    await step.run("mark-generating", async () => {
      const supabase = createServiceClient();
      await supabase
        .from("content_pieces")
        .update({ status: "generating", error: null })
        .eq("id", pieceId);
    });

    // ── Step 3: Derive a fresh creative angle ────────────────────────────────
    const angle: string = await step.run("derive-angle", async () => {
      const msg = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 150,
        messages: [{
          role: "user",
          content: `You are a content strategist for One Flame Records, a Jamaican reggae/dancehall label. Generate a single creative angle for a ${piece.content_type.replace(/_/g, " ")} on ${piece.platform}.

Platform guide: ${platformGuide}
Source material:
<source>
${campaign.source_content.slice(0, 600)}
</source>

Return one sentence only. No explanation, no punctuation at the end.`,
        }],
      });
      return msg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
    });

    // ── Step 4: Generate piece content ───────────────────────────────────────
    // Throws on any failure so Inngest retries the step; onFailure marks the piece "failed"
    // after all retries are exhausted. Returns true on success to gate step 5.
    const contentGenerated: boolean = await step.run("generate-content", async () => {
      const supabase = createServiceClient();

      // ── News post ────────────────────────────────────────────────────────
      if (piece.platform === "news") {
        const articleMsg = await getAnthropic().messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: "You write editorial articles for One Flame Records, a Jamaican reggae/dancehall label based in Montego Bay. Voice: authentic, culturally grounded, engaging. Not corporate.",
          messages: [{
            role: "user",
            content: `Write a news article for the One Flame Records website.

Creative angle: ${angle}
Source material:
<source>
${campaign.source_content.slice(0, 1000)}
</source>

Return JSON with two keys:
- "title": a compelling article headline (max 80 chars)
- "body": the full article in markdown (400–700 words, use ## subheadings where appropriate)

Raw JSON only. No code fences.`,
          }],
        });

        const artRaw = articleMsg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
        const artStripped = artRaw.replace(/```(?:json)?/g, "").trim();
        const artStart = artStripped.indexOf("{");
        if (artStart === -1) throw new Error(`Claude returned no JSON for news article: ${artStripped.slice(0, 150)}`);
        const artJson = JSON.parse(artStripped.slice(artStart));

        await supabase.from("content_pieces").update({
          caption:      artJson.title ?? angle,
          video_script: artJson.body ?? "",
          hashtags:     [],
          image_url:    null,
          status:       "ready",
        }).eq("id", pieceId);
        return true;
      }

      // ── Social post ──────────────────────────────────────────────────────

      // Caption + hashtags
      const captionMsg = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: "You are a social media copywriter for One Flame Records, a Jamaican reggae/dancehall label. Write authentic, culturally grounded content. Never corporate or generic.",
        messages: [{
          role: "user",
          content: `Write a ${piece.content_type.replace(/_/g, " ")} caption for ${piece.platform.charAt(0).toUpperCase() + piece.platform.slice(1)}.

Platform guide: ${platformGuide}
Creative angle: ${angle}
Source material:
<source>
${campaign.source_content.slice(0, 800)}
</source>

Return JSON with two keys: "caption" (the post text, no hashtags) and "hashtags" (array of 3–5 strings without # symbol). Nothing else.`,
        }],
      });

      const captionRaw = captionMsg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
      const captionStripped = captionRaw.replace(/```(?:json)?/g, "").trim();
      const captionStart = captionStripped.indexOf("{");
      if (captionStart === -1) throw new Error(`Claude returned no JSON for caption: ${captionStripped.slice(0, 150)}`);
      const captionJson = JSON.parse(captionStripped.slice(captionStart));
      const caption: string    = captionJson.caption ?? "";
      const hashtags: string[] = captionJson.hashtags ?? [];

      // Video script
      let video_script: string | null = null;
      if (piece.video_mode === "script" || piece.video_mode === "generated") {
        const scriptMsg = await getAnthropic().messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          system: "You write short-form video scripts for One Flame Records social content. Scripts should feel authentic, energetic, and culturally rooted in Jamaican music.",
          messages: [{
            role: "user",
            content: `Write a 30–60 second ${piece.platform} video script.
Creative angle: ${angle}
Source:
<source>
${campaign.source_content.slice(0, 600)}
</source>

Format: Hook (first 3 seconds) / Body / CTA. Plain text, no JSON.`,
          }],
        });
        video_script = scriptMsg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
      }

      // AI image (failure is non-fatal — piece is still ready without an image)
      let image_url: string | null = null;
      if (needsImage(piece.content_type) && process.env.OPENAI_API_KEY) {
        const imgPrompt = `${angle}. Reggae/dancehall aesthetic, One Flame Records label from Montego Bay Jamaica. ${piece.platform === "instagram" || piece.platform === "facebook" ? "Square composition." : "Vertical composition."}`;
        const imgSize = piece.platform === "tiktok" ? "1024x1536" : "1024x1024";
        try {
          const response = await getOpenAI().images.generate({
            model: "gpt-image-1",
            prompt: imgPrompt,
            size: imgSize as "1024x1024" | "1024x1536",
            quality: "medium",
            n: 1,
          });
          const b64 = response.data?.[0]?.b64_json;
          if (b64) {
            const buffer = Buffer.from(b64, "base64");
            const storagePath = `ai-generated/campaign/${campaignId}/${pieceId}.png`;
            const { error: upErr } = await supabase.storage.from("public-media").upload(storagePath, buffer, { contentType: "image/png", upsert: true });
            if (!upErr) {
              const { data: pub } = supabase.storage.from("public-media").getPublicUrl(storagePath);
              image_url = pub.publicUrl;
              try { await supabase.from("ai_generated_images").insert({ url: image_url, prompt: imgPrompt, purpose: "campaign" }); } catch { /* ignore */ }
            }
          }
        } catch {
          // Image failure is non-fatal
        }
      }

      await supabase.from("content_pieces").update({
        caption,
        hashtags,
        video_script,
        image_url,
        status: "ready",
      }).eq("id", pieceId);

      return true;
    });

    // ── Step 5: Kick off video generation if needed ──────────────────────────
    if (piece.video_mode === "generated" && contentGenerated) {
      await step.sendEvent("queue-regen-video", {
        name: "campaign/video.requested" as const,
        data: { pieceId },
      });
    }
  }
);
