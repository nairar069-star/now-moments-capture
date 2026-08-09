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
  emoji: string;
  note?: string;
  replyTo?: string;
};

export type NowPost = {
  id: string;
  user: string;
  handle: string;
  photo: string;
  selfie?: string;
  ago: string;
  caption?: string;
  place?: string;
  visibility: Visibility;
  someoneWithYou?: boolean;
  together?: string;
  guessPlace?: { options: string[]; answer: string };
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
    guessPlace: { options: ["🏫 School", "☕ Cafe", "🏠 Home"], answer: "🏠 Home" },
    reactions: [
      { id: "r1", user: "Naira", emoji: "📸", note: "studying" },
      { id: "r2", user: "Alya", emoji: "😂", replyTo: "r1" },
      { id: "r3", user: "Naira", emoji: "😭", replyTo: "r2" },
      { id: "r4", user: "Sarah", emoji: "💀", replyTo: "r3" },
      { id: "r5", user: "Alya", emoji: "💀💀", replyTo: "r4" },
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
    someoneWithYou: true,
    reactions: [
      { id: "r6", user: "Raka", emoji: "👀", note: "IS THAT RAKA?" },
      { id: "r7", user: "Sarah", emoji: "😂", replyTo: "r6" },
    ],
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
    reactions: [
      { id: "r9", user: "Alya", emoji: "🍜" },
      { id: "r10", user: "You", emoji: "😮‍💨", replyTo: "r9" },
    ],
  },
];

export const cities = [
  { flag: "🇯🇵", name: "Tokyo", count: 12381, time: "01:09", photo: now6 },
  { flag: "🇮🇩", name: "Jakarta", count: 8923, time: "23:09", photo: now8 },
  { flag: "🇫🇷", name: "Paris", count: 4291, time: "17:09", photo: now4 },
  { flag: "🇧🇷", name: "São Paulo", count: 3117, time: "13:09", photo: now2 },
  { flag: "🇰🇪", name: "Nairobi", count: 1842, time: "19:09", photo: now1 },
  { flag: "🇮🇸", name: "Reykjavík", count: 612, time: "16:09", photo: now7 },
];

export const worldNows: NowPost[] = [
  {
    id: "w1",
    user: "someone",
    handle: "@tokyo",
    photo: now6,
    ago: "just now",
    place: "Tokyo",
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
    place: "Jakarta",
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
    place: "Paris",
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
    place: "São Paulo",
    visibility: "public",
    reactions: [],
  },
];

export const quests = [
  { id: "q1", label: "TODAY'S QUEST", title: "Find something yellow.", joined: 2841 },
  { id: "q2", label: "SHOW US", title: "What's outside your window?", joined: 1120 },
  { id: "q3", label: "TODAY'S QUEST", title: "Something you almost forgot today.", joined: 704 },
];

export const events = [
  {
    id: "e1",
    emoji: "🌙",
    title: "EVERYONE, LOOK UP.",
    time: "20:00",
    status: "live" as const,
    blurb: "Thousands of NOWs, one sky.",
    photos: [now4, now2, now6, now8],
  },
  {
    id: "e2",
    emoji: "🪟",
    title: "WHAT'S OUTSIDE YOUR WINDOW?",
    time: "Tomorrow, 09:00",
    status: "upcoming" as const,
    blurb: "One window each. That's it.",
    photos: [now8, now1, now3, now7],
  },
  {
    id: "e3",
    emoji: "🌆",
    title: "SHOW US YOUR CITY.",
    time: "Last Sunday",
    status: "past" as const,
    blurb: "THE WORLD — 20:00",
    photos: [now6, now2, now4, now3],
  },
];

export const memoryMonths = [
  {
    id: "m1",
    label: "AUGUST 2026",
    nows: 31,
    togethers: 4,
    events: 2,
    photos: [now1, now3, now7, now5, now8, now2],
  },
  {
    id: "m2",
    label: "JULY 2026",
    nows: 28,
    togethers: 3,
    events: 1,
    photos: [now4, now6, now2, now7, now1, now3],
  },
  {
    id: "m3",
    label: "JUNE 2026",
    nows: 30,
    togethers: 2,
    events: 3,
    photos: [now8, now5, now4, now6, now3, now1],
  },
];

export const notifications = [
  { id: "x1", icon: "🔵", title: "NOW DROP", body: "You have 90 seconds.", ago: "now", accent: true },
  { id: "x2", icon: "🫂", title: "You might have been together", body: "With Sarah, around 20:31.", ago: "1 hr" },
  { id: "x3", icon: "🔒", title: "Secret NOW", body: "Naira sent you a Secret NOW.", ago: "2 hr" },
  { id: "x4", icon: "🎯", title: "New NOW Quest", body: "Find something yellow.", ago: "5 hr" },
  { id: "x5", icon: "🌎", title: "Everyone is looking up", body: "THE WORLD — 20:00 is forming.", ago: "yesterday" },
  { id: "x6", icon: "📸", title: "Missed your NOW", body: "You missed yesterday.", ago: "yesterday" },
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
    return "On your birthday you posted 4 NOWs: a kitchen at 08:12, a bus window at 13:40, and two after dark. Three friends reacted with 🎂.";
  if (s.includes("happiest"))
    return "August 2026 — 31 NOWs, 4 Together moments, the most reaction chains of any month in your archive.";
  if (s.includes("summer"))
    return "Last summer: 78 NOWs across 3 cities. Mostly evenings, mostly outside, mostly with Naira and Raka.";
  return "I searched your archive: 218 NOWs, 12 memory months, 9 Togethers. Try asking about a person, a month, or a place.";
}
