import { useCallback, useEffect, useRef, useState } from "react";
import {
  useMe, useConversations, useMessages, useDirectory, usePresence,
  sendMessage, sendFileMessage, toggleReaction, markConversationRead,
  deleteMessage, openDirectConversation, createGroupConversation,
  conversationTitle, formatFileSize, formatVoiceDuration,
  type Conversation, type ChatMessage, type Me, type DirectoryPerson, type PresenceStatus,
} from "@/lib/use-chat";
import {
  Loader2, Search, Send, ArrowLeft, Users, MessageSquare,
  Paperclip, Mic, Smile, Trash2,
  Reply, Download, FileText, Phone, Video,
  X, Check, CheckCheck, UserPlus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMOJI_QUICK = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"];

const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  online: "bg-green-500",
  away: "bg-yellow-400",
  busy: "bg-red-500",
  offline: "bg-muted-foreground/40",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PresenceDot({ status }: { status: PresenceStatus }) {
  return (
    <span
      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${PRESENCE_COLORS[status]}`}
    />
  );
}

function Avatar({
  name,
  size = 9,
  status,
}: {
  name: string;
  size?: number;
  status?: PresenceStatus;
}) {
  return (
    <span className={`relative shrink-0 grid h-${size} w-${size} place-items-center rounded-full bg-primary/10 text-xs font-black text-primary`}>
      {name.slice(0, 2).toUpperCase()}
      {status && <PresenceDot status={status} />}
    </span>
  );
}

function FilePreview({ msg }: { msg: ChatMessage }) {
  if (msg.message_type === "image" && msg.file_url) {
    return (
      <a href={msg.file_url} target="_blank" rel="noreferrer" className="block">
        <img
          src={msg.file_url}
          alt={msg.file_name ?? "image"}
          className="mt-1 max-h-56 max-w-xs rounded-xl object-cover"
        />
      </a>
    );
  }
  if (msg.message_type === "voice" && msg.file_url) {
    return (
      <div className="mt-1 flex items-center gap-2">
        <Mic className="h-4 w-4 shrink-0" />
        <audio controls src={msg.file_url} className="h-8 max-w-[180px]" />
        {msg.voice_duration != null && (
          <span className="text-[10px] opacity-60">{formatVoiceDuration(msg.voice_duration)}</span>
        )}
      </div>
    );
  }
  if (msg.message_type === "file" && msg.file_url) {
    return (
      <a
        href={msg.file_url}
        download={msg.file_name ?? true}
        target="_blank"
        rel="noreferrer"
        className="mt-1 flex items-center gap-2 rounded-xl border border-current/20 bg-black/10 px-3 py-2 text-xs"
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{msg.file_name ?? "File"}</span>
        {msg.file_size != null && (
          <span className="opacity-60">{formatFileSize(msg.file_size)}</span>
        )}
        <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </a>
    );
  }
  return null;
}

function ReadReceipts({ msg, meId, participantCount }: { msg: ChatMessage; meId: string; participantCount: number }) {
  if (msg.sender_id !== meId) return null;
  const readCount = (msg.read_by ?? []).filter((id) => id !== meId).length;
  const total = participantCount - 1;
  if (total <= 0) return null;
  const allRead = readCount >= total;
  return (
    <span className="ml-1 inline-flex items-center opacity-70">
      {allRead
        ? <CheckCheck className="h-3 w-3 text-blue-400" />
        : <Check className="h-3 w-3" />}
    </span>
  );
}

function ReactionBar({ msg, meId, convId }: { msg: ChatMessage; meId: string; convId: string }) {
  if (!msg.reactions || msg.reactions.length === 0) return null;
  // Group by emoji
  const grouped: Record<string, { count: number; users: string[]; myReaction: boolean }> = {};
  for (const r of msg.reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, users: [], myReaction: false };
    grouped[r.emoji].count++;
    grouped[r.emoji].users.push(r.user_name ?? "?");
    if (r.user_id === meId) grouped[r.emoji].myReaction = true;
  }
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {Object.entries(grouped).map(([emoji, { count, myReaction }]) => (
        <button
          key={emoji}
          onClick={() => {
            const me = { userId: meId, name: "", kind: "staff" as const };
            toggleReaction(msg.id, convId, me, emoji);
          }}
          className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs transition ${
            myReaction
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card hover:bg-muted"
          }`}
        >
          {emoji} <span className="font-bold">{count}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Emoji picker (minimal quick-pick)
// ---------------------------------------------------------------------------

function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  const MORE = [
    "😀","😁","😂","🤣","😊","😇","🥰","😍","🤩","😘",
    "😜","🤪","😎","🥳","😏","😒","😔","😢","😭","😤",
    "😡","🤬","🤯","😱","🤔","🤗","🙄","😴","🤧","😷",
    "👋","🤝","👍","👎","❤️","🔥","✅","⭐","🎉","🙏",
    "💪","🫡","🚀","💡","📌","📎","🎯","⚡","🛠️","💼",
  ];
  return (
    <div className="absolute bottom-14 right-0 z-50 w-64 rounded-2xl border border-border bg-card p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground">Pick an emoji</p>
        <button onClick={onClose}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
      </div>
      <div className="flex flex-wrap gap-1">
        {MORE.map((e) => (
          <button
            key={e}
            onClick={() => { onPick(e); onClose(); }}
            className="grid h-8 w-8 place-items-center rounded-lg text-lg hover:bg-muted"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Voice recorder
// ---------------------------------------------------------------------------

function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert("Microphone access denied.");
    }
  }, []);

  const stop = useCallback((): Promise<{ blob: Blob; duration: number } | null> => {
    return new Promise((resolve) => {
      if (!mediaRef.current) { resolve(null); return; }
      const dur = duration;
      mediaRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        resolve({ blob, duration: dur });
      };
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      setDuration(0);
    });
  }, [duration]);

  const cancel = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setDuration(0);
    chunksRef.current = [];
  }, []);

  return { recording, duration, start, stop, cancel };
}

// ---------------------------------------------------------------------------
// Create Group Modal
// ---------------------------------------------------------------------------

function CreateGroupModal({
  me,
  onCreated,
  onClose,
}: {
  me: Me;
  onCreated: (id: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DirectoryPerson[]>([]);
  const [busy, setBusy] = useState(false);
  const { people } = useDirectory(query);

  async function create() {
    if (!title.trim() || selected.length === 0) return;
    setBusy(true);
    try {
      const id = await createGroupConversation(me, title.trim(), selected);
      onCreated(id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-black text-foreground">New Group</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members to add…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        {/* search results */}
        {query && (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border">
            {people.filter((p) => p.user_id !== me.userId && !selected.find((s) => s.user_id === p.user_id)).map((p) => (
              <button
                key={p.user_id}
                onClick={() => setSelected((prev) => [...prev, p])}
                className="flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Avatar name={p.name} size={7} />
                <span>{p.name} <span className="text-muted-foreground text-xs">· {p.kind}</span></span>
              </button>
            ))}
          </div>
        )}
        {/* selected members */}
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((p) => (
              <span key={p.user_id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {p.name}
                <button onClick={() => setSelected((prev) => prev.filter((s) => s.user_id !== p.user_id))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <button
          onClick={create}
          disabled={busy || !title.trim() || selected.length === 0}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          Create Group ({selected.length + 1} members)
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

function MessageBubble({
  msg,
  mine,
  meId,
  convId,
  participantCount,
  allMessages,
  onReply,
}: {
  msg: ChatMessage;
  mine: boolean;
  meId: string;
  convId: string;
  participantCount: number;
  allMessages: ChatMessage[];
  onReply: (m: ChatMessage) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const me = { userId: meId, name: "", kind: "staff" as const };

  const replyTarget = msg.reply_to_id
    ? allMessages.find((m) => m.id === msg.reply_to_id)
    : null;

  if (msg.is_deleted) {
    return (
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <p className="rounded-2xl border border-border bg-muted px-3 py-2 text-xs italic text-muted-foreground">
          This message was deleted
        </p>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Bubble */}
      <div className={`relative max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
        {/* Reply quote */}
        {replyTarget && (
          <div className={`mb-1 rounded-xl border-l-4 border-primary/50 bg-muted/60 px-2 py-1 text-xs text-muted-foreground ${mine ? "self-end" : "self-start"}`}>
            <span className="font-semibold">{replyTarget.sender_name ?? "…"}: </span>
            {replyTarget.body.slice(0, 60)}{replyTarget.body.length > 60 ? "…" : ""}
          </div>
        )}

        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            mine
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border border-border bg-card text-foreground"
          }`}
        >
          {!mine && (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">
              {msg.sender_name}
            </p>
          )}
          <FilePreview msg={msg} />
          {msg.message_type === "text" || msg.message_type === "emoji"
            ? <p className="whitespace-pre-wrap break-words">{msg.body}</p>
            : null}
          <div className={`mt-0.5 flex items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] opacity-60">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {msg.edited_at && <span className="text-[10px] opacity-50">edited</span>}
            <ReadReceipts msg={msg} meId={meId} participantCount={participantCount} />
          </div>
        </div>

        {/* Reactions */}
        <ReactionBar msg={msg} meId={meId} convId={convId} />
      </div>

      {/* Hover action buttons */}
      <div className={`flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${mine ? "flex-row-reverse" : ""}`}>
        {/* Quick emoji reactions */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker((p) => !p)}
            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-3.5 w-3.5" />
          </button>
          {showEmojiPicker && (
            <div className={`absolute bottom-8 z-50 flex gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl ${mine ? "right-0" : "left-0"}`}>
              {EMOJI_QUICK.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    toggleReaction(msg.id, convId, me, e);
                    setShowEmojiPicker(false);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-base hover:bg-muted"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply */}
        <button
          onClick={() => onReply(msg)}
          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>

        {/* Delete (own messages only) */}
        {mine && (
          <button
            onClick={() => deleteMessage(msg.id, msg.sender_id, meId)}
            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ChatPanel
// ---------------------------------------------------------------------------

export function ChatPanel({ compact = false, clientName, clientUserId }: { compact?: boolean; clientName?: string; clientUserId?: string }) {
  const { me: resolvedMe, loading: meLoading } = useMe();
  // If passed from portal shell, use it directly without waiting for hook resolution
  const me = (clientName && clientUserId)
    ? { userId: clientUserId, name: clientName, kind: "client" as const }
    : resolvedMe;
  const loading = (clientName && clientUserId) ? false : meLoading;
  const { conversations, loading: convsLoading, reload } = useConversations(!!me);
  const [activeId, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { people } = useDirectory(query);
  const { messages, reload: reloadMsgs } = useMessages(activeId);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const { recording, duration, start: startRec, stop: stopRec, cancel: cancelRec } = useVoiceRecorder();
  const { getStatus } = usePresence(me?.userId ?? null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (!activeId || !me) return;
    const unread = messages
      .filter((m) => m.sender_id !== me.userId && !(m.read_by ?? []).includes(me.userId))
      .map((m) => m.id);
    if (unread.length > 0) markConversationRead(activeId, me.userId, unread);
  }, [activeId, messages, me]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const participantCount = active?.conversation_participants?.length ?? 0;

  // Send text
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !activeId || !draft.trim()) return;
    setBusy(true);
    try {
      await sendMessage(activeId, me, draft, replyTo?.id);
      setDraft("");
      setReplyTo(null);
    } finally { setBusy(false); }
  }

  // Send file
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !me || !activeId) return;
    const type = file.type.startsWith("image/") ? "image" : "file";
    setBusy(true);
    try { await sendFileMessage(activeId, me, file, type); }
    catch (err) { console.error(err); }
    finally { setBusy(false); e.target.value = ""; }
  }

  // Stop recording and send voice
  async function sendVoice() {
    if (!me || !activeId) return;
    const result = await stopRec();
    if (!result) return;
    const file = new File([result.blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    setBusy(true);
    try { await sendFileMessage(activeId, me, file, "voice", result.duration); }
    catch (err) { console.error(err); }
    finally { setBusy(false); }
  }

  // Add emoji to draft
  function insertEmoji(e: string) {
    setDraft((d) => d + e);
    setShowEmoji(false);
  }

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------
  if (meLoading) {
    return (
      <div className="grid h-full place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }
  if (!me) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
        Sign in to use messaging.
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Left pane — conversation list
  // ---------------------------------------------------------------------------
  const listPane = (
    <div
      className={`flex h-full min-h-0 flex-col border-r border-border ${
        compact && activeId ? "hidden" : ""
      } ${compact ? "w-full" : "w-full max-w-[300px]"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearching(e.target.value.length > 0); }}
            placeholder="Search or start new chat"
            className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowNewGroup(true)}
          title="New group"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-muted"
        >
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Own status */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Avatar name={me.name} size={7} status={getStatus(me.userId)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-foreground">{me.name}</p>
          <p className="text-[10px] capitalize text-muted-foreground">{getStatus(me.userId)}</p>
        </div>
      </div>

      {/* List body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {searching ? (
          people.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No matching person found.</p>
          ) : (
            people
              .filter((p) => p.user_id !== me.userId)
              .map((p) => (
                <button
                  key={p.user_id}
                  onClick={async () => {
                    const id = await openDirectConversation(me, p);
                    setQuery(""); setSearching(false);
                    await reload();
                    setActive(id);
                  }}
                  className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted"
                >
                  <Avatar name={p.name} size={9} status={getStatus(p.user_id)} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{p.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {p.am_id ?? p.email} · {p.kind}
                    </span>
                  </span>
                </button>
              ))
          )
        ) : convsLoading ? (
          <div className="grid h-24 place-items-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground">
            No conversations yet. Search someone above to start a chat.
          </p>
        ) : (
          conversations.map((c: Conversation) => {
            const otherParticipant = c.conversation_participants?.find(
              (p) => p.user_id !== me.userId
            );
            const isGroup = c.kind === "group";
            const title = conversationTitle(c, me.userId);
            const onlineStatus = !isGroup && otherParticipant
              ? getStatus(otherParticipant.user_id)
              : undefined;

            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted ${
                  activeId === c.id ? "bg-muted" : ""
                }`}
              >
                <div className="relative shrink-0">
                  {isGroup ? (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                      <Users className="h-4 w-4" />
                    </span>
                  ) : (
                    <Avatar name={title} size={9} status={onlineStatus} />
                  )}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  <span className="flex items-center justify-between">
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {isGroup
                        ? `${c.conversation_participants?.length ?? 0} members`
                        : onlineStatus === "online" ? "Online" : "Offline"}
                    </span>
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Right pane — message thread
  // ---------------------------------------------------------------------------
  const otherInDirect = active?.kind === "direct"
    ? active.conversation_participants?.find((p) => p.user_id !== me.userId)
    : null;

  const threadPane = (
    <div className={`flex h-full min-h-0 flex-1 flex-col ${compact && !activeId ? "hidden" : ""}`}>
      {!active ? (
        <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
          <div>
            <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p>Select a conversation or search for someone to start chatting.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Thread header */}
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
            {compact && (
              <button
                onClick={() => setActive(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {active.kind === "group" ? (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </span>
            ) : (
              <Avatar
                name={conversationTitle(active, me.userId)}
                size={10}
                status={otherInDirect ? getStatus(otherInDirect.user_id) : undefined}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {conversationTitle(active, me.userId)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {active.kind === "group"
                  ? `${participantCount} members`
                  : otherInDirect
                    ? getStatus(otherInDirect.user_id) === "online"
                      ? "🟢 Online"
                      : `Last seen ${new Date(
                          // fallback if no presence row
                          active.last_message_at
                        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}
              </p>
            </div>
            {/* Header icons */}
            <div className="flex items-center gap-1">
              <button
                title="Voice call (coming soon)"
                disabled
                className="grid h-8 w-8 place-items-center rounded-xl border border-border text-muted-foreground opacity-40"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                title="Video call (coming soon)"
                disabled
                className="grid h-8 w-8 place-items-center rounded-xl border border-border text-muted-foreground opacity-40"
              >
                <Video className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpolygon points='20 10 10 0 0 10 10 20'/%3E%3C/g%3E%3C/svg%3E\")" }}>
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-muted-foreground">No messages yet. Say hi! 👋</p>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  mine={m.sender_id === me.userId}
                  meId={me.userId}
                  convId={active.id}
                  participantCount={participantCount}
                  allMessages={messages}
                  onReply={setReplyTo}
                />
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* Reply preview bar */}
          {replyTo && (
            <div className="flex items-center gap-3 border-t border-primary/30 bg-primary/5 px-4 py-2">
              <Reply className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-primary">{replyTo.sender_name}</p>
                <p className="truncate text-xs text-muted-foreground">{replyTo.body.slice(0, 80)}</p>
              </div>
              <button onClick={() => setReplyTo(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Voice recording bar */}
          {recording && (
            <div className="flex items-center gap-3 border-t border-border bg-destructive/10 px-4 py-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
              <span className="flex-1 text-sm font-semibold text-foreground">
                Recording… {formatVoiceDuration(duration)}
              </span>
              <button
                onClick={cancelRec}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={sendVoice}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                Send
              </button>
            </div>
          )}

          {/* Compose bar */}
          {!recording && (
            <div className="relative border-t border-border bg-card p-3">
              <form onSubmit={send} className="flex items-end gap-2">
                {/* File attach */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                  className="hidden"
                  onChange={handleFile}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Text input */}
                <div className="relative flex-1">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as React.FormEvent); }
                    }}
                    placeholder="Type a message…"
                    rows={1}
                    className="max-h-28 min-h-[40px] w-full resize-none rounded-2xl border border-border bg-background px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary"
                    style={{ overflowY: "auto" }}
                  />
                  {/* Emoji button inside input */}
                  <button
                    type="button"
                    onClick={() => setShowEmoji((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  {showEmoji && (
                    <EmojiPicker onPick={insertEmoji} onClose={() => setShowEmoji(false)} />
                  )}
                </div>

                {/* Voice or Send */}
                {draft.trim() ? (
                  <button
                    type="submit"
                    disabled={busy}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRec}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      {showNewGroup && (
        <CreateGroupModal
          me={me}
          onCreated={async (id) => {
            setShowNewGroup(false);
            await reload();
            setActive(id);
          }}
          onClose={() => setShowNewGroup(false)}
        />
      )}
      <div className="flex h-full min-h-0 overflow-hidden rounded-none">
        {listPane}
        {threadPane}
      </div>
    </>
  );
}
