import { inngest } from "@/lib/inngest/client";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

// Initialize lazily inside steps so module-level eval doesn't fail at build time
function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
function getOpenAI()    { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

// ── Schema for the content plan Claude produces ───────────────────────────────

const PieceSchema = z.object({
  platform:     z.enum(["instagram", "tiktok", "facebook", "news"]),
  content_type: z.enum(["image_post", "video_post", "reel", "story", "text_post", "news_post"]),
  angle:        z.string(),
  image_needed: z.boolean(),
  video_mode:   z.enum(["script", "generated", "none"]).optional(),
});

const PlanSchema = z.array(PieceSchema);
type Piece = z.infer<typeof PieceSchema>;

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram: "Instagram: visual-first, 2200 char caption max, 3–5 relevant hashtags, strong first line hooks the scroll. Reels perform best.",
  tiktok:    "TikTok: hook in first 3 seconds, conversational caption under 150 chars, 3 trending hashtags, vertical video. Script should feel spontaneous.",
  facebook:  "Facebook: longer copy works (up to 500 chars), storytelling tone, one clear CTA, image or video with emotional pull.",
  news:      "Website news post: editorial article for the label's website. Well-structured, informative, 400–700 words. Use markdown. No hashtags.",
};

// ── Main Inngest function ─────────────────────────────────────────────────────

export const generateCampaign = inngest.createFunction(
  {
    id: "generate-campaign",
    triggers: [{ event: "campaign/generate.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { campaignId, platforms, piecesPerPlatform, video_mode } = event.data as {
      campaignId: string;
      platforms: string[];
      piecesPerPlatform: number;
      video_mode: "script" | "generated";
    };

    // ── Step 1: Load campaign ────────────────────────────────────────────────
    const campaign = await step.run("load-campaign", async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("content_campaigns")
        .select("id, title, source_type, source_content")
        .eq("id", campaignId)
        .single();
      if (error || !data) throw new Error(`Campaign not found: ${campaignId}`);
      return data;
    });

    // ── Step 2: Generate content plan ────────────────────────────────────────
    const plan: Piece[] = await step.run("plan-content", async () => {
      const supabase = createServiceClient();
      await supabase.from("content_campaigns").update({ status: "generating" }).eq("id", campaignId);

      const platformContext = (platforms as string[])
        .map((p) => PLATFORM_GUIDELINES[p] ?? p)
        .join("\n");

      const systemPrompt = `You are a social media content strategist for One Flame Records, an independent reggae and dancehall label from Montego Bay, Jamaica. Your job is to take source material and create a concrete content plan for their social channels. Voice: authentic, culturally grounded, not corporate. Always root content in Jamaican music culture.`;

      const userPrompt = `Source type: ${campaign.source_type}
Source content:
<source>
${campaign.source_content}
</source>

Target platforms and guidelines:
${platformContext}

Create a content plan with exactly ${piecesPerPlatform} piece(s) per platform (${piecesPerPlatform * platforms.length} total pieces).

Return a raw JSON array (no markdown, no code fences). Each object must use EXACTLY these field names and values:
- "platform": one of: "instagram", "tiktok", "facebook", "news" (lowercase, no capitals)
- "content_type": one of: "image_post", "video_post", "reel", "story", "text_post", "news_post" (use "news_post" for news platform pieces)
- "angle": one sentence of creative direction (use exactly this key name, not "creative_angle")
- "image_needed": true or false (false for news pieces)
- "video_mode": "${video_mode}" for video pieces, "none" for all others including news

Output only the JSON array. No explanation, no markdown, no code fences.`;

      const msg = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const raw = msg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
      const stripped = raw.replace(/```(?:json)?/g, "").trim();
      const jsonStr = stripped.startsWith("[") ? stripped : stripped.slice(stripped.indexOf("["));

      try {
        const parsed = JSON.parse(jsonStr);
        const normalized = (Array.isArray(parsed) ? parsed : []).map((item: Record<string, unknown>) => ({
          platform:     typeof item.platform === "string" ? item.platform.toLowerCase() : item.platform,
          content_type: item.content_type,
          angle:        item.angle ?? item.creative_angle ?? item.description ?? "",
          image_needed: item.image_needed ?? false,
          video_mode:   item.video_mode ?? "none",
        }));
        return PlanSchema.parse(normalized);
      } catch {
        throw new Error(`Claude returned invalid plan JSON: ${stripped.slice(0, 300)}`);
      }
    });

    // ── Step 3: Create piece rows in DB ──────────────────────────────────────
    const pieceIds: string[] = await step.run("create-pieces", async () => {
      const supabase = createServiceClient();
      const rows = plan.map((p, i) => ({
        campaign_id:  campaignId,
        platform:     p.platform,
        content_type: p.content_type,
        video_mode:   p.video_mode === "none" ? null : (p.video_mode ?? null),
        status:       "pending" as const,
        sort_order:   i,
      }));

      const { data, error } = await supabase.from("content_pieces").insert(rows).select("id");
      if (error) throw new Error(`Failed to create pieces: ${error.message}`);
      return (data ?? []).map((r) => r.id);
    });

    // ── Step 4: Generate each piece in parallel ───────────────────────────────
    await Promise.all(
      plan.map((piece, i) =>
        step.run(`generate-piece-${i}`, async () => {
          const pieceId = pieceIds[i];
          if (!pieceId) return;

          const supabase = createServiceClient();
          await supabase.from("content_pieces").update({ status: "generating" }).eq("id", pieceId);

          try {
            const platformGuide = PLATFORM_GUIDELINES[piece.platform] ?? piece.platform;

            // ── News post piece ──────────────────────────────────────────────
            if (piece.platform === "news") {
              const articleMsg = await getAnthropic().messages.create({
                model: "claude-sonnet-4-6",
                max_tokens: 1500,
                system: "You write editorial articles for One Flame Records, a Jamaican reggae/dancehall label based in Montego Bay. Voice: authentic, culturally grounded, engaging. Not corporate.",
                messages: [{
                  role: "user",
                  content: `Write a news article for the One Flame Records website.

Creative angle: ${piece.angle}
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
              const artJson = JSON.parse(artStripped.startsWith("{") ? artStripped : artStripped.slice(artStripped.indexOf("{")));

              await supabase.from("content_pieces").update({
                caption:      artJson.title ?? piece.angle,
                video_script: artJson.body ?? "",
                hashtags:     [],
                image_url:    null,
                status:       "ready",
              }).eq("id", pieceId);
              return;
            }

            // ── Social piece ─────────────────────────────────────────────────

            // ── Caption + hashtags ──
            const captionMsg = await getAnthropic().messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 512,
              system: "You are a social media copywriter for One Flame Records, a Jamaican reggae/dancehall label. Write authentic, culturally grounded content. Never corporate or generic.",
              messages: [{
                role: "user",
                content: `Write a ${piece.content_type.replace("_", " ")} caption for ${piece.platform.charAt(0).toUpperCase() + piece.platform.slice(1)}.

Platform guide: ${platformGuide}
Creative angle: ${piece.angle}
Source material summary:
<source>
${campaign.source_content.slice(0, 800)}
</source>

Return JSON with two keys: "caption" (the post text, no hashtags) and "hashtags" (array of 3–5 strings without # symbol). Nothing else.`,
              }],
            });

            const captionRaw = captionMsg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
            const captionStripped = captionRaw.replace(/```(?:json)?/g, "").trim();
            const captionJson = JSON.parse(captionStripped.startsWith("{") ? captionStripped : captionStripped.slice(captionStripped.indexOf("{")));
            const caption: string  = captionJson.caption ?? "";
            const hashtags: string[] = captionJson.hashtags ?? [];

            // ── Video script (if needed) ──
            // "generated" pieces also need a script — generate-campaign-video reads it to make scenes
            let video_script: string | null = null;
            if (piece.video_mode === "script" || piece.video_mode === "generated") {
              const scriptMsg = await getAnthropic().messages.create({
                model: "claude-sonnet-4-6",
                max_tokens: 512,
                system: "You write short-form video scripts for One Flame Records social content. Scripts should feel authentic, energetic, and culturally rooted in Jamaican music.",
                messages: [{
                  role: "user",
                  content: `Write a 30–60 second ${piece.platform} video script.
Creative angle: ${piece.angle}
Source:
<source>
${campaign.source_content.slice(0, 600)}
</source>

Format: Hook (first 3 seconds) / Body / CTA. Plain text, no JSON.`,
                }],
              });
              video_script = scriptMsg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
            }

            // ── AI image (if needed) ──
            let image_url: string | null = null;
            if (piece.image_needed && process.env.OPENAI_API_KEY) {
              const imgPrompt = `${piece.angle}. Reggae/dancehall aesthetic, One Flame Records label from Montego Bay Jamaica. ${piece.platform === "instagram" || piece.platform === "facebook" ? "Square composition." : "Vertical composition."}`;
              const imgSize = (piece.platform === "tiktok") ? "1024x1536" : "1024x1024";
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
                  const path   = `ai-generated/campaign/${campaignId}/${pieceId}.png`;
                  const { error: upErr } = await supabase.storage.from("public-media").upload(path, buffer, { contentType: "image/png", upsert: false });
                  if (!upErr) {
                    const { data: pub } = supabase.storage.from("public-media").getPublicUrl(path);
                    image_url = pub.publicUrl;
                    try { await supabase.from("ai_generated_images").insert({ url: image_url, prompt: imgPrompt, purpose: "campaign" }); } catch { /* ignore */ }
                  }
                }
              } catch {
                // Image generation failure doesn't fail the piece — caption still ready
              }
            }

            await supabase.from("content_pieces").update({
              caption,
              hashtags,
              video_script,
              image_url,
              status: "ready",
            }).eq("id", pieceId);

          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            await supabase.from("content_pieces").update({ status: "failed", error: msg }).eq("id", pieceId);
          }
        })
      )
    );

    // ── Step 5: Mark campaign as ready for review ─────────────────────────────
    await step.run("mark-review", async () => {
      const supabase = createServiceClient();
      const { data: pieces } = await supabase
        .from("content_pieces")
        .select("status")
        .eq("campaign_id", campaignId);

      const allFailed = pieces?.every((p) => p.status === "failed") ?? false;
      await supabase.from("content_campaigns").update({ status: allFailed ? "failed" : "review" }).eq("id", campaignId);
    });

    // ── Step 6: Kick off AI video generation for "generated" pieces ──────────
    const videoGenIds = plan
      .map((p, i) => ({ mode: p.video_mode, id: pieceIds[i] }))
      .filter(({ mode }) => mode === "generated")
      .map(({ id }) => id)
      .filter((id): id is string => Boolean(id));

    if (videoGenIds.length > 0) {
      await step.sendEvent(
        "queue-campaign-videos",
        videoGenIds.map((pieceId) => ({
          name: "campaign/video.requested" as const,
          data: { pieceId },
        }))
      );
    }
  }
);
