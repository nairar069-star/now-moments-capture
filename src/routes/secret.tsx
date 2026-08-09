import { createFileRoute, Link } from "@tanstack/react-router";
import { useNow } from "@/lib/now-store";

export const Route = createFileRoute("/secret")({
  head: () => ({
    meta: [
      { title: "Secret NOW | NOW" },
      { name: "description", content: "A NOW sent to one person, viewable once. Then it's gone." },
      { property: "og:title", content: "Secret NOW" },
      { property: "og:description", content: "One person. One view. Then gone." },
    ],
  }),
  component: Secret,
});

function Secret() {
  const { secrets, openSecret } = useNow();
  const secret = secrets[0];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-foreground px-6 text-background sm:max-w-lg">
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
          <p className="mt-3 text-lg">🔐 {secret.from} sent you a Secret NOW.</p>
          <button
            onClick={() => openSecret(secret.id)}
            className="mt-8 rounded-full border border-background/40 px-6 py-3 text-sm"
          >
            Open once
          </button>
        </div>
      )}
      <Link to="/" className="mt-12 text-center text-xs opacity-60">
        Back to your people
      </Link>
    </div>
  );
}
