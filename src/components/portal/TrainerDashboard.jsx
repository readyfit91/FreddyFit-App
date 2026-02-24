import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import LOGO_IMG from "../../assets/freddyfit-logo.png";

// ── FREDDY FIT LOGO (embedded SVG as base64) ──────────────────────────────
const LOGO_B64 = LOGO_IMG;

// ── FREDDYFIT BRAND COLORS ─────────────────────────────────────────────────
const C = {
  blue:       "#1AABE3",
  blueDark:   "#1490C4",
  blueLight:  "#E8F7FD",
  blueGlow:   "#1AABE322",
  grey:       "#8A9BB0",
  greyDark:   "#4A5568",
  greyLight:  "#F4F7FA",
  white:      "#FFFFFF",
  text:       "#1A2332",
  textMuted:  "#7A8A9E",
  border:     "#E2E8F0",
  green:      "#22C55E",
  red:        "#EF4444",
  orange:     "#F97316",
  shadow:     "0 2px 12px rgba(26,171,227,0.10)",
  shadowLg:   "0 8px 32px rgba(26,171,227,0.15)",
};

const ff = "'Barlow', 'Segoe UI', sans-serif";

// inject Barlow font
if (typeof document !== "undefined") {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

// ── SHARED STYLES ──────────────────────────────────────────────────────────
const S = {
  sidebar: {
    width: 240,
    background: C.white,
    borderRight: `1px solid ${C.border}`,
    position: "fixed", top: 0, left: 0, height: "100vh",
    display: "flex", flexDirection: "column",
    boxShadow: "2px 0 16px rgba(0,0,0,0.06)",
    zIndex: 100,
    fontFamily: ff,
  },
  main: {
    marginLeft: 240, flex: 1,
    background: C.greyLight,
    minHeight: "100vh",
    fontFamily: ff,
  },
  topbar: {
    background: C.white,
    borderBottom: `1px solid ${C.border}`,
    padding: "0 32px",
    height: 64,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 50,
  },
  content: { padding: 32 },
  card: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: C.shadow,
  },
  cardBlue: {
    background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
    borderRadius: 16,
    padding: 24,
    color: C.white,
    boxShadow: C.shadowLg,
  },
  grid: (n) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${n}, 1fr)`,
    gap: 20,
  }),
  btn: {
    background: C.blue,
    color: C.white,
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: ff,
    letterSpacing: "0.3px",
    transition: "all 0.15s",
    boxShadow: `0 4px 14px ${C.blueGlow}`,
  },
  btnGhost: {
    background: "transparent",
    color: C.blue,
    border: `1.5px solid ${C.blue}`,
    borderRadius: 10,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: ff,
    transition: "all 0.15s",
  },
  btnSm: {
    background: C.blueLight,
    color: C.blue,
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: ff,
  },
  input: {
    background: C.greyLight,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    padding: "11px 16px",
    color: C.text,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    fontFamily: ff,
    outline: "none",
    transition: "border-color 0.15s",
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: C.greyDark,
    marginBottom: 6,
    display: "block",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  tag: (color, bg) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: bg || `${color}18`,
    color: color,
    letterSpacing: "0.3px",
  }),
  avatar: (size = 40, initials, color = C.blue) => ({
    style: {
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${C.blueDark})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size / 3, fontWeight: 800, color: C.white,
      flexShrink: 0, fontFamily: ff,
    },
    initials,
  }),
};

// ── MINI WEIGHT CHART ──────────────────────────────────────────────────────
function WeightChart({ data, height = 60, width = 180, color = C.blue }) {
  const min = Math.min(...data) - 3;
  const max = Math.max(...data) + 3;
  const range = max - min;
  const pad = 8;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${height} L${pts[0].x},${height} Z`;
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace("#","")})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={C.white} stroke={color} strokeWidth={2}/>)}
    </svg>
  );
}

// ── MACRO BAR ──────────────────────────────────────────────────────────────
function MacroBar({ label, val, goal, color, unit = "g" }) {
  const pct = Math.min(100, (val / goal) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.greyDark }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{val}{unit} <span style={{ color: C.textMuted, fontWeight: 400 }}>/ {goal}{unit}</span></span>
      </div>
      <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width 0.4s ease" }}/>
      </div>
    </div>
  );
}

// ── DATA ───────────────────────────────────────────────────────────────────
const CLIENTS = [
  { id: 1, name: "Marcus Webb",  email: "marcus@email.com",  goal: "Build Muscle",        since: "Jan 2024", weight: [185,183,181,182,180,178,177], color: C.blue },
  { id: 2, name: "Sofia Chen",   email: "sofia@email.com",   goal: "Fat Loss",            since: "Mar 2024", weight: [148,146,145,143,142,141,139], color: "#A855F7" },
  { id: 3, name: "Jordan Lee",   email: "jordan@email.com",  goal: "Athletic Performance",since: "Feb 2024", weight: [172,173,172,174,173,175,174], color: C.orange },
];

const VIDEOS = [
  { id:1, title:"Perfect Squat Form",          category:"Lower Body", duration:"8:24",  thumb:"🦵" },
  { id:2, title:"Push-Up Progressions",         category:"Upper Body", duration:"6:10",  thumb:"💪" },
  { id:3, title:"Romanian Deadlift Tutorial",   category:"Lower Body", duration:"9:45",  thumb:"🏋️" },
  { id:4, title:"Core Stability Fundamentals",  category:"Core",       duration:"12:30", thumb:"🧘" },
  { id:5, title:"Bench Press Mastery",          category:"Upper Body", duration:"7:55",  thumb:"🏋️" },
  { id:6, title:"Sprint Mechanics",             category:"Cardio",     duration:"5:20",  thumb:"🏃" },
  { id:7, title:"Pull-Up Ladder",               category:"Upper Body", duration:"11:00", thumb:"🤸" },
  { id:8, title:"Hip Hinge Fundamentals",       category:"Lower Body", duration:"8:40",  thumb:"🦴" },
];

const WORKOUT_PLAN = [
  { day:"Monday",    name:"Push Day",  exercises:[
    { name:"Bench Press",      sets:4, reps:"8-10", weight:"185 lbs" },
    { name:"Overhead Press",   sets:3, reps:"10-12",weight:"95 lbs"  },
    { name:"Incline DB Press", sets:3, reps:"12",   weight:"65 lbs"  },
    { name:"Lateral Raises",   sets:4, reps:"15",   weight:"20 lbs"  },
  ]},
  { day:"Wednesday", name:"Pull Day", exercises:[
    { name:"Barbell Row",  sets:4, reps:"8-10",weight:"165 lbs" },
    { name:"Pull-Ups",     sets:3, reps:"8",   weight:"Bodyweight" },
    { name:"Face Pulls",   sets:3, reps:"15",  weight:"40 lbs"  },
    { name:"Bicep Curls",  sets:3, reps:"12",  weight:"35 lbs"  },
  ]},
  { day:"Friday",    name:"Leg Day",  exercises:[
    { name:"Back Squat",         sets:4, reps:"8",  weight:"225 lbs" },
    { name:"Romanian Deadlift",  sets:3, reps:"10", weight:"185 lbs" },
    { name:"Leg Press",          sets:3, reps:"12", weight:"360 lbs" },
    { name:"Calf Raises",        sets:4, reps:"20", weight:"100 lbs" },
  ]},
];

const NUTRITION_LOG = [
  { meal:"Breakfast", food:"Eggs, oatmeal, banana",     cals:520, protein:38, carbs:72, fat:14 },
  { meal:"Lunch",     food:"Chicken rice bowl",         cals:680, protein:52, carbs:65, fat:18 },
  { meal:"Snack",     food:"Greek yogurt + almonds",    cals:280, protein:22, carbs:18, fat:12 },
];

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function Sidebar({ role, page, setPage, onLogout, userName }) {
  const nav = role === "trainer"
    ? [
        { id:"dashboard", label:"Dashboard",     icon:"⚡" },
        { id:"clients",   label:"Clients",       icon:"👥" },
        { id:"workouts",  label:"Workout Plans", icon:"🏋️" },
        { id:"videos",    label:"Video Library", icon:"🎬" },
      ]
    : [
        { id:"dashboard",  label:"My Dashboard", icon:"⚡" },
        { id:"workouts",   label:"My Workouts",  icon:"🏋️" },
        { id:"weight",     label:"Weight Log",   icon:"📊" },
        { id:"nutrition",  label:"Nutrition",    icon:"🥗" },
        { id:"videos",     label:"Videos",       icon:"🎬" },
      ];

  return (
    <div style={S.sidebar}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <img src={LOGO_B64} alt="Freddy Fit" style={{ width: "100%", maxWidth: 190, height: "auto", display: "block" }} />
      </div>

      {/* Role badge */}
      <div style={{ padding: "12px 24px" }}>
        <span style={S.tag(C.blue, C.blueLight)}>
          {role === "trainer" ? "🏅 Trainer Portal" : "👤 Client Portal"}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {nav.map(n => {
          const active = page === n.id;
          return (
            <div key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 24px", cursor: "pointer",
              background: active ? C.blueLight : "transparent",
              borderLeft: `3px solid ${active ? C.blue : "transparent"}`,
              color: active ? C.blue : C.greyDark,
              fontSize: 14, fontWeight: active ? 700 : 500,
              transition: "all 0.15s", marginBottom: 2,
            }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: 20, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ ...S.avatar(36).style }}>{userName[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{userName}</div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "capitalize" }}>{role}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ ...S.btnGhost, width: "100%", fontSize: 12, padding: "7px 0" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, loginError }) {
  const [form, setForm] = useState({ email: "", password: "", role: "client" });
  const [busy, setBusy] = useState(false);

  return (
    <div style={{
      minHeight: "100vh", fontFamily: ff,
      background: `linear-gradient(135deg, #F0F9FF 0%, #E8F4FD 50%, #F4F7FA 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Left decorative panel */}
      <div style={{
        display: "flex", gap: 48, alignItems: "center", maxWidth: 900, width: "100%", padding: "0 24px",
      }}>
        <div style={{ flex: 1, display: "none" }} />

        {/* Card */}
        <div style={{ width: 420 }}>
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <img src={LOGO_B64} alt="Freddy Fit" style={{ width: 260, height: "auto", display: "block", margin: "0 auto" }} />
          </div>

          <div style={{ ...S.card, padding: 36 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Welcome back</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 28 }}>Sign in to your portal</div>

            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Email Address</label>
              <input style={S.input} placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
              <div style={{ textAlign: "right", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: C.blue, cursor: "pointer", fontWeight: 600 }}>
                  Forgot password?
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Sign in as</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["client","trainer"].map(r => (
                  <button key={r} onClick={() => setForm({...form, role: r})} style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer",
                    fontSize: 13, fontWeight: 700, fontFamily: ff,
                    background: form.role === r ? C.blue : C.greyLight,
                    color: form.role === r ? C.white : C.greyDark,
                    border: `1.5px solid ${form.role === r ? C.blue : C.border}`,
                    transition: "all 0.15s",
                  }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loginError && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                ⚠️ {loginError}
              </div>
            )}

            <button style={{ ...S.btn, width: "100%", padding: "14px 0", fontSize: 15, opacity: busy ? 0.7 : 1 }}
              disabled={busy}
              onClick={async () => {
                if (!form.email || !form.password) return;
                setBusy(true);
                await onLogin(form.role, form.email, form.password);
                setBusy(false);
              }}>
              {busy ? "Signing in…" : "Sign In →"}
            </button>

            <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: C.textMuted }}>
              New client?{" "}
              <a href="/onboarding" style={{ color: C.blue, fontWeight: 700, textDecoration: "none" }}>
                Create your account →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ ...S.card, borderTop: `4px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.5px" }}>{value}</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: color, fontWeight: 700, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{icon}</div>
      </div>
    </div>
  );
}

// ── PAGES ──────────────────────────────────────────────────────────────────
function TrainerDashboardView() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: "-0.3px" }}>Good morning, Coach 👋</div>
        <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Here's your FREDDY FIT overview for today</div>
      </div>

      <div style={{ ...S.grid(4), marginBottom: 24 }}>
        <StatCard label="Active Clients"      value="3"   color={C.blue}   icon="👥" sub="+1 this month" />
        <StatCard label="Sessions This Week"  value="9"   color={C.green}  icon="🏋️" sub="3 today" />
        <StatCard label="Avg Goal Progress"   value="74%" color={C.orange} icon="📈" sub="↑ 8% this week" />
        <StatCard label="Videos in Library"   value="8"   color="#A855F7"  icon="🎬" sub="2 added recently" />
      </div>

      <div style={{ ...S.grid(2), marginBottom: 24 }}>
        <div style={S.card}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 20 }}>Client Progress</div>
          {CLIENTS.map((c,i) => (
            <div key={c.id} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"14px 0", borderBottom: i < CLIENTS.length-1 ? `1px solid ${C.border}` : "none"
            }}>
              <div style={{ ...S.avatar(40,c.name[0],c.color).style }}>{c.name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{c.name}</div>
                <div style={{ fontSize:12, color:C.textMuted }}>{c.goal}</div>
              </div>
              <WeightChart data={c.weight} width={140} height={50} color={c.color}/>
              <div style={{ textAlign:"right", minWidth:60 }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{c.weight[c.weight.length-1]} lbs</div>
                <div style={{ fontSize:11, color:C.green, fontWeight:700 }}>
                  -{c.weight[0]-c.weight[c.weight.length-1]} lbs
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:20 }}>Today's Sessions</div>
          {[
            { time:"8:00 AM",  client:"Marcus Webb", type:"Push Day",        status:"Confirmed" },
            { time:"10:30 AM", client:"Sofia Chen",  type:"Cardio + Core",   status:"Confirmed" },
            { time:"2:00 PM",  client:"Jordan Lee",  type:"Leg Day",         status:"Pending"   },
          ].map((s,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"14px 0", borderBottom: i<2 ? `1px solid ${C.border}` : "none"
            }}>
              <div style={{
                fontSize:12, color:C.white, background:C.blue,
                padding:"4px 10px", borderRadius:8, fontWeight:700, flexShrink:0, minWidth:72, textAlign:"center"
              }}>{s.time}</div>
              <div style={{ ...S.avatar(36,s.client[0]).style }}>{s.client[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{s.client}</div>
                <div style={{ fontSize:12, color:C.textMuted }}>{s.type}</div>
              </div>
              <span style={S.tag(s.status==="Confirmed" ? C.green : C.orange)}>
                {s.status}
              </span>
            </div>
          ))}
          <button style={{ ...S.btn, marginTop:20, width:"100%", fontSize:13 }}>+ Schedule Session</button>
        </div>
      </div>
    </div>
  );
}

function ClientsPage() {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:900, color:C.text }}>Clients</div>
          <div style={{ fontSize:14, color:C.textMuted, marginTop:4 }}>Manage your FREDDY FIT roster</div>
        </div>
        <button style={S.btn} onClick={() => window.location.href = "/trainer/clients"}>+ Add Client</button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {CLIENTS.map(c => (
          <div key={c.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ ...S.avatar(56,c.name[0],c.color).style }}>{c.name[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:17, fontWeight:800, color:C.text }}>{c.name}</div>
              <div style={{ fontSize:13, color:C.textMuted }}>{c.email}</div>
              <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Member since {c.since}</div>
            </div>
            <div style={{ textAlign:"center", minWidth:80 }}>
              <div style={{ fontSize:22, fontWeight:900, color:C.text }}>{c.weight[c.weight.length-1]}</div>
              <div style={{ fontSize:11, color:C.textMuted }}>lbs today</div>
            </div>
            <WeightChart data={c.weight} width={160} height={60} color={c.color}/>
            <span style={S.tag(c.color)}>{c.goal}</span>
            <div style={{ display:"flex", gap:8 }}>
              <button style={S.btnSm}>View</button>
              <button style={S.btnSm}>Plan</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutsPage({ role }) {
  const [checked, setChecked] = useState({});
  const toggle = (d,e) => { const k=`${d}-${e}`; setChecked(p=>({...p,[k]:!p[k]})); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:900, color:C.text }}>
            {role==="trainer" ? "Workout Plans" : "My Workouts"}
          </div>
          <div style={{ fontSize:14, color:C.textMuted, marginTop:4 }}>Current week — 3 training sessions</div>
        </div>
        {role==="trainer" && <button style={S.btn}>+ New Plan</button>}
      </div>

      <div style={S.grid(3)}>
        {WORKOUT_PLAN.map((day,dayIdx) => {
          const done = day.exercises.filter((_,ei) => checked[`${dayIdx}-${ei}`]).length;
          const pct = Math.round((done/day.exercises.length)*100);
          return (
            <div key={day.day} style={S.card}>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, color:C.blue, fontWeight:800, letterSpacing:"1px" }}>{day.day.toUpperCase()}</div>
                  <span style={S.tag(C.blue)}>{done}/{day.exercises.length} done</span>
                </div>
                <div style={{ fontSize:20, fontWeight:900, color:C.text, marginTop:4 }}>{day.name}</div>
                <div style={{ height:4, background:C.border, borderRadius:4, marginTop:10, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:C.blue, borderRadius:4, transition:"width 0.3s" }}/>
                </div>
              </div>

              {day.exercises.map((ex,exIdx) => {
                const k=`${dayIdx}-${exIdx}`;
                const isDone = checked[k];
                return (
                  <div key={exIdx} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"10px 0", borderBottom:`1px solid ${C.border}`,
                    opacity: isDone ? 0.45 : 1, transition:"opacity 0.2s",
                  }}>
                    <div onClick={() => toggle(dayIdx,exIdx)} style={{
                      width:22, height:22, borderRadius:6,
                      border:`2px solid ${isDone ? C.green : C.border}`,
                      background: isDone ? C.green : C.white,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, color:C.white, fontWeight:800, flexShrink:0, transition:"all 0.15s",
                    }}>{isDone && "✓"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, textDecoration: isDone?"line-through":"none" }}>
                        {ex.name}
                      </div>
                      <div style={{ fontSize:11, color:C.textMuted }}>
                        {ex.sets} sets × {ex.reps} reps · {ex.weight}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <button style={{ ...S.btnSm, flex:1 }}>📹 Tutorials</button>
                {role==="trainer" && <button style={{ ...S.btnSm, flex:1 }}>✏️ Edit</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeightPage() {
  const [entries, setEntries] = useState([
    { date:"Feb 3",  weight:185 },
    { date:"Feb 7",  weight:183 },
    { date:"Feb 10", weight:182 },
    { date:"Feb 14", weight:181 },
    { date:"Feb 17", weight:180 },
    { date:"Feb 21", weight:179 },
    { date:"Feb 23", weight:178 },
  ]);
  const [newW, setNewW] = useState("");
  const weights = entries.map(e=>e.weight);
  const lost = weights[0] - weights[weights.length-1];

  const addEntry = () => {
    if (!newW) return;
    const d = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
    setEntries(p=>[...p,{date:d,weight:parseFloat(newW)}]);
    setNewW("");
  };

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:26, fontWeight:900, color:C.text }}>Weight Log</div>
        <div style={{ fontSize:14, color:C.textMuted, marginTop:4 }}>Track every pound of your journey</div>
      </div>

      <div style={{ ...S.grid(3), marginBottom:24 }}>
        <StatCard label="Current Weight"  value={`${weights[weights.length-1]} lbs`} color={C.blue}  icon="⚖️" />
        <StatCard label="Total Lost"      value={`-${lost} lbs`}                    color={C.green} icon="📉" sub="Great progress!" />
        <StatCard label="Entries Logged"  value={entries.length}                     color={C.orange}icon="📅" />
      </div>

      <div style={S.grid(2)}>
        <div style={S.card}>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:20 }}>Progress Chart</div>
          <WeightChart data={weights} width={380} height={180} color={C.blue}/>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            {entries.filter((_,i)=>i%2===0).map((e,i)=>(
              <div key={i} style={{ fontSize:10, color:C.textMuted }}>{e.date}</div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ ...S.card, marginBottom:16 }}>
            <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:16 }}>Log Today's Weight</div>
            <label style={S.label}>Weight (lbs)</label>
            <input style={{ ...S.input, marginBottom:14 }} type="number" placeholder="Enter your weight..."
              value={newW} onChange={e=>setNewW(e.target.value)}/>
            <button style={{ ...S.btn, width:"100%" }} onClick={addEntry}>Log Weight ✓</button>
          </div>

          <div style={S.card}>
            <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:14 }}>History</div>
            <div style={{ maxHeight:220, overflowY:"auto" }}>
              {[...entries].reverse().map((e,i)=>(
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 0", borderBottom:`1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize:13, color:C.textMuted }}>{e.date}</span>
                  <span style={{ fontSize:15, fontWeight:800, color:C.text }}>{e.weight} lbs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionPage() {
  const [log, setLog] = useState(NUTRITION_LOG);
  const [form, setForm] = useState({ meal:"Dinner", food:"", cals:"", protein:"", carbs:"", fat:"" });
  const totals = log.reduce((a,e)=>({
    cals:a.cals+e.cals, protein:a.protein+e.protein, carbs:a.carbs+e.carbs, fat:a.fat+e.fat
  }), {cals:0,protein:0,carbs:0,fat:0});
  const GOALS = { cals:2400, protein:180, carbs:240, fat:80 };

  const addFood = () => {
    if(!form.food) return;
    setLog(p=>[...p,{...form,cals:+form.cals,protein:+form.protein,carbs:+form.carbs,fat:+form.fat}]);
    setForm({meal:"Dinner",food:"",cals:"",protein:"",carbs:"",fat:""});
  };

  const calPct = Math.min(100,(totals.cals/GOALS.cals)*100);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:26, fontWeight:900, color:C.text }}>Nutrition Log</div>
        <div style={{ fontSize:14, color:C.textMuted, marginTop:4 }}>Today's food journal & macro tracking</div>
      </div>

      <div style={{ ...S.grid(2), marginBottom:24, alignItems:"start" }}>
        <div style={S.card}>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:20 }}>Daily Targets</div>

          {/* Calorie ring visual */}
          <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:24 }}>
            <div style={{ position:"relative", width:100, height:100 }}>
              <svg width={100} height={100}>
                <circle cx={50} cy={50} r={40} fill="none" stroke={C.border} strokeWidth={10}/>
                <circle cx={50} cy={50} r={40} fill="none" stroke={C.blue} strokeWidth={10}
                  strokeDasharray={`${2*Math.PI*40}`}
                  strokeDashoffset={`${2*Math.PI*40*(1-calPct/100)}`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition:"stroke-dashoffset 0.5s" }}
                />
              </svg>
              <div style={{
                position:"absolute", top:0,left:0,width:"100%",height:"100%",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              }}>
                <div style={{ fontSize:18, fontWeight:900, color:C.text }}>{totals.cals}</div>
                <div style={{ fontSize:9, color:C.textMuted, fontWeight:600 }}>KCAL</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize:14, color:C.textMuted }}>Daily Goal</div>
              <div style={{ fontSize:22, fontWeight:900, color:C.text }}>{GOALS.cals} kcal</div>
              <div style={{ fontSize:13, color:C.green, fontWeight:700, marginTop:4 }}>
                {GOALS.cals - totals.cals} remaining
              </div>
            </div>
          </div>

          <MacroBar label="Protein" val={totals.protein} goal={GOALS.protein} color={C.blue}/>
          <MacroBar label="Carbs"   val={totals.carbs}   goal={GOALS.carbs}   color={C.orange}/>
          <MacroBar label="Fat"     val={totals.fat}     goal={GOALS.fat}     color="#A855F7"/>
        </div>

        <div style={S.card}>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:16 }}>Log Food</div>
          <div style={{ marginBottom:12 }}>
            <label style={S.label}>Meal</label>
            <select style={S.input} value={form.meal} onChange={e=>setForm({...form,meal:e.target.value})}>
              {["Breakfast","Lunch","Dinner","Snack","Pre-Workout","Post-Workout"].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.label}>Food Description</label>
            <input style={S.input} placeholder="e.g. Grilled chicken + rice"
              value={form.food} onChange={e=>setForm({...form,food:e.target.value})}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {[["cals","Kcal"],["protein","Protein"],["carbs","Carbs"],["fat","Fat"]].map(([f,l])=>(
              <div key={f}>
                <label style={S.label}>{l}</label>
                <input style={S.input} type="number" placeholder="0"
                  value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/>
              </div>
            ))}
          </div>
          <button style={{ ...S.btn, width:"100%" }} onClick={addFood}>Add to Log ✓</button>

          <div style={{ marginTop:20, padding:14, background:C.blueLight, borderRadius:12, textAlign:"center" }}>
            <div style={{ fontSize:12, color:C.blue, fontWeight:700 }}>🔍 FOOD SEARCH COMING SOON</div>
            <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>
              Search 600k+ foods from USDA database — auto-fills macros instantly
            </div>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:16 }}>Today's Food Log</div>
        <div style={{
          display:"grid", gridTemplateColumns:"120px 1fr 80px 90px 80px 70px",
          gap:8, fontSize:11, color:C.textMuted, fontWeight:700,
          padding:"0 0 10px", borderBottom:`1px solid ${C.border}`,
          letterSpacing:"0.5px",
        }}>
          <span>MEAL</span><span>FOOD</span><span>KCAL</span><span>PROTEIN</span><span>CARBS</span><span>FAT</span>
        </div>
        {log.map((e,i)=>(
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"120px 1fr 80px 90px 80px 70px",
            gap:8, padding:"12px 0", borderBottom:`1px solid ${C.border}`,
            fontSize:13, alignItems:"center",
          }}>
            <span><span style={S.tag(C.blue)}>{e.meal}</span></span>
            <span style={{ color:C.greyDark }}>{e.food}</span>
            <span style={{ fontWeight:800, color:C.text }}>{e.cals}</span>
            <span style={{ color:C.blue, fontWeight:700 }}>{e.protein}g</span>
            <span style={{ color:C.orange, fontWeight:700 }}>{e.carbs}g</span>
            <span style={{ color:"#A855F7", fontWeight:700 }}>{e.fat}g</span>
          </div>
        ))}
        <div style={{
          display:"grid", gridTemplateColumns:"120px 1fr 80px 90px 80px 70px",
          gap:8, padding:"12px 0", fontSize:13, fontWeight:800,
          background:C.greyLight, borderRadius:10, marginTop:4, paddingLeft:12,
        }}>
          <span style={{ color:C.text }}>TOTAL</span><span></span>
          <span style={{ color:C.text }}>{totals.cals}</span>
          <span style={{ color:C.blue }}>{totals.protein}g</span>
          <span style={{ color:C.orange }}>{totals.carbs}g</span>
          <span style={{ color:"#A855F7" }}>{totals.fat}g</span>
        </div>
      </div>
    </div>
  );
}

function VideosPage({ role }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All","Upper Body","Lower Body","Core","Cardio"];
  const filtered = VIDEOS.filter(v => filter==="All" || v.category===filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:900, color:C.text }}>Video Library</div>
          <div style={{ fontSize:14, color:C.textMuted, marginTop:4 }}>{VIDEOS.length} training videos from Freddy Fit</div>
        </div>
        {role==="trainer" && <button style={S.btn}>+ Upload Video</button>}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {cats.map(cat=>(
          <button key={cat} onClick={()=>setFilter(cat)} style={{
            padding:"8px 18px", borderRadius:20, cursor:"pointer",
            fontSize:13, fontWeight:700, border:"none", fontFamily:ff,
            background: filter===cat ? C.blue : C.white,
            color: filter===cat ? C.white : C.greyDark,
            boxShadow: filter===cat ? C.shadowLg : C.shadow,
            transition:"all 0.15s",
          }}>{cat}</button>
        ))}
      </div>

      <div style={S.grid(4)}>
        {filtered.map(v=>(
          <div key={v.id} style={{
            ...S.card, cursor:"pointer", overflow:"hidden", padding:0,
            transition:"transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=C.shadowLg;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=C.shadow;}}>
            {/* Thumbnail */}
            <div style={{
              height:130, background:`linear-gradient(135deg, ${C.blueLight}, #E0F2FE)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:52, position:"relative",
            }}>
              {v.thumb}
              <div style={{
                position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                background:"rgba(26,171,227,0)", transition:"background 0.2s",
              }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%",
                  background:`${C.blue}dd`, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, color:C.white, fontWeight:800,
                }}>▶</div>
              </div>
            </div>
            <div style={{ padding:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>{v.title}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={S.tag(C.blue)}>{v.category}</span>
                <span style={{ fontSize:12, color:C.textMuted, fontWeight:600 }}>⏱ {v.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientDashboard() {
  const c = CLIENTS[0];
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:26, fontWeight:900, color:C.text }}>
          Hey, {c.name.split(" ")[0]}! 👋
        </div>
        <div style={{ fontSize:14, color:C.textMuted, marginTop:4 }}>
          Goal: {c.goal} · Keep pushing — you're doing great!
        </div>
      </div>

      {/* Hero card */}
      <div style={{ ...S.cardBlue, marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:13, opacity:0.8, marginBottom:4, letterSpacing:"1px", fontWeight:700 }}>TODAY'S WORKOUT</div>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px" }}>Push Day 💪</div>
          <div style={{ fontSize:14, opacity:0.85, marginTop:6 }}>4 exercises · ~45 minutes</div>
          <button style={{
            marginTop:16, padding:"10px 24px", borderRadius:10, border:"none",
            background:C.white, color:C.blue, fontWeight:800, fontSize:14,
            cursor:"pointer", fontFamily:ff,
          }}>Start Workout →</button>
        </div>
        <div style={{ fontSize:80, opacity:0.3 }}>🏋️</div>
      </div>

      <div style={{ ...S.grid(4), marginBottom:24 }}>
        <StatCard label="Current Weight"  value={`${c.weight[c.weight.length-1]} lbs`} color={C.blue}   icon="⚖️" />
        <StatCard label="Weight Lost"     value={`-${c.weight[0]-c.weight[c.weight.length-1]} lbs`} color={C.green} icon="📉" sub="This month" />
        <StatCard label="Workouts Done"   value="9"   color={C.orange} icon="✅" sub="This month" />
        <StatCard label="Goal Progress"   value="74%" color="#A855F7"  icon="🎯" sub="On track!" />
      </div>

      <div style={S.grid(2)}>
        <div style={S.card}>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:16 }}>Weight Trend</div>
          <WeightChart data={c.weight} width={380} height={160} color={C.blue}/>
        </div>
        <div style={S.card}>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:16 }}>Today's Exercises</div>
          {WORKOUT_PLAN[0].exercises.map((ex,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"11px 0", borderBottom: i<3 ? `1px solid ${C.border}` : "none"
            }}>
              <div style={{
                width:32, height:32, borderRadius:8, background:C.blueLight,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, flexShrink:0,
              }}>🏋️</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{ex.name}</div>
                <div style={{ fontSize:12, color:C.textMuted }}>{ex.sets} sets × {ex.reps} @ {ex.weight}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── APP SHELL ──────────────────────────────────────────────────────────────
export default function TrainerDashboard() {
  const [supaSession, setSupaSession] = useState(null);
  const [profile,     setProfile]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError,  setLoginError]  = useState("");
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaSession(session);
      if (session) fetchProfile(session.user.id);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSupaSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (error) console.error("Profile fetch error:", error.message);
    setProfile(data || null);
    setAuthLoading(false);
  }

  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.greyLight, fontFamily:ff }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:44, height:44, border:`4px solid ${C.border}`, borderTopColor:C.blue, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize:14, color:C.grey }}>Loading Freddy Fit…</div>
      </div>
    </div>
  );

  // Compat session object the rest of the portal uses
  const session = supaSession && profile
    ? { role: profile.role || "client", email: supaSession.user.email }
    : null;

  if (!session) return (
    <LoginPage
      onLogin={async (_role, email, password) => {
        setLoginError("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setLoginError(error.message);
        // On success onAuthStateChange fires and sets supaSession → profile
      }}
      loginError={loginError}
    />
  );

  const renderPage = () => {
    if (page==="dashboard") return session.role==="trainer" ? <TrainerDashboardView/> : <ClientDashboard/>;
    if (page==="clients")   return <ClientsPage/>;
    if (page==="workouts")  return <WorkoutsPage role={session.role}/>;
    if (page==="videos")    return <VideosPage role={session.role}/>;
    if (page==="weight")    return <WeightPage/>;
    if (page==="nutrition") return <NutritionPage/>;
    return null;
  };

  const name = session.email.split("@")[0];

  return (
    <div style={{ display:"flex", fontFamily:ff }}>
      <Sidebar role={session.role} page={page} setPage={setPage}
        onLogout={() => supabase.auth.signOut()} userName={name}/>
      <div style={S.main}>
        {/* Top bar */}
        <div style={S.topbar}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={LOGO_B64} alt="Freddy Fit" style={{ height:28, width:"auto" }}/>
            <span style={{ color:C.border }}>|</span>
            <span style={{ fontSize:13, color:C.textMuted, fontWeight:600 }}>
              {page.charAt(0).toUpperCase()+page.slice(1)}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:13, color:C.textMuted }}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </div>
            <div style={{ ...S.avatar(34,name[0].toUpperCase()).style }}>{name[0].toUpperCase()}</div>
          </div>
        </div>
        {/* Page content */}
        <div style={S.content}>{renderPage()}</div>
      </div>
    </div>
  );
}
