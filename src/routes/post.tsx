import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Camera, RefreshCw, X } from "lucide-react";
import { formatCountdown, useNow } from "@/lib/now-store";
import { photos, type Visibility } from "@/lib/nowData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a NOW | NOW" },
      { name: "description", content: "Open the camera and post a NOW. Spontaneous, not polished." },
      { property: "og:title", content: "Post a NOW" },
      { property: "og:description", content: "Take it now, share it now." },
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
  const { postNow, drop, doubleNow } = useNow();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [live, setLive] = useState(false);
  const [shots, setShots] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [place, setPlace] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("friends");
  const needed = doubleNow ? 2 : 1;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
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
  }, [facing]);

  function capture() {
    let shot: string | undefined;
    const video = videoRef.current;
    if (live && video && video.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      shot = canvas.toDataURL("image/jpeg", 0.85);
    } else {
      shot = photos[Math.floor(Math.random() * photos.length)]!;
    }
    setShots((s) => [...s, shot!].slice(0, needed));
  }

  function publish() {
    postNow({
      photo: shots[0]!,
      selfie: shots[1],
      caption: caption || undefined,
      place: place ? "Somewhere nearby" : undefined,
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
        <p className="meta-label">{doubleNow ? "Double NOW" : "Post a NOW"}</p>
        {drop.active ? (
          <span className="wordmark tabular text-sm text-accent">{formatCountdown(drop.secondsLeft)}</span>
        ) : (
          <span className="w-9" />
        )}
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl bg-foreground/90">
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn("aspect-[4/5] w-full object-cover", shots.length >= needed && "opacity-0")}
        />
        {shots[0] ? (
          <img
            src={shots[0]}
            alt="Your NOW"
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              shots.length < needed && "hidden",
            )}
          />
        ) : null}
        {shots[1] ? (
          <img
            src={shots[1]}
            alt=""
            className="absolute top-3 left-3 h-28 w-20 rounded-md border border-background/60 object-cover"
          />
        ) : null}
        {!live && shots.length === 0 ? (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs text-background/80">
            Camera unavailable — tap to use a sample frame.
          </p>
        ) : null}
      </div>

      {shots.length < needed ? (
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            aria-label="Flip camera"
            className="rounded-full p-3 text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className="size-5" />
          </button>
          <button
            onClick={capture}
            aria-label="Take photo"
            className="flex size-18 items-center justify-center rounded-full border-2 border-foreground p-1 transition-transform active:scale-95"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-foreground text-background">
              <Camera className="size-5" />
            </span>
          </button>
          <span className="w-11 text-center text-[11px] text-muted-foreground">
            {doubleNow ? `${shots.length}/2` : ""}
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

          <label className="flex items-center justify-between text-sm">
            <span>
              Location context
              <span className="block text-xs text-muted-foreground">Approximate area only.</span>
            </span>
            <input
              type="checkbox"
              checked={place}
              onChange={(e) => setPlace(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
          </label>

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
              onClick={() => setShots([])}
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
