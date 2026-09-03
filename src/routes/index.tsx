import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { useNow } from "@/lib/now-store";
import { me } from "@/lib/nowData";
import { useAuth } from "@/lib/auth";
import { fetchFeed } from "@/lib/nowdb";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { feed, secrets, drop, postedToday, quests, joinedQuests, joinQuest, togetherRequests, answerTogether } =
    useNow();
  const { user } = useAuth();
  const dbFeed = useQuery({
    queryKey: ["feed", user?.id ?? null],
    queryFn: () => fetchFeed(user?.id ?? null),
  });
  const unopened = secrets.filter((s) => !s.opened);
  const quest = quests[0]!;
  const pending = togetherRequests.filter((t) => t.status === "pending");

  return (
    <AppShell title="Your people" subtitle="See your people, right now.">
      <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>{me.streak} day streak.</span>
        <span>
          {postedToday ? "Your NOW is live." : drop.missed ? "Missed your NOW." : "Post a NOW to unblur."}
        </span>
      </div>

      {pending.map((t) => (
        <div key={t.id} className="mb-6 rounded-2xl border p-4">
          <p className="meta-label">Together confirmation</p>
          <p className="mt-1 text-sm">
            {t.from} says you were together at {t.time}, {t.place}.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => answerTogether(t.id, false)} className="flex-1 rounded-full border py-2 text-xs">
              Not me
            </button>
            <button
              onClick={() => answerTogether(t.id, true)}
              className="flex-1 rounded-full bg-accent py-2 text-xs font-medium text-accent-foreground"
            >
              Confirm
            </button>
          </div>
        </div>
      ))}

      {unopened.length > 0 ? (
        <Link
          to="/secret"
          className="mb-6 flex items-center justify-between rounded-xl border border-foreground/15 px-4 py-3"
        >
          <span className="text-sm">{unopened[0]!.from} sent you a Secret NOW.</span>
          <span className="meta-label">Open once</span>
        </Link>
      ) : null}

      <div className="mb-8 rounded-xl bg-muted px-4 py-3">
        <p className="meta-label">{quest.label}</p>
        <p className="mt-1 text-sm">{quest.title}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{quest.joined.toLocaleString()} joined</span>
          {joinedQuests.includes(quest.id) ? (
            <Link to="/post" className="text-xs text-accent">
              Post it
            </Link>
          ) : (
            <button
              onClick={() => joinQuest(quest.id)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-background"
            >
              Join quest
            </button>
          )}
        </div>
      </div>

      {!user ? (
        <Link
          to="/auth"
          className="mb-8 flex items-center justify-between rounded-xl bg-foreground px-4 py-3.5 text-sm text-background"
        >
          Sign in to post your own NOW
          <span className="text-[11px] tracking-[0.14em] uppercase opacity-70">Join</span>
        </Link>
      ) : null}

      {(dbFeed.data ?? []).map((post) => (
        <NowCard key={post.id} post={post} />
      ))}

      {feed.map((post) => (
        <NowCard key={post.id} post={post} />
      ))}

      <p className="pt-2 pb-4 text-center text-xs text-muted-foreground">
        That's everyone. Less scrolling, more moments.
      </p>
    </AppShell>
  );
}
