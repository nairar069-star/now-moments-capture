import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchUserNows, mediaUrl } from "@/lib/nowdb";
import type { Profile } from "@/lib/auth";

export const Route = createFileRoute("/u/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} on NOW` },
      { name: "description", content: `See what @${params.handle} is doing right now on NOW.` },
      { property: "og:title", content: `@${params.handle} on NOW` },
      { property: "og:description", content: "People, not popularity. No followers count games." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicProfile,
});

function PublicProfile() {
  const { handle } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", handle],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url, is_pro")
        .eq("handle", handle)
        .maybeSingle();
      return (data as Profile | null) ?? null;
    },
  });
  const profile = profileQuery.data ?? null;

  useEffect(() => {
    let alive = true;
    void mediaUrl("avatars", profile?.avatar_url ?? null).then((u) => alive && setAvatar(u));
    return () => {
      alive = false;
    };
  }, [profile?.avatar_url]);

  const postsQuery = useQuery({
    queryKey: ["user-nows", profile?.id, user?.id ?? null],
    queryFn: () => fetchUserNows(profile!.id, user?.id ?? null),
    enabled: Boolean(profile?.id),
  });

  const statsQuery = useQuery({
    queryKey: ["follow-stats", profile?.id, user?.id ?? null],
    queryFn: async () => {
      const [followers, following, mine] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile!.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile!.id),
        user
          ? supabase
              .from("follows")
              .select("follower_id")
              .eq("follower_id", user.id)
              .eq("following_id", profile!.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        followers: followers.count ?? 0,
        following: following.count ?? 0,
        isFollowing: Boolean((mine as { data: unknown }).data),
      };
    },
    enabled: Boolean(profile?.id),
  });

  async function toggleFollow() {
    if (!user || !profile) return;
    if (statsQuery.data?.isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
    }
    await queryClient.invalidateQueries({ queryKey: ["follow-stats", profile.id, user.id] });
  }

  if (profileQuery.isLoading) {
    return (
      <AppShell title="Profile">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Not here" subtitle={`@${handle}`}>
        <p className="text-sm text-muted-foreground">This person isn't on NOW yet.</p>
      </AppShell>
    );
  }

  const isMe = user?.id === profile.id;

  return (
    <AppShell title={profile.display_name} subtitle={`@${profile.handle}`}>
      <div className="flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt={profile.display_name} className="size-16 rounded-full object-cover" />
        ) : (
          <div className="wordmark flex size-16 items-center justify-center rounded-full bg-muted text-lg">
            {profile.display_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[15px] font-medium">{profile.display_name}</p>
          <p className="text-sm text-muted-foreground">{profile.bio || "No bio yet."}</p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4 border-y py-4 text-center">
        <div>
          <dt className="meta-label">NOWs</dt>
          <dd className="wordmark tabular mt-1 text-xl">{postsQuery.data?.length ?? 0}</dd>
        </div>
        <div>
          <dt className="meta-label">Followers</dt>
          <dd className="wordmark tabular mt-1 text-xl">{statsQuery.data?.followers ?? 0}</dd>
        </div>
        <div>
          <dt className="meta-label">Following</dt>
          <dd className="wordmark tabular mt-1 text-xl">{statsQuery.data?.following ?? 0}</dd>
        </div>
      </dl>

      {isMe ? (
        <Link to="/profile" className="mt-6 block rounded-full border px-4 py-3 text-center text-sm">
          Edit your profile
        </Link>
      ) : user ? (
        <button
          onClick={() => void toggleFollow()}
          className={
            statsQuery.data?.isFollowing
              ? "mt-6 w-full rounded-full border px-4 py-3 text-sm"
              : "mt-6 w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
          }
        >
          {statsQuery.data?.isFollowing ? "Following" : "Follow"}
        </button>
      ) : (
        <Link
          to="/auth"
          className="mt-6 block rounded-full bg-foreground px-4 py-3 text-center text-sm font-medium text-background"
        >
          Sign in to follow
        </Link>
      )}

      <h2 className="meta-label mt-10 mb-4">Their NOWs</h2>
      {postsQuery.data?.length ? (
        postsQuery.data.map((p) => <NowCard key={p.id} post={p} />)
      ) : (
        <p className="text-sm text-muted-foreground">Nothing posted yet.</p>
      )}
    </AppShell>
  );
}
