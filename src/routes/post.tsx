import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Eye, RefreshCw, Square, Users, Video, X } from "lucide-react";
import { formatCountdown, useNow } from "@/lib/now-store";
import { photos, type Visibility } from "@/lib/nowData";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/nowdb";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a NOW | NOW" },
      { name: "description", content: "Open the camera and post a NOW — photo, video or dual camera." },
      { property: "og:title", content: "Post a NOW" },
      { property: "og:description", content: "Take it now, share it now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Compose,
});

const visibilities: { key: Visibility; label: string }[] = [
  { key: "private", label: "Private" },
  { key: "friends", label: "Friends" },
  { key: "public", label: "Public" },
];

type Mode = "photo" | "video" | "dual";

function Compose() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const { postNow, drop, doubleNow, cities, worldPlace, activeEvent, friends } = useNow();
  const videoRef = useRef<HTMLVideoElement>(null);
  const frontRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frontStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [mode, setMode] = useState<Mode>("photo");
  const [dualMain, setDualMain] = useState<"user" | "environment">("user");
  const [dualVideo, setDualVideo] = useState(false);
  const [recording, setRecording] = useState(false);
  const [live, setLive] = useState(false);
  const [dualLive, setDualLive] = useState(false);
  const [shots, setShots] = useState<string[]>([]);
  const [clip, setClip] = useState<string | undefined>(undefined);
  const [clip2, setClip2] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [place, setPlace] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("friends");
  const [once, setOnce] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const myFriends = friends.filter((f) => f.status === "friend");
  const other = (f: "user" | "environment") => (f === "user" ? "environment" : "user");
  const dualPhoto = mode === "dual" && !dualVideo;
  const needed = dualPhoto ? 2 : doubleNow && mode === "photo" ? 2 : 1;
  const done = clip ? true : shots.length >= needed;


  // Main camera stream.
  const mainFacing =
    mode !== "dual" ? facing : dualPhoto && shots.length === 1 ? other(dualMain) : dualMain;
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mainFacing },
          audio: mode === "video" || dualVideo,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setLive(true);
        }
      } catch {
        setLive(false);
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [mainFacing, mode, dualVideo]);

  // Dual video: a second, simultaneous stream so both cameras record at once.
  useEffect(() => {
    if (mode !== "dual" || !dualVideo) {
      setDualLive(false);
      return;
    }
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: other(dualMain) },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        frontStreamRef.current = stream;
        if (frontRef.current) {
          frontRef.current.srcObject = stream;
          await frontRef.current.play();
          setDualLive(true);
        }
      } catch {
        setDualLive(false);
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [mode, dualVideo, dualMain]);


  function grab(el: HTMLVideoElement | null) {
    if (el && el.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = el.videoWidth;
      canvas.height = el.videoHeight;
      // No mirroring: the frame is drawn exactly as the sensor sees it.
      canvas.getContext("2d")?.drawImage(el, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.85);
    }
    return photos[Math.floor(Math.random() * photos.length)]!;
  }

  function capture() {
    // Dual photo: one camera at a time — main first, then the small one.
    const next = [...shots, grab(live ? videoRef.current : null)].slice(0, needed);
    setShots(next);
    if (doubleNow && mode === "photo" && next.length === 1) setFacing("user");
  }

  function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    const stream = streamRef.current;
    if (!stream) return;
    try {
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      // Dual video: the second camera records at the same time.
      let rec2: MediaRecorder | null = null;
      if (dualVideo && frontStreamRef.current) {
        const chunks2: BlobPart[] = [];
        rec2 = new MediaRecorder(frontStreamRef.current);
        rec2.ondataavailable = (e) => chunks2.push(e.data);
        rec2.onstop = () =>
          setClip2(URL.createObjectURL(new Blob(chunks2, { type: rec2!.mimeType || "video/webm" })));
      }
      rec.onstop = () => {
        if (rec2 && rec2.state === "recording") rec2.stop();
        setClip(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "video/webm" })));
        setRecording(false);
      };
      recorderRef.current = rec;
      rec.start();
      rec2?.start();
      setRecording(true);
      setTimeout(() => rec.state === "recording" && rec.stop(), 15000);
    } catch {
      setRecording(false);
    }
  }


  async function publish() {
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setPublishing(true);
    setPublishError("");
    try {
      const photoPath = await uploadMedia(user.id, "nows", shots[0] ?? photos[0]!, "jpg");
      const videoPath = clip ? await uploadMedia(user.id, "nows", clip, "webm") : null;
      const selfiePath = shots[1] ? await uploadMedia(user.id, "nows", shots[1], "jpg") : null;
      const { error } = await supabase.from("nows").insert({
        user_id: user.id,
        photo_url: photoPath,
        video_url: videoPath,
        selfie_url: selfiePath,
        caption: caption || null,
        place: place || null,
        visibility,
        once,
        collaborators,
        event_id: activeEvent?.id ?? null,
      });
      if (error) throw error;
      await queryClient.invalidateQueries();
    } catch (e) {
      setPublishing(false);
      setPublishError(e instanceof Error ? e.message : "Could not post your NOW.");
      return;
    }
    setPublishing(false);
    postNowLocal();
  }

  function postNowLocal() {
    postNow({
      photo: shots[0] ?? photos[0]!,
      video: clip,
      selfie: shots[1],
      caption: caption || undefined,
      place: place || undefined,
      visibility,
      once,
      collaborators,
      eventId: activeEvent?.id,
    });
    void navigate({ to: activeEvent ? "/events" : "/" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 pt-5 pb-10 sm:max-w-lg">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Close" className="rounded-full p-2 hover:bg-muted">
          <X className="size-5" />
        </Link>
        <p className="meta-label">
          {mode === "dual"
            ? "Dual camera — front + back"
            : doubleNow
              ? "Double NOW — back, then front"
              : "Post a NOW"}
        </p>
        {drop.active ? (
          <span className="wordmark tabular text-sm text-accent">{formatCountdown(drop.secondsLeft)}</span>
        ) : (
          <span className="w-9" />
        )}
      </div>

      {activeEvent ? (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
          <span className="truncate">Sending to {activeEvent.title}</span>
          <span className="wordmark tabular ml-3">{formatCountdown(activeEvent.secondsLeft)}</span>
        </div>
      ) : null}

      {!done ? (
        <div className="mt-4 flex justify-center gap-1 rounded-full bg-muted p-1 text-xs">
          {(["photo", "video", "dual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setShots([]);
                setClip(undefined);
              }}
              className={cn(
                "flex-1 rounded-full py-2 capitalize transition-colors",
                mode === m ? "bg-background font-medium shadow-sm" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative mt-4 overflow-hidden rounded-2xl bg-foreground/90">
        <video
          ref={videoRef}
          playsInline
          muted
          // Never mirrored, on either camera.
          style={{ transform: "none" }}
          className={cn("aspect-[4/5] w-full object-cover", done && "opacity-0")}
        />
        {mode === "dual" && !done ? (
          <video
            ref={frontRef}
            playsInline
            muted
            style={{ transform: "none" }}
            className="absolute top-3 left-3 h-32 w-24 rounded-lg border-2 border-background/80 bg-foreground object-cover"
          />
        ) : null}
        {clip ? (
          <video
            src={clip}
            controls
            playsInline
            className="absolute inset-0 h-full w-full bg-foreground object-cover"
          />
        ) : shots[0] && done ? (
          <img src={shots[0]} alt="Your NOW" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        {shots[1] && done ? (
          <img
            src={shots[1]}
            alt=""
            className="absolute top-3 left-3 h-28 w-20 rounded-lg border-2 border-background/80 object-cover"
          />
        ) : null}
        {recording ? (
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-[11px] text-background">
            <span className="size-1.5 animate-pulse rounded-full bg-background" /> REC
          </span>
        ) : null}
        {!live && !done ? (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs text-background/80">
            Camera unavailable — tap the shutter to use a sample frame.
          </p>
        ) : null}
        {mode === "dual" && live && !dualLive && !done ? (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs text-background/80">
            Only one camera on this device — the second frame is a sample.
          </p>
        ) : null}
      </div>

      {!done ? (
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            aria-label="Flip camera"
            disabled={mode === "dual"}
            className="rounded-full p-3 text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <RefreshCw className="size-5" />
          </button>
          <button
            onClick={mode === "video" ? toggleRecording : capture}
            aria-label={mode === "video" ? (recording ? "Stop recording" : "Record video") : "Take photo"}
            className="flex size-18 items-center justify-center rounded-full border-2 border-foreground p-1 transition-transform active:scale-95"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full text-background",
                recording ? "bg-destructive" : "bg-foreground",
              )}
            >
              {mode === "video" ? (
                recording ? (
                  <Square className="size-4" />
                ) : (
                  <Video className="size-5" />
                )
              ) : (
                <Camera className="size-5" />
              )}
            </span>
          </button>
          <span className="w-11 text-center text-[11px] text-muted-foreground">
            {doubleNow && mode === "photo" ? `${shots.length}/2` : ""}
          </span>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something (optional)"
            className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
          />

          <div>
            <p className="meta-label mb-2">Location</p>
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Type a place, or pick one"
              className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[worldPlace, ...cities.slice(0, 3).map((c) => c.name)]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((c) => (
                  <button
                    key={c}
                    onClick={() => setPlace(c)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      place === c ? "border-foreground" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {c}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <p className="meta-label mb-2 flex items-center gap-1.5">
              <Users className="size-3.5" /> Collaborators
            </p>
            <div className="flex flex-wrap gap-2">
              {myFriends.map((f) => {
                const on = collaborators.includes(f.name);
                return (
                  <button
                    key={f.handle}
                    onClick={() =>
                      setCollaborators((c) => (on ? c.filter((x) => x !== f.name) : [...c, f.name]))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      on ? "border-accent text-accent" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="meta-label mb-2">Who can see this</p>
            <div className="flex gap-2">
              {visibilities.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVisibility(v.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    visibility === v.key ? "border-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setOnce((o) => !o)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
              once && "border-accent text-accent",
            )}
          >
            <span className="flex items-center gap-2">
              <Eye className="size-4" /> View once
            </span>
            <span className="text-[11px] tracking-[0.14em] uppercase">{once ? "On" : "Off"}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShots([]);
                setClip(undefined);
                if (doubleNow) setFacing("environment");
              }}
              className="flex-1 rounded-full border px-4 py-3 text-sm"
            >
              Retake
            </button>
            <button
              onClick={() => void publish()}
              disabled={publishing}
              className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-foreground disabled:opacity-40"
            >
              {publishing ? "Posting…" : activeEvent ? "Send to event" : "Post a NOW"}
            </button>
          </div>
          {publishError ? <p className="text-xs text-destructive">{publishError}</p> : null}
        </div>
      )}
    </div>
  );
}
