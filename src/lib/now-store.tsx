import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { friendsNows, photos, type NowPost, type Visibility } from "./nowData";

type DropState = { active: boolean; secondsLeft: number; missed: boolean };

type Store = {
  feed: NowPost[];
  drop: DropState;
  startDrop: () => void;
  doubleNow: boolean;
  postNow: (input: {
    photo: string;
    selfie?: string | undefined;
    caption?: string | undefined;
    place?: string | undefined;
    visibility: Visibility;
    secretTo?: string | undefined;
  }) => void;
  react: (postId: string, emoji: string, replyTo?: string) => void;
  secrets: { id: string; from: string; photo: string; opened: boolean }[];
  openSecret: (id: string) => void;
  guessed: Record<string, string[]>;
  guess: (postId: string, option: string) => void;
  postedToday: boolean;
};

const NowContext = createContext<Store | null>(null);

const DROP_SECONDS = 90;

export function NowProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<NowPost[]>(friendsNows);
  const [drop, setDrop] = useState<DropState>({ active: false, secondsLeft: DROP_SECONDS, missed: false });
  const [doubleNow, setDoubleNow] = useState(false);
  const [postedToday, setPostedToday] = useState(false);
  const [guessed, setGuessed] = useState<Record<string, string[]>>({});
  const [secrets, setSecrets] = useState([
    { id: "s1", from: "Naira", photo: photos[6]!, opened: false },
  ]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDrop = useCallback(() => {
    setDoubleNow(Math.random() > 0.6);
    setDrop({ active: true, secondsLeft: DROP_SECONDS, missed: false });
  }, []);

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
    const t = setTimeout(() => setDrop({ active: true, secondsLeft: DROP_SECONDS, missed: false }), delay);
    return () => clearTimeout(t);
  }, []);

  const postNow: Store["postNow"] = useCallback((input) => {
    if (input.secretTo) {
      setPostedToday(true);
      return;
    }
    const post: NowPost = {
      id: `me-${Date.now()}`,
      user: "You",
      handle: "@rana",
      photo: input.photo,
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
  }, []);

  const react: Store["react"] = useCallback((postId, emoji, replyTo) => {
    setFeed((f) =>
      f.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: [
                ...p.reactions,
                { id: `${postId}-${Date.now()}`, user: "You", emoji, replyTo },
              ],
            }
          : p,
      ),
    );
  }, []);

  const openSecret = useCallback((id: string) => {
    setSecrets((s) => s.map((x) => (x.id === id ? { ...x, opened: true } : x)));
  }, []);

  const guess = useCallback((postId: string, option: string) => {
    setGuessed((g) => {
      const prev = g[postId] ?? [];
      if (prev.includes(option) || prev.length >= 3) return g;
      return { ...g, [postId]: [...prev, option] };
    });
  }, []);

  const value = useMemo(
    () => ({
      feed,
      drop,
      startDrop,
      doubleNow,
      postNow,
      react,
      secrets,
      openSecret,
      guessed,
      guess,
      postedToday,
    }),
    [feed, drop, startDrop, doubleNow, postNow, react, secrets, openSecret, guessed, guess, postedToday],
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
