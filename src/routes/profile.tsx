import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { me } from "@/lib/nowData";
import { useNow } from "@/lib/now-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile | NOW" },
      { name: "description", content: "A minimal NOW profile: your latest NOW, memories and Togethers." },
      { property: "og:title", content: "Your profile on NOW" },
      { property: "og:description", content: "People, not popularity. No followers, no likes." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { feed } = useNow();
  const latest = feed[0]!;

  return (
    <AppShell title="You" subtitle={me.handle}>
      <div className="flex items-center gap-4">
        <img
          src={me.photo}
          alt="Your profile"
          loading="lazy"
          width={768}
          height={1024}
          className="size-16 rounded-full object-cover"
        />
        <div>
          <p className="text-[15px] font-medium">{me.name}</p>
          <p className="text-sm text-muted-foreground">{me.bio}</p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4 border-y py-4 text-center">
        {[
          ["NOWs", me.nows],
          ["Memories", me.memories],
          ["Togethers", me.togethers],
        ].map(([k, v]) => (
          <div key={k as string}>
            <dt className="meta-label">{k}</dt>
            <dd className="wordmark tabular mt-1 text-xl">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">{me.streak} consecutive NOWs.</p>

      <h2 className="meta-label mt-8 mb-3">Most recent NOW</h2>
      <img
        src={latest.photo}
        alt="Your most recent NOW"
        loading="lazy"
        width={768}
        height={1024}
        className="aspect-[4/5] w-full rounded-xl object-cover"
      />

      <div className="mt-8 space-y-2">
        <Link to="/settings" className="block rounded-lg border px-4 py-3 text-sm">
          Privacy & settings
        </Link>
        <Link to="/ai" className="block rounded-lg border px-4 py-3 text-sm">
          NOW AI — memory assistant
        </Link>
      </div>
    </AppShell>
  );
}
