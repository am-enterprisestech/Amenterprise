import { useEffect, useRef, useState } from "react";
import { Send, X, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What does AM Enterprises build?",
  "How does the process work?",
  "What's the cost of a project?",
  "Book a free consultation",
];

export function AIChatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi there. I'm the AM Enterprises assistant. Ask me anything about our services, how we work, or what it takes to get started.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  if (!open) return null;

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { reply: string };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Something went wrong on my end. Please try again, or email us directly at info@amenterprise.tech",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="AM Enterprises AI Assistant"
      aria-modal="true"
      className="fixed bottom-[9.5rem] right-4 z-50 flex h-[min(72vh,560px)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-luxury slide-in lg:bottom-24 lg:right-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-espresso px-4 py-3.5 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-cocoa/20 text-cocoa ring-1 ring-cocoa/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-sm font-black leading-tight">AM Enterprises Assistant</p>
            <p className="flex items-center gap-1.5 text-[10px] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa animate-pulse" />
              Online · AI powered
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close assistant"
          className="rounded-lg p-1.5 transition hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-sand/50 px-4 py-4"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft ${
                m.role === "user"
                  ? "rounded-br-sm bg-cocoa text-white"
                  : "rounded-bl-sm bg-white text-espresso"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-soft">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cocoa [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cocoa [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cocoa" />
            </div>
          </div>
        )}

        {messages.length <= 1 && !loading && (
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-medium text-espresso transition hover:border-cocoa/35 hover:bg-sand"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 border-t border-border bg-white px-3 py-3"
      >
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          className="flex-1 rounded-xl border border-border bg-sand/60 px-4 py-2.5 text-sm text-espresso placeholder:text-espresso/35 focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="grid h-10 w-10 place-items-center rounded-xl bg-cocoa text-white transition hover:bg-copper disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
