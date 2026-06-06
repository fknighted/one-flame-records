// Instagram + Facebook posting via Make.com webhook

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

async function fireWebhook(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.SOCIAL_WEBHOOK_URL;
  if (!url) throw new Error("SOCIAL_WEBHOOK_URL is not configured.");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Make.com webhook error ${res.status}`);
}

export async function postToInstagram(piece: Piece): Promise<void> {
  await fireWebhook({
    platform: "instagram",
    piece_id: piece.id,
    content_type: piece.content_type,
    caption: buildCaption(piece),
    image_url: piece.image_url,
    video_url: piece.video_url,
  });
}

export async function postToFacebook(piece: Piece): Promise<void> {
  await fireWebhook({
    platform: "facebook",
    piece_id: piece.id,
    content_type: piece.content_type,
    caption: buildCaption(piece),
    image_url: piece.image_url,
    video_url: piece.video_url,
  });
}
