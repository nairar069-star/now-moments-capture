import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { memoryMonths } from "@/lib/nowData";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memories — Replay your NOWs | NOW" },
      {
        name: "description",
        content: "A visual diary of your NOWs, organised by month, place, people and Together moments.",
      },
      { property: "og:title", content: "Memories — Replay your NOWs" },
      { property: "og:description", content: "Your personal archive of real moments on NOW." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Memories,
});

function Memories() {
  const [replay, setReplay] = useState<{ label: string; photos: string[]; index: number } | null>(null);

  return (
    <AppShell title="Memories" subtitle="Replay your NOWs.">
      <Link
        to="/ai"
        className="mb-8 flex items-center justify-between rounded-xl border border-accent/40 px-4 py-3"
      >
        <span className="text-sm">Ask NOW AI about your archive</span>
        <span className="meta-label text-accent">Open</span>
      </Link>

      {memoryMonths.map((m) => (
        <section key={m.id} className="mb-10">
          <h2 className="wordmark text-xl">{m.label}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {m.nows} NOWs · {m.togethers} Together moments · {m.events} Events
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {m.photos.map((p, i) => (
              <button key={i} onClick={() => setReplay({ label: m.label, photos: m.photos, index: i })}>
                <img
                  src={p}
                  alt=""
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="aspect-[3/4] w-full rounded-lg object-cover"
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => setReplay({ label: m.label, photos: m.photos, index: 0 })}
            className="meta-label mt-3 transition-colors hover:text-foreground"
          >
            Replay this month
          </button>
        </section>
      ))}

      {replay ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-foreground/95 px-5 py-6 text-background">
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-70">{replay.label}</p>
            <button onClick={() => setReplay(null)} aria-label="Close replay" className="rounded-full p-2">
              <X className="size-5" />
            </button>
          </div>
          <img
            src={replay.photos[replay.index]}
            alt=""
            className="mt-4 max-h-[70vh] w-full rounded-2xl object-cover"
          />
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              onClick={() => setReplay((r) => (r ? { ...r, index: Math.max(0, r.index - 1) } : r))}
              disabled={replay.index === 0}
              className="rounded-full border border-background/40 px-4 py-2 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs opacity-70">
              {replay.index + 1} / {replay.photos.length}
            </span>
            <button
              onClick={() =>
                setReplay((r) => (r ? { ...r, index: Math.min(r.photos.length - 1, r.index + 1) } : r))
              }
              disabled={replay.index === replay.photos.length - 1}
              className="rounded-full border border-background/40 px-4 py-2 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
