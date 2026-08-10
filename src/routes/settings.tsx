import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { useNow } from "@/lib/now-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Privacy & settings | NOW" },
      { name: "description", content: "Control visibility, location context, Secret NOWs and your archive." },
      { property: "og:title", content: "Privacy on NOW" },
      { property: "og:description", content: "Privacy is a core part of NOW, not a setting you hunt for." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const { feed, deletePost, pushEnabled, enablePush } = useNow();
  const [picked, setPicked] = useState<Record<string, string>>({
    "Default NOW visibility": "Friends",
    "Location context": "Approximate",
    "Secret NOWs from": "Friends",
    "Memories visible to": "Only me",
  });
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState(false);

  function exportMemories() {
    const blob = new Blob([JSON.stringify(feed, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "now-memories.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Your memories were downloaded.");
  }

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
        <li>
          <p className="text-sm font-medium">Push notifications</p>
          <p className="text-xs text-muted-foreground">NOW DROPs, Togethers and Secret NOWs.</p>
          <button
            onClick={() => void enablePush()}
            className={cn(
              "mt-2 rounded-full border px-3 py-1 text-xs",
              pushEnabled ? "border-accent text-accent" : "hover:bg-muted",
            )}
          >
            {pushEnabled ? "On" : "Turn on"}
          </button>
        </li>
      </ul>

      <div className="mt-10 space-y-2 border-t pt-6">
        <button onClick={exportMemories} className="w-full rounded-xl border px-4 py-3 text-left text-sm">
          Export my memories
        </button>
        <button
          onClick={() => setDeleting((d) => !d)}
          className="w-full rounded-xl border px-4 py-3 text-left text-sm text-destructive"
        >
          Delete a NOW
        </button>
        {deleting ? (
          <ul className="space-y-2 pt-2">
            {feed.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-2 text-sm">
                <span className="truncate">
                  {p.user} · {p.caption ?? p.ago}
                </span>
                <button
                  onClick={() => {
                    deletePost(p.id);
                    setStatus("NOW deleted.");
                  }}
                  className="ml-3 shrink-0 text-xs text-destructive"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {status ? <p className="mt-4 text-xs text-accent">{status}</p> : null}

      <p className="mt-6 text-xs text-muted-foreground">
        NOW never identifies people in photos automatically and never shares precise location. World NOW
        only shows content explicitly made public.
      </p>
    </AppShell>
  );
}
