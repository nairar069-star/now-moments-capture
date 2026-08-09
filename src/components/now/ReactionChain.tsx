import { useState } from "react";
import type { NowPost } from "@/lib/nowData";
import { useNow } from "@/lib/now-store";
import { cn } from "@/lib/utils";

const quick = ["😂", "😭", "💀", "🫂", "👀", "🔥"];

export function ReactionChain({ post }: { post: NowPost }) {
  const { react } = useNow();
  const [replyTo, setReplyTo] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      {post.reactions.length > 0 ? (
        <ul className="space-y-1">
          {post.reactions.map((r) => (
            <li
              key={r.id}
              className={cn("flex items-center gap-2 text-sm", r.replyTo && "pl-4")}
            >
              <span className="text-xs text-muted-foreground">{r.user}</span>
              <button
                onClick={() => {
                  setReplyTo(r.id);
                  setOpen(true);
                }}
                className="rounded-full px-1 transition-colors hover:bg-muted"
                aria-label={`Reply to ${r.user}`}
              >
                {r.emoji}
                {r.note ? <span className="ml-1 text-xs text-muted-foreground">{r.note}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {quick.map((e) => (
            <button
              key={e}
              onClick={() => {
                react(post.id, e, replyTo);
                setOpen(false);
                setReplyTo(undefined);
              }}
              className="rounded-full border px-2.5 py-1 text-sm transition-colors hover:bg-muted"
            >
              {e}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => {
            setReplyTo(undefined);
            setOpen(true);
          }}
          className="meta-label mt-2 transition-colors hover:text-foreground"
        >
          React
        </button>
      )}
    </div>
  );
}
