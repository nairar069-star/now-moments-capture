import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { useNow } from "@/lib/now-store";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "NOW Pro — $10/month | NOW" },
      {
        name: "description",
        content: "NOW Pro lets you create events, join every event, post video NOWs and keep your full archive.",
      },
      { property: "og:title", content: "NOW Pro — $10/month" },
      { property: "og:description", content: "Create events, join everything, keep every memory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pro,
});

const perks = [
  "Create your own events",
  "Join every event, no limits",
  "Video NOWs up to 15 seconds",
  "Unlimited memory archive",
  "Secret NOWs to anyone",
];

function Pro() {
  const { pro, subscribePro, cancelPro } = useNow();

  return (
    <AppShell title="NOW Pro" subtitle="Ten dollars a month. That's it.">
      <div className="rounded-2xl bg-foreground p-6 text-background">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-70">Membership</p>
        <p className="wordmark mt-2 text-5xl leading-none">$10</p>
        <p className="mt-1 text-sm opacity-70">per month, cancel anytime</p>
      </div>

      <ul className="mt-6 space-y-3">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-3 text-sm">
            <Check className="size-4 text-accent" />
            {p}
          </li>
        ))}
      </ul>

      {pro ? (
        <div className="mt-8 space-y-3">
          <p className="text-sm text-accent">Pro is active.</p>
          <Link
            to="/events"
            className="block rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground"
          >
            Create an event
          </Link>
          <button onClick={cancelPro} className="w-full rounded-full border px-4 py-3 text-sm">
            Cancel membership
          </button>
        </div>
      ) : (
        <button
          onClick={subscribePro}
          className="mt-8 w-full rounded-full bg-accent px-4 py-3.5 text-sm font-medium text-accent-foreground transition-transform active:scale-[0.98]"
        >
          Subscribe for $10/month
        </button>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        This prototype does not charge a real card. Billing is simulated.
      </p>
    </AppShell>
  );
}
