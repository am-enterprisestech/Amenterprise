import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchUserByAMID, generateAMID, type UserAMIdentity } from "@/lib/am-id";
import {
  Send, Paperclip, Smile, Mic, Search, CheckCheck, Phone, Video, MoreVertical,
  Plus, Users, MessageSquare, X, Play, Pause, FileText, Image as ImageIcon, CornerUpLeft, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export interface ChatUser {
  id: string;
  am_id: string;
  name: string;
  role: string;
  avatar_url?: string;
  type: "admin" | "staff" | "client";
}

interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  message: string;
  attachments?: { name: string; url: string; type: string }[];
  reactions?: Record<string, number>;
  reply_to?: { id: string; sender_name: string; message: string };
  is_read: boolean;
  created_at: string;
}

interface Channel {
  id: string;
  name: string;
  type: "direct" | "group" | "project";
  members: string[];
  last_message?: string;
  updated_at?: string;
}

export function WhatsAppChat({ currentUser }: { currentUser: ChatUser }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [amSearchResults, setAmSearchResults] = useState<UserAMIdentity[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<UserAMIdentity[]>([]);
  const [groupName, setGroupName] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user channels
  useEffect(() => {
    loadChannels();
  }, [currentUser.id]);

  const loadChannels = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("chat_channels")
      .select("*")
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      setChannels(data as Channel[]);
      if (!activeChannel) setActiveChannel(data[0] as Channel);
    } else {
      // Create default General Channel if empty
      const defaultChan: Channel = {
        id: crypto.randomUUID(),
        name: "amenterprise General Workspace",
        type: "group",
        members: [currentUser.am_id],
      };
      setChannels([defaultChan]);
      setActiveChannel(defaultChan);
    }
  };

  // Load messages & subscribe to realtime
  useEffect(() => {
    if (!activeChannel) return;

    loadMessages(activeChannel.id);

    // Supabase Realtime Subscription
    const channelSub = supabase
      .channel(`chat_${activeChannel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${activeChannel.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSub);
    };
  }, [activeChannel?.id]);

  const loadMessages = async (channelId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("chat_messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    setMessages((data as Message[]) ?? []);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async (overrideMessage?: string, overrideAttachments?: { name: string; url: string; type: string }[]) => {
    const content = (overrideMessage || text).trim();
    if (!content && (!overrideAttachments || overrideAttachments.length === 0)) return;
    if (!activeChannel) return;

    const newMsg: Partial<Message> = {
      id: crypto.randomUUID(),
      channel_id: activeChannel.id,
      sender_id: currentUser.am_id,
      sender_name: currentUser.name,
      sender_type: currentUser.type,
      message: content,
      attachments: overrideAttachments || [],
      reply_to: replyingTo ? { id: replyingTo.id, sender_name: replyingTo.sender_name, message: replyingTo.message } : undefined,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setText("");
    setReplyingTo(null);
    setMessages((prev) => [...prev, newMsg as Message]);
    scrollToBottom();

    // Persist to Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("chat_messages").insert(newMsg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("chat_channels").update({ updated_at: new Date().toISOString() }).eq("id", activeChannel.id);
  };

  const handleSearchAMID = async (q: string) => {
    if (!q) {
      setAmSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const res = await searchUserByAMID(q);
    setAmSearchResults(res);
    setSearchLoading(false);
  };

  const startDirectChat = (user: UserAMIdentity) => {
    const existing = channels.find((c) => c.type === "direct" && c.members.includes(user.am_id));
    if (existing) {
      setActiveChannel(existing);
    } else {
      const newChan: Channel = {
        id: crypto.randomUUID(),
        name: `${user.name} (${user.am_id})`,
        type: "direct",
        members: [currentUser.am_id, user.am_id],
      };
      setChannels((prev) => [newChan, ...prev]);
      setActiveChannel(newChan);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from as any)("chat_channels").insert(newChan);
    }
    setShowNewChat(false);
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) {
      toast.error("Please provide group name and select at least one member.");
      return;
    }
    const memberAMIds = [currentUser.am_id, ...selectedGroupMembers.map((m) => m.am_id)];
    const newChan: Channel = {
      id: crypto.randomUUID(),
      name: groupName,
      type: "group",
      members: memberAMIds,
    };

    setChannels((prev) => [newChan, ...prev]);
    setActiveChannel(newChan);
    setShowNewGroup(false);
    setGroupName("");
    setSelectedGroupMembers([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("chat_channels").insert(newChan);
    toast.success(`Group "${groupName}" created successfully!`);
  };

  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceSeconds(0);
    timerRef.current = setInterval(() => {
      setVoiceSeconds((s) => s + 1);
    }, 1000);
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecordingVoice(false);
    // Send simulated voice note audio file
    sendMessage("🎤 Voice note", [{ name: `Voice Note (${voiceSeconds}s).mp3`, url: "simulated_audio", type: "audio" }]);
    setVoiceSeconds(0);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || {};
        const count = currentReactions[emoji] || 0;
        return {
          ...m,
          reactions: { ...currentReactions, [emoji]: count > 0 ? count - 1 : count + 1 },
        };
      })
    );
  };

  return (
    <div className="flex h-[750px] w-full overflow-hidden rounded-3xl border border-espresso/15 bg-card shadow-2xl">
      {/* LEFT SIDEBAR: CHAT LIST */}
      <div className="flex w-80 shrink-0 flex-col border-r border-espresso/10 bg-sand/30">
        {/* User Header */}
        <div className="flex items-center justify-between border-b border-espresso/10 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-espresso text-sm font-black text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-black text-espresso">{currentUser.name}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-espresso/60">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> {currentUser.am_id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewChat(true)}
              className="grid h-8 w-8 place-items-center rounded-full border border-espresso/15 hover:bg-sand"
              title="New Chat by AM ID"
            >
              <Plus className="h-4 w-4 text-espresso" />
            </button>
            <button
              onClick={() => setShowNewGroup(true)}
              className="grid h-8 w-8 place-items-center rounded-full border border-espresso/15 hover:bg-sand"
              title="New Project Group"
            >
              <Users className="h-4 w-4 text-espresso" />
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-full border border-espresso/15 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-espresso/50" />
            <input
              type="text"
              placeholder="Search chat or AM ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
        </div>

        {/* Channel Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-espresso/6">
          {channels.length === 0 ? (
            <p className="p-4 text-center text-xs text-foreground/50">No chats yet. Click + to start!</p>
          ) : (
            channels
              .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((c) => {
                const isActive = activeChannel?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChannel(c)}
                    className={`flex w-full items-center gap-3 p-3.5 text-left transition ${isActive ? "bg-espresso/10 border-l-4 border-espresso" : "hover:bg-sand/60"
                      }`}
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-espresso/15 text-espresso">
                      {c.type === "group" || c.type === "project" ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        <MessageSquare className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-bold text-espresso">{c.name}</p>
                        <span className="text-[10px] text-foreground/50">12:45 PM</span>
                      </div>
                      <p className="truncate text-xs text-foreground/60">
                        {c.type === "group" ? `${c.members.length} members` : "Click to view chat"}
                      </p>
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: ACTIVE CHAT */}
      <div className="flex flex-1 flex-col bg-white">
        {activeChannel ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-espresso/10 bg-sand/20 px-6 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-espresso text-sm font-black text-white">
                  {activeChannel.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-sm font-black text-espresso">{activeChannel.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online · Active Channel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" title="Call">
                  <Phone className="h-4 w-4 text-espresso/70" />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" title="Video Call">
                  <Video className="h-4 w-4 text-espresso/70" />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand">
                  <MoreVertical className="h-4 w-4 text-espresso/70" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sand/10">
              {messages.map((m) => {
                const isMe = m.sender_id === currentUser.am_id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="group relative max-w-md">
                      {/* Sender Tag */}
                      {!isMe && (
                        <p className="mb-1 text-[10px] font-bold text-espresso/60">{m.sender_name} · {m.sender_type}</p>
                      )}

                      {/* Reply preview */}
                      {m.reply_to && (
                        <div className="mb-1 rounded-lg border-l-4 border-espresso bg-espresso/10 p-2 text-xs">
                          <p className="font-bold text-espresso">{m.reply_to.sender_name}</p>
                          <p className="truncate text-foreground/70">{m.reply_to.message}</p>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${isMe ? "bg-espresso text-white rounded-br-none" : "bg-card border border-espresso/10 text-espresso rounded-bl-none"
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>

                        {/* Attachments */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {m.attachments.map((att, idx) => (
                              <div key={idx} className="flex items-center gap-2 rounded-xl bg-black/10 p-2 text-xs">
                                {att.type === "audio" ? (
                                  <button
                                    onClick={() => setPlayingAudioId(playingAudioId === m.id ? null : m.id)}
                                    className="flex items-center gap-2 font-bold"
                                  >
                                    {playingAudioId === m.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    {att.name}
                                  </button>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4" />
                                    <span className="underline">{att.name}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {isMe && <CheckCheck className="h-3 w-3 text-emerald-400" />}
                        </div>
                      </div>

                      {/* Quick Reactions & Action Hover */}
                      <div className="absolute -top-3 right-0 hidden items-center gap-1 rounded-full border border-espresso/10 bg-white p-1 shadow group-hover:flex">
                        {["👍", "❤️", "🔥", "😂"].map((emoji) => (
                          <button key={emoji} onClick={() => toggleReaction(m.id, emoji)} className="hover:scale-125 transition">
                            {emoji}
                          </button>
                        ))}
                        <button onClick={() => setReplyingTo(m)} className="p-1 hover:text-espresso" title="Reply">
                          <CornerUpLeft className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Reaction Counters */}
                      {m.reactions && Object.keys(m.reactions).length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {Object.entries(m.reactions).map(
                            ([emoji, cnt]) =>
                              cnt > 0 && (
                                <span key={emoji} className="rounded-full bg-sand px-2 py-0.5 text-[10px] border border-espresso/10">
                                  {emoji} {cnt}
                                </span>
                              )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying Indicator */}
            {replyingTo && (
              <div className="flex items-center justify-between border-t border-espresso/10 bg-sand/40 px-6 py-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-espresso">Replying to {replyingTo.sender_name}: </span>
                  <span className="truncate text-foreground/60">{replyingTo.message}</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="rounded-full p-1 hover:bg-sand">
                  <X className="h-4 w-4 text-espresso" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-espresso/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand">
                  <Smile className="h-5 w-5 text-espresso/70" />
                </button>
                <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-sand">
                  <Paperclip className="h-5 w-5 text-espresso/70" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        sendMessage(`Attached: ${file.name}`, [{ name: file.name, url: "file_url", type: "file" }]);
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  placeholder={isRecordingVoice ? `Recording voice... ${voiceSeconds}s` : "Type a message..."}
                  value={text}
                  disabled={isRecordingVoice}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 rounded-full border border-espresso/15 bg-sand/20 px-5 py-2.5 text-sm outline-none focus:border-espresso focus:bg-white"
                />

                {text.trim() ? (
                  <button
                    onClick={() => sendMessage()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-espresso text-white hover:bg-cocoa"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${isRecordingVoice ? "bg-red-600 animate-pulse" : "bg-espresso hover:bg-cocoa"
                      }`}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <MessageSquare className="mx-auto h-12 w-12 text-espresso/30" />
              <h3 className="mt-3 font-display text-lg font-black text-espresso">Select a conversation</h3>
              <p className="mt-1 text-xs text-foreground/60">Choose a chat from the left or search by AM ID to start messaging.</p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: START NEW CHAT BY AM ID */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/50 p-4" onClick={() => setShowNewChat(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-black text-espresso">New Chat by AM ID</h3>
              <button onClick={() => setShowNewChat(false)} className="rounded-full p-1 hover:bg-sand"><X className="h-4 w-4" /></button>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-espresso/60">Search Name, Email or AM ID</label>
              <input
                type="text"
                placeholder="e.g. AM-CLI-9821107 or Moez..."
                onChange={(e) => handleSearchAMID(e.target.value)}
                className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-espresso/6">
              {searchLoading ? (
                <p className="p-4 text-center text-xs text-foreground/50">Searching...</p>
              ) : amSearchResults.length === 0 ? (
                <p className="p-4 text-center text-xs text-foreground/50">No users found.</p>
              ) : (
                amSearchResults.map((u) => (
                  <button
                    key={u.am_id}
                    onClick={() => startDirectChat(u)}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-sand/40"
                  >
                    <div>
                      <p className="text-sm font-bold text-espresso">{u.name}</p>
                      <p className="text-xs text-foreground/60">{u.email} · {u.role}</p>
                    </div>
                    <span className="rounded-full bg-espresso/10 px-2.5 py-1 text-[10px] font-bold text-espresso">{u.am_id}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE PROJECT GROUP CHAT */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/50 p-4" onClick={() => setShowNewGroup(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-black text-espresso">Create Project Group Chat</h3>
              <button onClick={() => setShowNewGroup(false)} className="rounded-full p-1 hover:bg-sand"><X className="h-4 w-4" /></button>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-espresso/60">Group Name</label>
              <input
                type="text"
                placeholder="e.g. E-Commerce Redesign Project"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
              />
            </div>

            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-espresso/60">Search & Add Members by AM ID</label>
              <input
                type="text"
                placeholder="Search team member..."
                onChange={(e) => handleSearchAMID(e.target.value)}
                className="mt-1 w-full rounded-xl border border-espresso/15 bg-sand/30 px-3.5 py-2 text-sm outline-none focus:border-espresso"
              />
            </div>

            {selectedGroupMembers.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {selectedGroupMembers.map((m) => (
                  <span key={m.am_id} className="inline-flex items-center gap-1 rounded-full bg-espresso text-white px-2.5 py-1 text-xs font-bold">
                    {m.name}
                    <button onClick={() => setSelectedGroupMembers(selectedGroupMembers.filter((x) => x.am_id !== m.am_id))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto divide-y divide-espresso/6 mb-4">
              {amSearchResults.map((u) => (
                <button
                  key={u.am_id}
                  onClick={() => {
                    if (!selectedGroupMembers.some((x) => x.am_id === u.am_id)) {
                      setSelectedGroupMembers([...selectedGroupMembers, u]);
                    }
                  }}
                  className="flex w-full items-center justify-between p-2.5 text-left hover:bg-sand/40"
                >
                  <p className="text-xs font-bold text-espresso">{u.name} ({u.role})</p>
                  <span className="text-[10px] text-espresso/60">{u.am_id}</span>
                </button>
              ))}
            </div>

            <button
              onClick={createGroupChat}
              className="w-full rounded-full bg-espresso py-2.5 text-xs font-bold text-white hover:bg-cocoa"
            >
              Create Group Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
