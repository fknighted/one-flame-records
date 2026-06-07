export const PILLARS = [
  { value: "artist_spotlight",  label: "Artist Spotlight",        description: "Feature an individual artist — their story, sound, and vision" },
  { value: "release_promotion", label: "Release Promotion",       description: "Push a new or catalogue release across platforms" },
  { value: "behind_the_music",  label: "Behind the Music",        description: "Studio sessions, creative process, day-in-the-life" },
  { value: "culture_roots",     label: "Culture & Roots",         description: "Jamaican music culture, history, and tradition" },
  { value: "fan_engagement",    label: "Fan Engagement",          description: "Q&As, polls, reposts, community moments" },
  { value: "label_news",        label: "Label News",              description: "Signings, milestones, events, announcements" },
] as const;

export type Pillar = typeof PILLARS[number]["value"];

export type Idea = {
  id: string;
  title: string;
  angle: string | null;
  pillar: string | null;
  source_type: string;
  suggested_platforms: string[];
  status: string;
  created_at: string;
};
