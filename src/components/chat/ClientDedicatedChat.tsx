import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Send, Paperclip, Mic, Smile, Loader2, Phone, Download,
  Bot, Sparkles, Volume2, VolumeX, CheckCheck, Play, Pause,
  Headphones, Users
} from "lucide-react";

interface LiveMessage {
  id: string;
  sender_name: string;
  sender_kind: "client" | "staff" | "bot";
  body: string;
  file_url?: string | null;
  file_name?: string | null;
  audio_url?: string | null;
  audio_duration?: number;
  created_at: string;
  status?: "sending" | "sent" | "delivered";
}

const QUICK_PROMPTS = [
  { icon: "🚀", label: "Sprint Progress", text: "Hi team, could you please provide a quick status update on my current project milestones?" },
  { icon: "💡", label: "Deliverable Feedback", text: "Hello, I have reviewed the latest deliverable and would like to request an adjustment to the UI layout." },
  { icon: "🧾", label: "Invoice Query", text: "Hi, I have a quick question regarding my recent invoice. Could Accounts team please check?" },
  { icon: "📞", label: "Schedule Sync", text: "Hi team, I would like to schedule a 15-minute sync this week to review roadmap deliverables." },
  { icon: "⚡", label: "Technical Specs", text: "Hi engineering team, could you share the latest API endpoint docs and staging credentials?" },
];

const EMOJIS = ["👍", "❤️", "🔥", "🚀", "✅", "🎉"];

function playMessageChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Soft editorial two-tone chime
    osc1.frequency.setValueAtTime(523.25, now);
    osc2.frequency.setValueAtTime(659.25, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch {
    // Autoplay restrictions
  }
}

export function ClientDedicatedChat({
  clientId,
  clientName,
  clientEmail,
}: {
  clientId: string;
  clientName: string;
  clientEmail: string;
}) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copilotActive, setCopilotActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async (playSound = false) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbMsgs } = await (supabase.from as any)("client_messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (dbMsgs && dbMsgs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: LiveMessage[] = dbMsgs.map((m: any) => {
          const senderLower = (m.sender || "").toLowerCase();
          const isStaff = senderLower.includes("veloura") || senderLower.includes("am") || senderLower.includes("team") || senderLower.includes("support") || senderLower.includes("architect");
          const isBot = senderLower.includes("copilot") || senderLower.includes("ai");
          return {
            id: m.id,
            sender_name: m.sender || "Delivery Team",
            sender_kind: isBot ? "bot" : isStaff ? "staff" : "client",
            body: m.body,
            created_at: m.created_at,
            status: "delivered",
          };
        });
        setMessages(mapped);
        if (playSound && soundEnabled) playMessageChime();
      } else {
        const initialWelcome: LiveMessage = {
          id: "welcome-1",
          sender_name: "Veloura Delivery Desk",
          sender_kind: "staff",
          body: `Hello ${clientName}! 👋 Welcome to your dedicated private executive channel.\n\nOur project managers, engineering leads, and brand specialists monitor this room directly. Feel free to request project status, review sprint milestones, or share deliverable feedback.`,
          created_at: new Date().toISOString(),
          status: "delivered",
        };
        setMessages([initialWelcome]);
      }
    } catch (e) {
      console.warn("Notice loading messages:", e);
    }
  }, [clientId, clientName, soundEnabled]);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`live-client-chat-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "client_messages", filter: `client_id=eq.${clientId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.new;
          if (row) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              const senderLower = (row.sender || "").toLowerCase();
              const isStaff = senderLower.includes("veloura") || senderLower.includes("am") || senderLower.includes("team") || senderLower.includes("support");
              const isBot = senderLower.includes("copilot") || senderLower.includes("ai");
              
              const newMsg: LiveMessage = {
                id: row.id,
                sender_name: row.sender || "Delivery Team",
                sender_kind: isBot ? "bot" : isStaff ? "staff" : "client",
                body: row.body,
                created_at: row.created_at,
                status: "delivered",
              };

              if (newMsg.sender_kind !== "client" && soundEnabled) {
                playMessageChime();
              }

              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      loadMessages();
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [clientId, loadMessages, soundEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || draft).trim();
    if (!text || busy) return;

    setBusy(true);
    const tempId = `temp-${Date.now()}`;
    const newMsg: LiveMessage = {
      id: tempId,
      sender_name: clientName,
      sender_kind: "client",
      body: text,
      created_at: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraft("");

    try {
      // 1. Insert into client_messages in Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error: insertErr } = await (supabase.from as any)("client_messages").insert({
        client_id: clientId,
        sender: clientName,
        subject: "Executive Portal Message",
        body: text,
        important: false,
        is_read: false,
      }).select().single();

      if (!insertErr && inserted) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: inserted.id, status: "delivered" } : m))
        );
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "delivered" } : m))
        );
      }

      // 2. Log activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_activities").insert({
        client_id: clientId,
        action: "sent_chat_message",
        description: `Sent message to Delivery Desk: "${text.slice(0, 45)}..."`,
      }).catch(() => {});

      // 3. AI Copilot if active and configured
      if (copilotActive) {
        setIsTyping(true);
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: `Client context: Name is ${clientName}, Client ID is ${clientId}. The client just sent this message to the Veloura Apparel delivery channel: "${text}". Provide a professional, concise, and helpful executive response.`,
                },
              ],
            }),
          });

          if (res.ok) {
            const json = await res.json();
            // Only show AI response if it's NOT degraded / offline notice
            if (!json.degraded && json.reply && !json.reply.includes("temporarily offline")) {
              const replyText = json.reply;
              setTimeout(async () => {
                setIsTyping(false);
                const botMsg: LiveMessage = {
                  id: `bot-${Date.now()}`,
                  sender_name: "Veloura AI Assistant",
                  sender_kind: "bot",
                  body: replyText,
                  created_at: new Date().toISOString(),
                  status: "delivered",
                };

                setMessages((prev) => [...prev, botMsg]);
                if (soundEnabled) playMessageChime();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from as any)("client_messages").insert({
                  client_id: clientId,
                  sender: "Veloura AI Assistant",
                  subject: "Re: Executive Portal Message",
                  body: replyText,
                  important: false,
                  is_read: true,
                }).catch(() => {});
              }, 600);
            } else {
              setIsTyping(false);
            }
          } else {
            setIsTyping(false);
          }
        } catch {
          setIsTyping(false);
        }
      }
    } catch (e) {
      console.warn("Message dispatch notice:", e);
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "dat";
      const path = `chat/${clientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;

      const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = data?.signedUrl || "";

      const fileMsg: LiveMessage = {
        id: `file-${Date.now()}`,
        sender_name: clientName,
        sender_kind: "client",
        body: `📎 Shared file: ${file.name}`,
        file_url: url,
        file_name: file.name,
        created_at: new Date().toISOString(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, fileMsg]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_messages").insert({
        client_id: clientId,
        sender: clientName,
        subject: "Client Uploaded File",
        body: `📎 Shared file: ${file.name} (Download: ${url})`,
        important: false,
        is_read: false,
      });
    } catch {
      // Graceful error handle
    } finally {
      setUploading(false);
    }
  }

  function toggleRecording() {
    if (recording) {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      const voiceSec = Math.max(recordSec, 2);
      const voiceMsg: LiveMessage = {
        id: `voice-${Date.now()}`,
        sender_name: clientName,
        sender_kind: "client",
        body: `🎙️ Voice Note (${voiceSec}s)`,
        audio_duration: voiceSec,
        created_at: new Date().toISOString(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, voiceMsg]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from as any)("client_messages").insert({
        client_id: clientId,
        sender: clientName,
        subject: "Voice Note Recorded",
        body: `🎙️ Client recorded a voice note (${voiceSec} seconds).`,
        important: false,
        is_read: false,
      }).then(() => {});

      setRecordSec(0);
    } else {
      setRecording(true);
      setRecordSec(0);
      timerRef.current = setInterval(() => setRecordSec((s) => s + 1), 1000);
    }
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col overflow-hidden rounded-2xl border border-[#ECEBE8] bg-[#FAFAF8] shadow-sm">
      {/* ── TOP HEADER (SOFT GLASS LUXURY UI) ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#ECEBE8] bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E5F3FA] text-[#85BBD6] font-bold text-sm border border-[#85BBD6]/30">
              VA
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#638D79]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-heading text-sm font-bold text-[#24262B]">Veloura Delivery Desk</p>
              <span className="rounded-full bg-[#E5F3FA] border border-[#85BBD6]/30 px-2 py-0.5 text-[10px] font-semibold text-[#85BBD6]">
                Direct Line
              </span>
            </div>
            <p className="text-xs text-[#85858D] flex items-center gap-1.5 mt-0.5">
              <span>Account Manager &amp; Delivery Leads</span>
              <span>·</span>
              <span className="text-[#638D79] font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#638D79]" /> Active
              </span>
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* AI Copilot Toggle Button */}
          <button
            type="button"
            onClick={() => setCopilotActive((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
              copilotActive
                ? "bg-[#E5F3FA] border-[#85BBD6] text-[#24262B]"
                : "bg-white border-[#ECEBE8] text-[#85858D] hover:text-[#24262B]"
            }`}
            title="Toggle AI Delivery Assistant"
          >
            <Bot className="h-3.5 w-3.5 text-[#85BBD6]" />
            <span className="hidden sm:inline">AI Assist</span>
            <span className="text-[10px] font-mono">{copilotActive ? "ON" : "OFF"}</span>
          </button>

          {/* Sound Notification Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white border border-[#ECEBE8] text-[#85858D] hover:text-[#24262B] transition-colors"
            title={soundEnabled ? "Mute audio chimes" : "Unmute audio chimes"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#85BBD6]" /> : <VolumeX className="h-4 w-4 text-[#85858D]" />}
          </button>
        </div>
      </div>

      {/* ── QUICK ACTION CHIPS BAR ── */}
      <div className="no-print flex items-center gap-2 overflow-x-auto border-b border-[#ECEBE8] bg-[#FAFAF8] px-5 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#85858D] shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-[#85BBD6]" /> Quick notes:
        </span>
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setDraft(p.text)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#ECEBE8] bg-white px-3 py-1 text-xs font-medium text-[#24262B] hover:border-[#85BBD6] hover:bg-[#E5F3FA] transition-all"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── MESSAGES CHAT STREAM ── */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#FAFAF8]">
        {messages.map((m) => {
          const isMe = m.sender_kind === "client";
          const isBot = m.sender_kind === "bot";

          return (
            <div key={m.id} className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-[#24262B] border ${
                    isBot ? "bg-[#F8E8EF] border-[#D9A7BC]/40" : "bg-[#E5F3FA] border-[#85BBD6]/40"
                  }`}
                >
                  {isBot ? <Bot className="h-4 w-4 text-[#D9A7BC]" /> : "VA"}
                </div>
              )}

              <div className="relative max-w-[85%] sm:max-w-[70%] space-y-1">
                {!isMe && (
                  <p className="text-[11px] font-medium text-[#85858D] pl-1 flex items-center gap-1.5">
                    <span>{m.sender_name}</span>
                    {isBot && (
                      <span className="rounded-full bg-[#F8E8EF] border border-[#D9A7BC]/40 px-2 py-0.2 text-[9px] font-medium text-[#D9A7BC]">
                        Assistant
                      </span>
                    )}
                  </p>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
                    isMe
                      ? "rounded-br-xs bg-[#E5F3FA] border border-[#85BBD6]/30 text-[#24262B]"
                      : isBot
                      ? "rounded-bl-xs border border-[#D9A7BC]/30 bg-[#F8E8EF] text-[#24262B]"
                      : "rounded-bl-xs border border-[#ECEBE8] bg-white text-[#24262B]"
                  }`}
                >
                  {m.audio_duration ? (
                    <div className="flex items-center gap-3 py-1">
                      <button
                        type="button"
                        onClick={() => setPlayingVoiceId(playingVoiceId === m.id ? null : m.id)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#85BBD6] text-white transition-transform active:scale-95"
                      >
                        {playingVoiceId === m.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1">
                          {[35, 60, 45, 80, 50, 70, 90, 40, 65, 30, 85, 55].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all ${
                                playingVoiceId === m.id ? "bg-[#85BBD6] animate-pulse" : "bg-[#85BBD6]/40"
                              }`}
                              style={{ height: `${h * 0.22}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#85858D] font-mono ml-2">0:{m.audio_duration < 10 ? `0${m.audio_duration}` : m.audio_duration}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  )}

                  {m.file_url && (
                    <div className="mt-2.5 pt-2 border-t border-[#ECEBE8]">
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#ECEBE8] px-3 py-1.5 text-xs font-medium text-[#24262B] hover:border-[#85BBD6] transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 text-[#85BBD6]" />
                        <span>Download {m.file_name || "Attachment"}</span>
                      </a>
                    </div>
                  )}

                  <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${isMe ? "justify-end text-[#85858D]" : "justify-start text-[#85858D]"}`}>
                    <span>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && (
                      <span>
                        {m.status === "sending" ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-[#85BBD6]" />
                        ) : (
                          <CheckCheck className="h-3.5 w-3.5 text-[#85BBD6]" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#85858D] pl-2 pt-1">
            <div className="grid h-7 w-7 place-items-center rounded-xl bg-[#F8E8EF] text-[#D9A7BC]">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1 bg-white border border-[#ECEBE8] px-3 py-1.5 rounded-full">
              <span className="font-medium text-[#24262B]">Veloura Assistant typing</span>
              <span className="flex gap-0.5 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#85BBD6] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#85BBD6] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#85BBD6] animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── MESSAGE INPUT CONTROL BAR ── */}
      <div className="shrink-0 border-t border-[#ECEBE8] bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] hover:bg-[#E5F3FA] text-[#24262B] transition-colors"
            title="Attach Document or Asset"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#85BBD6]" /> : <Paperclip className="h-4 w-4 text-[#85858D]" />}
          </button>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all ${
              recording
                ? "border-[#D9A7BC] bg-[#F8E8EF] text-[#D9A7BC] animate-pulse"
                : "border-[#ECEBE8] bg-[#FAFAF8] hover:bg-[#E5F3FA] text-[#85858D]"
            }`}
            title={recording ? "Tap to finish voice message" : "Record Voice Message"}
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Emoji Popover */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] hover:bg-[#E5F3FA] text-[#85858D] transition-colors"
              title="Add Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-14 left-0 flex gap-1 rounded-2xl border border-[#ECEBE8] bg-white p-2 shadow-lg z-30">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setDraft((d) => d + em);
                      setShowEmoji(false);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-xl text-base hover:bg-[#E5F3FA] transition-colors"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input text box */}
          <div className="relative flex-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                recording
                  ? `Recording Voice Note (${recordSec}s)... Tap mic to finish`
                  : copilotActive
                  ? "Message delivery desk (AI assistance active)..."
                  : "Type a message to your Veloura delivery team..."
              }
              disabled={recording}
              className="w-full rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#24262B] outline-none focus:border-[#85BBD6] focus:bg-white focus:ring-2 focus:ring-[#85BBD6]/20 transition-all placeholder:text-[#85858D]"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#85BBD6] px-5 text-sm font-medium text-white hover:bg-[#85BBD6]/90 disabled:opacity-40 transition-all shadow-sm shrink-0"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
