import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { useNow } from "@/lib/now-store";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "Friends — your people on NOW" },
      { name: "description", content: "See who you're friends with on NOW, accept requests and add new people." },
      { property: "og:title", content: "Friends on NOW" },
      { property: "og:description", content: "No followers. Just the people you actually see." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Friends,
});

function Friends() {
  const { friends, addFriend, answerFriend, removeFriend } = useNow();
  const [q, setQ] = useState("");
  const match = (h: string, n: string) =>
    !q.trim() || `${h} ${n}`.toLowerCase().includes(q.trim().toLowerCase());

  const mine = friends.filter((f) => f.status === "friend" && match(f.handle, f.name));
  const pending = friends.filter((f) => f.status === "pending");
  const others = friends.filter((f) => f.status !== "friend" && f.status !== "pending" && match(f.handle, f.name));

  return (
    <AppShell title="Friends" subtitle="The people you actually see.">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or @handle"
        className="mb-8 w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
      />

      {pending.length > 0 ? (
        <section className="mb-8">
          <h2 className="meta-label mb-3">Requests</h2>
          <ul className="space-y-3">
            {pending.map((f) => (
              <li key={f.handle} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                <img src={f.photo} alt="" loading="lazy" className="size-10 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{f.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{f.handle}</span>
                </span>
                <button
                  onClick={() => answerFriend(f.handle, false)}
                  className="rounded-full border px-3 py-1 text-xs"
                >
                  Ignore
                </button>
                <button
                  onClick={() => answerFriend(f.handle, true)}
                  className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="meta-label mb-3">Your friends — {mine.length}</h2>
        <ul className="divide-y divide-[var(--hairline)]">
          {mine.map((f) => (
            <li key={f.handle} className="flex items-center gap-3 py-3">
              <img src={f.photo} alt="" loading="lazy" className="size-10 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{f.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {f.handle} · last NOW {f.lastNow}
                </span>
              </span>
              <button
                onClick={() => removeFriend(f.handle)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
              >
                Remove
              </button>
            </li>
          ))}
          {mine.length === 0 ? <li className="py-3 text-sm text-muted-foreground">No one here yet.</li> : null}
        </ul>
      </section>

      <section>
        <h2 className="meta-label mb-3">Add people</h2>
        <ul className="divide-y divide-[var(--hairline)]">
          {others.map((f) => (
            <li key={f.handle} className="flex items-center gap-3 py-3">
              <img src={f.photo} alt="" loading="lazy" className="size-10 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{f.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {f.handle} · {f.lastNow}
                </span>
              </span>
              {f.status === "requested" ? (
                <span className="meta-label">Requested</span>
              ) : (
                <button
                  onClick={() => addFriend(f.handle)}
                  className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted"
                >
                  Add friend
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
