import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Privacy & settings | NOW" },
      { name: "description", content: "Control visibility, location context, Secret NOWs and your archive." },
      { property: "og:title", content: "Privacy on NOW" },
      { property: "og:description", content: "Privacy is a core part of NOW, not a setting you hunt for." },
    ],
  }),
  component: Settings,
});

const rows: { label: string; hint: string; options: string[] }[] = [
  { label: "Default NOW visibility", hint: "Who sees a new NOW.", options: ["Private", "Friends", "Public"] },
  { label: "Location context", hint: "Approximate area only, never precise.", options: ["Off", "Approximate"] },
  { label: "Secret NOWs from", hint: "Who can send you a Secret NOW.", options: ["Nobody", "Friends"] },
  { label: "Memories visible to", hint: "Your archive stays yours by default.", options: ["Only me", "Friends"] },
];

function Settings() {
  const [picked, setPicked] = useState<Record<string, string>>({
    "Default NOW visibility": "Friends",
    "Location context": "Approximate",
    "Secret NOWs from": "Friends",
    "Memories visible to": "Only me",
  });

  return (
    <AppShell title="Settings" subtitle="Privacy first.">
      <ul className="space-y-6">
        {rows.map((r) => (
          <li key={r.label}>
            <p className="text-sm font-medium">{r.label}</p>
            <p className="text-xs text-muted-foreground">{r.hint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.options.map((o) => (
                <button
                  key={o}
                  onClick={() => setPicked((p) => ({ ...p, [r.label]: o }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    picked[r.label] === o ? "border-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 space-y-2 border-t pt-6">
        <button className="w-full rounded-lg border px-4 py-3 text-left text-sm">
          Export my memories
        </button>
        <button className="w-full rounded-lg border px-4 py-3 text-left text-sm text-destructive">
          Delete a NOW
        </button>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        NOW never identifies people in photos automatically and never shares precise location. World
        NOW only shows content explicitly made public.
      </p>
    </AppShell>
  );
}
