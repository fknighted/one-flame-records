export function buildSpotifyEmbedUrl(
  value: string,
  type: "album" | "artist" | "track"
): string | null {
  if (!value) return null;
  if (value.includes("open.spotify.com/embed")) return value;

  // Full Spotify URL — extract type + ID
  const match = value.match(/spotify\.com\/(album|artist|track)\/([A-Za-z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${type}/${match[2]}?utm_source=generator&theme=0`;
  }

  // Bare Spotify ID (22 alphanumeric chars)
  if (/^[A-Za-z0-9]{22}$/.test(value)) {
    return `https://open.spotify.com/embed/${type}/${value}?utm_source=generator&theme=0`;
  }

  return null;
}
