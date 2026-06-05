// TikTok Content Posting API

function validateMediaUrl(url: string | null, label: string): string {
  if (!url) throw new Error(`${label} is required.`);
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error(`Invalid ${label} URL.`); }
  if (parsed.protocol !== "https:") throw new Error(`${label} must be an HTTPS URL.`);
  return url;
}

type Piece = {
  id: string;
  caption: string | null;
  hashtags: string[] | null;
  video_url: string | null;
  image_url: string | null;
  content_type: string;
};

function buildCaption(piece: Piece): string {
  const tags = (piece.hashtags ?? []).map((h) => `#${h}`).join(" ");
  return [piece.caption, tags].filter(Boolean).join(" ");
}

async function tikTokPost(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const token  = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) throw new Error("TIKTOK_ACCESS_TOKEN is not configured.");

  const res = await fetch(`https://open.tiktokapis.com${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as { error?: { code: string; message: string }; data?: Record<string, unknown> };
  if (!res.ok || (data.error && data.error.code !== "ok")) {
    throw new Error(data.error?.message ?? `TikTok API error ${res.status}`);
  }
  return data.data ?? {};
}

export async function postToTikTok(piece: Piece): Promise<void> {
  const openId = process.env.TIKTOK_OPEN_ID;
  if (!openId) throw new Error("TIKTOK_OPEN_ID is not configured.");

  const caption = buildCaption(piece).slice(0, 2200);

  if (piece.video_url) {
    const videoUrl = validateMediaUrl(piece.video_url, "Video URL");
    // Video post via pull URL
    const initRes = await tikTokPost("/v2/post/publish/video/init/", {
      post_info: {
        title:          caption,
        privacy_level:  "PUBLIC_TO_EVERYONE",
        disable_duet:   false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source:    "PULL_FROM_URL",
        video_url: videoUrl,
      },
    }) as { publish_id?: string };

    if (!initRes.publish_id) throw new Error("TikTok did not return a publish_id.");
    // Posting is async on TikTok's side — publish_id is for status checks
  } else if (piece.image_url) {
    const imageUrl = validateMediaUrl(piece.image_url, "Image URL");
    // Photo post
    await tikTokPost("/v2/post/publish/content/init/", {
      post_info: {
        title:         caption,
        privacy_level: "PUBLIC_TO_EVERYONE",
        media_type:    "PHOTO",
        photo_images:  [imageUrl],
        photo_cover_index: 0,
      },
    });
  } else {
    throw new Error("TikTok requires a video or image URL.");
  }
}
