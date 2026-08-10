import { useState } from "react";
import { CornerDownRight, Send } from "lucide-react";
import type { NowPost } from "@/lib/nowData";
import { useNow } from "@/lib/now-store";
import { cn } from "@/lib/utils";

const quick = ["😂", "🫂", "🔥", "👀"];

export function ReactionChain({ post }: { post: NowPost }) {
  const { react } = useNow();
  const [replyTo, setReplyTo] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function send(emoji?: string) {
    const note = text.trim();
    if (!emoji && !note) return;
    react(post.id, { emoji, note: note || undefined, replyTo });
    setText("");
    setOpen(false);
    setReplyTo(undefined);
  }

  return (
    <div className="mt-3">
      {post.reactions.length > 0 ? (
        <ul className="space-y-1.5">
          {post.reactions.map((r) => (
            <li key={r.id} className={cn("flex items-start gap-2 text-sm", r.replyTo && "pl-5")}>
              {r.replyTo ? <CornerDownRight className="mt-1 size-3 shrink-0 text-muted-foreground" /> : null}
              <span className="shrink-0 text-xs text-muted-foreground">{r.user}</span>
              <button
                onClick={() => {
                  setReplyTo(r.id);
                  setOpen(true);
                }}
                className="rounded-md px-1 text-left transition-colors hover:bg-muted"
                aria-label={`Reply to ${r.user}`}
              >
                {r.emoji ? <span>{r.emoji}</span> : null}
                {r.note ? <span className={cn(r.emoji && "ml-1")}>{r.note}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="mt-3 rounded-xl border p-2">
          {replyTo ? (
            <p className="mb-2 px-1 text-[11px] text-muted-foreground">Replying in the chain</p>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Write a reaction"
              className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              aria-label="Send reaction"
              className="rounded-full bg-foreground p-2 text-background transition-transform active:scale-95"
            >
              <Send className="size-3.5" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {quick.map((e) => (
              <button
                key={e}
                onClick={() => send(e)}
                className="rounded-full border px-2.5 py-1 text-sm transition-colors hover:bg-muted"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setReplyTo(undefined);
            setOpen(true);
          }}
          className="meta-label mt-2 transition-colors hover:text-foreground"
        >
          React or reply
        </button>
      )}
    </div>
  );
}
