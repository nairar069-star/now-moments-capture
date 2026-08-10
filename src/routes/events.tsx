import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { useNow } from "@/lib/now-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Quests — collective moments | NOW" },
      {
        name: "description",
        content: "Join community-wide NOW events and daily quests, or create your own with NOW Pro.",
      },
      { property: "og:title", content: "Events — collective moments on NOW" },
      {
        property: "og:description",
        content: "Thousands of people posting a NOW at the same minute, all over the world.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Events,
});

function Events() {
  const { events, joinedEvents, joinEvent, createEvent, quests, joinedQuests, joinQuest, pro } = useNow();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [blurb, setBlurb] = useState("");

  return (
    <AppShell title="Events" subtitle="Collective moments, all at once.">
      {pro ? (
        <div className="mb-8 rounded-2xl border p-4">
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Plus className="size-4" /> Create an event
              </span>
              <span className="meta-label">Pro</span>
            </button>
          ) : (
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="When, e.g. Tonight 21:00"
                className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <input
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="One line about it"
                className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setCreating(false)} className="flex-1 rounded-full border py-2.5 text-sm">
                  Cancel
                </button>
                <button
                  disabled={!title.trim()}
                  onClick={() => {
                    createEvent({ title: title.trim(), time: time.trim(), blurb: blurb.trim() });
                    setTitle("");
                    setTime("");
                    setBlurb("");
                    setCreating(false);
                  }}
                  className="flex-1 rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/pro"
          className="mb-8 flex items-center justify-between rounded-2xl bg-foreground px-4 py-4 text-background"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4" /> Create and join events
            </span>
            <span className="mt-1 block text-xs opacity-70">NOW Pro — $10/month</span>
          </span>
          <span className="text-[11px] tracking-[0.14em] uppercase">Upgrade</span>
        </Link>
      )}

      {events.map((e) => {
        const joined = joinedEvents.includes(e.id);
        return (
          <section key={e.id} className="mb-10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{e.title}</h2>
              <span
                className={cn(
                  "shrink-0 text-[11px] tracking-[0.14em] uppercase",
                  e.status === "live" ? "text-accent" : "text-muted-foreground",
                )}
              >
                {e.status === "live" ? "Live" : e.time}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{e.blurb}</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {e.photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt=""
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{e.joined.toLocaleString()} joined</p>
              {e.status === "past" ? (
                <span className="meta-label">Ended</span>
              ) : joined ? (
                <Link to="/post" className="flex items-center gap-1.5 text-xs text-accent">
                  <Check className="size-3.5" /> Joined — post a NOW
                </Link>
              ) : (
                <button
                  onClick={() => joinEvent(e.id)}
                  className="rounded-full border px-4 py-1.5 text-xs transition-colors hover:bg-muted"
                >
                  {pro ? "Join" : "Join with Pro"}
                </button>
              )}
            </div>
            {!pro && !joined && e.status !== "past" ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Joining events is part of NOW Pro.{" "}
                <Link to="/pro" className="underline underline-offset-4">
                  See Pro
                </Link>
              </p>
            ) : null}
          </section>
        );
      })}

      <h2 className="meta-label mb-3">NOW Quest</h2>
      <ul className="space-y-3">
        {quests.map((q) => {
          const joined = joinedQuests.includes(q.id);
          return (
            <li key={q.id} className="rounded-xl border px-4 py-3">
              <p className="meta-label">{q.label}</p>
              <p className="mt-1 text-[15px]">{q.title}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  {q.joined.toLocaleString()} people posted a NOW for this.
                </p>
                {joined ? (
                  <Link to="/post" className="text-xs text-accent">
                    Post it
                  </Link>
                ) : (
                  <button
                    onClick={() => joinQuest(q.id)}
                    className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted"
                  >
                    Join
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
