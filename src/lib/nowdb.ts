import { supabase } from "@/integrations/supabase/client";
import type { NowPost, Visibility } from "@/lib/nowData";

export type DbEvent = {
  id: string;
  title: string;
  time_label: string;
  blurb: string;
  created_by: string | null;
  created_at: string;
};

type NowRow = {
  id: string;
  user_id: string;
  photo_url: string;
  video_url: string | null;
  selfie_url: string | null;
  caption: string | null;
  place: string | null;
  visibility: string;
  once: boolean;
  collaborators: string[];
  event_id: string | null;
  created_at: string;
  profiles: { handle: string; display_name: string; avatar_url: string | null } | null;
};

export function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Media is stored privately; resolve a storage path into a temporary URL. */
export async function mediaUrl(bucket: "nows" | "avatars", path: string | null) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? null;
}

export async function uploadMedia(userId: string, bucket: "nows" | "avatars", src: string, ext: string) {
  const blob = await (await fetch(src)).blob();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || (ext === "webm" ? "video/webm" : "image/jpeg"),
    upsert: false,
  });
  if (error) throw error;
  return path;
}

const SELECT = "*, profiles:profiles!nows_user_id_fkey(handle, display_name, avatar_url)";

async function toPosts(rows: NowRow[], myId: string | null): Promise<NowPost[]> {
  return Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      dbId: r.id,
      mine: r.user_id === myId,
      profileHandle: r.profiles?.handle,
      user: r.profiles?.display_name ?? "Someone",
      handle: r.profiles ? `@${r.profiles.handle}` : "@someone",
      photo: (await mediaUrl("nows", r.photo_url)) ?? "",
      video: (await mediaUrl("nows", r.video_url)) ?? undefined,
      selfie: (await mediaUrl("nows", r.selfie_url)) ?? undefined,
      ago: timeAgo(r.created_at),
      caption: r.caption ?? undefined,
      place: r.place ?? undefined,
      visibility: (r.visibility as Visibility) ?? "friends",
      once: r.once,
      collaborators: r.collaborators.length ? r.collaborators : undefined,
      reactions: [],
    })),
  );
}

export async function fetchFeed(myId: string | null) {
  const { data, error } = await supabase
    .from("nows")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return toPosts((data ?? []) as unknown as NowRow[], myId);
}

export async function fetchUserNows(userId: string, myId: string | null) {
  const { data, error } = await supabase
    .from("nows")
    .select(SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return toPosts((data ?? []) as unknown as NowRow[], myId);
}

export async function fetchEventNows(eventId: string, myId: string | null) {
  const { data, error } = await supabase
    .from("nows")
    .select(SELECT)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return toPosts((data ?? []) as unknown as NowRow[], myId);
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbEvent[];
}

export async function deleteNow(id: string) {
  const { error } = await supabase.from("nows").delete().eq("id", id);
  if (error) throw error;
}
