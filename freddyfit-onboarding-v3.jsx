import { useState } from "react";

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
  yellow:     "#EAB308",
  yellowLight:"#FEFCE8",
  orange:     "#F97316",
  red:        "#EF4444",
  redLight:   "#FEF2F2",
  shadow:     "0 2px 16px rgba(26,171,227,0.10)",
  shadowLg:   "0 8px 40px rgba(26,171,227,0.18)",
};
const ff = "'Barlow', 'Segoe UI', sans-serif";

if (typeof document !== "undefined") {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800;900&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}

const LOGO_B64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NDAgMTE1Ij4KICA8dGV4dCB4PSIwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIE5hcnJvdywgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzYiIGZvbnQtd2VpZ2h0PSIzMDAiIGxldHRlci1zcGFjaW5nPSIzIiBmaWxsPSIjOUNBM0FGIj5GUkVERFk8L3RleHQ+CiAgPHRleHQgeD0iMzE2IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9Ijc2IiBmb250LXdlaWdodD0iODAwIiBsZXR0ZXItc3BhY2luZz0iMyIgZmlsbD0iIzFBQUJFMyI+RklUPC90ZXh0PgogIDxsaW5lIHgxPSI0NzQiIHkxPSI4IiB4Mj0iNDc0IiB5Mj0iODIiIHN0cm9rZT0iI0NCRDVFMSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8Y2lyY2xlIGN4PSI1MDciIGN5PSI0NCIgcj0iMzQiIGZpbGw9IiMxQUFCRTMiLz4KICA8dGV4dCB4PSI0OTEiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDIiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IndoaXRlIj5GPC90ZXh0PgogIDx0ZXh0IHg9IjY4IiB5PSIxMDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjUwMCIgbGV0dGVyLXNwYWNpbmc9IjciIGZpbGw9IiMxQUFCRTMiPlZJU1VBTElaRSDCtyBETyDCtyBCRUNPTUU8L3RleHQ+Cjwvc3ZnPg==";

const STEPS = [
  { id: 1, label: "Account",    icon: "👤", title: "Create Your Account",  sub: "Let's get you set up with Freddy Fit"       },
  { id: 2, label: "Body Stats", icon: "⚖️", title: "Your Starting Point",  sub: "We'll calculate your BMI automatically"     },
  { id: 3, label: "Waiver",     icon: "📝", title: "Liability Waiver",     sub: "Please read and sign before we get started" },
  { id: 4, label: "Welcome",    icon: "🎉", title: "You're In!",           sub: "Your Freddy Fit journey starts now"         },
];

// ── BMI HELPERS ────────────────────────────────────────────────────────────
function calcBMI(heightStr, weightLbs) {
  if (!heightStr || !weightLbs) return null;
  const match = heightStr.match(/(\d+)'\s*(\d+)"/);
  if (!match) return null;
  const inches = parseInt(match[1]) * 12 + parseInt(match[2]);
  return Math.round((703 * parseFloat(weightLbs)) / (inches * inches) * 10) / 10;
}

function bmiCategory(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: "Underweight", color: C.blue,   bg: C.blueLight,   icon: "📉", msg: "Freddy will prioritize a structured plan to help you gain healthy weight and muscle." };
  if (bmi < 25)   return { label: "Healthy",     color: C.green,  bg: C.greenLight,  icon: "✅", msg: "Great starting point! Freddy will focus on optimizing your composition and performance." };
  if (bmi < 30)   return { label: "Overweight",  color: C.yellow, bg: C.yellowLight, icon: "⚠️", msg: "Freddy will build a focused fat loss plan to move you into the healthy range." };
  return              { label: "Obese",           color: C.red,    bg: C.redLight,    icon: "🔴", msg: "Freddy will create a safe, progressive plan. We also recommend consulting your doctor." };
}

// ── SHARED UI ──────────────────────────────────────────────────────────────
const inpBase = {
  background: C.greyLight, border: `1.5px solid ${C.border}`,
  borderRadius: 10, padding: "12px 16px", color: C.text,
  fontSize: 15, width: "100%", boxSizing: "border-box",
  fontFamily: ff, outline: "none", transition: "border-color 0.15s",
};
const lbl = {
  fontSize: 12, fontWeight: 700, color: C.greyDark,
  marginBottom: 7, display: "block", letterSpacing: "0.5px", textTransform: "uppercase",
};

function Input({ label, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={lbl}>{label}</label>}
      <input style={{ ...inpBase, borderColor: focus ? C.blue : C.border }}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...props} />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={lbl}>{label}</label>}
      <select style={{ ...inpBase, cursor: "pointer" }} {...props}>{children}</select>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.border : C.blue, color: disabled ? C.muted : C.white,
      border: "none", borderRadius: 12, padding: "14px 32px",
      fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: ff, width: "100%", boxShadow: disabled ? "none" : C.shadowLg,
      transition: "all 0.2s", letterSpacing: "0.3px",
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: C.muted,
      border: `1.5px solid ${C.border}`, borderRadius: 12,
      padding: "14px 32px", fontSize: 15, fontWeight: 600,
      cursor: "pointer", fontFamily: ff, width: "100%", transition: "all 0.15s",
    }}>{children}</button>
  );
}

// ── PROGRESS ───────────────────────────────────────────────────────────────
function ProgressBar({ current }) {
  const vis = STEPS.slice(0, 3);
  const pct = ((current - 1) / (vis.length - 1)) * 100;
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        <div style={{ position: "absolute", top: 14, left: "8%", right: "8%", height: 2, background: C.border, zIndex: 0 }}>
          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.blueDark})`, transition: "width 0.4s ease" }} />
        </div>
        {vis.map(s => {
          const done = s.id < current, active = s.id === current;
          return (
            <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: done ? C.blue : C.white,
                border: `2.5px solid ${done || active ? C.blue : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800,
                color: done ? C.white : active ? C.blue : C.muted,
                transition: "all 0.3s",
                boxShadow: active ? `0 0 0 5px ${C.blueGlow}` : "none",
              }}>{done ? "✓" : s.id}</div>
              <div style={{ fontSize: 10, marginTop: 6, fontWeight: active ? 700 : 500, color: active ? C.blue : done ? C.greyDark : C.muted }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepShell({ step, children }) {
  return (
    <div key={step} style={{ animation: "fadeUp 0.3s ease" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>{STEPS[step - 1].icon}</div>
        <div style={{ fontSize: 25, fontWeight: 900, color: C.text, letterSpacing: "-0.3px" }}>{STEPS[step - 1].title}</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>{STEPS[step - 1].sub}</div>
      </div>
      {children}
    </div>
  );
}

// ── STEP 1 — ACCOUNT ───────────────────────────────────────────────────────
function Step1({ data, set, next }) {
  const passMatch = data.password === data.confirm;
  const valid = data.firstName && data.lastName && data.dob && data.email && data.password.length >= 8 && passMatch && data.password;
  const strength = data.password.length === 0 ? 0 : data.password.length < 4 ? 1 : data.password.length < 8 ? 2 : data.password.length < 12 ? 3 : 4;
  const sm = [{ label:"", color:C.border }, { label:"Too short", color:C.red }, { label:"Weak", color:C.orange }, { label:"Good", color:C.blue }, { label:"Strong ✓", color:C.green }];

  return (
    <StepShell step={1}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="First Name" placeholder="John" value={data.firstName} onChange={e => set({ ...data, firstName: e.target.value })} />
        <Input label="Last Name" placeholder="Smith" value={data.lastName} onChange={e => set({ ...data, lastName: e.target.value })} />
      </div>
      <Input label="Date of Birth" type="date" value={data.dob} onChange={e => set({ ...data, dob: e.target.value })} />
      <Input label="Email Address" type="email" placeholder="john@example.com" value={data.email} onChange={e => set({ ...data, email: e.target.value })} />
      <Input label="Phone Number" type="tel" placeholder="(555) 000-0000" value={data.phone} onChange={e => set({ ...data, phone: e.target.value })} />
      <Input label="Password (min 8 characters)" type="password" placeholder="••••••••" value={data.password} onChange={e => set({ ...data, password: e.target.value })} />
      {data.password.length > 0 && (
        <div style={{ marginTop: -12, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:4, background: strength >= i ? sm[strength].color : C.border, transition:"background 0.2s" }} />)}
          </div>
          <div style={{ fontSize: 11, color: sm[strength].color, fontWeight: 600 }}>{sm[strength].label}</div>
        </div>
      )}
      <Input label="Confirm Password" type="password" placeholder="••••••••" value={data.confirm} onChange={e => set({ ...data, confirm: e.target.value })} />
      {data.confirm && !passMatch && <div style={{ color: C.red, fontSize: 13, marginTop: -12, marginBottom: 16, fontWeight: 600 }}>⚠️ Passwords don't match</div>}
      <PrimaryBtn onClick={next} disabled={!valid}>Continue →</PrimaryBtn>
      <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.muted }}>
        Already have an account? <span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>Sign in</span>
      </div>
    </StepShell>
  );
}

// ── STEP 2 — BODY STATS + BMI ──────────────────────────────────────────────
function Step2({ data, set, next, back }) {
  const valid = data.height && data.weight;
  const bmi   = calcBMI(data.height, data.weight);
  const cat   = bmiCategory(bmi);
  const bmiPct = bmi ? Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) : 0;

  return (
    <StepShell step={2}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>
        Enter your height and weight — your BMI will calculate live below.
      </div>

      <SelectField label="Height" value={data.height} onChange={e => set({ ...data, height: e.target.value })}>
        <option value="">Select your height</option>
        {Array.from({ length: 24 }, (_, i) => {
          const totalIn = 60 + i;
          const ft = Math.floor(totalIn / 12), inch = totalIn % 12;
          return <option key={i} value={`${ft}'${inch}"`}>{ft}' {inch}"</option>;
        })}
      </SelectField>

      <Input label="Current Weight (lbs)" type="number" placeholder="175"
        value={data.weight} onChange={e => set({ ...data, weight: e.target.value })} />

      {/* BMI Result Card */}
      {bmi && cat ? (
        <div style={{ padding: 20, borderRadius: 16, marginBottom: 22, background: cat.bg, border: `2px solid ${cat.color}33`, transition: "all 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: cat.color, letterSpacing: "1.5px", marginBottom: 4 }}>YOUR BMI</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: C.text, letterSpacing: "-2px", lineHeight: 1 }}>{bmi}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ padding: "5px 16px", borderRadius: 20, background: cat.color, color: C.white, fontSize: 12, fontWeight: 800, letterSpacing: "0.5px" }}>
                {cat.label}
              </div>
            </div>
          </div>

          {/* Gauge */}
          <div style={{ height: 12, background: "#E2E8F0", borderRadius: 8, overflow: "hidden", marginBottom: 6, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex" }}>
              <div style={{ width: "28%", background: C.blue,   opacity: 0.25, borderRadius: "8px 0 0 8px" }} />
              <div style={{ width: "30%", background: C.green,  opacity: 0.25 }} />
              <div style={{ width: "20%", background: C.yellow, opacity: 0.25 }} />
              <div style={{ width: "22%", background: C.red,    opacity: 0.25, borderRadius: "0 8px 8px 0" }} />
            </div>
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: `${bmiPct}%`,
              width: 4, background: cat.color, borderRadius: 4,
              transform: "translateX(-50%)", transition: "left 0.5s ease",
              boxShadow: `0 0 8px ${cat.color}`,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, fontWeight: 600, marginBottom: 12 }}>
            <span>Under</span><span>Healthy</span><span>Over</span><span>Obese</span>
          </div>

          <div style={{ fontSize: 12, color: C.greyDark, lineHeight: 1.6, borderTop: `1px solid ${cat.color}22`, paddingTop: 12 }}>
            {cat.msg}
          </div>
        </div>
      ) : (
        <div style={{ padding: 24, borderRadius: 16, marginBottom: 22, background: C.greyLight, border: `2px dashed ${C.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⚖️</div>
          <div style={{ fontSize: 13, color: C.muted }}>Enter your height and weight above to see your BMI</div>
        </div>
      )}

      <div style={{ fontSize: 12, color: C.muted, padding: "10px 14px", background: C.greyLight, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 24, lineHeight: 1.6 }}>
        ℹ️ <strong>What is BMI?</strong> Body Mass Index measures body fat based on height and weight. It's a useful starting point, though it doesn't account for muscle mass. Freddy uses it alongside your full profile.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <GhostBtn onClick={back}>← Back</GhostBtn>
        <PrimaryBtn onClick={next} disabled={!valid}>Continue →</PrimaryBtn>
      </div>
    </StepShell>
  );
}

// ── STEP 3 — WAIVER ────────────────────────────────────────────────────────
function Step3({ data, set, next, back }) {
  const valid = data.waiverSigned && data.waiverName && data.waiverName.trim().length > 2;
  const sections = [
    ["1. ASSUMPTION OF RISK", "I acknowledge that physical exercise involves inherent risks including physical injury, muscular strains, sprains, fractures, and in extreme cases, death. I voluntarily choose to participate in fitness programs, workout plans, nutritional guidance, and related services provided by Freddy Fit."],
    ["2. MEDICAL CLEARANCE", "I represent that I am in good physical health and have no medical condition, illness, disability, or impairment that would prevent safe participation. I acknowledge that Freddy Fit strongly recommends consulting a licensed physician before beginning any new exercise program."],
    ["3. RELEASE OF LIABILITY", "In consideration of being permitted to participate, I hereby release, waive, and discharge Freddy Fit, its trainers, employees, agents, and representatives from any and all claims, demands, losses, or damages arising from my participation, including claims arising from negligence."],
    ["4. NUTRITIONAL DISCLAIMER", "Nutritional guidance provided through Freddy Fit is for general informational purposes only and does not constitute medical advice. I agree to consult a registered dietitian or physician regarding any significant dietary changes."],
    ["5. VIDEO & CONTENT LIBRARY", "Instructional videos and content are for educational purposes. I agree to perform exercises within my own ability and to stop immediately if I experience pain, dizziness, or discomfort."],
    ["6. PERSONAL DATA & PRIVACY", "I consent to Freddy Fit collecting and storing my personal information, body measurements, fitness data, and progress photos for the purpose of delivering personalized training services. My data will never be sold to third parties."],
    ["7. PHOTO & MEDIA RELEASE", "I grant Freddy Fit permission to use any progress photos or testimonials I voluntarily submit for promotional purposes, unless I explicitly opt out in writing."],
    ["8. CANCELLATION POLICY", "Subscription fees are non-refundable after the first 48 hours. I agree to the cancellation and refund policies as communicated by Freddy Fit at the time of enrollment."],
    ["9. GOVERNING LAW", "This agreement shall be governed by applicable law. If any provision is found unenforceable, the remaining provisions shall continue in full force and effect."],
  ];

  return (
    <StepShell step={3}>
      <div style={{ height: 300, overflowY: "auto", padding: 20, background: C.greyLight, borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13, lineHeight: 1.8, color: C.greyDark, marginBottom: 6 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 14, textAlign: "center" }}>
          FREDDY FIT — LIABILITY WAIVER & INFORMED CONSENT
        </div>
        {sections.map(([h, b], i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{h}</div>
            <p style={{ margin: 0 }}>{b}</p>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 20 }}>↑ Scroll to read the full waiver</div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Type your full legal name as your digital signature</label>
        <input style={{ ...inpBase, borderColor: data.waiverName ? C.blue : C.border, fontSize: 16, fontStyle: "italic" }}
          placeholder="Your Full Name" value={data.waiverName || ""}
          onChange={e => set({ ...data, waiverName: e.target.value })} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: C.greyLight, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 18, fontSize: 13 }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Date of Signature</span>
        <span style={{ fontWeight: 700, color: C.text }}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>

      <div onClick={() => set({ ...data, waiverSigned: !data.waiverSigned })} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 16, borderRadius: 12, cursor: "pointer", border: `2px solid ${data.waiverSigned ? C.blue : C.border}`, background: data.waiverSigned ? C.blueLight : C.white, marginBottom: 24, transition: "all 0.15s" }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${data.waiverSigned ? C.blue : C.border}`, background: data.waiverSigned ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.white, fontWeight: 800, transition: "all 0.15s" }}>
          {data.waiverSigned && "✓"}
        </div>
        <div style={{ fontSize: 13, color: C.greyDark, lineHeight: 1.6 }}>
          I have read and fully understand the Freddy Fit Liability Waiver & Informed Consent. I agree to all terms and conditions. I acknowledge this serves as my legally binding digital signature.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <GhostBtn onClick={back}>← Back</GhostBtn>
        <PrimaryBtn onClick={next} disabled={!valid}>I Agree & Continue →</PrimaryBtn>
      </div>
    </StepShell>
  );
}

// ── STEP 4 — WELCOME ───────────────────────────────────────────────────────
function Step4({ data }) {
  const bmi = calcBMI(data.height, data.weight);
  const cat = bmiCategory(bmi);

  return (
    <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.7}}
      `}</style>

      <img
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzFBQUJFMyIvPgogIDwhLS0gSG9yaXpvbnRhbCBiYXIgdG9wIC0tPgogIDxyZWN0IHg9IjIyIiB5PSIzMCIgd2lkdGg9IjUyIiBoZWlnaHQ9IjEwIiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8IS0tIEhvcml6b250YWwgYmFyIG1pZGRsZSAtLT4KICA8cmVjdCB4PSIyMiIgeT0iNDYiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgcng9IjIiIGZpbGw9IndoaXRlIi8+CiAgPCEtLSBWZXJ0aWNhbCBzdGVtIC0tPgogIDxyZWN0IHg9IjIyIiB5PSIzMCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjQyIiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8IS0tIERpYWdvbmFsIHNsYXNoIHJpZ2h0IHRvcCAtLT4KICA8cG9seWdvbiBwb2ludHM9IjU4LDMwIDc0LDMwIDYyLDQwIDQ2LDQwIiBmaWxsPSJ3aGl0ZSIvPgogIDwhLS0gRGlhZ29uYWwgc2xhc2ggcmlnaHQgbWlkZGxlIC0tPiAgCiAgPHBvbHlnb24gcG9pbnRzPSI0Niw0NiA2Miw0NiA1Niw1NiA0MCw1NiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+"
        alt="Freddy Fit"
        style={{ width: 100, height: 100, margin: "0 auto 20px", display: "block", animation: "pop 0.5s ease forwards", filter: `drop-shadow(0 12px 24px ${C.blueGlow})` }}
      />

      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.5px", marginBottom: 6 }}>Welcome, {data.firstName}!</div>
      <div style={{ fontSize: 15, color: C.muted, marginBottom: 28, lineHeight: 1.7 }}>
        Your profile is complete and your waiver is signed.<br />Freddy will review everything and build your custom program.
      </div>

      {/* Next steps */}
      <div style={{ background: C.greyLight, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, textAlign: "left", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.text, letterSpacing: "1px", marginBottom: 16 }}>WHAT HAPPENS NEXT</div>
        {[
          { icon:"📧", title:"Check your email",           desc:`Confirmation sent to ${data.email}` },
          { icon:"⏱️", title:"Plan ready within 24 hours", desc:"Freddy reviews your profile and builds your custom workout plan" },
          { icon:"📱", title:"You'll get notified",         desc:"Email alert the moment your plan is live" },
          { icon:"🚀", title:"Start training",              desc:"Log in, follow your plan, and track every rep from day one" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: C.white, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, textAlign: "left", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.text, letterSpacing: "1px", marginBottom: 14 }}>YOUR PROFILE SUMMARY</div>
        {[
          { label: "Name",          value: `${data.firstName} ${data.lastName}` },
          { label: "Date of Birth", value: data.dob ? new Date(data.dob + "T00:00:00").toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) : "—" },
          { label: "Height",        value: data.height || "—" },
          { label: "Weight",        value: data.weight ? `${data.weight} lbs` : "—" },
          { label: "BMI",           value: bmi && cat ? `${bmi} — ${cat.label} ${cat.icon}` : "—" },
          { label: "Waiver Signed", value: data.waiverSigned ? `✅ ${new Date().toLocaleDateString()}` : "—" },
        ].map((row, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 13 }}>
            <span style={{ color: C.muted, fontWeight: 600 }}>{row.label}</span>
            <span style={{ color: C.text, fontWeight: 700 }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: 14, background: C.blueLight, borderRadius: 12, border: `1px solid ${C.blue}33`, marginBottom: 24, animation: "shimmer 2.5s ease infinite" }}>
        <div style={{ fontSize: 13, color: C.blue, fontWeight: 700 }}>📧 Confirmation email sent to {data.email}</div>
      </div>

      <button style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: C.white, border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: ff, width: "100%", boxShadow: C.shadowLg }}>
        Go to My Dashboard →
      </button>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState({ firstName:"", lastName:"", dob:"", email:"", phone:"", password:"", confirm:"" });
  const [stats,   setStats]   = useState({ height:"", weight:"" });
  const [waiver,  setWaiver]  = useState({ waiverSigned: false, waiverName:"" });

  const allData = { ...account, ...stats, ...waiver };
  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(140deg, #EFF9FF 0%, #E3F4FC 45%, #F4F7FA 100%)", fontFamily: ff, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 60px" }}>
      <div style={{ width: "100%", maxWidth: 540 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={LOGO_B64} alt="Freddy Fit" style={{ height: 48, width: "auto" }} />
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: "36px 40px", boxShadow: "0 20px 60px rgba(26,171,227,0.12), 0 4px 20px rgba(0,0,0,0.05)", border: `1px solid ${C.border}` }}>
          {step < 4 && <ProgressBar current={step} />}
          {step === 1 && <Step1 data={account} set={setAccount} next={next} />}
          {step === 2 && <Step2 data={stats}   set={setStats}   next={next} back={back} />}
          {step === 3 && <Step3 data={waiver}  set={setWaiver}  next={next} back={back} />}
          {step === 4 && <Step4 data={allData} />}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted }}>
          {step < 4 ? `Step ${step} of 3` : "Complete!"} &nbsp;·&nbsp; FREDDY FIT &nbsp;·&nbsp;
          <span style={{ color: C.blue, cursor: "pointer" }}>Privacy Policy</span> &nbsp;·&nbsp;
          <span style={{ color: C.blue, cursor: "pointer" }}>Terms of Service</span>
        </div>
      </div>
    </div>
  );
}
