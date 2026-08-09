import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { events, quests } from "@/lib/nowData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "EVENTS & Quests — collective moments | NOW" },
      {
        name: "description",
        content:
          "Everyone, look up. Join community-wide NOW events and daily quests, no leaderboards.",
      },
      { property: "og:title", content: "EVENTS — collective moments on NOW" },
      {
        property: "og:description",
        content: "Thousands of people posting a NOW at the same minute, all over the world.",
      },
    ],
  }),
  component: Events,
});

function Events() {
  return (
    <AppShell title="Events" subtitle="Collective moments, all at once.">
      {events.map((e) => (
        <section key={e.id} className="mb-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">
              {e.emoji} {e.title}
            </h2>
            <span
              className={cn(
                "text-[11px] tracking-[0.14em] uppercase",
                e.status === "live" ? "text-accent" : "text-muted-foreground",
              )}
            >
              {e.status === "live" ? "Live" : e.time}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{e.blurb}</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {e.photos.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-square w-full rounded-md object-cover"
              />
            ))}
          </div>
        </section>
      ))}

      <h2 className="meta-label mb-3">NOW Quest</h2>
      <ul className="space-y-3">
        {quests.map((q) => (
          <li key={q.id} className="rounded-lg border px-4 py-3">
            <p className="meta-label">{q.label}</p>
            <p className="mt-1 text-[15px]">{q.title}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {q.joined.toLocaleString()} people posted a NOW for this.
            </p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
