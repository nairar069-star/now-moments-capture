import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Globe, Sparkles, CalendarDays, Archive, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/now-store";
import { DropBanner } from "./DropBanner";

const tabs = [
  { to: "/", label: "NOW", icon: Sparkles },
  { to: "/world", label: "World", icon: Globe },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/memories", label: "Memories", icon: Archive },
];

export function AppShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { drop } = useNow();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background sm:max-w-lg">
      <header className="sticky top-0 z-20 bg-background/90 px-5 pt-5 pb-3 backdrop-blur hair-b">
        <div className="flex items-center justify-between">
          <Link to="/" className="wordmark text-2xl leading-none">
            NOW
          </Link>
          <div className="flex items-center gap-1">
            {action}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative rounded-full p-2 text-foreground/70 transition-colors hover:bg-muted"
            >
              <Bell className="size-[18px]" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" />
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-muted"
            >
              <span className="block size-[18px] rounded-full border border-foreground/40" />
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-[28px] leading-tight font-semibold">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </header>

      {drop.active ? <DropBanner /> : null}

      <main className="flex-1 px-5 pt-4 pb-32">{children}</main>

      <Link
        to="/post"
        className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform active:scale-95"
      >
        <Camera className="size-4" />
        Post a NOW
      </Link>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md bg-background/95 px-2 pt-2 pb-[env(safe-area-inset-bottom,0.75rem)] backdrop-blur hair-t sm:max-w-lg">
        <ul className="flex items-stretch justify-between">
          {tabs.map((t) => {
            const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to} className="flex-1">
                <Link
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md py-2 text-[11px] tracking-wide transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("size-[18px]", active && "text-accent")} />
                  <span className={cn(active && "font-medium")}>{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
