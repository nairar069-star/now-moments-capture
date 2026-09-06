import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, MapPin, Users, Lock, Globe2, Trash2 } from "lucide-react";
import type { NowPost } from "@/lib/nowData";
import { useNow } from "@/lib/now-store";
import { deleteNow } from "@/lib/nowdb";
import { ReactionChain } from "./ReactionChain";
import { cn } from "@/lib/utils";

const visibilityIcon = {
  private: Lock,
  friends: Users,
  public: Globe2,
};

export function NowCard({ post, compact = false }: { post: NowPost; compact?: boolean }) {
  const { guessed, guess, deletePost } = useNow();
  const queryClient = useQueryClient();
  const [showGuess, setShowGuess] = useState(false);
  const VIcon = visibilityIcon[post.visibility];
  const myGuesses = guessed[post.id] ?? [];
  const correct = post.guessPlace ? myGuesses.includes(post.guessPlace.answer) : false;
  const mine = post.mine ?? post.user === "You";
  // Feed frames vary: some landscape, some square, some portrait.
  const ratios = ["aspect-[4/3]", "aspect-square", "aspect-[3/4]"] as const;
  const seed = [...post.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const ratio = ratios[seed % ratios.length]!;


  async function remove() {
    if (post.dbId) {
      await deleteNow(post.dbId);
      await queryClient.invalidateQueries();
      return;
    }
    deletePost(post.id);
  }

  return (
    <article className="mb-10">
      <header className="mb-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          {post.profileHandle ? (
            <Link
              to="/u/$handle"
              params={{ handle: post.profileHandle }}
              className="text-[15px] font-medium underline-offset-4 hover:underline"
            >
              {post.user}
            </Link>
          ) : (
            <h2 className="text-[15px] font-medium">{post.user}</h2>
          )}
          {post.collaborators?.length ? (
            <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              with {post.collaborators.join(", ")}
            </span>
          ) : null}
          {post.together ? (
            <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[11px] text-accent">
              with {post.together}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {post.once ? <Eye className="size-3 text-accent" /> : null}
          <VIcon className="size-3" />
          <span className="text-[11px]">{post.ago}</span>
          {mine ? (
            <button
              onClick={() => void remove()}
              aria-label="Delete this NOW"
              className="rounded-full p-1 transition-colors hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      </header>

      <div className="relative overflow-hidden rounded-2xl bg-muted shadow-[0_18px_40px_-30px_rgba(0,0,0,0.6)]">
        {post.video ? (
          <video
            src={post.video}
            controls
            playsInline
            className={cn("w-full bg-foreground object-cover", compact ? "aspect-square" : ratio)}
          />
        ) : (
          <img
            src={post.photo}
            alt={`${post.user}'s NOW`}
            loading="lazy"
            width={768}
            height={768}
            className={cn("w-full object-cover", compact ? "aspect-square" : ratio)}
          />
        )}

        {post.selfie ? (
          <img
            src={post.selfie}
            alt=""
            loading="lazy"
            width={768}
            height={1024}
            className="absolute top-3 left-3 h-28 w-20 rounded-lg border-2 border-background/80 object-cover shadow-lg"
          />
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
              {correct ? (
                <span className="text-xs text-accent">Correct</span>
              ) : myGuesses.length >= 3 ? (
                <span className="text-xs text-muted-foreground">Out of guesses</span>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <ReactionChain post={post} />
    </article>
  );
}
