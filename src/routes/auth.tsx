import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or sign up | NOW" },
      { name: "description", content: "Create your NOW account to post moments, follow people and join events." },
      { property: "og:title", content: "Sign in to NOW" },
      { property: "og:description", content: "See your people, right now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
  }, [user, loading, navigate]);

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/", replace: true });
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setMessage("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setMessage("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/", replace: true });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12 sm:max-w-lg">
      <Link to="/" className="wordmark text-3xl">
        NOW
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {mode === "signin" ? "Welcome back." : "Create your account."}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">See your people, right now.</p>

      <div className="mt-8 space-y-4">
        {mode === "signup" ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        ) : null}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="Email"
          className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="Password"
          className="w-full border-b bg-transparent pb-2 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <button
        onClick={() => void submit()}
        disabled={busy || !email || !password}
        className="mt-8 w-full rounded-full bg-foreground px-4 py-3.5 text-sm font-medium text-background disabled:opacity-40"
      >
        {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Sign up"}
      </button>

      <button
        onClick={() => void google()}
        className="mt-3 w-full rounded-full border px-4 py-3.5 text-sm transition-colors hover:bg-muted"
      >
        Continue with Google
      </button>

      {message ? <p className="mt-4 text-xs text-accent">{message}</p> : null}

      <button
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className={cn("mt-8 text-xs text-muted-foreground underline underline-offset-4")}
      >
        {mode === "signin" ? "No account yet? Sign up" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}
