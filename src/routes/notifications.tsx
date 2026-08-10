import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarDays, Camera, Lock, Target, Users, Zap } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { useNow } from "@/lib/now-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | NOW" },
      { name: "description", content: "NOW DROPs, Togethers, Secret NOWs and Quests — nothing else." },
      { property: "og:title", content: "Notifications on NOW" },
      { property: "og:description", content: "Important, never overwhelming." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Notifications,
});

const icons = {
  drop: Zap,
  together: Users,
  secret: Lock,
  quest: Target,
  event: CalendarDays,
  miss: Camera,
};

function Notifications() {
  const { notifications, pushEnabled, enablePush, togetherRequests, answerTogether } = useNow();
  const pending = togetherRequests.filter((t) => t.status === "pending");

  return (
    <AppShell title="Notifications" subtitle="Only what matters.">
      {!pushEnabled ? (
        <button
          onClick={() => void enablePush()}
          className="mb-6 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <Bell className="size-4" /> Turn on push notifications
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              So you never miss a NOW DROP.
            </span>
          </span>
          <span className="meta-label">Allow</span>
        </button>
      ) : (
        <p className="mb-6 text-xs text-accent">Push notifications are on.</p>
      )}

      {pending.length > 0 ? (
        <section className="mb-6 space-y-3">
          <h2 className="meta-label">Together confirmation</h2>
          {pending.map((t) => (
            <div key={t.id} className="rounded-2xl border p-4">
              <p className="text-sm">
                {t.from} says you were together at {t.time}.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t.place}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => answerTogether(t.id, false)}
                  className="flex-1 rounded-full border py-2 text-xs"
                >
                  Not me
                </button>
                <button
                  onClick={() => answerTogether(t.id, true)}
                  className="flex-1 rounded-full bg-accent py-2 text-xs font-medium text-accent-foreground"
                >
                  Confirm Together
                </button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <ul className="divide-y divide-[var(--hairline)]">
        {notifications.map((n) => {
          const Icon = icons[n.kind];
          return (
            <li key={n.id} className="flex items-start gap-3 py-4">
              <Icon className={cn("mt-0.5 size-4 text-muted-foreground", n.accent && "text-accent")} />
              <div className="flex-1">
                <p className={cn("text-sm font-medium", n.accent && "text-accent")}>{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">{n.ago}</span>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
