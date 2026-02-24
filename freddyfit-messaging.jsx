import { useState, useRef, useEffect } from "react";

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

const LOGO_B64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NDAgMTE1Ij4KICA8dGV4dCB4PSIwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIE5hcnJvdywgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzYiIGZvbnQtd2VpZ2h0PSIzMDAiIGxldHRlci1zcGFjaW5nPSIzIiBmaWxsPSIjOUNBM0FGIj5GUkVERFk8L3RleHQ+CiAgPHRleHQgeD0iMzE2IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9Ijc2IiBmb250LXdlaWdodD0iODAwIiBsZXR0ZXItc3BhY2luZz0iMyIgZmlsbD0iIzFBQUJFMyI+RklUPC90ZXh0PgogIDxsaW5lIHgxPSI0NzQiIHkxPSI4IiB4Mj0iNDc0IiB5Mj0iODIiIHN0cm9rZT0iI0NCRDVFMSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8Y2lyY2xlIGN4PSI1MDciIGN5PSI0NCIgcj0iMzQiIGZpbGw9IiMxQUFCRTMiLz4KICA8dGV4dCB4PSI0OTEiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDIiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IndoaXRlIj5GPC90ZXh0PgogIDx0ZXh0IHg9IjY4IiB5PSIxMDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjUwMCIgbGV0dGVyLXNwYWNpbmc9IjciIGZpbGw9IiMxQUFCRTMiPlZJU1VBTElaRSDCtyBETyDCtyBCRUNPTUU8L3RleHQ+Cjwvc3ZnPg==";
const ICON_B64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzFBQUJFMyIvPgogIDxyZWN0IHg9IjIyIiB5PSIzMCIgd2lkdGg9IjUyIiBoZWlnaHQ9IjEwIiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIyMiIgeT0iNDYiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgcng9IjIiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMjIiIHk9IjMwIiB3aWR0aD0iMTIiIGhlaWdodD0iNDIiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTgsMzAgNzQsMzAgNjIsNDAgNDYsNDAiIGZpbGw9IndoaXRlIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI0Niw0NiA2Miw0NiA1Niw1NiA0MCw1NiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+";

// ── DATA ───────────────────────────────────────────────────────────────────
const CLIENTS = [
  { id: 1, name: "Marcus Webb",  avatar: "M", color: C.blue,    goal: "Build Muscle",         online: true  },
  { id: 2, name: "Sofia Chen",   avatar: "S", color: "#A855F7", goal: "Fat Loss",             online: true  },
  { id: 3, name: "Jordan Lee",   avatar: "J", color: "#F97316", goal: "Athletic Performance", online: false },
  { id: 4, name: "Priya Patel",  avatar: "P", color: "#22C55E", goal: "General Health",       online: false },
  { id: 5, name: "Devon Clarke", avatar: "D", color: "#EC4899", goal: "Endurance",            online: true  },
];

const INIT_MESSAGES = {
  1: [
    { id:1, from:"client", text:"Hey Freddy! Quick question about today's bench press sets — should I be going to complete failure or leaving a rep in the tank?", time:"9:14 AM", read:true },
    { id:2, from:"trainer", text:"Great question Marcus! Leave 1-2 reps in the tank on your working sets. Save failure for your last set only. This keeps your form tight and reduces injury risk.", time:"9:22 AM", read:true },
    { id:3, from:"client", text:"That makes sense. Also my shoulder has been a little tight lately, should I be worried?", time:"9:25 AM", read:true },
    { id:4, from:"trainer", text:"Don't push through shoulder pain. Drop the weight by 20% today and focus on your warm-up rotations. If it persists after 3 days let me know and we'll modify the plan.", time:"9:31 AM", read:true },
    { id:5, from:"client", text:"Will do, thanks! Heading to the gym now 💪", time:"9:33 AM", read:true },
  ],
  2: [
    { id:1, from:"trainer", text:"Hey Sofia! Just checked your nutrition log — great work hitting your protein targets 3 days in a row! 🎉", time:"Yesterday", read:true },
    { id:2, from:"client", text:"Thank you!! It's been tough but I'm getting the hang of meal prepping on Sundays", time:"Yesterday", read:true },
    { id:3, from:"client", text:"Quick question — is it okay if I swap Wednesday's cardio for a yoga class? My gym is offering a free session", time:"8:02 AM", read:false },
    { id:4, from:"client", text:"It's a 60 minute flow class", time:"8:03 AM", read:false },
  ],
  3: [
    { id:1, from:"client", text:"Freddy I crushed my 5k time today!! 24:32, that's a new PR for me!", time:"Monday", read:true },
    { id:2, from:"trainer", text:"LETS GO JORDAN!!! That's a massive improvement from your 27:10 six weeks ago. Your aerobic base is really building now.", time:"Monday", read:true },
    { id:3, from:"trainer", text:"Make sure you get a full rest day tomorrow — don't skip the recovery work!", time:"Monday", read:true },
  ],
  4: [
    { id:1, from:"trainer", text:"Hi Priya! Your workout plan is ready and waiting for you in the app. Let me know if you have any questions!", time:"Tuesday", read:true },
    { id:2, from:"client", text:"Thank you so much Freddy! I'm a little nervous starting out but excited 😊", time:"Tuesday", read:true },
  ],
  5: [
    { id:1, from:"client", text:"Morning! Completed week 2 of the half marathon plan. Legs are dead lol", time:"Wed", read:true },
    { id:2, from:"trainer", text:"Haha that's exactly how they should feel! That's adaptation happening in real time. How's your sleep been?", time:"Wed", read:true },
    { id:3, from:"client", text:"Honestly not great, averaging maybe 6hrs", time:"Wed", read:true },
    { id:4, from:"trainer", text:"That's your #1 priority right now Devon — sleep is where the gains actually happen. Try to get to bed 45 mins earlier this week. Your body needs it for the training load.", time:"Wed", read:true },
  ],
};

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

function formatTime(time) { return time; }

// ── QUICK REPLIES ──────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Great work today! 💪",
  "Keep pushing, you've got this!",
  "Make sure to rest and recover",
  "Log your workout when done",
  "Check your nutrition targets",
  "See you at our next session!",
];

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole]           = useState("trainer"); // "trainer" or "client"
  const [activeId, setActiveId]   = useState(1);
  const [messages, setMessages]   = useState(INIT_MESSAGES);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [search, setSearch]       = useState("");
  const [showQuick, setShowQuick] = useState(false);
  const [showInfo, setShowInfo]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const activeClient = CLIENTS.find(c => c.id === activeId);
  const activeMessages = messages[activeId] || [];

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeId]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    setMessages(prev => ({
      ...prev,
      [activeId]: (prev[activeId] || []).map(m => ({ ...m, read: true })),
    }));
  }, [activeId]);

  // Simulate client reply after trainer sends
  const simulateReply = (clientId) => {
    const replies = {
      1: "Thanks coach! On it 💪",
      2: "Got it, thank you Freddy!",
      3: "Appreciate it! Will do!",
      4: "Thank you so much! 😊",
      5: "Roger that, I'll try my best!",
    };
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => ({
          ...prev,
          [clientId]: [...(prev[clientId] || []), {
            id: Date.now(),
            from: "client",
            text: replies[clientId] || "Thanks!",
            time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            read: true,
          }],
        }));
      }, 1800);
    }, 800);
  };

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const newMsg = {
      id: Date.now(),
      from: role,
      text: msg,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      read: true,
    };
    setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setInput("");
    setShowQuick(false);
    if (role === "trainer") simulateReply(activeId);
  };

  const unreadCount = (id) => (messages[id] || []).filter(m => m.from === "client" && !m.read).length;

  const filteredClients = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // For client view — only show Freddy as the contact
  const clientView = role === "client";

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
            <button key={r} onClick={() => { setRole(r); setActiveId(1); }} style={{
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
            {(clientView ? [CLIENTS[0]] : filteredClients).map(client => {
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
                        {lastMsg ? `${lastMsg.from === "trainer" ? "You: " : ""}${lastMsg.text}` : "No messages yet"}
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
                <Avatar name={activeClient.name} color={activeClient.color} size={44} online={activeClient.online} />
              )}
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                  {clientView ? "Freddy — Your Coach" : activeClient.name}
                </div>
                <div style={{ fontSize: 12, color: activeClient.online ? C.green : C.muted, fontWeight: 600 }}>
                  {activeClient.online ? "● Online now" : "○ Last seen recently"}
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
              <button style={{
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
                const isMe = (role === "trainer" && msg.from === "trainer") || (role === "client" && msg.from === "client");
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
                          : <Avatar name={activeClient.name} color={activeClient.color} size={32} />
                      )}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      {showAvatar && !isMe && (
                        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 4, marginLeft: 4 }}>
                          {clientView ? "Freddy" : activeClient.name}
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
                  <Avatar name={activeClient.name} color={activeClient.color} size={32} />
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
                  <Avatar name={activeClient.name} color={activeClient.color} size={64} online={activeClient.online} />
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 12 }}>{activeClient.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{activeClient.goal}</div>
                  <div style={{ fontSize: 11, color: activeClient.online ? C.green : C.muted, fontWeight: 600, marginTop: 4 }}>
                    {activeClient.online ? "● Online" : "○ Offline"}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  {[
                    { label: "Current Weight", value: "177 lbs" },
                    { label: "Goal Weight",    value: "170 lbs" },
                    { label: "BMI",            value: "24.2" },
                    { label: "Plan",           value: "Push/Pull/Legs" },
                    { label: "Member Since",   value: "Jan 2024" },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ color: C.muted, fontWeight: 600 }}>{row.label}</span>
                      <span style={{ color: C.text, fontWeight: 700 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <button style={{
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
              <button title="Attach file" style={{
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
                placeholder={clientView ? "Message Freddy..." : `Message ${activeClient.name}...`}
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
        </div>
      </div>
    </div>
  );
}
