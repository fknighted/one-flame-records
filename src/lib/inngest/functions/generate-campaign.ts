import { inngest } from "@/lib/inngest/client";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Schema for the content plan Claude produces ───────────────────────────────

const PieceSchema = z.object({
  platform:     z.enum(["instagram", "tiktok", "facebook"]),
  content_type: z.enum(["image_post", "video_post", "reel", "story", "text_post"]),
  angle:        z.string(),           // brief creative direction for this piece
  image_needed: z.boolean(),
  video_mode:   z.enum(["script", "generated", "none"]).optional(),
});

const PlanSchema = z.array(PieceSchema);
type Piece = z.infer<typeof PieceSchema>;

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram: "Instagram: visual-first, 2200 char caption max, 3–5 relevant hashtags, strong first line hooks the scroll. Reels perform best.",
  tiktok:    "TikTok: hook in first 3 seconds, conversational caption under 150 chars, 3 trending hashtags, vertical video. Script should feel spontaneous.",
  facebook:  "Facebook: longer copy works (up to 500 chars), storytelling tone, one clear CTA, image or video with emotional pull.",
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
${campaign.source_content}

Target platforms and guidelines:
${platformContext}

Create a content plan with exactly ${piecesPerPlatform} piece(s) per platform (${piecesPerPlatform * platforms.length} total pieces).

For each piece, decide:
- Which platform
- Best content type for that platform (image_post, video_post, reel, story, text_post)
- A short creative angle/angle (1 sentence describing the angle)
- Whether an AI-generated image is needed (true/false)
- For video pieces: "script" or "generated" based on the default mode: ${video_mode}

Return ONLY a valid JSON array of objects. No explanation, no markdown.`;

      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const raw = msg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
      const jsonStr = raw.startsWith("[") ? raw : raw.slice(raw.indexOf("["));

      try {
        const parsed = JSON.parse(jsonStr);
        return PlanSchema.parse(parsed);
      } catch {
        throw new Error(`Claude returned invalid plan JSON: ${raw.slice(0, 200)}`);
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

            // ── Caption + hashtags ──
            const captionMsg = await anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 512,
              system: "You are a social media copywriter for One Flame Records, a Jamaican reggae/dancehall label. Write authentic, culturally grounded content. Never corporate or generic.",
              messages: [{
                role: "user",
                content: `Write a ${piece.content_type.replace("_", " ")} caption for ${piece.platform.charAt(0).toUpperCase() + piece.platform.slice(1)}.

Platform guide: ${platformGuide}
Creative angle: ${piece.angle}
Source material summary: ${campaign.source_content.slice(0, 800)}

Return JSON with two keys: "caption" (the post text, no hashtags) and "hashtags" (array of 3–5 strings without # symbol). Nothing else.`,
              }],
            });

            const captionRaw = captionMsg.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("").trim();
            const captionJson = JSON.parse(captionRaw.startsWith("{") ? captionRaw : captionRaw.slice(captionRaw.indexOf("{")));
            const caption: string  = captionJson.caption ?? "";
            const hashtags: string[] = captionJson.hashtags ?? [];

            // ── Video script (if needed) ──
            let video_script: string | null = null;
            if (piece.video_mode === "script") {
              const scriptMsg = await anthropic.messages.create({
                model: "claude-sonnet-4-6",
                max_tokens: 512,
                system: "You write short-form video scripts for One Flame Records social content. Scripts should feel authentic, energetic, and culturally rooted in Jamaican music.",
                messages: [{
                  role: "user",
                  content: `Write a 30–60 second ${piece.platform} video script.
Creative angle: ${piece.angle}
Source: ${campaign.source_content.slice(0, 600)}

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
                const response = await openai.images.generate({
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
                    // Save to image library (non-critical)
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
  }
);
