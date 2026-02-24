import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import LOGO_IMG from "../../assets/freddyfit-logo.png";

const C = {
  blue:      "#1AABE3",
  blueDark:  "#1490C4",
  blueLight: "#E8F7FD",
  blueGlow:  "rgba(26,171,227,0.12)",
  greyDark:  "#4A5568",
  greyLight: "#F4F7FA",
  white:     "#FFFFFF",
  text:      "#1A2332",
  muted:     "#7A8A9E",
  border:    "#E2E8F0",
  green:     "#22C55E",
  greenLight:"#DCFCE7",
  red:       "#EF4444",
  shadow:    "0 2px 12px rgba(0,0,0,0.06)",
  shadowLg:  "0 8px 32px rgba(26,171,227,0.14)",
};
const ff = "'Barlow', 'Segoe UI', sans-serif";

if (typeof document !== "undefined") {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800;900&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}

const LOGO_B64 = LOGO_IMG;
const ICON_B64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzFBQUJFMyIvPgogIDxyZWN0IHg9IjIyIiB5PSIzMCIgd2lkdGg9IjUyIiBoZWlnaHQ9IjEwIiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIyMiIgeT0iNDYiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgcng9IjIiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMjIiIHk9IjMwIiB3aWR0aD0iMTIiIGhlaWdodD0iNDIiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTgsMzAgNzQsMzAgNjIsNDAgNDYsNDAiIGZpbGw9IndoaXRlIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI0Niw0NiA2Miw0NiA1Niw1NiA0MCw1NiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+";

// ── QUICK REPLIES ──────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Great work today! 💪",
  "Keep pushing, you've got this!",
  "Make sure to rest and recover",
  "Log your workout when done",
  "Check your nutrition targets",
  "See you at our next session!",
];

// ── HELPERS ────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 40, online }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size / 2.6, fontWeight: 800, color: C.white, fontFamily: ff,
      }}>{name[0]}</div>
      {online !== undefined && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: size / 4, height: size / 4, borderRadius: "50%",
          background: online ? C.green : "#CBD5E0",
          border: `2px solid ${C.white}`,
        }} />
      )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function Messaging({ role: initialRole = "trainer" }) {
  const [role, setRole]             = useState(initialRole);
  const [contacts, setContacts]     = useState([]);
  const [activeId, setActiveId]     = useState(null);
  const [messages, setMessages]     = useState({});
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [search, setSearch]         = useState("");
  const [showQuick, setShowQuick]   = useState(false);
  const [showInfo, setShowInfo]     = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading]       = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const activeClient   = contacts.find(c => c.id === activeId) || null;
  const activeMessages = (activeId && messages[activeId]) ? messages[activeId] : [];

  // ── Load current user ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
      else setLoading(false);
    });
  }, []);

  // ── Load contacts ──────────────────────────────────────────────────────
  const loadContacts = useCallback(async (userId, currentRole) => {
    setLoading(true);
    if (currentRole === "trainer") {
      // RLS on profiles limits trainer to only see clients with accepted invites
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, fitness_level")
        .eq("role", "client");

      if (data && data.length > 0) {
        const list = data.map(p => ({
          id: p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Client",
          avatar: (p.first_name || "C")[0].toUpperCase(),
          color: C.blue,
          goal: p.fitness_level || "",
          online: false,
        }));
        setContacts(list);
        setActiveId(list[0].id);
      } else {
        setContacts([]);
      }
    } else {
      // Find the trainer linked to this client via accepted invite
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (myProfile?.email) {
        const { data: inv } = await supabase
          .from("invites")
          .select("trainer_id")
          .eq("email", myProfile.email)
          .eq("status", "accepted")
          .limit(1)
          .maybeSingle();

        if (inv?.trainer_id) {
          const { data: trainerProfile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("id", inv.trainer_id)
            .single();

          if (trainerProfile) {
            const contact = {
              id: trainerProfile.id,
              name: [trainerProfile.first_name, trainerProfile.last_name].filter(Boolean).join(" ") || "Freddy",
              avatar: (trainerProfile.first_name || "F")[0].toUpperCase(),
              color: C.blue,
              goal: "Personal Trainer",
              online: false,
            };
            setContacts([contact]);
            setActiveId(contact.id);
          } else {
            setContacts([]);
          }
        } else {
          setContacts([]);
        }
      } else {
        setContacts([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUserId) loadContacts(currentUserId, role);
  }, [currentUserId, role, loadContacts]);

  // ── Load messages for active conversation ──────────────────────────────
  const loadMessages = useCallback(async (contactId) => {
    if (!currentUserId || !contactId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${contactId}),` +
        `and(sender_id.eq.${contactId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      const mapped = data.map(m => ({
        id: m.id,
        from: m.sender_id === currentUserId ? role : (role === "trainer" ? "client" : "trainer"),
        text: m.body,
        time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        read: m.read,
      }));
      setMessages(prev => ({ ...prev, [contactId]: mapped }));
    }
  }, [currentUserId, role]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  // ── Mark messages as read when opening conversation ────────────────────
  useEffect(() => {
    if (!currentUserId || !activeId) return;
    supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_id", currentUserId)
      .eq("sender_id", activeId)
      .then(() => {
        setMessages(prev => ({
          ...prev,
          [activeId]: (prev[activeId] || []).map(m => ({ ...m, read: true })),
        }));
      });
  }, [activeId, currentUserId]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeId]);

  // ── Realtime subscription ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`messages:${currentUserId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${currentUserId}`,
      }, (payload) => {
        const m = payload.new;
        const mapped = {
          id: m.id,
          from: role === "trainer" ? "client" : "trainer",
          text: m.body,
          time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          read: false,
        };
        setMessages(prev => ({
          ...prev,
          [m.sender_id]: [...(prev[m.sender_id] || []), mapped],
        }));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentUserId, role]);

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || !currentUserId || !activeId) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      from: role,
      text: msg,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      read: false,
    };
    setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), tempMsg] }));
    setInput("");
    setShowQuick(false);

    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, receiver_id: activeId, body: msg })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => ({
        ...prev,
        [activeId]: (prev[activeId] || []).map(m =>
          m.id === tempId ? { ...m, id: data.id } : m
        ),
      }));
    }
  }, [input, currentUserId, activeId, role]);

  const unreadCount = (id) =>
    (messages[id] || []).filter(m => m.from !== role && !m.read).length;

  const filteredClients = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const clientView = role === "client";

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ fontFamily: ff, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.greyLight }}>
        <div style={{ color: C.muted, fontSize: 16 }}>Loading messages…</div>
      </div>
    );
  }

  // Fallback so JSX doesn't crash before contacts load
  const displayClient = activeClient || { name: "–", avatar: "?", color: C.muted, goal: "", online: false };

  return (
    <div style={{ fontFamily: ff, height: "100vh", display: "flex", flexDirection: "column", background: C.greyLight }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes typingPulse { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        textarea:focus { outline: none; border-color: ${C.blue} !important; }
      `}</style>

      {/* ── TOP NAV ── */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: C.shadow, flexShrink: 0,
      }}>
        <img src={LOGO_B64} alt="Freddy Fit" style={{ height: 32, width: "auto" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: C.muted }}>Viewing as:</span>
          {["trainer", "client"].map(r => (
            <button key={r} onClick={() => { setRole(r); setActiveId(null); }} style={{
              padding: "6px 16px", borderRadius: 20, cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: ff, border: "none",
              background: role === r ? C.blue : C.greyLight,
              color: role === r ? C.white : C.muted,
              transition: "all 0.15s",
            }}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 300, background: C.white,
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          flexShrink: 0,
        }}>
          {/* Sidebar header */}
          <div style={{ padding: "20px 20px 12px" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 12 }}>
              {clientView ? "My Trainer" : "Messages"}
            </div>
            {!clientView && (
              <div style={{ position: "relative" }}>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  style={{
                    width: "100%", padding: "9px 12px 9px 36px",
                    borderRadius: 10, border: `1.5px solid ${C.border}`,
                    fontSize: 13, fontFamily: ff, background: C.greyLight,
                    color: C.text, outline: "none",
                  }}
                />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
              </div>
            )}
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {contacts.length === 0 ? (
              <div style={{ padding: "24px 20px", color: C.muted, fontSize: 13, textAlign: "center" }}>
                {clientView ? "No trainer linked yet." : "No clients yet."}
              </div>
            ) : (clientView ? contacts : filteredClients).map(client => {
              const msgs = messages[client.id] || [];
              const lastMsg = msgs[msgs.length - 1];
              const unread = unreadCount(client.id);
              const isActive = activeId === client.id;

              return (
                <div key={client.id} onClick={() => setActiveId(client.id)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 20px", cursor: "pointer",
                  background: isActive ? C.blueLight : "transparent",
                  borderLeft: `3px solid ${isActive ? C.blue : "transparent"}`,
                  transition: "all 0.15s",
                }}>
                  <Avatar name={client.name} color={client.color} size={44} online={client.online} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: unread > 0 ? 800 : 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {clientView ? "Freddy (Your Trainer)" : client.name}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, flexShrink: 0, marginLeft: 8 }}>
                        {lastMsg?.time}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                      <div style={{
                        fontSize: 12, color: unread > 0 ? C.text : C.muted,
                        fontWeight: unread > 0 ? 600 : 400,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        maxWidth: unread > 0 ? "80%" : "100%",
                      }}>
                        {lastMsg ? `${lastMsg.from === role ? "You: " : ""}${lastMsg.text}` : "No messages yet"}
                      </div>
                      {unread > 0 && (
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          background: C.blue, color: C.white,
                          fontSize: 11, fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>{unread}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {!activeId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 15 }}>
              Select a conversation to start messaging.
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                background: C.white, borderBottom: `1px solid ${C.border}`,
                padding: "0 24px", height: 68,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0, boxShadow: C.shadow,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {clientView ? (
                    <img src={ICON_B64} alt="Freddy" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                  ) : (
                    <Avatar name={displayClient.name} color={displayClient.color} size={44} online={displayClient.online} />
                  )}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                      {clientView ? "Freddy — Your Coach" : displayClient.name}
                    </div>
                    <div style={{ fontSize: 12, color: displayClient.online ? C.green : C.muted, fontWeight: 600 }}>
                      {displayClient.online ? "● Online now" : "○ Last seen recently"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {!clientView && (
                    <button onClick={() => setShowInfo(!showInfo)} style={{
                      padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`,
                      background: showInfo ? C.blueLight : C.white, color: C.blue,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: ff,
                    }}>
                      👤 Profile
                    </button>
                  )}
                  <button onClick={() => alert("Voice calling coming soon!")} style={{
                    padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`,
                    background: C.white, color: C.greyDark,
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: ff,
                  }}>
                    📞 Call
                  </button>
                </div>
              </div>

              {/* Messages + optional profile panel */}
              <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 16px", display: "flex", flexDirection: "column", gap: 4 }}>

                  {/* Date divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.5px" }}>TODAY</div>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>

                  {activeMessages.map((msg, i) => {
                    const isMe = msg.from === role;
                    const showAvatar = !isMe && (i === 0 || activeMessages[i-1]?.from !== msg.from);
                    const isConsecutive = i > 0 && activeMessages[i-1]?.from === msg.from;

                    return (
                      <div key={msg.id} style={{
                        display: "flex",
                        flexDirection: isMe ? "row-reverse" : "row",
                        alignItems: "flex-end",
                        gap: 10,
                        marginBottom: isConsecutive ? 2 : 10,
                        animation: "fadeIn 0.2s ease",
                      }}>
                        {/* Avatar space */}
                        <div style={{ width: 32, flexShrink: 0 }}>
                          {showAvatar && !isMe && (
                            clientView
                              ? <img src={ICON_B64} alt="Freddy" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                              : <Avatar name={displayClient.name} color={displayClient.color} size={32} />
                          )}
                        </div>

                        {/* Bubble */}
                        <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                          {showAvatar && !isMe && (
                            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 4, marginLeft: 4 }}>
                              {clientView ? "Freddy" : displayClient.name}
                            </div>
                          )}
                          <div style={{
                            padding: "10px 16px",
                            borderRadius: isMe
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            background: isMe
                              ? `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`
                              : C.white,
                            color: isMe ? C.white : C.text,
                            fontSize: 14,
                            lineHeight: 1.5,
                            boxShadow: isMe
                              ? `0 4px 14px rgba(26,171,227,0.3)`
                              : C.shadow,
                            border: isMe ? "none" : `1px solid ${C.border}`,
                            wordBreak: "break-word",
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, marginLeft: isMe ? 0 : 4, marginRight: isMe ? 4 : 0 }}>
                            {msg.time}
                            {isMe && <span style={{ marginLeft: 4 }}>{msg.read ? " ✓✓" : " ✓"}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {typing && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, animation: "fadeIn 0.2s ease" }}>
                      <Avatar name={displayClient.name} color={displayClient.color} size={32} />
                      <div style={{
                        padding: "12px 18px", borderRadius: "18px 18px 18px 4px",
                        background: C.white, border: `1px solid ${C.border}`,
                        boxShadow: C.shadow, display: "flex", gap: 4, alignItems: "center",
                      }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{
                            width: 7, height: 7, borderRadius: "50%", background: C.muted,
                            animation: `typingPulse 1.2s ease ${i * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Client info panel */}
                {showInfo && !clientView && (
                  <div style={{
                    width: 260, background: C.white, borderLeft: `1px solid ${C.border}`,
                    padding: 20, overflowY: "auto", flexShrink: 0,
                    animation: "fadeIn 0.2s ease",
                  }}>
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <Avatar name={displayClient.name} color={displayClient.color} size={64} online={displayClient.online} />
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 12 }}>{displayClient.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{displayClient.goal}</div>
                      <div style={{ fontSize: 11, color: displayClient.online ? C.green : C.muted, fontWeight: 600, marginTop: 4 }}>
                        {displayClient.online ? "● Online" : "○ Offline"}
                      </div>
                    </div>

                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                      {[
                        { label: "Goal",   value: displayClient.goal || "—" },
                        { label: "Status", value: displayClient.online ? "Online" : "Offline" },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                          <span style={{ color: C.muted, fontWeight: 600 }}>{row.label}</span>
                          <span style={{ color: C.text, fontWeight: 700 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => alert("Shared media view coming soon!")} style={{
                      marginTop: 16, width: "100%", padding: "10px 0",
                      background: C.blueLight, color: C.blue, border: "none",
                      borderRadius: 10, fontSize: 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: ff,
                    }}>
                      View Full Profile →
                    </button>
                  </div>
                )}
              </div>

              {/* ── INPUT AREA ── */}
              <div style={{
                background: C.white, borderTop: `1px solid ${C.border}`,
                padding: "12px 20px 16px", flexShrink: 0,
              }}>
                {/* Quick replies (trainer only) */}
                {showQuick && !clientView && (
                  <div style={{ marginBottom: 12, animation: "fadeIn 0.15s ease" }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>QUICK REPLIES</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {QUICK_REPLIES.map((r, i) => (
                        <button key={i} onClick={() => sendMessage(r)} style={{
                          padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                          fontSize: 12, fontWeight: 600, fontFamily: ff,
                          background: C.blueLight, color: C.blue, border: "none",
                          transition: "all 0.15s",
                        }}>{r}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                  {/* Quick reply toggle (trainer only) */}
                  {!clientView && (
                    <button onClick={() => setShowQuick(!showQuick)} title="Quick replies" style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: showQuick ? C.blueLight : C.greyLight,
                      border: `1.5px solid ${showQuick ? C.blue : C.border}`,
                      cursor: "pointer", fontSize: 18, display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>⚡</button>
                  )}

                  {/* Attachment button */}
                  <button title="Attach file" onClick={() => alert("File attachments coming soon!")} style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: C.greyLight, border: `1.5px solid ${C.border}`,
                    cursor: "pointer", fontSize: 18, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>📎</button>

                  {/* Text input */}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={clientView ? "Message Freddy..." : `Message ${displayClient.name}...`}
                    rows={1}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 14,
                      border: `1.5px solid ${C.border}`, fontSize: 14,
                      fontFamily: ff, color: C.text, background: C.greyLight,
                      resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
                    }}
                  />

                  {/* Send button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: input.trim() ? C.blue : C.border,
                      border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, boxShadow: input.trim() ? C.shadowLg : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: "center" }}>
                  Press Enter to send · Shift+Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
