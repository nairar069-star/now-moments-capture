import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { cities, worldNows } from "@/lib/nowData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "WORLD — What's happening right now | NOW" },
      {
        name: "description",
        content: "Explore public NOWs from random people in Tokyo, Jakarta, Paris and beyond.",
      },
      { property: "og:title", content: "WORLD — What's happening right now" },
      {
        property: "og:description",
        content: "Random, authentic moments from cities around the world.",
      },
    ],
  }),
  component: World,
});

function World() {
  const [selected, setSelected] = useState(cities[0]!.name);

  return (
    <AppShell title="World" subtitle="What's happening in another city right now?">
      <ul className="mb-8 divide-y divide-[var(--hairline)]">
        {cities.map((c) => (
          <li key={c.name}>
            <button
              onClick={() => setSelected(c.name)}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{c.flag}</span>
                <span>
                  <span className={cn("block text-[15px]", selected === c.name && "text-accent")}>
                    {c.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {c.count.toLocaleString()} NOWs · local {c.time}
                  </span>
                </span>
              </span>
              <span className="meta-label">{selected === c.name ? "Viewing" : "Open"}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="meta-label mb-4">Random public NOWs — {selected}</p>
      {worldNows.map((post) => (
        <NowCard key={post.id} post={{ ...post, place: selected }} compact />
      ))}
    </AppShell>
  );
}
