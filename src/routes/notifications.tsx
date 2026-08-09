import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { notifications } from "@/lib/nowData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | NOW" },
      { name: "description", content: "NOW DROPs, Togethers, Secret NOWs and Quests — nothing else." },
      { property: "og:title", content: "Notifications on NOW" },
      { property: "og:description", content: "Important, never overwhelming." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  return (
    <AppShell title="Notifications" subtitle="Only what matters.">
      <ul className="divide-y divide-[var(--hairline)]">
        {notifications.map((n) => (
          <li key={n.id} className="flex items-start gap-3 py-4">
            <span className="text-base leading-6">{n.icon}</span>
            <div className="flex-1">
              <p className={cn("text-sm font-medium", n.accent && "text-accent")}>{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </div>
            <span className="text-[11px] text-muted-foreground">{n.ago}</span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
