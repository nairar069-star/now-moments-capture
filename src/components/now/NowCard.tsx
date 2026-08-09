import { useState } from "react";
import { MapPin, Users, Lock, Globe2 } from "lucide-react";
import type { NowPost } from "@/lib/nowData";
import { useNow } from "@/lib/now-store";
import { ReactionChain } from "./ReactionChain";
import { cn } from "@/lib/utils";

const visibilityIcon = {
  private: Lock,
  friends: Users,
  public: Globe2,
};

export function NowCard({ post, compact = false }: { post: NowPost; compact?: boolean }) {
  const { guessed, guess } = useNow();
  const [showGuess, setShowGuess] = useState(false);
  const VIcon = visibilityIcon[post.visibility];
  const myGuesses = guessed[post.id] ?? [];
  const correct = post.guessPlace ? myGuesses.includes(post.guessPlace.answer) : false;

  return (
    <article className="mb-10">
      <header className="mb-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[15px] font-medium">{post.user}</h2>
          {post.together ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              🫂 with {post.together}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <VIcon className="size-3" />
          <span className="text-[11px]">{post.ago}</span>
        </div>
      </header>

      <div className="relative overflow-hidden rounded-xl bg-muted">
        <img
          src={post.photo}
          alt={`${post.user}'s NOW`}
          loading="lazy"
          width={768}
          height={1024}
          className={cn("w-full object-cover", compact ? "aspect-square" : "aspect-[4/5]")}
        />
        {post.selfie ? (
          <img
            src={post.selfie}
            alt=""
            loading="lazy"
            width={768}
            height={1024}
            className="absolute top-3 left-3 h-28 w-20 rounded-md border border-background/60 object-cover"
          />
        ) : null}
        {post.someoneWithYou ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px]">
            👤 Someone's with you.
          </span>
        ) : null}
      </div>

      {post.caption || post.place ? (
        <div className="mt-2 flex items-center justify-between gap-3">
          {post.caption ? <p className="text-sm">{post.caption}</p> : <span />}
          {post.place ? (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3" />
              {post.place}
            </span>
          ) : null}
        </div>
      ) : null}

      {post.guessPlace ? (
        <div className="mt-3">
          {!showGuess ? (
            <button
              onClick={() => setShowGuess(true)}
              className="meta-label transition-colors hover:text-foreground"
            >
              Guess where I am
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {post.guessPlace.options.map((o) => {
                const picked = myGuesses.includes(o);
                const isAnswer = o === post.guessPlace!.answer;
                return (
                  <button
                    key={o}
                    onClick={() => guess(post.id, o)}
                    disabled={correct || myGuesses.length >= 3}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      picked && isAnswer && "border-accent text-accent",
                      picked && !isAnswer && "text-muted-foreground line-through",
                      !picked && "hover:bg-muted",
                    )}
                  >
                    {o}
                  </button>
                );
              })}
              {correct ? <span className="text-xs text-accent">+1</span> : null}
            </div>
          )}
        </div>
      ) : null}

      <ReactionChain post={post} />
    </article>
  );
}
