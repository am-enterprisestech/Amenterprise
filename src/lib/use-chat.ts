import { useCallback, useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => (supabase.from as any)(table);
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DirectoryPerson {
  user_id: string;
  name: string;
  email: string;
  am_id: string | null;
  kind: string;
  department: string | null;
}

export interface Participant {
  user_id: string;
  display_name: string | null;
  kind: string;
  role: string;
  is_muted: boolean;
}

export interface Conversation {
  id: string;
  kind: string; // direct | group
  title: string | null;
  avatar_url: string | null;
  description: string | null;
  project_id: string | null;
  last_message_at: string;
  is_archived: boolean;
  conversation_participants: Participant[];
}

export type MessageType = "text" | "image" | "file" | "voice" | "emoji";

export interface ChatReaction {
  id: string;
  message_id: string;
  user_id: string;
  user_name: string | null;
  emoji: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_mime: string | null;
  voice_duration: number | null;
  reply_to_id: string | null;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
  reactions?: ChatReaction[];
  read_by?: string[];
}

export interface Me {
  userId: string;
  name: string;
  kind: "staff" | "client" | "admin";
}

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
}

// ---------------------------------------------------------------------------
// useMe — resolve signed-in identity
// ---------------------------------------------------------------------------

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) { setMe(null); setLoading(false); return; }

      // Check staff first
      const { data: staff } = await supabase
        .from("staff_members").select("name").eq("user_id", user.id).maybeSingle();
      if (staff) { setMe({ userId: user.id, name: staff.name, kind: "staff" }); setLoading(false); return; }

      // Use the SECURITY DEFINER RPC so clients with NULL user_id also resolve correctly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clientRows } = await (supabase.rpc as any)("get_my_portal_client");
      const client = clientRows?.[0] ?? null;
      if (client) { setMe({ userId: user.id, name: client.name, kind: "client" }); setLoading(false); return; }

      setMe({ userId: user.id, name: user.email ?? "Admin", kind: "admin" });
      setLoading(false);
    })();
  }, []);

  return { me, loading };
}

// ---------------------------------------------------------------------------
// usePresence — track and update online status
// ---------------------------------------------------------------------------

export function usePresence(userId: string | null) {
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;
    const upsert = () =>
      db("user_presence").upsert(
        { user_id: userId, status: "online", last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    upsert();
    heartbeatRef.current = setInterval(upsert, 30_000);

    const markOffline = () =>
      db("user_presence").upsert(
        { user_id: userId, status: "offline", last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    window.addEventListener("beforeunload", markOffline);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", markOffline);
      markOffline();
    };
  }, [userId]);

  useEffect(() => {
    const ch = supabase
      .channel("user-presence-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_presence" },
        (payload) => {
          const row = payload.new as UserPresence;
          setPresenceMap((prev) => ({ ...prev, [row.user_id]: row }));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    db("user_presence").select("*").then(({ data }: { data: UserPresence[] | null }) => {
      if (!data) return;
      const map: Record<string, UserPresence> = {};
      for (const row of data) map[row.user_id] = row;
      setPresenceMap(map);
    });
  }, []);

  const getStatus = useCallback(
    (uid: string): PresenceStatus => {
      const p = presenceMap[uid];
      if (!p) return "offline";
      const diff = Date.now() - new Date(p.last_seen_at).getTime();
      if (diff > 2 * 60 * 1000) return "offline";
      return p.status;
    },
    [presenceMap]
  );

  return { presenceMap, getStatus };
}

// ---------------------------------------------------------------------------
// useDirectory
// ---------------------------------------------------------------------------

export function useDirectory(query: string) {
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.rpc("search_directory", { _q: query.trim() });
      if (!cancelled) { setPeople((data as DirectoryPerson[]) ?? []); setLoading(false); }
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  return { people, loading };
}

// ---------------------------------------------------------------------------
// useConversations
// ---------------------------------------------------------------------------

export function useConversations(enabled: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("conversations")
      .select(`
        id, kind, title, avatar_url, description, project_id,
        last_message_at, is_archived,
        conversation_participants(user_id, display_name, kind, role, is_muted)
      `)
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false });
    setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!enabled) return;
    const ch = supabase
      .channel("conversations-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [enabled, load]);

  return { conversations, loading, reload: load };
}

// ---------------------------------------------------------------------------
// useMessages
// ---------------------------------------------------------------------------

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!conversationId) { setMessages([]); return; }
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("chat_messages")
      .select(`
        id, conversation_id, sender_id, sender_name, body,
        message_type, file_url, file_name, file_size, file_mime,
        voice_duration, reply_to_id, is_deleted, edited_at, created_at
      `)
      .eq("conversation_id", conversationId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    const msgs = (data as ChatMessage[]) ?? [];

    if (msgs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: reactions } = await (supabase.from as any)("chat_reactions")
        .select("id, message_id, user_id, user_name, emoji")
        .eq("conversation_id", conversationId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: receipts } = await (supabase.from as any)("chat_read_receipts")
        .select("message_id, user_id")
        .eq("conversation_id", conversationId);

      const reactionMap: Record<string, ChatReaction[]> = {};
      const readMap: Record<string, string[]> = {};

      for (const r of (reactions as ChatReaction[]) ?? []) {
        reactionMap[r.message_id] = [...(reactionMap[r.message_id] ?? []), r];
      }
      for (const r of (receipts as { message_id: string; user_id: string }[]) ?? []) {
        readMap[r.message_id] = [...(readMap[r.message_id] ?? []), r.user_id];
      }
      for (const m of msgs) {
        m.reactions = reactionMap[m.id] ?? [];
        m.read_by = readMap[m.id] ?? [];
      }
    }

    setMessages(msgs);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!conversationId) return;
    const ch = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_reactions", filter: `conversation_id=eq.${conversationId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_read_receipts", filter: `conversation_id=eq.${conversationId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conversationId, load]);

  return { messages, loading, reload: load };
}

// ---------------------------------------------------------------------------
// Send text message
// ---------------------------------------------------------------------------

export async function sendMessage(
  conversationId: string,
  me: Me,
  body: string,
  replyToId?: string
) {
  const text = body.trim();
  if (!text) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)("chat_messages").insert({
    conversation_id: conversationId,
    sender_id: me.userId,
    sender_name: me.name,
    body: text,
    message_type: "text",
    reply_to_id: replyToId ?? null,
  });
  if (error) throw new Error((error as { message: string }).message);
}

// ---------------------------------------------------------------------------
// Send file/image/voice message
// ---------------------------------------------------------------------------

export async function sendFileMessage(
  conversationId: string,
  me: Me,
  file: File,
  type: "file" | "image" | "voice",
  voiceDuration?: number
) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${me.userId}/${conversationId}/${Date.now()}.${ext}`;
  const { data: upload, error: uploadErr } = await supabase.storage
    .from("chat-uploads")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadErr) throw new Error(uploadErr.message);

  const { data: urlData } = supabase.storage
    .from("chat-uploads")
    .getPublicUrl(upload.path);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)("chat_messages").insert({
    conversation_id: conversationId,
    sender_id: me.userId,
    sender_name: me.name,
    body: type === "voice" ? "🎤 Voice message" : file.name,
    message_type: type,
    file_url: urlData.publicUrl,
    file_name: file.name,
    file_size: file.size,
    file_mime: file.type,
    voice_duration: voiceDuration ?? null,
  });
  if (error) throw new Error((error as { message: string }).message);
}

// ---------------------------------------------------------------------------
// Toggle emoji reaction
// ---------------------------------------------------------------------------

export async function toggleReaction(
  messageId: string,
  conversationId: string,
  me: Me,
  emoji: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from as any)("chat_reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", me.userId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("chat_reactions").delete().eq("id", (existing as { id: string }).id);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("chat_reactions").insert({
      message_id: messageId,
      conversation_id: conversationId,
      user_id: me.userId,
      user_name: me.name,
      emoji,
    });
  }
}

// ---------------------------------------------------------------------------
// Mark conversation as read
// ---------------------------------------------------------------------------

export async function markConversationRead(
  conversationId: string,
  userId: string,
  messageIds: string[]
) {
  if (messageIds.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from as any)("chat_read_receipts")
    .select("message_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .in("message_id", messageIds);

  const alreadyRead = new Set(
    ((existing as { message_id: string }[]) ?? []).map((r) => r.message_id)
  );
  const toInsert = messageIds
    .filter((id) => !alreadyRead.has(id))
    .map((id) => ({ message_id: id, conversation_id: conversationId, user_id: userId }));

  if (toInsert.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from as any)("chat_read_receipts").insert(toInsert);
}

// ---------------------------------------------------------------------------
// Soft-delete a message
// ---------------------------------------------------------------------------

export async function deleteMessage(messageId: string, senderId: string, myId: string) {
  if (senderId !== myId) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from as any)("chat_messages").update({ is_deleted: true }).eq("id", messageId);
}

// ---------------------------------------------------------------------------
// Open or create a direct conversation
// ---------------------------------------------------------------------------

export async function openDirectConversation(me: Me, other: DirectoryPerson): Promise<string> {
  const { data: shared } = await supabase
    .from("conversation_participants")
    .select("conversation_id, conversations(kind)")
    .eq("user_id", other.user_id);

  const existing = (shared ?? []).find(
    (r) =>
      (r as unknown as { conversations: { kind: string } | null }).conversations?.kind === "direct"
  );
  if (existing) return (existing as { conversation_id: string }).conversation_id;

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ kind: "direct", created_by: me.userId })
    .select("id")
    .single();
  if (error || !conv) throw new Error(error?.message ?? "Could not start conversation");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from as any)("conversation_participants").insert([
    { conversation_id: conv.id, user_id: me.userId, display_name: me.name, kind: me.kind, role: "owner" },
    { conversation_id: conv.id, user_id: other.user_id, display_name: other.name, kind: other.kind, role: "member" },
  ]);
  return conv.id;
}

// ---------------------------------------------------------------------------
// Create a group conversation
// ---------------------------------------------------------------------------

export async function createGroupConversation(
  me: Me,
  title: string,
  members: DirectoryPerson[]
): Promise<string> {
  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ kind: "group", title, created_by: me.userId })
    .select("id")
    .single();
  if (error || !conv) throw new Error(error?.message ?? "Could not create group");

  const participants = [
    { conversation_id: conv.id, user_id: me.userId, display_name: me.name, kind: me.kind, role: "owner" },
    ...members.map((m) => ({
      conversation_id: conv.id,
      user_id: m.user_id,
      display_name: m.name,
      kind: m.kind,
      role: "member",
    })),
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from as any)("conversation_participants").insert(participants);
  return conv.id;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function conversationTitle(c: Conversation, meId: string) {
  if (c.title) return c.title;
  const other = c.conversation_participants?.find((p) => p.user_id !== meId);
  return other?.display_name ?? "Conversation";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatVoiceDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
