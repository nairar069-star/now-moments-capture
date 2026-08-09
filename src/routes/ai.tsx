import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/now/AppShell";
import { aiSuggestions, answerFromMemories } from "@/lib/nowData";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "NOW AI — your memory assistant | NOW" },
      {
        name: "description",
        content: "Ask NOW AI about your own archive: people, months, places and moments you forgot.",
      },
      { property: "og:title", content: "NOW AI — your memory assistant" },
      { property: "og:description", content: "It only knows your memories, and only yours." },
    ],
  }),
  component: NowAI,
});

type Msg = { role: "you" | "ai"; text: string };

function NowAI() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "I remember your NOWs. Ask me about a person, a month, or a place." },
  ]);
  const [input, setInput] = useState("");

  function send(q: string) {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "you", text: q }, { role: "ai", text: answerFromMemories(q) }]);
    setInput("");
  }

  return (
    <AppShell title="NOW AI" subtitle="Your memories, remembered.">
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "you" ? "text-right" : ""}>
            <p className="meta-label">{m.role === "you" ? "You" : "NOW AI"}</p>
            <p className="mt-1 text-sm leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {aiSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-6 flex items-center gap-2 border-b pb-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your archive…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" className="meta-label text-accent">
          Ask
        </button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        NOW AI only reads memories you're authorised to see. Private NOWs stay private.
      </p>
    </AppShell>
  );
}
