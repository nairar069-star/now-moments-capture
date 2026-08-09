import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { useNow } from "@/lib/now-store";
import { me, quests } from "@/lib/nowData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOW — See your people, right now." },
      {
        name: "description",
        content:
          "Open NOW to see what your friends are doing right now. No feeds, no likes — just moments.",
      },
      { property: "og:title", content: "NOW — See your people, right now." },
      {
        property: "og:description",
        content: "A spontaneous social app for real moments, not polished content.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { feed, secrets, drop, postedToday } = useNow();
  const unopened = secrets.filter((s) => !s.opened);
  const quest = quests[0]!;

  return (
    <AppShell title="Your people" subtitle="See your people, right now.">
      <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>You've been here for {me.streak} days.</span>
        <span>{postedToday ? "Your NOW is live." : drop.missed ? "Missed your NOW." : "Post a NOW to unblur."}</span>
      </div>

      {unopened.length > 0 ? (
        <Link
          to="/secret"
          className="mb-6 flex items-center justify-between rounded-lg border border-foreground/15 bg-surface px-4 py-3"
        >
          <span className="text-sm">🔐 {unopened[0]!.from} sent you a Secret NOW.</span>
          <span className="meta-label">Open once</span>
        </Link>
      ) : null}

      <Link
        to="/events"
        className="mb-8 block rounded-lg bg-muted px-4 py-3 transition-colors hover:bg-secondary"
      >
        <p className="meta-label">{quest.label}</p>
        <p className="mt-1 text-sm">{quest.title}</p>
      </Link>

      {feed.map((post) => (
        <NowCard key={post.id} post={post} />
      ))}

      <p className="pt-2 pb-4 text-center text-xs text-muted-foreground">
        That's everyone. Less scrolling, more moments.
      </p>
    </AppShell>
  );
}
