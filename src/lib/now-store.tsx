import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  cities as seedCities,
  events as seedEvents,
  friendsNows,
  notifications as seedNotifications,
  photos,
  quests as seedQuests,
  type City,
  type NowEvent,
  type NowNotification,
  type NowPost,
  type Quest,
  type Visibility,
} from "./nowData";

type DropState = { active: boolean; secondsLeft: number; missed: boolean };

export type TogetherRequest = {
  id: string;
  from: string;
  postId: string;
  place: string;
  time: string;
  status: "pending" | "confirmed" | "declined";
};

type PostInput = {
  photo: string;
  video?: string | undefined;
  selfie?: string | undefined;
  caption?: string | undefined;
  place?: string | undefined;
  visibility: Visibility;
  secretTo?: string | undefined;
};

type Store = {
  feed: NowPost[];
  drop: DropState;
  startDrop: () => void;
  doubleNow: boolean;
  postNow: (input: PostInput) => void;
  deletePost: (id: string) => void;
  react: (postId: string, input: { emoji?: string; note?: string; replyTo?: string }) => void;
  secrets: { id: string; from: string; photo: string; opened: boolean }[];
  openSecret: (id: string) => void;
  sendSecret: (to: string) => void;
  guessed: Record<string, string[]>;
  guess: (postId: string, option: string) => void;
  postedToday: boolean;

  pro: boolean;
  subscribePro: () => void;
  cancelPro: () => void;

  cities: City[];
  addCity: (name: string) => void;
  worldPlace: string;
  setWorldPlace: (name: string) => void;

  events: NowEvent[];
  joinedEvents: string[];
  joinEvent: (id: string) => void;
  createEvent: (input: { title: string; time: string; blurb: string }) => void;

  quests: Quest[];
  joinedQuests: string[];
  joinQuest: (id: string) => void;

  togetherRequests: TogetherRequest[];
  answerTogether: (id: string, accept: boolean) => void;

  notifications: NowNotification[];
  pushEnabled: boolean;
  enablePush: () => Promise<void>;
  notify: (n: { kind: NowNotification["kind"]; title: string; body: string }) => void;
};

const NowContext = createContext<Store | null>(null);

const DROP_SECONDS = 90;

export function NowProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<NowPost[]>(friendsNows);
  const [drop, setDrop] = useState<DropState>({ active: false, secondsLeft: DROP_SECONDS, missed: false });
  const [doubleNow, setDoubleNow] = useState(false);
  const [postedToday, setPostedToday] = useState(false);
  const [guessed, setGuessed] = useState<Record<string, string[]>>({});
  const [secrets, setSecrets] = useState([{ id: "s1", from: "Naira", photo: photos[6]!, opened: false }]);
  const [pro, setPro] = useState(false);
  const [cities, setCities] = useState<City[]>(seedCities);
  const [worldPlace, setWorldPlace] = useState(seedCities[0]!.name);
  const [events, setEvents] = useState<NowEvent[]>(seedEvents);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [quests, setQuests] = useState<Quest[]>(seedQuests);
  const [joinedQuests, setJoinedQuests] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NowNotification[]>(seedNotifications);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [togetherRequests, setTogetherRequests] = useState<TogetherRequest[]>([
    {
      id: "t1",
      from: "Sarah",
      postId: "n3",
      place: "Near the old market",
      time: "20:31",
      status: "pending",
    },
  ]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const notify = useCallback<Store["notify"]>((n) => {
    setNotifications((list) => [{ id: `${Date.now()}`, ago: "now", ...n }, ...list]);
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(n.title, { body: n.body });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const enablePush = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPushEnabled(result === "granted");
  }, []);

  const startDrop = useCallback(() => {
    setDoubleNow(Math.random() > 0.5);
    setDrop({ active: true, secondsLeft: DROP_SECONDS, missed: false });
    notify({ kind: "drop", title: "NOW DROP", body: "You have 90 seconds." });
  }, [notify]);

  useEffect(() => {
    if (!drop.active) return;
    timer.current = setInterval(() => {
      setDrop((d) => {
        if (d.secondsLeft <= 1) return { active: false, secondsLeft: DROP_SECONDS, missed: true };
        return { ...d, secondsLeft: d.secondsLeft - 1 };
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [drop.active]);

  // Unpredictable drop: fires once, somewhere between 25s and 70s after open.
  useEffect(() => {
    const delay = 25000 + Math.random() * 45000;
    const t = setTimeout(() => {
      setDoubleNow(Math.random() > 0.5);
      setDrop({ active: true, secondsLeft: DROP_SECONDS, missed: false });
      setNotifications((list) => [
        { id: `${Date.now()}`, kind: "drop", title: "NOW DROP", body: "You have 90 seconds.", ago: "now", accent: true },
        ...list,
      ]);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("NOW DROP", { body: "You have 90 seconds." });
        } catch {
          /* ignore */
        }
      }
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const postNow = useCallback<Store["postNow"]>(
    (input) => {
      if (input.secretTo) {
        setPostedToday(true);
        return;
      }
      const post: NowPost = {
        id: `me-${Date.now()}`,
        user: "You",
        handle: "@rana",
        photo: input.photo,
        video: input.video,
        selfie: input.selfie,
        ago: "just now",
        caption: input.caption,
        place: input.place,
        visibility: input.visibility,
        reactions: [],
      };
      setFeed((f) => [post, ...f]);
      setPostedToday(true);
      setDrop({ active: false, secondsLeft: DROP_SECONDS, missed: false });
    },
    [],
  );

  const deletePost = useCallback((id: string) => {
    setFeed((f) => f.filter((p) => p.id !== id));
  }, []);

  const react = useCallback<Store["react"]>((postId, input) => {
    setFeed((f) =>
      f.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: [
                ...p.reactions,
                {
                  id: `${postId}-${Date.now()}`,
                  user: "You",
                  emoji: input.emoji,
                  note: input.note,
                  replyTo: input.replyTo,
                },
              ],
            }
          : p,
      ),
    );
  }, []);

  const openSecret = useCallback((id: string) => {
    setSecrets((s) => s.map((x) => (x.id === id ? { ...x, opened: true } : x)));
  }, []);

  const sendSecret = useCallback(
    (to: string) => {
      notify({ kind: "secret", title: "Secret NOW sent", body: `Only ${to} can open it, once.` });
    },
    [notify],
  );

  const guess = useCallback((postId: string, option: string) => {
    setGuessed((g) => {
      const prev = g[postId] ?? [];
      if (prev.includes(option) || prev.length >= 3) return g;
      return { ...g, [postId]: [...prev, option] };
    });
  }, []);

  const subscribePro = useCallback(() => {
    setPro(true);
    notify({ kind: "event", title: "NOW Pro active", body: "You can create and join events now." });
  }, [notify]);

  const cancelPro = useCallback(() => setPro(false), []);

  const addCity = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setCities((c) =>
      c.some((x) => x.name.toLowerCase() === clean.toLowerCase())
        ? c
        : [
            {
              name: clean,
              count: 1,
              time: new Date().toTimeString().slice(0, 5),
              photo: photos[Math.floor(Math.random() * photos.length)]!,
            },
            ...c,
          ],
    );
    setWorldPlace(clean);
  }, []);

  const joinEvent = useCallback(
    (id: string) => {
      setJoinedEvents((j) => (j.includes(id) ? j : [...j, id]));
      setEvents((list) => list.map((e) => (e.id === id ? { ...e, joined: e.joined + 1 } : e)));
      const ev = seedEvents.find((e) => e.id === id);
      notify({ kind: "event", title: "You joined an event", body: ev?.title ?? "See you there." });
    },
    [notify],
  );

  const createEvent = useCallback<Store["createEvent"]>(
    (input) => {
      const ev: NowEvent = {
        id: `ev-${Date.now()}`,
        title: input.title,
        time: input.time || "Today",
        status: "upcoming",
        blurb: input.blurb,
        photos: photos.slice(0, 4),
        joined: 1,
        mine: true,
      };
      setEvents((list) => [ev, ...list]);
      setJoinedEvents((j) => [...j, ev.id]);
      notify({ kind: "event", title: "Event created", body: input.title });
    },
    [notify],
  );

  const joinQuest = useCallback(
    (id: string) => {
      setJoinedQuests((j) => (j.includes(id) ? j : [...j, id]));
      setQuests((list) => list.map((q) => (q.id === id ? { ...q, joined: q.joined + 1 } : q)));
      notify({ kind: "quest", title: "Quest joined", body: "Post a NOW for this quest." });
    },
    [notify],
  );

  const answerTogether = useCallback(
    (id: string, accept: boolean) => {
      setTogetherRequests((list) =>
        list.map((t) => (t.id === id ? { ...t, status: accept ? "confirmed" : "declined" } : t)),
      );
      const req = togetherRequests.find((t) => t.id === id);
      if (accept && req) {
        setFeed((f) => f.map((p) => (p.id === req.postId ? { ...p, together: req.from } : p)));
        notify({ kind: "together", title: "Together confirmed", body: `Saved with ${req.from}.` });
      }
    },
    [notify, togetherRequests],
  );

  const value = useMemo<Store>(
    () => ({
      feed,
      drop,
      startDrop,
      doubleNow,
      postNow,
      deletePost,
      react,
      secrets,
      openSecret,
      sendSecret,
      guessed,
      guess,
      postedToday,
      pro,
      subscribePro,
      cancelPro,
      cities,
      addCity,
      worldPlace,
      setWorldPlace,
      events,
      joinedEvents,
      joinEvent,
      createEvent,
      quests,
      joinedQuests,
      joinQuest,
      togetherRequests,
      answerTogether,
      notifications,
      pushEnabled,
      enablePush,
      notify,
    }),
    [
      feed,
      drop,
      startDrop,
      doubleNow,
      postNow,
      deletePost,
      react,
      secrets,
      openSecret,
      sendSecret,
      guessed,
      guess,
      postedToday,
      pro,
      subscribePro,
      cancelPro,
      cities,
      addCity,
      worldPlace,
      events,
      joinedEvents,
      joinEvent,
      createEvent,
      quests,
      joinedQuests,
      joinQuest,
      togetherRequests,
      answerTogether,
      notifications,
      pushEnabled,
      enablePush,
      notify,
    ],
  );

  return <NowContext.Provider value={value}>{children}</NowContext.Provider>;
}

export function useNow() {
  const ctx = useContext(NowContext);
  if (!ctx) throw new Error("useNow must be used inside NowProvider");
  return ctx;
}

export function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
