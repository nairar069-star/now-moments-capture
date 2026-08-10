import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Camera, RefreshCw, Square, Video, X } from "lucide-react";
import { formatCountdown, useNow } from "@/lib/now-store";
import { photos, type Visibility } from "@/lib/nowData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a NOW | NOW" },
      { name: "description", content: "Open the camera and post a NOW — photo or video. Spontaneous, not polished." },
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

function Compose() {
  const navigate = useNavigate();
  const { postNow, drop, doubleNow, cities, worldPlace } = useNow();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [recording, setRecording] = useState(false);
  const [live, setLive] = useState(false);
  const [shots, setShots] = useState<string[]>([]);
  const [clip, setClip] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [place, setPlace] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("friends");
  const needed = doubleNow ? 2 : 1;
  const done = clip ? true : shots.length >= needed;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: mode === "video",
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
  }, [facing, mode]);

  function capture() {
    let shot: string | undefined;
    const video = videoRef.current;
    if (live && video && video.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // No mirroring: draw the frame exactly as the sensor sees it.
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      shot = canvas.toDataURL("image/jpeg", 0.85);
    } else {
      shot = photos[Math.floor(Math.random() * photos.length)]!;
    }
    const next = [...shots, shot!].slice(0, needed);
    setShots(next);
    // Double NOW: first the back camera, then automatically flip to the front.
    if (doubleNow && next.length === 1) setFacing("user");
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
      rec.onstop = () => {
        setClip(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "video/webm" })));
        setRecording(false);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setTimeout(() => rec.state === "recording" && rec.stop(), 15000);
    } catch {
      setRecording(false);
    }
  }

  function publish() {
    postNow({
      photo: shots[0] ?? photos[0]!,
      video: clip,
      selfie: shots[1],
      caption: caption || undefined,
      place: place || undefined,
      visibility,
    });
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 pt-5 pb-10 sm:max-w-lg">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Close" className="rounded-full p-2 hover:bg-muted">
          <X className="size-5" />
        </Link>
        <p className="meta-label">{doubleNow ? "Double NOW — back, then front" : "Post a NOW"}</p>
        {drop.active ? (
          <span className="wordmark tabular text-sm text-accent">{formatCountdown(drop.secondsLeft)}</span>
        ) : (
          <span className="w-9" />
        )}
      </div>

      {!done ? (
        <div className="mt-4 flex justify-center gap-1 rounded-full bg-muted p-1 text-xs">
          {(["photo", "video"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
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
          // Never mirrored, even on the front camera.
          style={{ transform: "none" }}
          className={cn("aspect-[4/5] w-full object-cover", done && "opacity-0")}
        />
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
      </div>

      {!done ? (
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            aria-label="Flip camera"
            className="rounded-full p-3 text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className="size-5" />
          </button>
          <button
            onClick={mode === "photo" ? capture : toggleRecording}
            aria-label={mode === "photo" ? "Take photo" : recording ? "Stop recording" : "Record video"}
            className="flex size-18 items-center justify-center rounded-full border-2 border-foreground p-1 transition-transform active:scale-95"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full text-background",
                recording ? "bg-destructive" : "bg-foreground",
              )}
            >
              {mode === "photo" ? (
                <Camera className="size-5" />
              ) : recording ? (
                <Square className="size-4" />
              ) : (
                <Video className="size-5" />
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
              onClick={publish}
              className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-foreground"
            >
              Post a NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
