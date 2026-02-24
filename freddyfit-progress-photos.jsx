import { useState, useRef } from "react";

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
  shadow:     "0 2px 12px rgba(0,0,0,0.06)",
  shadowLg:   "0 8px 32px rgba(26,171,227,0.14)",
};
const ff = "'Barlow', 'Segoe UI', sans-serif";

if (typeof document !== "undefined") {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800;900&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}

const LOGO_B64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NDAgMTE1Ij4KICA8dGV4dCB4PSIwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIE5hcnJvdywgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzYiIGZvbnQtd2VpZ2h0PSIzMDAiIGxldHRlci1zcGFjaW5nPSIzIiBmaWxsPSIjOUNBM0FGIj5GUkVERFk8L3RleHQ+CiAgPHRleHQgeD0iMzE2IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9Ijc2IiBmb250LXdlaWdodD0iODAwIiBsZXR0ZXItc3BhY2luZz0iMyIgZmlsbD0iIzFBQUJFMyI+RklUPC90ZXh0PgogIDxsaW5lIHgxPSI0NzQiIHkxPSI4IiB4Mj0iNDc0IiB5Mj0iODIiIHN0cm9rZT0iI0NCRDVFMSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8Y2lyY2xlIGN4PSI1MDciIGN5PSI0NCIgcj0iMzQiIGZpbGw9IiMxQUFCRTMiLz4KICA8dGV4dCB4PSI0OTEiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDIiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IndoaXRlIj5GPC90ZXh0PgogIDx0ZXh0IHg9IjY4IiB5PSIxMDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjUwMCIgbGV0dGVyLXNwYWNpbmc9IjciIGZpbGw9IiMxQUFCRTMiPlZJU1VBTElaRSDCtyBETyDCtyBCRUNPTUU8L3RleHQ+Cjwvc3ZnPg==";

// ── PLACEHOLDER PHOTO COLORS (simulate photos with gradients) ─────────────
const PHOTO_GRADIENTS = [
  ["#1AABE3","#1490C4"],
  ["#6366F1","#4F46E5"],
  ["#F97316","#EA580C"],
  ["#22C55E","#16A34A"],
  ["#EC4899","#DB2777"],
  ["#F59E0B","#D97706"],
];

// ── SEED DATA ──────────────────────────────────────────────────────────────
const SEED_PHOTOS = [
  { id:1,  date:"2024-01-15", label:"Week 1 — Starting Point", angle:"Front", weight:185, notes:"Day 1. Ready to make a change.", gradient:PHOTO_GRADIENTS[0], month:"January" },
  { id:2,  date:"2024-01-15", label:"Week 1 — Starting Point", angle:"Side",  weight:185, notes:"",                             gradient:PHOTO_GRADIENTS[1], month:"January" },
  { id:3,  date:"2024-01-15", label:"Week 1 — Starting Point", angle:"Back",  weight:185, notes:"",                             gradient:PHOTO_GRADIENTS[2], month:"January" },
  { id:4,  date:"2024-02-15", label:"Week 5 — One Month In",   angle:"Front", weight:181, notes:"Down 4 lbs, feeling stronger.", gradient:PHOTO_GRADIENTS[3], month:"February" },
  { id:5,  date:"2024-02-15", label:"Week 5 — One Month In",   angle:"Side",  weight:181, notes:"",                             gradient:PHOTO_GRADIENTS[4], month:"February" },
  { id:6,  date:"2024-02-15", label:"Week 5 — One Month In",   angle:"Back",  weight:181, notes:"",                             gradient:PHOTO_GRADIENTS[5], month:"February" },
  { id:7,  date:"2024-03-15", label:"Week 9 — Two Months",     angle:"Front", weight:178, notes:"Visible change in shoulders and arms!", gradient:PHOTO_GRADIENTS[1], month:"March" },
  { id:8,  date:"2024-03-15", label:"Week 9 — Two Months",     angle:"Side",  weight:178, notes:"",                             gradient:PHOTO_GRADIENTS[0], month:"March" },
  { id:9,  date:"2024-03-15", label:"Week 9 — Two Months",     angle:"Back",  weight:178, notes:"",                             gradient:PHOTO_GRADIENTS[2], month:"March" },
];

const ANGLES = ["Front", "Side", "Back", "Other"];

// ── PHOTO CARD (simulated with gradient + icon) ────────────────────────────
function PhotoCard({ photo, onClick, selected }) {
  return (
    <div onClick={onClick} style={{
      borderRadius: 14, overflow: "hidden", cursor: "pointer",
      border: `2px solid ${selected ? C.blue : "transparent"}`,
      boxShadow: selected ? C.shadowLg : C.shadow,
      transition: "all 0.2s",
      transform: selected ? "scale(1.02)" : "scale(1)",
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.transform = "scale(1)"; }}>

      {/* Photo placeholder */}
      <div style={{
        height: 200,
        background: `linear-gradient(135deg, ${photo.gradient[0]}, ${photo.gradient[1]})`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <div style={{ fontSize: 48, opacity: 0.4 }}>👤</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 700, marginTop: 8 }}>
          {photo.angle} View
        </div>

        {/* Angle badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
          color: C.white, padding: "3px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 700,
        }}>{photo.angle}</div>

        {/* Weight badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(255,255,255,0.9)",
          color: C.text, padding: "3px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 800,
        }}>{photo.weight} lbs</div>

        {selected && (
          <div style={{
            position: "absolute", inset: 0,
            background: `${C.blue}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>✓</div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px", background: C.white }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          {new Date(photo.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>{photo.label}</div>
        {photo.notes && (
          <div style={{ fontSize: 11, color: C.blue, marginTop: 4, fontStyle: "italic" }}>"{photo.notes}"</div>
        )}
      </div>
    </div>
  );
}

// ── UPLOAD MODAL ───────────────────────────────────────────────────────────
function UploadModal({ onClose, onUpload }) {
  const [form, setForm] = useState({ label: "", angle: "Front", weight: "", notes: "", date: new Date().toISOString().split("T")[0] });
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const valid = form.label && form.weight;

  const handleSubmit = () => {
    onUpload({
      id: Date.now(),
      date: form.date,
      label: form.label,
      angle: form.angle,
      weight: parseFloat(form.weight),
      notes: form.notes,
      gradient: PHOTO_GRADIENTS[Math.floor(Math.random() * PHOTO_GRADIENTS.length)],
      month: new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { month: "long" }),
      preview,
    });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(26,35,50,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.2)", animation:"popIn 0.2s ease" }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>

        <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:C.text }}>Upload Progress Photo</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Add to your transformation timeline</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:C.greyLight, cursor:"pointer", fontSize:16, color:C.muted }}>✕</button>
        </div>

        <div style={{ padding:28 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            style={{
              height: 180, borderRadius: 14, marginBottom: 20, cursor: "pointer",
              border: `2px dashed ${dragging ? C.blue : C.border}`,
              background: dragging ? C.blueLight : C.greyLight,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", overflow: "hidden", position: "relative",
            }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
            {preview ? (
              <>
                <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ color:C.white, fontSize:13, fontWeight:700 }}>Click to change photo</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:40, marginBottom:10 }}>📸</div>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Drop photo here or click to browse</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>JPG, PNG or HEIC • Max 20MB</div>
              </>
            )}
          </div>

          {/* Form fields */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.greyDark, marginBottom:6, display:"block", letterSpacing:"0.5px", textTransform:"uppercase" }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})}
                style={{ background:C.greyLight, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 16px", color:C.text, fontSize:14, width:"100%", fontFamily:ff, outline:"none" }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.greyDark, marginBottom:6, display:"block", letterSpacing:"0.5px", textTransform:"uppercase" }}>Weight (lbs) *</label>
              <input type="number" placeholder="175" value={form.weight} onChange={e => setForm({...form, weight:e.target.value})}
                style={{ background:C.greyLight, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 16px", color:C.text, fontSize:14, width:"100%", fontFamily:ff, outline:"none" }} />
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.greyDark, marginBottom:6, display:"block", letterSpacing:"0.5px", textTransform:"uppercase" }}>Label / Milestone *</label>
            <input placeholder="e.g. Week 4 Check-in, 3 Month Progress..." value={form.label} onChange={e => setForm({...form, label:e.target.value})}
              style={{ background:C.greyLight, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 16px", color:C.text, fontSize:14, width:"100%", fontFamily:ff, outline:"none", boxSizing:"border-box" }} />
          </div>

          {/* Angle selector */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.greyDark, marginBottom:8, display:"block", letterSpacing:"0.5px", textTransform:"uppercase" }}>Photo Angle</label>
            <div style={{ display:"flex", gap:8 }}>
              {ANGLES.map(a => (
                <button key={a} onClick={() => setForm({...form, angle:a})} style={{
                  flex:1, padding:"9px 0", borderRadius:10, cursor:"pointer",
                  border:`2px solid ${form.angle===a ? C.blue : C.border}`,
                  background: form.angle===a ? C.blueLight : C.white,
                  color: form.angle===a ? C.blue : C.muted,
                  fontSize:12, fontWeight:700, fontFamily:ff, transition:"all 0.15s",
                }}>{a}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.greyDark, marginBottom:6, display:"block", letterSpacing:"0.5px", textTransform:"uppercase" }}>Notes (optional)</label>
            <textarea placeholder="How are you feeling? Any changes you've noticed?" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})}
              style={{ background:C.greyLight, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 16px", color:C.text, fontSize:14, width:"100%", fontFamily:ff, outline:"none", height:72, resize:"none", lineHeight:1.5, boxSizing:"border-box" }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <button onClick={onClose} style={{ padding:"13px 0", borderRadius:12, border:`1.5px solid ${C.border}`, background:"transparent", color:C.muted, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:ff }}>Cancel</button>
            <button onClick={handleSubmit} disabled={!valid} style={{ padding:"13px 0", borderRadius:12, border:"none", background:valid?C.blue:C.border, color:valid?C.white:C.muted, fontWeight:800, fontSize:14, cursor:valid?"pointer":"not-allowed", fontFamily:ff, boxShadow:valid?C.shadowLg:"none" }}>
              Upload Photo 📸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPARE VIEW ───────────────────────────────────────────────────────────
function CompareView({ photos, onClose }) {
  const [leftId,  setLeftId]  = useState(photos[0]?.id);
  const [rightId, setRightId] = useState(photos[photos.length-1]?.id);

  const left  = photos.find(p => p.id === leftId);
  const right = photos.find(p => p.id === rightId);
  const diff  = left && right ? right.weight - left.weight : null;

  const PhotoSlot = ({ photo, side, onChange }) => (
    <div style={{ flex:1 }}>
      <div style={{ marginBottom:10 }}>
        <select value={photo?.id} onChange={e => onChange(parseInt(e.target.value))}
          style={{ width:"100%", padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.greyLight, fontSize:13, fontFamily:ff, color:C.text, outline:"none" }}>
          {photos.map(p => (
            <option key={p.id} value={p.id}>
              {new Date(p.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} — {p.angle} — {p.weight}lbs
            </option>
          ))}
        </select>
      </div>
      {photo && (
        <div style={{ borderRadius:14, overflow:"hidden", border:`2px solid ${side==="left"?C.blue:"#A855F7"}` }}>
          <div style={{
            height:280,
            background: photo.preview ? `url(${photo.preview}) center/cover` : `linear-gradient(135deg, ${photo.gradient[0]}, ${photo.gradient[1]})`,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative",
          }}>
            {!photo.preview && <div style={{ fontSize:56, opacity:0.3 }}>👤</div>}
            <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)", color:C.white, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>
              {side === "left" ? "BEFORE" : "AFTER"}
            </div>
            <div style={{ position:"absolute", bottom:10, left:10, right:10, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", padding:"8px 12px", borderRadius:10 }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.white }}>{photo.label}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:2 }}>
                {new Date(photo.date+"T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} · {photo.angle} · {photo.weight} lbs
              </div>
            </div>
          </div>
          {photo.notes && (
            <div style={{ padding:"10px 14px", background:C.white, fontSize:12, color:C.blue, fontStyle:"italic" }}>"{photo.notes}"</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(26,35,50,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:780, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)", animation:"popIn 0.2s ease" }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>

        <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:C.text }}>📊 Before & After Comparison</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Select any two photos to compare</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:C.greyLight, cursor:"pointer", fontSize:16, color:C.muted }}>✕</button>
        </div>

        <div style={{ padding:28 }}>
          {/* Diff stat */}
          {diff !== null && (
            <div style={{ padding:"14px 20px", borderRadius:14, marginBottom:24, background: diff < 0 ? C.greenLight : C.blueLight, border:`1px solid ${diff < 0 ? C.green : C.blue}33`, display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ fontSize:32 }}>{diff < 0 ? "🎉" : diff > 0 ? "💪" : "⚖️"}</div>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color: diff < 0 ? C.green : C.blue }}>
                  {diff < 0 ? `${diff} lbs` : diff > 0 ? `+${diff} lbs` : "Same weight"}
                </div>
                <div style={{ fontSize:13, color:C.greyDark, marginTop:2 }}>
                  {diff < 0
                    ? `Lost ${Math.abs(diff)} lbs between these two photos — incredible progress!`
                    : diff > 0
                    ? `Gained ${diff} lbs — building that muscle mass!`
                    : "Weight maintained between these photos"}
                </div>
              </div>
            </div>
          )}

          {/* Side by side */}
          <div style={{ display:"flex", gap:20 }}>
            <PhotoSlot photo={left}  side="left"  onChange={setLeftId}  />
            <div style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:C.greyLight, border:`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⇄</div>
            </div>
            <PhotoSlot photo={right} side="right" onChange={setRightId} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LIGHTBOX ───────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ maxWidth:500, width:"100%", animation:"popIn 0.2s ease" }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ borderRadius:16, overflow:"hidden" }}>
          <div style={{
            height:400,
            background: photo.preview ? `url(${photo.preview}) center/cover` : `linear-gradient(135deg, ${photo.gradient[0]}, ${photo.gradient[1]})`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {!photo.preview && <div style={{ fontSize:80, opacity:0.3 }}>👤</div>}
          </div>
          <div style={{ background:C.text, padding:20 }}>
            <div style={{ fontSize:16, fontWeight:800, color:C.white, marginBottom:4 }}>{photo.label}</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:8 }}>
              {new Date(photo.date+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})} · {photo.angle} view · {photo.weight} lbs
            </div>
            {photo.notes && <div style={{ fontSize:13, color:C.blue, fontStyle:"italic" }}>"{photo.notes}"</div>}
            <button onClick={onClose} style={{ marginTop:16, width:"100%", padding:"11px 0", borderRadius:10, border:"none", background:"rgba(255,255,255,0.12)", color:C.white, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:ff }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function App() {
  const [photos,      setPhotos]     = useState(SEED_PHOTOS);
  const [showUpload,  setShowUpload] = useState(false);
  const [showCompare, setShowCompare]= useState(false);
  const [lightbox,    setLightbox]   = useState(null);
  const [selected,    setSelected]   = useState([]);
  const [filterAngle, setFilterAngle]= useState("All");
  const [viewMode,    setViewMode]   = useState("grid"); // grid | timeline
  const [toast,       setToast]      = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const toggleSelect = (id) => {
    setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  };

  const handleUpload = (photo) => {
    setPhotos(p => [photo, ...p]);
    showToast("📸 Photo uploaded successfully!");
  };

  const handleDelete = () => {
    setPhotos(p => p.filter(x => !selected.includes(x.id)));
    showToast(`${selected.length} photo${selected.length>1?"s":""} deleted`);
    setSelected([]);
  };

  const filtered = photos.filter(p => filterAngle === "All" || p.angle === filterAngle);

  // Group by month for timeline
  const byMonth = filtered.reduce((acc, p) => {
    if (!acc[p.month]) acc[p.month] = [];
    acc[p.month].push(p);
    return acc;
  }, {});

  const startWeight = photos.length ? Math.max(...photos.map(p=>p.weight)) : 0;
  const latestWeight = photos.length ? photos.sort((a,b)=>new Date(b.date)-new Date(a.date))[0].weight : 0;
  const totalLost = startWeight - latestWeight;

  return (
    <div style={{ minHeight:"100vh", background:C.greyLight, fontFamily:ff }}>
      <style>{`* { box-sizing:border-box; } ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}`}</style>

      {/* Top nav */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:C.shadow }}>
        <img src={LOGO_B64} alt="Freddy Fit" style={{ height:30, width:"auto" }} />
        <div style={{ fontSize:13, color:C.muted, fontWeight:600 }}>Progress Photos</div>
      </div>

      <div style={{ padding:32, maxWidth:1100, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:26, fontWeight:900, color:C.text, letterSpacing:"-0.3px" }}>Progress Photos</div>
            <div style={{ fontSize:14, color:C.muted, marginTop:4 }}>Document your transformation — every photo tells your story</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {photos.length >= 2 && (
              <button onClick={() => setShowCompare(true)} style={{ padding:"11px 20px", borderRadius:12, border:`1.5px solid ${C.blue}`, background:C.blueLight, color:C.blue, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:ff }}>
                ⇄ Compare
              </button>
            )}
            <button onClick={() => setShowUpload(true)} style={{ padding:"11px 20px", borderRadius:12, border:"none", background:C.blue, color:C.white, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:ff, boxShadow:C.shadowLg, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>+</span> Upload Photo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Photos",    value:photos.length,              color:C.blue,  icon:"📸" },
            { label:"Check-ins",       value:new Set(photos.map(p=>p.date)).size, color:"#A855F7", icon:"📅" },
            { label:"Starting Weight", value:`${startWeight} lbs`,       color:C.muted, icon:"⚖️" },
            { label:"Total Lost",      value:totalLost>0?`-${totalLost} lbs`:`${totalLost} lbs`, color:totalLost>0?C.green:C.blue, icon:"📉" },
          ].map(s => (
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:20, borderTop:`4px solid ${s.color}`, boxShadow:C.shadow }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{s.label}</div>
                </div>
                <div style={{ fontSize:24, opacity:0.7 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
          {/* Angle filter */}
          <div style={{ display:"flex", gap:6 }}>
            {["All","Front","Side","Back","Other"].map(a => (
              <button key={a} onClick={() => setFilterAngle(a)} style={{
                padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:700, fontFamily:ff,
                background: filterAngle===a ? C.blue : C.white,
                color: filterAngle===a ? C.white : C.muted,
                boxShadow: C.shadow, transition:"all 0.15s",
              }}>{a}</button>
            ))}
          </div>

          <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
            {/* View toggle */}
            {[["grid","⊞ Grid"],["timeline","≡ Timeline"]].map(([v,l]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:700, fontFamily:ff,
                background: viewMode===v ? C.text : C.white,
                color: viewMode===v ? C.white : C.muted,
                boxShadow:C.shadow,
              }}>{l}</button>
            ))}

            {/* Bulk actions */}
            {selected.length > 0 && (
              <div style={{ display:"flex", gap:8, alignItems:"center", padding:"6px 14px", background:"#FEF2F2", borderRadius:20, border:"1px solid #FCA5A5" }}>
                <span style={{ fontSize:12, color:C.red, fontWeight:700 }}>{selected.length} selected</span>
                <button onClick={handleDelete} style={{ padding:"4px 12px", borderRadius:12, border:"none", background:C.red, color:C.white, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:ff }}>Delete</button>
                <button onClick={() => setSelected([])} style={{ fontSize:14, cursor:"pointer", background:"none", border:"none", color:C.red }}>✕</button>
              </div>
            )}
          </div>
        </div>

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <>
            {filtered.length === 0 ? (
              <div style={{ background:C.white, borderRadius:16, padding:60, textAlign:"center", border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:56, marginBottom:16 }}>📸</div>
                <div style={{ fontSize:18, fontWeight:800, color:C.text }}>No photos yet</div>
                <div style={{ fontSize:14, color:C.muted, marginTop:8, marginBottom:24 }}>Upload your first progress photo to start your transformation timeline</div>
                <button onClick={() => setShowUpload(true)} style={{ padding:"12px 28px", borderRadius:12, border:"none", background:C.blue, color:C.white, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:ff, boxShadow:C.shadowLg }}>
                  + Upload First Photo
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
                {filtered.map(p => (
                  <div key={p.id} style={{ position:"relative" }}>
                    <div style={{ position:"absolute", top:10, left:10, zIndex:10 }}>
                      <div onClick={e => { e.stopPropagation(); toggleSelect(p.id); }} style={{
                        width:22, height:22, borderRadius:6,
                        border:`2px solid ${selected.includes(p.id) ? C.blue : "rgba(255,255,255,0.8)"}`,
                        background: selected.includes(p.id) ? C.blue : "rgba(255,255,255,0.6)",
                        backdropFilter:"blur(4px)",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:12, color:C.white, fontWeight:800,
                      }}>{selected.includes(p.id) && "✓"}</div>
                    </div>
                    <PhotoCard photo={p} onClick={() => setLightbox(p)} selected={selected.includes(p.id)} />
                  </div>
                ))}

                {/* Upload card */}
                <div onClick={() => setShowUpload(true)} style={{
                  borderRadius:14, border:`2px dashed ${C.border}`, cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  minHeight:260, background:C.white, transition:"all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.white; }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>📸</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Add Photo</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Click to upload</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TIMELINE VIEW ── */}
        {viewMode === "timeline" && (
          <div>
            {Object.entries(byMonth).map(([month, monthPhotos]) => (
              <div key={month} style={{ marginBottom:32 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                  <div style={{ fontSize:16, fontWeight:900, color:C.text }}>{month}</div>
                  <div style={{ flex:1, height:1, background:C.border }} />
                  <div style={{ fontSize:12, color:C.muted, fontWeight:600 }}>{monthPhotos.length} photos · {monthPhotos[0].weight} lbs</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14 }}>
                  {monthPhotos.map(p => (
                    <PhotoCard key={p.id} photo={p} onClick={() => setLightbox(p)} selected={selected.includes(p.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Privacy notice */}
        <div style={{ marginTop:24, padding:"12px 20px", background:C.white, borderRadius:12, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, fontSize:13 }}>
          <span style={{ fontSize:20 }}>🔒</span>
          <span style={{ color:C.muted }}>Your progress photos are <strong style={{ color:C.text }}>private and encrypted</strong>. Only you and your trainer Freddy can view them. They are never shared or used for any other purpose.</span>
        </div>
      </div>

      {showUpload  && <UploadModal  onClose={() => setShowUpload(false)}  onUpload={handleUpload} />}
      {showCompare && <CompareView  photos={photos} onClose={() => setShowCompare(false)} />}
      {lightbox    && <Lightbox     photo={lightbox} onClose={() => setLightbox(null)} />}

      {toast && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:C.text, color:C.white, padding:"12px 24px", borderRadius:12, fontSize:14, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", zIndex:2000, whiteSpace:"nowrap", animation:"fadeUp 0.2s ease" }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {toast}
        </div>
      )}
    </div>
  );
}
