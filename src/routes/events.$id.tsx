import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchEventNows, type DbEvent } from "@/lib/nowdb";
import { useNow } from "@/lib/now-store";
import { formatCountdown } from "@/lib/now-store";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event — everyone's NOWs | NOW" },
      { name: "description", content: "Open an event and see every NOW people posted in that moment." },
      { property: "og:title", content: "An event on NOW" },
      { property: "og:description", content: "Thousands of people, the same minute, everywhere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const { user, isPro } = useAuth();
  const { activeEvent, joinEvent, leaveActiveEvent } = useNow();

  const eventQuery = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      return (data as DbEvent | null) ?? null;
    },
  });

  const postsQuery = useQuery({
    queryKey: ["event-nows", id, user?.id ?? null],
    queryFn: () => fetchEventNows(id, user?.id ?? null),
  });

  const event = eventQuery.data;

  if (!event) {
    return (
      <AppShell title="Event">
        <p className="text-sm text-muted-foreground">{eventQuery.isLoading ? "Loading…" : "This event is gone."}</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={event.title} subtitle={event.time_label}>
      <p className="text-sm text-muted-foreground">{event.blurb}</p>

      <div className="mt-4">
        {activeEvent?.id === event.id ? (
          <div className="flex items-center gap-3">
            <Link
              to="/post"
              className="flex-1 rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground"
            >
              Post to this event
            </Link>
            <span className="wordmark tabular text-sm text-accent">
              {formatCountdown(activeEvent.secondsLeft)}
            </span>
            <button onClick={leaveActiveEvent} className="text-xs text-muted-foreground">
              Leave
            </button>
          </div>
        ) : !user ? (
          <Link
            to="/auth"
            className="block rounded-full bg-foreground px-4 py-3 text-center text-sm font-medium text-background"
          >
            Sign in to join
          </Link>
        ) : isPro ? (
          <button
            onClick={() => joinEvent(event.id, event.title)}
            className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
          >
            Join event
          </button>
        ) : (
          <Link
            to="/pro"
            className="block rounded-full bg-foreground px-4 py-3 text-center text-sm font-medium text-background"
          >
            Join with NOW Pro — $10/month
          </Link>
        )}
      </div>

      <h2 className="meta-label mt-10 mb-4">Posted in this event</h2>
      {postsQuery.data?.length ? (
        postsQuery.data.map((p) => <NowCard key={p.id} post={p} />)
      ) : (
        <p className="text-sm text-muted-foreground">No NOWs here yet. Be the first.</p>
      )}
    </AppShell>
  );
}
