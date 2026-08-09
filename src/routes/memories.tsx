import { createFileRoute, Link } from "@tanstack/react-router";
import { memoryMonths } from "@/lib/nowData";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "MEMORIES — Replay your NOWs | NOW" },
      {
        name: "description",
        content: "A visual diary of your NOWs, organised by month, place, people and Together moments.",
      },
      { property: "og:title", content: "MEMORIES — Replay your NOWs" },
      { property: "og:description", content: "Your personal archive of real moments on NOW." },
    ],
  }),
  component: Memories,
});

import { AppShell } from "@/components/now/AppShell";

function Memories() {
  return (
    <AppShell title="Memories" subtitle="Replay your NOWs.">
      <Link
        to="/ai"
        className="mb-8 flex items-center justify-between rounded-lg border border-accent/40 px-4 py-3"
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
              <img
                key={i}
                src={p}
                alt=""
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-[3/4] w-full rounded-md object-cover"
              />
            ))}
          </div>
          <button className="meta-label mt-3 transition-colors hover:text-foreground">
            Replay this month
          </button>
        </section>
      ))}
    </AppShell>
  );
}
