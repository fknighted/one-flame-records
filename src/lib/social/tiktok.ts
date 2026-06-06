// TikTok posting via Make.com webhook

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

export async function postToTikTok(piece: Piece): Promise<void> {
  const url = process.env.SOCIAL_WEBHOOK_URL;
  if (!url) throw new Error("SOCIAL_WEBHOOK_URL is not configured.");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      platform: "tiktok",
      piece_id: piece.id,
      content_type: piece.content_type,
      caption: buildCaption(piece).slice(0, 2200),
      image_url: piece.image_url,
      video_url: piece.video_url,
    }),
  });

  if (!res.ok) throw new Error(`Make.com webhook error ${res.status}`);
}
