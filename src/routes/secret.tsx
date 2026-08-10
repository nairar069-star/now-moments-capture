import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useNow } from "@/lib/now-store";

export const Route = createFileRoute("/secret")({
  head: () => ({
    meta: [
      { title: "Secret NOW | NOW" },
      { name: "description", content: "A NOW sent to one person, viewable once. Then it's gone." },
      { property: "og:title", content: "Secret NOW" },
      { property: "og:description", content: "One person. One view. Then gone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Secret,
});

const friends = ["Naira", "Alya", "Raka", "Sarah"];

function Secret() {
  const { secrets, openSecret, sendSecret } = useNow();
  const secret = secrets[0];
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-foreground px-6 py-12 text-background sm:max-w-lg">
      {!secret ? (
        <p className="text-center text-sm opacity-70">Nothing here.</p>
      ) : secret.opened ? (
        <div className="text-center">
          <p className="wordmark text-4xl">Gone.</p>
          <p className="mt-2 text-sm opacity-60">Secret NOWs are viewed once.</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="meta-label !text-background/60">Secret NOW</p>
          <p className="mt-3 text-lg">{secret.from} sent you a Secret NOW.</p>
          <button
            onClick={() => openSecret(secret.id)}
            className="mt-8 rounded-full border border-background/40 px-6 py-3 text-sm"
          >
            Open once
          </button>
        </div>
      )}

      <div className="mt-12 border-t border-background/20 pt-6">
        <p className="meta-label !text-background/60">Send a Secret NOW</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {friends.map((f) => (
            <button
              key={f}
              onClick={() => {
                sendSecret(f);
                setSentTo(f);
              }}
              className="rounded-full border border-background/40 px-4 py-2 text-xs"
            >
              {f}
            </button>
          ))}
        </div>
        {sentTo ? (
          <p className="mt-3 text-xs opacity-70">Sent to {sentTo}. Only they can open it, once.</p>
        ) : (
          <Link to="/post" className="mt-3 inline-block text-xs underline underline-offset-4 opacity-70">
            Take a new one first
          </Link>
        )}
      </div>

      <Link to="/" className="mt-12 text-center text-xs opacity-60">
        Back to your people
      </Link>
    </div>
  );
}
