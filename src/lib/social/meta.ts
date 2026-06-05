// Meta Graph API — Instagram + Facebook posting

function validateMediaUrl(url: string | null, label: string): string {
  if (!url) throw new Error(`${label} is required.`);
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error(`Invalid ${label} URL.`); }
  if (parsed.protocol !== "https:") throw new Error(`${label} must be an HTTPS URL.`);
  return url;
}

type Piece = {
  id: string;
  platform: string;
  content_type: string;
  caption: string | null;
  hashtags: string[] | null;
  image_url: string | null;
  video_url: string | null;
};

function buildCaption(piece: Piece): string {
  const tags = (piece.hashtags ?? []).map((h) => `#${h}`).join(" ");
  return [piece.caption, tags].filter(Boolean).join("\n\n");
}

async function graphPost(path: string, body: Record<string, unknown>): Promise<{ id: string }> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error("FACEBOOK_PAGE_ACCESS_TOKEN is not configured.");

  const url = `https://graph.facebook.com/v21.0${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: token }),
  });

  const data = await res.json() as { id?: string; error?: { message: string } };
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Meta API error ${res.status}`);
  if (!data.id) throw new Error("Meta API returned no id");
  return { id: data.id };
}

// ── Instagram ─────────────────────────────────────────────────────────────────

export async function postToInstagram(piece: Piece): Promise<void> {
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!igAccountId) throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID is not configured.");

  const caption = buildCaption(piece);

  if (piece.content_type === "video_post" || piece.content_type === "reel") {
    const videoUrl = validateMediaUrl(piece.video_url, "Video URL");
    // Step 1: create container
    const { id: containerId } = await graphPost(`/${igAccountId}/media`, {
      media_type: "REELS",
      video_url: videoUrl,
      caption,
    });
    // Step 2: poll until ready (up to 60s)
    await waitForIgContainer(igAccountId, containerId);
    // Step 3: publish
    await graphPost(`/${igAccountId}/media_publish`, { creation_id: containerId });
  } else {
    // Image post or text post (text-only not supported on IG — use image)
    const imageUrl = validateMediaUrl(piece.image_url, "Image URL");
    const { id: containerId } = await graphPost(`/${igAccountId}/media`, {
      image_url: imageUrl,
      caption,
    });
    await graphPost(`/${igAccountId}/media_publish`, { creation_id: containerId });
  }
}

async function waitForIgContainer(igAccountId: string, containerId: string): Promise<void> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json() as { status_code?: string };
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Instagram media container processing failed.");
  }
  throw new Error("Instagram media container timed out.");
}

// ── Facebook ──────────────────────────────────────────────────────────────────

export async function postToFacebook(piece: Piece): Promise<void> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageId) throw new Error("FACEBOOK_PAGE_ID is not configured.");

  const caption = buildCaption(piece);

  if (piece.content_type === "video_post") {
    const videoUrl = validateMediaUrl(piece.video_url, "Video URL");
    await graphPost(`/${pageId}/videos`, { file_url: videoUrl, description: caption });
  } else if (piece.image_url) {
    const imageUrl = validateMediaUrl(piece.image_url, "Image URL");
    await graphPost(`/${pageId}/photos`, { url: imageUrl, caption });
  } else {
    await graphPost(`/${pageId}/feed`, { message: caption });
  }
}
