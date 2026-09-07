import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  cities as seedCities,
  friends as seedFriends,
  type Friend,
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

type ActiveEvent = { id: string; title: string; secondsLeft: number } | null;

type PostInput = {
  photo: string;
  video?: string | undefined;
  selfie?: string | undefined;
  caption?: string | undefined;
  place?: string | undefined;
  visibility: Visibility;
  secretTo?: string | undefined;
  once?: boolean | undefined;
  collaborators?: string[] | undefined;
  eventId?: string | undefined;
};

type Store = {
  feed: NowPost[];
  drop: DropState;
  startDrop: () => void;
  nextDropIn: number;
  dropsLeft: number;
  dropsPerDay: number;
  doubleNow: boolean;
  postNow: (input: PostInput) => void;
  deletePost: (id: string) => void;
  react: (
    postId: string,
    input: { emoji?: string | undefined; note?: string | undefined; replyTo?: string | undefined },
  ) => void;
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
  activeEvent: ActiveEvent;
  leaveActiveEvent: () => void;
  joinEvent: (id: string, title?: string) => void;
  createEvent: (input: { title: string; time: string; blurb: string }) => void;

  quests: Quest[];
  joinedQuests: string[];
  joinQuest: (id: string) => void;

  togetherRequests: TogetherRequest[];
  answerTogether: (id: string, accept: boolean) => void;

  friends: Friend[];
  addFriend: (handle: string) => void;
  answerFriend: (handle: string, accept: boolean) => void;
  removeFriend: (handle: string) => void;

  notifications: NowNotification[];
  pushEnabled: boolean;
  enablePush: () => Promise<void>;
  notify: (n: { kind: NowNotification["kind"]; title: string; body: string }) => void;
};

const NowContext = createContext<Store | null>(null);

const DROP_SECONDS = 90;
const DROPS_PER_DAY = 3;

function secondsUntilMidnight() {
  const d = new Date();
  const m = new Date(d);
  m.setHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((m.getTime() - d.getTime()) / 1000));
}

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
  const [activeEvent, setActiveEvent] = useState<ActiveEvent>(null);
  const [friends, setFriends] = useState<Friend[]>(seedFriends);
  const [nextDropIn, setNextDropIn] = useState(90);
  const [dropsLeft, setDropsLeft] = useState(DROPS_PER_DAY);
  const dropsLeftRef = useRef(DROPS_PER_DAY);
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
    notify({ kind: "drop", title: "NOW DROP", body: "You have 90 seconds. Photo or video, your call." });
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

  // Daily NOW DROP scheduler: exactly 3 unpredictable drops per day,
  // spread across the remaining hours, resetting at midnight.
  useEffect(() => {
    setNextDropIn(Math.max(60, Math.floor(secondsUntilMidnight() / DROPS_PER_DAY)));
    const t = setInterval(() => {
      setNextDropIn((n) => {
        if (n > 1) return n - 1;
        if (dropsLeftRef.current <= 0) {
          // Past midnight: a fresh day, quota back to 3.
          dropsLeftRef.current = DROPS_PER_DAY;
          setDropsLeft(DROPS_PER_DAY);
          return Math.max(60, Math.floor(secondsUntilMidnight() / DROPS_PER_DAY));
        }
        dropsLeftRef.current -= 1;
        setDropsLeft(dropsLeftRef.current);
        setDoubleNow(Math.random() > 0.5);
        setDrop({ active: true, secondsLeft: DROP_SECONDS, missed: false });
        setNotifications((list) => [
          { id: `${Date.now()}`, kind: "drop", title: "NOW DROP", body: "You have 90 seconds. Photo or video, your call.", ago: "now", accent: true },
          ...list,
        ]);
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("NOW DROP", { body: "You have 90 seconds. Photo or video, your call." });
          } catch {
            /* ignore */
          }
        }
        const remaining = dropsLeftRef.current;
        return remaining > 0
          ? Math.max(120, Math.floor(secondsUntilMidnight() / remaining))
          : secondsUntilMidnight() + 3600;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Event window countdown: posting to a joined event is only open for a short while.
  useEffect(() => {
    if (!activeEvent) return;
    const t = setInterval(() => {
      setActiveEvent((e) => (e ? (e.secondsLeft <= 1 ? null : { ...e, secondsLeft: e.secondsLeft - 1 }) : e));
    }, 1000);
    return () => clearInterval(t);
  }, [activeEvent?.id]);

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
        once: input.once,
        collaborators: input.collaborators?.length ? input.collaborators : undefined,
        eventTitle: input.eventId ? events.find((e) => e.id === input.eventId)?.title : undefined,
        reactions: [],
      };
      setFeed((f) => [post, ...f]);
      setPostedToday(true);
      setDrop({ active: false, secondsLeft: DROP_SECONDS, missed: false });
      if (input.eventId) setActiveEvent(null);
    },
    [events],
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
    (id: string, title?: string) => {
      setJoinedEvents((j) => (j.includes(id) ? j : [...j, id]));
      setEvents((list) => list.map((e) => (e.id === id ? { ...e, joined: e.joined + 1 } : e)));
      const label = title ?? events.find((e) => e.id === id)?.title ?? "Event";
      setActiveEvent({ id, title: label, secondsLeft: 180 });
      notify({ kind: "event", title: "You joined an event", body: label });
    },
    [events, notify],
  );

  const leaveActiveEvent = useCallback(() => setActiveEvent(null), []);

  const addFriend = useCallback(
    (handle: string) => {
      setFriends((list) =>
        list.map((f) => (f.handle === handle ? { ...f, status: "requested", lastNow: "request sent" } : f)),
      );
      notify({ kind: "together", title: "Friend request sent", body: handle });
    },
    [notify],
  );

  const answerFriend = useCallback((handle: string, accept: boolean) => {
    setFriends((list) =>
      accept
        ? list.map((f) => (f.handle === handle ? { ...f, status: "friend", lastNow: "just now" } : f))
        : list.filter((f) => f.handle !== handle),
    );
  }, []);

  const removeFriend = useCallback((handle: string) => {
    setFriends((list) => list.map((f) => (f.handle === handle ? { ...f, status: "suggested", lastNow: "removed" } : f)));
  }, []);

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
      nextDropIn,
      dropsLeft,
      dropsPerDay: DROPS_PER_DAY,
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
      activeEvent,
      leaveActiveEvent,
      joinEvent,
      createEvent,
      quests,
      joinedQuests,
      joinQuest,
      togetherRequests,
      answerTogether,
      friends,
      addFriend,
      answerFriend,
      removeFriend,
      notifications,
      pushEnabled,
      enablePush,
      notify,
    }),
    [
      feed,
      drop,
      startDrop,
      nextDropIn,
      dropsLeft,
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
      activeEvent,
      leaveActiveEvent,
      joinEvent,
      createEvent,
      quests,
      joinedQuests,
      joinQuest,
      togetherRequests,
      answerTogether,
      friends,
      addFriend,
      answerFriend,
      removeFriend,
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
