import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppShell } from "@/components/now/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "NOW Pro — $10/month | NOW" },
      {
        name: "description",
        content: "NOW Pro unlocks events: create your own, join every one, and post video NOWs.",
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
  const navigate = useNavigate();
  const { user, isPro, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState("");
  const [paying, setPaying] = useState(false);

  async function setPro(next: boolean) {
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    await supabase.from("profiles").update({ is_pro: next }).eq("id", user.id);
    await refreshProfile();
    setBusy(false);
    setPaying(false);
  }

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

      {!user ? (
        <Link
          to="/auth"
          className="mt-8 block rounded-full bg-accent px-4 py-3.5 text-center text-sm font-medium text-accent-foreground"
        >
          Sign in to subscribe
        </Link>
      ) : isPro ? (
        <div className="mt-8 space-y-3">
          <p className="text-sm text-accent">Pro is active. Events are unlocked.</p>
          <Link
            to="/events"
            className="block rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground"
          >
            Go to events
          </Link>
          <button
            onClick={() => void setPro(false)}
            disabled={busy}
            className="w-full rounded-full border px-4 py-3 text-sm"
          >
            Cancel membership
          </button>
        </div>
      ) : paying ? (
        <div className="mt-8 space-y-4 rounded-2xl border p-4">
          <p className="meta-label">Card details</p>
          <input
            value={card}
            onChange={(e) => setCard(e.target.value.replace(/[^0-9 ]/g, "").slice(0, 19))}
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <button onClick={() => setPaying(false)} className="flex-1 rounded-full border py-2.5 text-sm">
              Cancel
            </button>
            <button
              onClick={() => void setPro(true)}
              disabled={busy || card.replace(/\D/g, "").length < 12}
              className="flex-1 rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-40"
            >
              {busy ? "Paying…" : "Pay $10"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPaying(true)}
          className="mt-8 w-full rounded-full bg-accent px-4 py-3.5 text-sm font-medium text-accent-foreground transition-transform active:scale-[0.98]"
        >
          Subscribe for $10/month
        </button>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        This prototype does not charge a real card. Billing is simulated, but your membership is saved to your
        account.
      </p>
    </AppShell>
  );
}
