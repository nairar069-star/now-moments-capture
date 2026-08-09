import { Link } from "@tanstack/react-router";
import { formatCountdown, useNow } from "@/lib/now-store";

export function DropBanner() {
  const { drop, doubleNow } = useNow();

  return (
    <div className="sticky top-[112px] z-10 mx-5 mt-3 rounded-lg bg-accent px-4 py-3 text-accent-foreground">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-90">
            {doubleNow ? "Double NOW" : "NOW Drop"}
          </p>
          <p className="mt-0.5 text-sm">
            {doubleNow ? "Show us what you're doing." : "You have 90 seconds."}
          </p>
        </div>
        <div className="text-right">
          <div className="wordmark tabular text-3xl leading-none">
            {formatCountdown(drop.secondsLeft)}
          </div>
          <Link to="/post" className="mt-1 inline-block text-[11px] tracking-wide underline underline-offset-4">
            Post now
          </Link>
        </div>
      </div>
    </div>
  );
}
