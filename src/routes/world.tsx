import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { NowCard } from "@/components/now/NowCard";
import { nearbyPlaces, worldNows } from "@/lib/nowData";
import { useNow } from "@/lib/now-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "World — What's happening right now | NOW" },
      {
        name: "description",
        content: "Explore public NOWs from people in Tokyo, Jakarta, Paris — or add your own location.",
      },
      { property: "og:title", content: "World — What's happening right now" },
      { property: "og:description", content: "Real moments from cities around the world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: World,
});

function World() {
  const { cities, worldPlace, setWorldPlace, addCity } = useNow();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [locating, setLocating] = useState(false);
  const [nearby, setNearby] = useState<{ name: string; km: number }[]>([]);

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Coordinates are never posted — they only pick nearby place options.
        setNearby(nearbyPlaces(pos.coords.latitude, pos.coords.longitude));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  return (
    <AppShell title="World" subtitle="What's happening in another place right now?">
      <div className="mb-6 rounded-2xl border p-3">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <Plus className="size-4" /> Add a location
            </span>
            <span className="meta-label">Anywhere</span>
          </button>
        ) : (
          <div className="space-y-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  addCity(name);
                  setName("");
                  setAdding(false);
                }
              }}
              placeholder="City or place name"
              className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={useMyLocation}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
              >
                <MapPin className="size-3.5" />
                {locating ? "Locating…" : "Use my location"}
              </button>
              <button onClick={() => { setAdding(false); setNearby([]); }} className="rounded-full border px-3 py-1.5 text-xs">
                Cancel
              </button>
              <button
                disabled={!name.trim()}
                onClick={() => {
                  addCity(name);
                  setName("");
                  setAdding(false);
                }}
                className="rounded-full bg-foreground px-4 py-1.5 text-xs text-background disabled:opacity-40"
              >
                Add
              </button>
            </div>
            {nearby.length > 0 ? (
              <div>
                <p className="meta-label mb-2">Places near you</p>
                <div className="flex flex-wrap gap-2">
                  {nearby.map((n) => (
                    <button
                      key={n.name}
                      onClick={() => {
                        addCity(n.name);
                        setNearby([]);
                        setAdding(false);
                      }}
                      className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                    >
                      {n.name} · {n.km} km
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ul className="mb-8 divide-y divide-[var(--hairline)]">
        {cities.map((c) => (
          <li key={c.name}>
            <button
              onClick={() => setWorldPlace(c.name)}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <span>
                <span className={cn("block text-[15px]", worldPlace === c.name && "text-accent")}>
                  {c.name}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {c.count.toLocaleString()} NOWs · local {c.time}
                </span>
              </span>
              <span className="meta-label">{worldPlace === c.name ? "Viewing" : "Open"}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="meta-label mb-4">Public NOWs — {worldPlace}</p>
      {worldNows.map((post) => (
        <NowCard key={post.id} post={{ ...post, place: worldPlace }} compact />
      ))}
    </AppShell>
  );
}
