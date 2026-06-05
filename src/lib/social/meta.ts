// Meta Graph API — Instagram + Facebook posting

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
    if (!piece.video_url) throw new Error("Video URL required for Instagram Reel.");
    // Step 1: create container
    const { id: containerId } = await graphPost(`/${igAccountId}/media`, {
      media_type: "REELS",
      video_url: piece.video_url,
      caption,
    });
    // Step 2: poll until ready (up to 60s)
    await waitForIgContainer(igAccountId, containerId);
    // Step 3: publish
    await graphPost(`/${igAccountId}/media_publish`, { creation_id: containerId });
  } else {
    // Image post or text post (text-only not supported on IG — use image)
    if (!piece.image_url) throw new Error("Image URL required for Instagram image post.");
    const { id: containerId } = await graphPost(`/${igAccountId}/media`, {
      image_url: piece.image_url,
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
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${token}`
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
    if (!piece.video_url) throw new Error("Video URL required for Facebook video post.");
    await graphPost(`/${pageId}/videos`, { file_url: piece.video_url, description: caption });
  } else if (piece.image_url) {
    await graphPost(`/${pageId}/photos`, { url: piece.image_url, caption });
  } else {
    await graphPost(`/${pageId}/feed`, { message: caption });
  }
}
