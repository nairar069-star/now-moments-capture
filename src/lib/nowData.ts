import now1 from "@/assets/now-1.jpg";
import now2 from "@/assets/now-2.jpg";
import now3 from "@/assets/now-3.jpg";
import now4 from "@/assets/now-4.jpg";
import now5 from "@/assets/now-5.jpg";
import now6 from "@/assets/now-6.jpg";
import now7 from "@/assets/now-7.jpg";
import now8 from "@/assets/now-8.jpg";

export const photos = [now1, now2, now3, now4, now5, now6, now7, now8];

export type Visibility = "private" | "friends" | "public";

export type Reaction = {
  id: string;
  user: string;
  emoji?: string | undefined;
  note?: string | undefined;
  replyTo?: string | undefined;
};

export type NowPost = {
  id: string;
  dbId?: string | undefined;
  mine?: boolean | undefined;
  profileHandle?: string | undefined;
  user: string;
  handle: string;
  photo: string;
  video?: string | undefined;
  selfie?: string | undefined;
  ago: string;
  caption?: string | undefined;
  place?: string | undefined;
  visibility: Visibility;
  together?: string | undefined;
  collaborators?: string[] | undefined;
  once?: boolean | undefined;
  eventTitle?: string | undefined;
  guessPlace?: { options: string[]; answer: string } | undefined;
  reactions: Reaction[];
};

export const me = {
  name: "You",
  handle: "@rana",
  bio: "mostly outside. occasionally on time.",
  photo: now5,
  nows: 218,
  memories: 12,
  togethers: 9,
  streak: 17,
};

export const friendsNows: NowPost[] = [
  {
    id: "n1",
    user: "Naira",
    handle: "@naira",
    photo: now1,
    selfie: now5,
    ago: "4 min ago",
    caption: "final push",
    place: "Somewhere quiet",
    visibility: "friends",
    guessPlace: { options: ["School", "Cafe", "Home"], answer: "Home" },
    reactions: [
      { id: "r1", user: "Naira", note: "studying, again" },
      { id: "r2", user: "Alya", emoji: "😂", replyTo: "r1" },
      { id: "r3", user: "Sarah", note: "same here", replyTo: "r2" },
    ],
  },
  {
    id: "n2",
    user: "Alya",
    handle: "@alya",
    photo: now3,
    ago: "22 min ago",
    caption: "she said one hour ago",
    place: "Near the old market",
    visibility: "friends",
    reactions: [{ id: "r6", user: "Raka", note: "waiting is a sport" }],
  },
  {
    id: "n3",
    user: "Raka",
    handle: "@raka",
    photo: now2,
    ago: "1 hr ago",
    caption: "long way home",
    visibility: "friends",
    together: "Sarah",
    reactions: [{ id: "r8", user: "Naira", emoji: "🫂" }],
  },
  {
    id: "n4",
    user: "Sarah",
    handle: "@sarah",
    photo: now7,
    ago: "2 hr ago",
    caption: "second dinner",
    visibility: "friends",
    guessPlace: { options: ["Street food", "Kitchen", "Office"], answer: "Street food" },
    reactions: [{ id: "r9", user: "Alya", note: "no regrets" }],
  },
];

export type Friend = {
  name: string;
  handle: string;
  photo: string;
  status: "friend" | "pending" | "requested" | "suggested";
  lastNow: string;
};

export const friends: Friend[] = [
  { name: "Naira", handle: "@naira", photo: now1, status: "friend", lastNow: "4 min ago" },
  { name: "Alya", handle: "@alya", photo: now3, status: "friend", lastNow: "22 min ago" },
  { name: "Raka", handle: "@raka", photo: now2, status: "friend", lastNow: "1 hr ago" },
  { name: "Sarah", handle: "@sarah", photo: now7, status: "friend", lastNow: "2 hr ago" },
  { name: "Dimas", handle: "@dimas", photo: now6, status: "pending", lastNow: "wants to be friends" },
  { name: "Kirana", handle: "@kirana", photo: now4, status: "suggested", lastNow: "3 mutual friends" },
  { name: "Bagas", handle: "@bagas", photo: now8, status: "suggested", lastNow: "1 mutual friend" },
];

export type NearbyPlace = { name: string; lat: number; lon: number };

// A small gazetteer used to turn raw coordinates into human place options.
export const gazetteer: NearbyPlace[] = [
  { name: "Jakarta", lat: -6.2, lon: 106.816 },
  { name: "Depok", lat: -6.402, lon: 106.794 },
  { name: "Bogor", lat: -6.595, lon: 106.816 },
  { name: "Bekasi", lat: -6.238, lon: 106.975 },
  { name: "Tangerang", lat: -6.178, lon: 106.63 },
  { name: "Bandung", lat: -6.917, lon: 107.619 },
  { name: "Yogyakarta", lat: -7.797, lon: 110.37 },
  { name: "Surabaya", lat: -7.257, lon: 112.752 },
  { name: "Bali", lat: -8.65, lon: 115.216 },
  { name: "Singapore", lat: 1.352, lon: 103.82 },
  { name: "Kuala Lumpur", lat: 3.139, lon: 101.687 },
  { name: "Tokyo", lat: 35.676, lon: 139.65 },
  { name: "Seoul", lat: 37.567, lon: 126.978 },
  { name: "Sydney", lat: -33.868, lon: 151.209 },
  { name: "Dubai", lat: 25.204, lon: 55.27 },
  { name: "London", lat: 51.507, lon: -0.128 },
  { name: "Paris", lat: 48.857, lon: 2.352 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "New York", lat: 40.713, lon: -74.006 },
  { name: "São Paulo", lat: -23.55, lon: -46.633 },
  { name: "Nairobi", lat: -1.286, lon: 36.817 },
  { name: "Reykjavík", lat: 64.147, lon: -21.94 },
];

export function nearbyPlaces(lat: number, lon: number, limit = 4) {
  return [...gazetteer]
    .map((p) => ({
      ...p,
      km: Math.round(
        Math.hypot((p.lat - lat) * 111, (p.lon - lon) * 111 * Math.cos((lat * Math.PI) / 180)),
      ),
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export type City = { name: string; count: number; time: string; photo: string };

export const cities: City[] = [
  { name: "Tokyo", count: 12381, time: "01:09", photo: now6 },
  { name: "Jakarta", count: 8923, time: "23:09", photo: now8 },
  { name: "Paris", count: 4291, time: "17:09", photo: now4 },
  { name: "São Paulo", count: 3117, time: "13:09", photo: now2 },
  { name: "Nairobi", count: 1842, time: "19:09", photo: now1 },
  { name: "Reykjavík", count: 612, time: "16:09", photo: now7 },
];

export const worldNows: NowPost[] = [
  {
    id: "w1",
    user: "someone",
    handle: "@tokyo",
    photo: now6,
    ago: "just now",
    caption: "rain again",
    visibility: "public",
    reactions: [],
  },
  {
    id: "w2",
    user: "someone",
    handle: "@jakarta",
    photo: now8,
    ago: "3 min ago",
    caption: "morning street",
    visibility: "public",
    reactions: [],
  },
  {
    id: "w3",
    user: "someone",
    handle: "@paris",
    photo: now4,
    ago: "6 min ago",
    caption: "look up",
    visibility: "public",
    reactions: [],
  },
  {
    id: "w4",
    user: "someone",
    handle: "@saopaulo",
    photo: now2,
    ago: "11 min ago",
    visibility: "public",
    reactions: [],
  },
];

export type Quest = { id: string; label: string; title: string; joined: number };

export const quests: Quest[] = [
  { id: "q1", label: "Today's quest", title: "Find something yellow.", joined: 2841 },
  { id: "q2", label: "Show us", title: "What's outside your window?", joined: 1120 },
  { id: "q3", label: "Today's quest", title: "Something you almost forgot today.", joined: 704 },
];

export type NowEvent = {
  id: string;
  title: string;
  time: string;
  status: "live" | "upcoming" | "past";
  blurb: string;
  photos: string[];
  joined: number;
  mine?: boolean | undefined;
};

export const events: NowEvent[] = [
  {
    id: "e1",
    title: "Everyone, look up.",
    time: "20:00",
    status: "live",
    blurb: "Thousands of NOWs, one sky.",
    photos: [now4, now2, now6, now8],
    joined: 8412,
  },
  {
    id: "e2",
    title: "What's outside your window?",
    time: "Tomorrow, 09:00",
    status: "upcoming",
    blurb: "One window each. That's it.",
    photos: [now8, now1, now3, now7],
    joined: 2210,
  },
  {
    id: "e3",
    title: "Show us your city.",
    time: "Last Sunday",
    status: "past",
    blurb: "The world, 20:00.",
    photos: [now6, now2, now4, now3],
    joined: 15230,
  },
];

export const memoryMonths = [
  {
    id: "m1",
    label: "August 2026",
    nows: 31,
    togethers: 4,
    events: 2,
    photos: [now1, now3, now7, now5, now8, now2],
  },
  {
    id: "m2",
    label: "July 2026",
    nows: 28,
    togethers: 3,
    events: 1,
    photos: [now4, now6, now2, now7, now1, now3],
  },
  {
    id: "m3",
    label: "June 2026",
    nows: 30,
    togethers: 2,
    events: 3,
    photos: [now8, now5, now4, now6, now3, now1],
  },
];

export type NowNotification = {
  id: string;
  kind: "drop" | "together" | "secret" | "quest" | "event" | "miss";
  title: string;
  body: string;
  ago: string;
  accent?: boolean | undefined;
};

export const notifications: NowNotification[] = [
  { id: "x3", kind: "secret", title: "Secret NOW", body: "Naira sent you a Secret NOW.", ago: "2 hr" },
  { id: "x4", kind: "quest", title: "New NOW Quest", body: "Find something yellow.", ago: "5 hr" },
  { id: "x5", kind: "event", title: "Everyone is looking up", body: "The world, 20:00.", ago: "yesterday" },
  { id: "x6", kind: "miss", title: "Missed your NOW", body: "You missed yesterday.", ago: "yesterday" },
];

export const aiSuggestions = [
  "When was the last time I saw Sarah?",
  "What was I doing on my birthday?",
  "Show me my happiest month.",
  "What did I do last summer?",
];

export function answerFromMemories(q: string) {
  const s = q.toLowerCase();
  if (s.includes("sarah"))
    return "Last time was 6 days ago — a Together at 20:31, near the old market. You've shared 9 Togethers with Sarah this year.";
  if (s.includes("birthday"))
    return "On your birthday you posted 4 NOWs: a kitchen at 08:12, a bus window at 13:40, and two after dark.";
  if (s.includes("happiest"))
    return "August 2026 — 31 NOWs, 4 Together moments, the most reaction chains of any month in your archive.";
  if (s.includes("summer"))
    return "Last summer: 78 NOWs across 3 cities. Mostly evenings, mostly outside, mostly with Naira and Raka.";
  return "I searched your archive: 218 NOWs, 12 memory months, 9 Togethers. Try asking about a person, a month, or a place.";
}
