import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchUserNows, mediaUrl, uploadMedia } from "@/lib/nowdb";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile | NOW" },
      { name: "description", content: "Customise your NOW profile: picture, name, handle and bio." },
      { property: "og:title", content: "Your profile on NOW" },
      { property: "og:description", content: "People, not popularity. No followers, no likes." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, loading, isPro, refreshProfile, signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name);
    setHandle(profile.handle);
    setBio(profile.bio);
  }, [profile]);

  useEffect(() => {
    let alive = true;
    void mediaUrl("avatars", profile?.avatar_url ?? null).then((u) => alive && setAvatar(u));
    return () => {
      alive = false;
    };
  }, [profile?.avatar_url]);

  const postsQuery = useQuery({
    queryKey: ["user-nows", user?.id ?? null, user?.id ?? null],
    queryFn: () => fetchUserNows(user!.id, user!.id),
    enabled: Boolean(user?.id),
  });

  async function pickAvatar(file: File) {
    if (!user) return;
    setStatus("Uploading…");
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = await uploadMedia(user.id, "avatars", URL.createObjectURL(file), ext);
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setStatus("Profile picture updated.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed.");
    }
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    setStatus("");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name.trim() || "Someone",
        handle: handle.trim().replace(/^@/, "").toLowerCase(),
        bio: bio.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setStatus(error.message.includes("duplicate") ? "That handle is taken." : error.message);
      return;
    }
    await refreshProfile();
    await queryClient.invalidateQueries();
    setStatus("Saved.");
  }

  if (loading || !profile) {
    return (
      <AppShell title="You">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="You" subtitle={`@${profile.handle}`}>
      <div className="flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="Your profile picture" className="size-16 rounded-full object-cover" />
        ) : (
          <div className="wordmark flex size-16 items-center justify-center rounded-full bg-muted text-lg">
            {profile.display_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <button onClick={() => fileRef.current?.click()} className="rounded-full border px-3 py-1.5 text-xs">
            Change picture
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void pickAvatar(f);
            }}
          />
          {isPro ? <p className="mt-2 text-[11px] text-accent">NOW Pro member</p> : null}
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <p className="meta-label mb-2">Name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-sm outline-none"
          />
        </div>
        <div>
          <p className="meta-label mb-2">Handle</p>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-sm outline-none"
          />
        </div>
        <div>
          <p className="meta-label mb-2">Bio</p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Say something short."
            className="w-full resize-none border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={() => void save()}
          disabled={saving}
          className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {status ? <p className="text-xs text-accent">{status}</p> : null}
      </div>

      <div className="mt-8 space-y-2">
        <Link to="/u/$handle" params={{ handle: profile.handle }} className="block rounded-lg border px-4 py-3 text-sm">
          View your public profile
        </Link>
        <Link to="/friends" className="block rounded-lg border px-4 py-3 text-sm">
          Friends
        </Link>
        <Link to="/settings" className="block rounded-lg border px-4 py-3 text-sm">
          Privacy & settings
        </Link>
        <Link to="/ai" className="block rounded-lg border px-4 py-3 text-sm">
          NOW AI — memory assistant
        </Link>
        {!isPro ? (
          <Link
            to="/pro"
            className="flex items-center justify-between rounded-lg bg-foreground px-4 py-3 text-sm text-background"
          >
            NOW Pro — create and join events
            <span className="text-xs opacity-70">$10/mo</span>
          </Link>
        ) : null}
        <button
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await signOut();
            void navigate({ to: "/auth", replace: true });
          }}
          className="w-full rounded-lg border px-4 py-3 text-left text-sm text-destructive"
        >
          Sign out
        </button>
      </div>

      <h2 className="meta-label mt-10 mb-4">Your NOWs</h2>
      {postsQuery.data?.length ? (
        postsQuery.data.map((p) => <NowCard key={p.id} post={p} />)
      ) : (
        <p className="text-sm text-muted-foreground">You haven't posted a NOW yet.</p>
      )}
    </AppShell>
  );
}
