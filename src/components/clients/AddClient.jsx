import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import LOGO_IMG from "../../assets/freddyfit-logo.png";

const C = {
  blue:       "#1AABE3",
  blueDark:   "#1490C4",
  blueLight:  "#E8F7FD",
  blueGlow:   "rgba(26,171,227,0.15)",
  greyDark:   "#4A5568",
  greyLight:  "#F4F7FA",
  white:      "#FFFFFF",
  text:       "#1A2332",
  muted:      "#7A8A9E",
  border:     "#E2E8F0",
  green:      "#22C55E",
  greenLight: "#F0FDF4",
  yellow:     "#F59E0B",
  yellowLight:"#FFFBEB",
  red:        "#EF4444",
  redLight:   "#FEF2F2",
  shadow:     "0 2px 12px rgba(0,0,0,0.06)",
  shadowLg:   "0 8px 32px rgba(26,171,227,0.16)",
};
const ff = "'Barlow', 'Segoe UI', sans-serif";

if (typeof document !== "undefined") {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800;900&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}

const LOGO_B64 = LOGO_IMG;

// ── SEED DATA ──────────────────────────────────────────────────────────────
const SEED_CLIENTS = [
  { id:1, firstName:"Marcus", lastName:"Webb",   email:"marcus@email.com",  phone:"555-0101", status:"active",  plan:"Push/Pull/Legs", joined:"Jan 15, 2024", inviteSent:"Jan 12, 2024", lastLogin:"Today",        color:"#1AABE3" },
  { id:2, firstName:"Sofia",  lastName:"Chen",   email:"sofia@email.com",   phone:"555-0102", status:"active",  plan:"Fat Loss 12wk",  joined:"Mar 3, 2024",  inviteSent:"Mar 1, 2024",  lastLogin:"Yesterday",    color:"#A855F7" },
  { id:3, firstName:"Jordan", lastName:"Lee",    email:"jordan@email.com",  phone:"555-0103", status:"active",  plan:"Athletic Perf",  joined:"Feb 20, 2024", inviteSent:"Feb 18, 2024", lastLogin:"3 days ago",   color:"#F97316" },
  { id:4, firstName:"Priya",  lastName:"Patel",  email:"priya@email.com",   phone:"555-0104", status:"pending", plan:"General Health", joined:"—",            inviteSent:"Feb 20, 2024", lastLogin:"Never",        color:"#22C55E" },
  { id:5, firstName:"Devon",  lastName:"Clarke", email:"devon@email.com",   phone:"555-0105", status:"pending", plan:"Endurance",      joined:"—",            inviteSent:"Feb 22, 2024", lastLogin:"Never",        color:"#EC4899" },
];

const PLANS = [
  "Push/Pull/Legs",
  "Fat Loss 12-Week",
  "Athletic Performance",
  "General Health",
  "Endurance Training",
  "Beginner Foundation",
  "Bodyweight Only",
  "Custom Plan",
];

// ── SHARED UI ──────────────────────────────────────────────────────────────
const inpStyle = {
  background: C.greyLight, border: `1.5px solid ${C.border}`,
  borderRadius: 10, padding: "11px 16px", color: C.text,
  fontSize: 14, width: "100%", boxSizing: "border-box",
  fontFamily: ff, outline: "none", transition: "border-color 0.15s",
};
const lblStyle = {
  fontSize: 11, fontWeight: 700, color: C.greyDark,
  marginBottom: 6, display: "block",
  letterSpacing: "0.5px", textTransform: "uppercase",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lblStyle}>{label}</label>
      {children}
    </div>
  );
}

function Inp({ label, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <Field label={label}>
      <input style={{ ...inpStyle, borderColor: focus ? C.blue : C.border }}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...props} />
    </Field>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <Field label={label}>
      <select style={{ ...inpStyle, cursor: "pointer" }} {...props}>{children}</select>
    </Field>
  );
}

function Avatar({ name, color, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size / 2.6, fontWeight: 800, color: C.white, fontFamily: ff,
    }}>{name[0]}</div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:  { label: "Active",         color: C.green,  bg: C.greenLight  },
    pending: { label: "Invite Pending", color: C.yellow, bg: C.yellowLight },
    expired: { label: "Invite Expired", color: C.red,    bg: C.redLight    },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, letterSpacing: "0.3px",
    }}>{s.label}</span>
  );
}

// ── EMAIL PREVIEW ──────────────────────────────────────────────────────────
function EmailPreview({ firstName, email, plan, note }) {
  return (
    <div style={{
      background: C.greyLight, borderRadius: 14, overflow: "hidden",
      border: `1px solid ${C.border}`, fontSize: 13,
    }}>
      {/* Email chrome */}
      <div style={{ background: C.white, padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ color: C.muted, fontWeight: 600, minWidth: 40 }}>To:</span>
          <span style={{ color: C.text, fontWeight: 600 }}>{email || "client@email.com"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ color: C.muted, fontWeight: 600, minWidth: 40 }}>From:</span>
          <span style={{ color: C.text }}>Freddy Fit &lt;noreply@freddyfit.com&gt;</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ color: C.muted, fontWeight: 600, minWidth: 40 }}>Sub:</span>
          <span style={{ color: C.text, fontWeight: 700 }}>
            You've been invited to Freddy Fit! 💪
          </span>
        </div>
      </div>

      {/* Email body */}
      <div style={{ padding: 20, background: C.white, margin: 12, borderRadius: 10, border: `1px solid ${C.border}` }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <img src={LOGO_B64} alt="Freddy Fit" style={{ height: 32, width: "auto" }} />
        </div>

        <p style={{ margin: "0 0 12px", color: C.text, lineHeight: 1.7 }}>
          Hey <strong>{firstName || "there"}</strong>,
        </p>
        <p style={{ margin: "0 0 12px", color: C.greyDark, lineHeight: 1.7 }}>
          Your personal trainer <strong>Freddy</strong> has set up your Freddy Fit account!
          You're all set to start your fitness journey.
        </p>

        {plan && (
          <div style={{ padding: "10px 14px", background: C.blueLight, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 700, color: C.blue }}>Your Plan: </span>
            <span style={{ color: C.text }}>{plan}</span>
          </div>
        )}

        {note && (
          <p style={{ margin: "0 0 12px", color: C.greyDark, lineHeight: 1.7, fontStyle: "italic" }}>
            "{note}"
          </p>
        )}

        <p style={{ margin: "0 0 20px", color: C.greyDark, lineHeight: 1.7 }}>
          Click below to create your password and complete your profile — it only takes 3 minutes.
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-block", padding: "13px 32px",
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
            color: C.white, borderRadius: 10, fontWeight: 800,
            fontSize: 14, letterSpacing: "0.3px",
          }}>
            Set Up My Account →
          </div>
        </div>

        <p style={{ margin: 0, color: C.muted, fontSize: 12, lineHeight: 1.7, textAlign: "center" }}>
          This link expires in 48 hours. Questions? Reply to this email.<br />
          <span style={{ color: C.blue }}>app.freddyfit.com</span>
        </p>
      </div>

      <div style={{ padding: "8px 16px 12px", textAlign: "center", fontSize: 11, color: C.muted }}>
        © 2025 Freddy Fit · VISUALIZE · DO · BECOME
      </div>
    </div>
  );
}

// ── ADD CLIENT MODAL ───────────────────────────────────────────────────────
function AddClientModal({ onClose, onSend }) {
  const [step, setStep]   = useState(1); // 1=form, 2=preview, 3=sent
  const [form, setForm]   = useState({
    firstName: "", lastName: "", email: "", phone: "",
    plan: "", note: "",
  });

  const valid = form.firstName && form.lastName && form.email && form.email.includes("@");

  const handleSend = () => {
    setStep(3);
    setTimeout(() => {
      onSend(form);
      onClose();
    }, 2200);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,35,50,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: C.white, borderRadius: 20, width: "100%",
        maxWidth: step === 2 ? 680 : 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        animation: "popIn 0.25s ease",
      }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Modal header */}
        <div style={{ padding: "22px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>
              {step === 1 ? "Add New Client" : step === 2 ? "Preview Invite Email" : "Sending Invite..."}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
              {step === 1 ? "Fill in their details and choose a plan" : step === 2 ? "This is exactly what they'll receive" : ""}
            </div>
          </div>
          {step < 3 && (
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: C.greyLight, cursor: "pointer", fontSize: 16, color: C.muted }}>✕</button>
          )}
        </div>

        <div style={{ padding: 28 }}>
          {/* ── STEP 1: FORM ── */}
          {step === 1 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Inp label="First Name *" placeholder="Sarah" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })} />
                <Inp label="Last Name *" placeholder="Johnson" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <Inp label="Email Address *" type="email" placeholder="sarah@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              <Inp label="Phone (optional)" type="tel" placeholder="(555) 000-0000" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Sel label="Assign a Plan (optional)" value={form.plan}
                onChange={e => setForm({ ...form, plan: e.target.value })}>
                <option value="">Select plan to assign...</option>
                {PLANS.map(p => <option key={p}>{p}</option>)}
              </Sel>
              <Field label="Personal Note (optional)">
                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="e.g. Met at the gym, wants to lose 20 lbs before summer..."
                  style={{ ...inpStyle, height: 80, resize: "none", lineHeight: 1.6 }} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                <button onClick={onClose} style={{ padding: "13px 0", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: ff }}>
                  Cancel
                </button>
                <button onClick={() => setStep(2)} disabled={!valid} style={{
                  padding: "13px 0", borderRadius: 12, border: "none",
                  background: valid ? C.blue : C.border,
                  color: valid ? C.white : C.muted,
                  fontWeight: 700, fontSize: 14, cursor: valid ? "pointer" : "not-allowed",
                  fontFamily: ff, boxShadow: valid ? C.shadowLg : "none",
                }}>
                  Preview Email →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: PREVIEW ── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <EmailPreview
                  firstName={form.firstName}
                  email={form.email}
                  plan={form.plan}
                  note={form.note}
                />
              </div>

              <div style={{ padding: 14, background: C.blueLight, borderRadius: 12, border: `1px solid ${C.blue}22`, marginBottom: 20, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: C.blue, marginBottom: 4 }}>✅ Ready to send to {form.email}</div>
                <div style={{ color: C.greyDark }}>The invite link will expire in 48 hours. You can resend anytime from the client list.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ padding: "13px 0", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: ff }}>
                  ← Edit Details
                </button>
                <button onClick={handleSend} style={{ padding: "13px 0", borderRadius: 12, border: "none", background: C.blue, color: C.white, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: ff, boxShadow: C.shadowLg }}>
                  Send Invite 📨
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: SENDING ── */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}`}</style>
              <div style={{ fontSize: 56, marginBottom: 16, animation: "checkPop 0.4s ease 0.3s both" }}>📨</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 8 }}>
                Invite sent to {form.firstName}!
              </div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
                {form.email} will receive their invite shortly.<br />
                They'll appear as <strong>Invite Pending</strong> until they sign up.
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: C.blue, borderRadius: 4, animation: "grow 2s linear forwards" }} />
                </div>
                <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CLIENT ROW ─────────────────────────────────────────────────────────────
function ClientRow({ client, onResend, onRemove, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "2.5fr 2fr 1.5fr 1.2fr 1.5fr 1fr",
      gap: 12, alignItems: "center",
      padding: "16px 20px",
      borderBottom: `1px solid ${C.border}`,
      transition: "background 0.15s",
      fontSize: 13,
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.greyLight}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

      {/* Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={client.firstName} color={client.color} size={38} />
        <div>
          <div style={{ fontWeight: 700, color: C.text }}>{client.firstName} {client.lastName}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{client.email}</div>
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={client.status} />

      {/* Plan */}
      <div style={{ color: client.plan ? C.text : C.muted, fontWeight: client.plan ? 600 : 400 }}>
        {client.plan || "No plan yet"}
      </div>

      {/* Invite sent */}
      <div style={{ color: C.muted, fontSize: 12 }}>
        <div style={{ fontWeight: 600, color: C.greyDark }}>Invite sent</div>
        {client.inviteSent}
      </div>

      {/* Last login */}
      <div style={{ color: C.muted, fontSize: 12 }}>
        <div style={{ fontWeight: 600, color: C.greyDark }}>Last login</div>
        <span style={{ color: client.lastLogin === "Never" ? C.red : client.lastLogin === "Today" ? C.green : C.text }}>
          {client.lastLogin}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", position: "relative" }}>
        {client.status === "pending" && (
          <button onClick={() => onResend(client.id)} title="Resend invite" style={{
            padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${C.blue}`,
            background: C.blueLight, color: C.blue, fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: ff, whiteSpace: "nowrap",
          }}>Resend</button>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.border}`,
          background: C.white, cursor: "pointer", fontSize: 16, display: "flex",
          alignItems: "center", justifyContent: "center", color: C.muted,
        }}>⋯</button>

        {menuOpen && (
          <div style={{
            position: "absolute", top: 34, right: 0, zIndex: 100,
            background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: C.shadowLg, minWidth: 160, overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
            {[
              { label: "👤 View Profile",   action: () => { onView(client); setMenuOpen(false); } },
              { label: "✏️ Edit Details",    action: () => setMenuOpen(false) },
              { label: "📋 Assign Plan",     action: () => setMenuOpen(false) },
              { label: "📨 Resend Invite",   action: () => { onResend(client.id); setMenuOpen(false); } },
              { label: "🚫 Remove Client",   action: () => { onRemove(client.id); setMenuOpen(false); }, danger: true },
            ].map((item, i) => (
              <div key={i} onClick={item.action} style={{
                padding: "11px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                color: item.danger ? C.red : C.text,
                borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = item.danger ? C.redLight : C.greyLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CLIENT PROFILE DRAWER ──────────────────────────────────────────────────
function ProfileDrawer({ client, onClose }) {
  if (!client) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(26,35,50,0.4)", backdropFilter: "blur(2px)",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: 360, background: C.white,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        overflowY: "auto", padding: 28,
        animation: "slideIn 0.25s ease",
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>Client Profile</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: C.greyLight, cursor: "pointer", fontSize: 16, color: C.muted }}>✕</button>
        </div>

        {/* Avatar + name */}
        <div style={{ textAlign: "center", marginBottom: 24, padding: 20, background: C.greyLight, borderRadius: 14 }}>
          <Avatar name={client.firstName} color={client.color} size={64} />
          <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginTop: 12 }}>{client.firstName} {client.lastName}</div>
          <div style={{ marginTop: 8 }}><StatusBadge status={client.status} /></div>
        </div>

        {/* Details */}
        {[
          { label: "Email",        value: client.email },
          { label: "Phone",        value: client.phone },
          { label: "Plan",         value: client.plan || "Not assigned" },
          { label: "Invite Sent",  value: client.inviteSent },
          { label: "Joined",       value: client.joined },
          { label: "Last Login",   value: client.lastLogin },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
            <span style={{ color: C.muted, fontWeight: 600 }}>{row.label}</span>
            <span style={{ color: C.text, fontWeight: 700, textAlign: "right", maxWidth: "55%" }}>{row.value}</span>
          </div>
        ))}

        {/* Actions */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={{ padding: "12px 0", borderRadius: 12, border: "none", background: C.blue, color: C.white, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: ff, boxShadow: C.shadowLg }}>
            💬 Send Message
          </button>
          <button style={{ padding: "12px 0", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.greyDark, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: ff }}>
            📋 View Workout Plan
          </button>
          {client.status === "pending" && (
            <button style={{ padding: "12px 0", borderRadius: 12, border: `1.5px solid ${C.blue}`, background: C.blueLight, color: C.blue, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: ff }}>
              📨 Resend Invite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function AddClient() {
  const [clients, setClients]     = useState(SEED_CLIENTS);
  const [showModal, setShowModal] = useState(false);
  const [viewClient, setViewClient] = useState(null);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState(null);
  const [trainerId, setTrainerId] = useState(null);

  const COLORS = ["#1AABE3","#A855F7","#F97316","#22C55E","#EC4899"];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load real clients from Supabase ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setTrainerId(user.id);
      loadClients(user.id);
    });
  }, []);

  async function loadClients(tid) {
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("trainer_id", tid)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return; // keep seed data on error / empty

    setClients(data.map((inv, i) => ({
      id:         inv.id,
      firstName:  inv.first_name  || "",
      lastName:   inv.last_name   || "",
      email:      inv.email,
      phone:      inv.phone       || "—",
      status:     inv.status,
      plan:       inv.plan        || "Not assigned",
      joined:     "—",
      inviteSent: new Date(inv.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      lastLogin:  "—",
      color:      COLORS[i % COLORS.length],
    })));
  }

  const handleSend = async (form) => {
    const newClient = {
      id: crypto.randomUUID(),
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      phone:     form.phone || "—",
      status:    "pending",
      plan:      form.plan || "Not assigned",
      joined:    "—",
      inviteSent: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      lastLogin: "Never",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    // Optimistic UI update
    setClients(p => [newClient, ...p]);
    showToast(`✅ Invite sent to ${form.firstName} ${form.lastName}!`);

    // Persist to Supabase
    if (trainerId) {
      await supabase.from("invites").insert({
        trainer_id: trainerId,
        email:      form.email,
        first_name: form.firstName,
        last_name:  form.lastName,
        plan:       form.plan  || null,
        note:       form.note  || null,
        status:     "pending",
      });
    }
  };

  const handleResend = (id) => {
    const c = clients.find(x => x.id === id);
    showToast(`📨 Invite resent to ${c?.firstName}!`);
  };

  const handleRemove = async (id) => {
    setClients(p => p.filter(c => c.id !== id));
    showToast("Client removed.");
    // Delete from DB (only works if id is a real UUID invite row)
    await supabase.from("invites").delete().eq("id", id).eq("trainer_id", trainerId);
  };

  const filtered = clients.filter(c => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount  = clients.filter(c => c.status === "active").length;
  const pendingCount = clients.filter(c => c.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: C.greyLight, fontFamily: ff }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* ── TOP NAV ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: C.shadow }}>
        <img src={LOGO_B64} alt="Freddy Fit" style={{ height: 30, width: "auto" }} />
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Trainer Dashboard</div>
      </div>

      <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: "-0.3px" }}>Client Management</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Add clients, send invites, and track onboarding status</div>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: C.blue, color: C.white, fontWeight: 800, fontSize: 14,
            cursor: "pointer", fontFamily: ff, boxShadow: C.shadowLg,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>+</span> Add Client
          </button>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Clients",    value: clients.length, color: C.blue,   icon: "👥" },
            { label: "Active",           value: activeCount,    color: C.green,  icon: "✅" },
            { label: "Invite Pending",   value: pendingCount,   color: C.yellow, icon: "⏳" },
            { label: "Invites Sent (30d)", value: clients.length, color: "#A855F7", icon: "📨" },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, borderTop: `4px solid ${s.color}`, boxShadow: C.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
                <div style={{ fontSize: 26, opacity: 0.7 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TABLE CARD ── */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

          {/* Table toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{ ...inpStyle, padding: "9px 12px 9px 36px", fontSize: 13 }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "all",     label: `All (${clients.length})` },
                { id: "active",  label: `Active (${activeCount})` },
                { id: "pending", label: `Pending (${pendingCount})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, fontFamily: ff, border: "none",
                  background: filter === f.id ? C.blue : C.greyLight,
                  color: filter === f.id ? C.white : C.muted,
                  transition: "all 0.15s",
                }}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 2fr 1.5fr 1.2fr 1.5fr 1fr",
            gap: 12, padding: "10px 20px",
            background: C.greyLight, borderBottom: `1px solid ${C.border}`,
            fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.5px",
          }}>
            <span>CLIENT</span>
            <span>STATUS</span>
            <span>PLAN</span>
            <span>INVITE SENT</span>
            <span>LAST LOGIN</span>
            <span style={{ textAlign: "right" }}>ACTIONS</span>
          </div>

          {/* Rows */}
          {filtered.length > 0 ? filtered.map(c => (
            <ClientRow key={c.id} client={c}
              onResend={handleResend}
              onRemove={handleRemove}
              onView={setViewClient}
            />
          )) : (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>No clients found</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Try adjusting your search or filter</div>
            </div>
          )}
        </div>

        {/* ── PENDING CALLOUT ── */}
        {pendingCount > 0 && (
          <div style={{ marginTop: 20, padding: 16, background: C.yellowLight, borderRadius: 14, border: `1px solid ${C.yellow}33`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28 }}>⏳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{pendingCount} client{pendingCount > 1 ? "s" : ""} haven't completed signup yet</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Invite links expire after 48 hours. Resend if they haven't signed up.</div>
            </div>
            <button style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: C.yellow, color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: ff }}>
              Resend All Pending
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && <AddClientModal onClose={() => setShowModal(false)} onSend={handleSend} />}

      {/* ── PROFILE DRAWER ── */}
      {viewClient && <ProfileDrawer client={viewClient} onClose={() => setViewClient(null)} />}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: C.text, color: C.white, padding: "12px 24px",
          borderRadius: 12, fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 2000,
          animation: "fadeIn 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {toast}
        </div>
      )}
    </div>
  );
}
