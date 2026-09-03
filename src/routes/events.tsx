import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchEvents } from "@/lib/nowdb";
import { formatCountdown, useNow } from "@/lib/now-store";

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
  const { quests, joinedQuests, joinQuest, joinedEvents, joinEvent, activeEvent, leaveActiveEvent } = useNow();
  const { user, isPro } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [blurb, setBlurb] = useState("");
  const [error, setError] = useState("");

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  async function create() {
    if (!user) return;
    const { error: err } = await supabase.from("events").insert({
      title: title.trim(),
      time_label: time.trim() || "Today",
      blurb: blurb.trim(),
      created_by: user.id,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setTitle("");
    setTime("");
    setBlurb("");
    setCreating(false);
    setError("");
    await queryClient.invalidateQueries({ queryKey: ["events"] });
  }

  return (
    <AppShell title="Events" subtitle="Collective moments, all at once.">
      {isPro ? (
        <div className="mb-8 rounded-2xl border p-4">
          {!creating ? (
            <button onClick={() => setCreating(true)} className="flex w-full items-center justify-between text-sm">
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
                  onClick={() => void create()}
                  className="flex-1 rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-40"
                >
                  Create
                </button>
              </div>
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>
          )}
        </div>
      ) : (
        <Link
          to={user ? "/pro" : "/auth"}
          className="mb-8 flex items-center justify-between rounded-2xl bg-foreground px-4 py-4 text-background"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4" /> Create and join events
            </span>
            <span className="mt-1 block text-xs opacity-70">NOW Pro — $10/month</span>
          </span>
          <span className="text-[11px] tracking-[0.14em] uppercase">Unlock</span>
        </Link>
      )}

      {eventsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading events…</p> : null}

      {(eventsQuery.data ?? []).map((e) => {
        const joined = joinedEvents.includes(e.id);
        return (
          <section key={e.id} className="mb-8 rounded-2xl border p-4">
            <Link to="/events/$id" params={{ id: e.id }} className="block">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{e.title}</h2>
                <span className="shrink-0 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {e.time_label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{e.blurb}</p>
              <p className="mt-2 text-[11px] text-accent">Open event — see everyone's NOWs</p>
            </Link>

            <div className="mt-3 flex items-center justify-between">
              {joined ? (
                activeEvent?.id === e.id ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="wordmark tabular text-accent">{formatCountdown(activeEvent.secondsLeft)}</span>
                    <Link to="/post" className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
                      Post to event
                    </Link>
                    <button onClick={leaveActiveEvent} className="text-muted-foreground">
                      Leave
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3.5" /> Joined — window closed
                  </span>
                )
              ) : !user ? (
                <Link to="/auth" className="rounded-full border px-4 py-1.5 text-xs">
                  Sign in to join
                </Link>
              ) : isPro ? (
                <button
                  onClick={() => joinEvent(e.id, e.title)}
                  className="rounded-full border px-4 py-1.5 text-xs transition-colors hover:bg-muted"
                >
                  Join
                </button>
              ) : (
                <Link to="/pro" className="rounded-full border px-4 py-1.5 text-xs">
                  Join with Pro
                </Link>
              )}
            </div>
          </section>
        );
      })}

      <h2 className="meta-label mt-10 mb-3">NOW Quest</h2>
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
