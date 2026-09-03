import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/now/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/nowdb";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "People — find and follow on NOW" },
      { name: "description", content: "Find people on NOW, open their profile and follow them." },
      { property: "og:title", content: "People on NOW" },
      { property: "og:description", content: "No followers count games. Just the people you actually see." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: People,
});

type Row = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
};

function People() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const peopleQuery = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      const rows = (data ?? []) as Row[];
      return Promise.all(
        rows.map(async (r) => ({ ...r, avatar: await mediaUrl("avatars", r.avatar_url) })),
      );
    },
  });

  const followingQuery = useQuery({
    queryKey: ["following", user?.id ?? null],
    queryFn: async () => {
      const { data } = await supabase.from("follows").select("following_id").eq("follower_id", user!.id);
      return new Set((data ?? []).map((f) => f.following_id as string));
    },
    enabled: Boolean(user),
  });

  async function toggle(id: string) {
    if (!user) return;
    if (followingQuery.data?.has(id)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
    }
    await queryClient.invalidateQueries({ queryKey: ["following", user.id] });
  }

  const term = q.trim().toLowerCase();
  const all = (peopleQuery.data ?? []).filter((p) => p.id !== user?.id);
  const list = term
    ? all.filter((p) => `${p.handle} ${p.display_name}`.toLowerCase().includes(term))
    : all;
  const following = list.filter((p) => followingQuery.data?.has(p.id));
  const others = list.filter((p) => !followingQuery.data?.has(p.id));

  function Person({ p }: { p: (typeof all)[number] }) {
    const isFollowing = Boolean(followingQuery.data?.has(p.id));
    return (
      <li className="flex items-center gap-3 py-3">
        <Link to="/u/$handle" params={{ handle: p.handle }} className="flex min-w-0 flex-1 items-center gap-3">
          {p.avatar ? (
            <img src={p.avatar} alt={p.display_name} loading="lazy" className="size-10 rounded-full object-cover" />
          ) : (
            <span className="wordmark flex size-10 items-center justify-center rounded-full bg-muted text-sm">
              {p.display_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{p.display_name}</span>
            <span className="block truncate text-[11px] text-muted-foreground">
              @{p.handle}
              {p.bio ? ` · ${p.bio}` : ""}
            </span>
          </span>
        </Link>
        {user ? (
          <button
            onClick={() => void toggle(p.id)}
            className={
              isFollowing
                ? "rounded-full border px-3 py-1 text-xs text-muted-foreground"
                : "rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
            }
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : (
          <Link to="/auth" className="rounded-full border px-3 py-1 text-xs">
            Sign in
          </Link>
        )}
      </li>
    );
  }

  return (
    <AppShell title="People" subtitle="Open a profile, follow the people you actually see.">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or handle"
        className="mb-8 w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
      />

      {peopleQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      {following.length > 0 ? (
        <section className="mb-8">
          <h2 className="meta-label mb-3">Following — {following.length}</h2>
          <ul className="divide-y divide-[var(--hairline)]">
            {following.map((p) => (
              <Person key={p.id} p={p} />
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="meta-label mb-3">On NOW</h2>
        <ul className="divide-y divide-[var(--hairline)]">
          {others.map((p) => (
            <Person key={p.id} p={p} />
          ))}
          {!peopleQuery.isLoading && others.length === 0 ? (
            <li className="py-3 text-sm text-muted-foreground">No one else here yet.</li>
          ) : null}
        </ul>
      </section>
    </AppShell>
  );
}
