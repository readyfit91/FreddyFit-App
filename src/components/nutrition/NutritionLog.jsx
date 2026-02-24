import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";

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
  orange:     "#F97316",
  orangeLight:"#FFF7ED",
  purple:     "#A855F7",
  purpleLight:"#FAF5FF",
  red:        "#EF4444",
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

// ── USDA API ───────────────────────────────────────────────────────────────
const USDA_KEY = "DEMO_KEY"; // free demo key — works up to 30 req/min
const searchFood = async (query) => {
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_KEY}`
  );
  const data = await res.json();
  return (data.foods || []).map(f => {
    const get = (name) => {
      const n = (f.foodNutrients || []).find(x => x.nutrientName?.toLowerCase().includes(name.toLowerCase()));
      return n ? Math.round(n.value * 10) / 10 : 0;
    };
    return {
      fdcId:    f.fdcId,
      name:     f.description,
      brand:    f.brandOwner || f.brandName || "",
      calories: get("Energy") || get("energy"),
      protein:  get("Protein"),
      carbs:    get("Carbohydrate"),
      fat:      get("Total lipid"),
      fiber:    get("Fiber"),
      serving:  f.servingSize ? `${f.servingSize}${f.servingSizeUnit || "g"}` : "100g",
    };
  });
};

// ── SEED LOG ───────────────────────────────────────────────────────────────
const SEED_LOG = [
  { id:1, meal:"Breakfast", name:"Scrambled Eggs (3 large)", calories:210, protein:18, carbs:2,  fat:14, fiber:0,  serving:"150g" },
  { id:2, meal:"Breakfast", name:"Oatmeal, cooked",          calories:158, protein:6,  carbs:27, fat:3,  fiber:4,  serving:"234g" },
  { id:3, meal:"Lunch",     name:"Grilled Chicken Breast",   calories:165, protein:31, carbs:0,  fat:4,  fiber:0,  serving:"100g" },
  { id:4, meal:"Lunch",     name:"Brown Rice, cooked",       calories:216, protein:5,  carbs:45, fat:2,  fiber:4,  serving:"196g" },
  { id:5, meal:"Snack",     name:"Greek Yogurt, plain",      calories:100, protein:17, carbs:6,  fat:0,  fiber:0,  serving:"170g" },
];

const GOALS = { calories: 2400, protein: 180, carbs: 240, fat: 80, fiber: 30 };
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"];

// ── QUICK FOODS (no API needed) ────────────────────────────────────────────
const QUICK_FOODS = [
  { name:"Banana",              calories:105, protein:1,  carbs:27, fat:0, fiber:3,  serving:"118g" },
  { name:"Chicken Breast 100g", calories:165, protein:31, carbs:0,  fat:4, fiber:0,  serving:"100g" },
  { name:"White Rice, cooked",  calories:206, protein:4,  carbs:45, fat:0, fiber:1,  serving:"186g" },
  { name:"Whole Egg",           calories:78,  protein:6,  carbs:1,  fat:5, fiber:0,  serving:"50g"  },
  { name:"Whey Protein Shake",  calories:120, protein:25, carbs:3,  fat:2, fiber:0,  serving:"30g"  },
  { name:"Almonds (28g)",       calories:164, protein:6,  carbs:6,  fat:14,fiber:3,  serving:"28g"  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────
const lbl = { fontSize:11, fontWeight:700, color:C.greyDark, marginBottom:6, display:"block", letterSpacing:"0.5px", textTransform:"uppercase" };
const inpBase = { background:C.greyLight, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 16px", color:C.text, fontSize:14, width:"100%", boxSizing:"border-box", fontFamily:ff, outline:"none", transition:"border-color 0.15s" };

function MacroBar({ label, val, goal, color }) {
  const pct = Math.min(100, (val / goal) * 100);
  const over = val > goal;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:13, fontWeight:600, color:C.greyDark }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:700, color: over ? C.red : C.text }}>
          {val}g <span style={{ color:C.muted, fontWeight:400 }}>/ {goal}g</span>
          {over && <span style={{ color:C.red, fontSize:11, marginLeft:4 }}>▲</span>}
        </span>
      </div>
      <div style={{ height:8, background:C.border, borderRadius:6, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background: over ? C.red : color, borderRadius:6, transition:"width 0.4s ease" }} />
      </div>
    </div>
  );
}

function MealBadge({ meal }) {
  const colors = {
    Breakfast:     { c:C.orange, bg:C.orangeLight },
    Lunch:         { c:C.blue,   bg:C.blueLight   },
    Dinner:        { c:C.purple, bg:C.purpleLight  },
    Snack:         { c:C.green,  bg:C.greenLight   },
    "Pre-Workout": { c:"#DC2626", bg:"#FEF2F2"     },
    "Post-Workout":{ c:"#7C3AED", bg:"#F5F3FF"     },
  };
  const s = colors[meal] || { c:C.muted, bg:C.greyLight };
  return <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.c }}>{meal}</span>;
}

// ── FOOD SEARCH MODAL ──────────────────────────────────────────────────────
function FoodSearchModal({ onClose, onAdd }) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [meal, setMeal]         = useState("Breakfast");
  const [qty, setQty]           = useState(1);
  const [tab, setTab]           = useState("search"); // "search" | "quick"
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = async (q) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setLoading(true); setError(null);
    try {
      const foods = await searchFood(q);
      setResults(foods);
    } catch (e) {
      setError("Search unavailable — try quick foods below");
      setResults([]);
    }
    setLoading(false);
  };

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleAdd = (food) => {
    const f = food || selected;
    if (!f) return;
    onAdd({
      id: Date.now(),
      meal,
      name:     f.name,
      calories: Math.round(f.calories * qty),
      protein:  Math.round(f.protein  * qty * 10) / 10,
      carbs:    Math.round(f.carbs    * qty * 10) / 10,
      fat:      Math.round(f.fat      * qty * 10) / 10,
      fiber:    Math.round((f.fiber || 0) * qty * 10) / 10,
      serving:  f.serving,
    });
    onClose();
  };

  const displayList = tab === "quick" ? QUICK_FOODS : results;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(26,35,50,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:600, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.2)", animation:"popIn 0.2s ease" }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ padding:"20px 24px 0", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:18, fontWeight:900, color:C.text }}>🔍 Search Foods</div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:C.greyLight, cursor:"pointer", fontSize:16, color:C.muted }}>✕</button>
          </div>

          {/* Meal selector */}
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Add to Meal</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {MEALS.map(m => (
                <button key={m} onClick={() => setMeal(m)} style={{
                  padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:700, fontFamily:ff,
                  background: meal === m ? C.blue : C.greyLight,
                  color: meal === m ? C.white : C.muted,
                  transition:"all 0.15s",
                }}>{m}</button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, marginBottom:14, borderBottom:`1px solid ${C.border}` }}>
            {[["search","🔍 USDA Search"],["quick","⚡ Quick Add"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding:"10px 20px", border:"none", background:"transparent",
                fontSize:13, fontWeight:700, fontFamily:ff, cursor:"pointer",
                color: tab === id ? C.blue : C.muted,
                borderBottom: `2px solid ${tab === id ? C.blue : "transparent"}`,
                transition:"all 0.15s", marginBottom:-1,
              }}>{label}</button>
            ))}
          </div>

          {/* Search input */}
          {tab === "search" && (
            <div style={{ position:"relative", marginBottom:12 }}>
              <input ref={inputRef} value={query} onChange={e => handleChange(e.target.value)}
                placeholder="Search 600,000+ foods (e.g. chicken breast, oatmeal, banana...)"
                style={{ ...inpBase, paddingLeft:40, paddingRight: loading ? 40 : 16 }} />
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
              {loading && (
                <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", width:18, height:18, border:`2.5px solid ${C.border}`, borderTopColor:C.blue, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 24px 8px" }}>
          {error && (
            <div style={{ padding:14, background:"#FEF2F2", borderRadius:10, color:C.red, fontSize:13, fontWeight:600, marginBottom:12 }}>
              ⚠️ {error}
            </div>
          )}

          {tab === "search" && !query && !loading && (
            <div style={{ textAlign:"center", padding:"32px 0", color:C.muted }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🥗</div>
              <div style={{ fontSize:14, fontWeight:600 }}>Start typing to search the USDA database</div>
              <div style={{ fontSize:12, marginTop:4 }}>Over 600,000 foods with full nutrition info</div>
            </div>
          )}

          {tab === "search" && query && !loading && results.length === 0 && !error && (
            <div style={{ textAlign:"center", padding:"32px 0", color:C.muted }}>
              <div style={{ fontSize:36, marginBottom:10 }}>😕</div>
              <div style={{ fontSize:14, fontWeight:600 }}>No results for "{query}"</div>
              <div style={{ fontSize:12, marginTop:4 }}>Try a different spelling or use Quick Add</div>
            </div>
          )}

          {displayList.map((food, i) => (
            <div key={food.fdcId || i} onClick={() => setSelected(selected?.fdcId === food.fdcId ? null : food)}
              style={{
                padding:"14px 16px", borderRadius:12, cursor:"pointer", marginBottom:8,
                border:`2px solid ${selected?.name === food.name ? C.blue : C.border}`,
                background: selected?.name === food.name ? C.blueLight : C.white,
                transition:"all 0.15s",
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>
                    {food.name.length > 55 ? food.name.slice(0,55)+"..." : food.name}
                  </div>
                  {food.brand && <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{food.brand} · {food.serving}</div>}
                  {!food.brand && <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Per {food.serving}</div>}
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    {[
                      { label:"Calories", val:food.calories, unit:"kcal", color:C.text    },
                      { label:"Protein",  val:food.protein,  unit:"g",    color:C.blue    },
                      { label:"Carbs",    val:food.carbs,    unit:"g",    color:C.orange  },
                      { label:"Fat",      val:food.fat,      unit:"g",    color:C.purple  },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:800, color:m.color }}>{m.val}{m.unit === "kcal" ? "" : m.unit}</div>
                        <div style={{ fontSize:10, color:C.muted, fontWeight:600 }}>{m.label === "Calories" ? `${m.val} kcal` : m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quick add button */}
                <button onClick={e => { e.stopPropagation(); handleAdd(food); }} style={{
                  width:36, height:36, borderRadius:10, border:"none", flexShrink:0,
                  background: selected?.name === food.name ? C.blue : C.blueLight,
                  color: selected?.name === food.name ? C.white : C.blue,
                  fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.15s",
                }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer — custom qty + add */}
        {selected && (
          <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}`, background:C.greyLight, borderRadius:"0 0 20px 20px", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>
                  {selected.name.length > 40 ? selected.name.slice(0,40)+"..." : selected.name}
                </div>
                <div style={{ fontSize:12, color:C.muted }}>{Math.round(selected.calories * qty)} kcal · {Math.round(selected.protein * qty * 10)/10}g protein</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <label style={{ ...lbl, margin:0 }}>Qty</label>
                <input type="number" min="0.25" max="10" step="0.25" value={qty}
                  onChange={e => setQty(parseFloat(e.target.value) || 1)}
                  style={{ ...inpBase, width:70, textAlign:"center", padding:"8px 10px" }} />
              </div>
              <button onClick={() => handleAdd()} style={{ padding:"11px 24px", borderRadius:12, border:"none", background:C.blue, color:C.white, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:ff, boxShadow:C.shadowLg, whiteSpace:"nowrap" }}>
                Add to {meal} ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function NutritionLog() {
  const [log, setLog]           = useState(SEED_LOG);
  const [showSearch, setShowSearch] = useState(false);
  const [toast, setToast]       = useState(null);
  const [clientId, setClientId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  // ── Load today's log from Supabase ────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setClientId(user.id);
      loadLog(user.id);
    });
  }, []);

  async function loadLog(uid) {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("client_id", uid)
      .eq("logged_date", today)
      .order("created_at");

    if (error || !data?.length) return; // keep seed data on error/empty
    setLog(data.map(e => ({
      id:       e.id,
      meal:     e.meal,
      name:     e.food_name,
      calories: e.calories,
      protein:  e.protein_g,
      carbs:    e.carbs_g,
      fat:      e.fat_g,
      fiber:    e.fiber_g || 0,
      serving:  e.serving,
    })));
  }

  const removeEntry = async (id) => {
    setLog(p => p.filter(e => e.id !== id));
    showToast("Entry removed");
    await supabase.from("nutrition_logs").delete().eq("id", id);
  };

  const addEntry = async (food) => {
    setLog(p => [...p, food]);
    showToast(`✅ ${food.name.slice(0,30)}${food.name.length>30?"...":""} added to ${food.meal}`);

    if (clientId) {
      const { data } = await supabase.from("nutrition_logs").insert({
        client_id:   clientId,
        meal:        food.meal,
        food_name:   food.name,
        calories:    food.calories,
        protein_g:   food.protein,
        carbs_g:     food.carbs,
        fat_g:       food.fat,
        fiber_g:     food.fiber || 0,
        serving:     food.serving,
        logged_date: new Date().toISOString().split("T")[0],
      }).select().single();

      // Replace temp local ID with real DB ID
      if (data) {
        setLog(p => p.map(e => e.id === food.id ? { ...e, id: data.id } : e));
      }
    }
  };

  // Totals
  const totals = log.reduce((a,e) => ({
    calories: a.calories + e.calories,
    protein:  a.protein  + e.protein,
    carbs:    a.carbs    + e.carbs,
    fat:      a.fat      + e.fat,
    fiber:    a.fiber    + (e.fiber || 0),
  }), { calories:0, protein:0, carbs:0, fat:0, fiber:0 });

  const calPct   = Math.min(100, (totals.calories / GOALS.calories) * 100);
  const remaining = GOALS.calories - totals.calories;

  // Group by meal
  const byMeal = MEALS.reduce((acc, m) => {
    const entries = log.filter(e => e.meal === m);
    if (entries.length) acc[m] = entries;
    return acc;
  }, {});

  return (
    <div style={{ minHeight:"100vh", background:C.greyLight, fontFamily:ff }}>
      <style>{`* { box-sizing:border-box; } ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}`}</style>

      {/* Top nav */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:C.shadow }}>
        <img src={LOGO_B64} alt="Freddy Fit" style={{ height:30, width:"auto" }} />
        <div style={{ fontSize:13, color:C.muted, fontWeight:600 }}>
          {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
        </div>
      </div>

      <div style={{ padding:32, maxWidth:1100, margin:"0 auto" }}>

        {/* Page header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:26, fontWeight:900, color:C.text, letterSpacing:"-0.3px" }}>Nutrition Log</div>
            <div style={{ fontSize:14, color:C.muted, marginTop:4 }}>Track your food with 600,000+ foods from the USDA database</div>
          </div>
          <button onClick={() => setShowSearch(true)} style={{ padding:"12px 24px", borderRadius:12, border:"none", background:C.blue, color:C.white, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:ff, boxShadow:C.shadowLg, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>+</span> Log Food
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:24, alignItems:"start" }}>

          {/* ── LEFT: Targets ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Calorie ring */}
            <div style={{ background:C.white, borderRadius:16, padding:24, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:20 }}>Daily Targets</div>

              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24 }}>
                {/* Ring */}
                <div style={{ position:"relative", width:100, height:100, flexShrink:0 }}>
                  <svg width={100} height={100}>
                    <circle cx={50} cy={50} r={40} fill="none" stroke={C.border} strokeWidth={10}/>
                    <circle cx={50} cy={50} r={40} fill="none" stroke={remaining < 0 ? C.red : C.blue} strokeWidth={10}
                      strokeDasharray={`${2*Math.PI*40}`}
                      strokeDashoffset={`${2*Math.PI*40*(1-calPct/100)}`}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition:"stroke-dashoffset 0.5s" }}
                    />
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:20, fontWeight:900, color:C.text, lineHeight:1 }}>{totals.calories}</div>
                    <div style={{ fontSize:9, color:C.muted, fontWeight:700 }}>EATEN</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:13, color:C.muted }}>Daily Goal</div>
                  <div style={{ fontSize:22, fontWeight:900, color:C.text }}>{GOALS.calories} kcal</div>
                  <div style={{ fontSize:13, fontWeight:700, marginTop:4, color: remaining < 0 ? C.red : C.green }}>
                    {remaining < 0 ? `${Math.abs(remaining)} over` : `${remaining} remaining`}
                  </div>
                </div>
              </div>

              <MacroBar label="Protein" val={totals.protein} goal={GOALS.protein} color={C.blue}   />
              <MacroBar label="Carbs"   val={totals.carbs}   goal={GOALS.carbs}   color={C.orange} />
              <MacroBar label="Fat"     val={totals.fat}     goal={GOALS.fat}     color={C.purple} />
              <MacroBar label="Fiber"   val={totals.fiber}   goal={GOALS.fiber}   color={C.green}  />
            </div>

            {/* Macro summary tiles */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"Protein",  val:`${totals.protein}g`, sub:`${GOALS.protein}g goal`, color:C.blue,   bg:C.blueLight   },
                { label:"Carbs",    val:`${totals.carbs}g`,   sub:`${GOALS.carbs}g goal`,   color:C.orange, bg:C.orangeLight },
                { label:"Fat",      val:`${totals.fat}g`,     sub:`${GOALS.fat}g goal`,     color:C.purple, bg:C.purpleLight },
                { label:"Fiber",    val:`${totals.fiber}g`,   sub:`${GOALS.fiber}g goal`,   color:C.green,  bg:C.greenLight  },
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}22`, borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:11, color:C.muted, fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:10, color:s.color, fontWeight:600 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick add */}
            <div style={{ background:C.white, borderRadius:16, padding:20, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:14 }}>⚡ Quick Add</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {QUICK_FOODS.slice(0,4).map((f,i) => (
                  <div key={i} onClick={() => { addEntry({ id:Date.now(), meal:"Snack", ...f, fiber:f.fiber||0 }); }} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", borderRadius:10, cursor:"pointer",
                    background:C.greyLight, border:`1px solid ${C.border}`,
                    transition:"all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background=C.blueLight; e.currentTarget.style.borderColor=C.blue; }}
                    onMouseLeave={e => { e.currentTarget.style.background=C.greyLight; e.currentTarget.style.borderColor=C.border; }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{f.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>{f.calories} kcal · {f.protein}g protein</div>
                    </div>
                    <div style={{ width:28, height:28, borderRadius:8, background:C.blue, color:C.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, flexShrink:0 }}>+</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Food Log ── */}
          <div>
            {/* Search bar shortcut */}
            <div onClick={() => setShowSearch(true)} style={{
              background:C.white, borderRadius:14, padding:"14px 20px", marginBottom:20,
              border:`1.5px solid ${C.border}`, cursor:"text", display:"flex", alignItems:"center", gap:12,
              boxShadow:C.shadow, transition:"border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor=C.blue}
              onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
              <span style={{ fontSize:18 }}>🔍</span>
              <span style={{ color:C.muted, fontSize:14 }}>Search for a food (chicken breast, oatmeal, banana...)</span>
              <span style={{ marginLeft:"auto", fontSize:12, color:C.blue, fontWeight:700, background:C.blueLight, padding:"4px 12px", borderRadius:20 }}>Search 600k+ foods</span>
            </div>

            {/* Meal groups */}
            {Object.keys(byMeal).length === 0 ? (
              <div style={{ background:C.white, borderRadius:16, padding:48, textAlign:"center", border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🥗</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text }}>No food logged yet today</div>
                <div style={{ fontSize:13, color:C.muted, marginTop:6, marginBottom:20 }}>Search for foods above or use Quick Add</div>
                <button onClick={() => setShowSearch(true)} style={{ padding:"11px 24px", borderRadius:12, border:"none", background:C.blue, color:C.white, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:ff }}>
                  + Log Your First Food
                </button>
              </div>
            ) : (
              Object.entries(byMeal).map(([meal, entries]) => {
                const mealTotals = entries.reduce((a,e) => ({ cal:a.cal+e.calories, pro:a.pro+e.protein }), {cal:0,pro:0});
                return (
                  <div key={meal} style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, marginBottom:16, overflow:"hidden" }}>
                    {/* Meal header */}
                    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:C.greyLight }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <MealBadge meal={meal} />
                        <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>{mealTotals.cal} kcal · {mealTotals.pro}g protein</span>
                      </div>
                      <button onClick={() => setShowSearch(true)} style={{ padding:"5px 14px", borderRadius:20, border:`1px solid ${C.blue}`, background:C.blueLight, color:C.blue, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:ff }}>
                        + Add
                      </button>
                    </div>

                    {/* Entries */}
                    {entries.map((entry, i) => (
                      <div key={entry.id} style={{
                        display:"grid", gridTemplateColumns:"1fr 60px 70px 60px 50px 36px",
                        gap:8, padding:"13px 20px", alignItems:"center",
                        borderBottom: i < entries.length-1 ? `1px solid ${C.border}` : "none",
                        fontSize:13, transition:"background 0.1s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background=C.greyLight}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                        <div>
                          <div style={{ fontWeight:600, color:C.text }}>{entry.name}</div>
                          <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{entry.serving}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontWeight:800, color:C.text }}>{entry.calories}</div>
                          <div style={{ fontSize:10, color:C.muted }}>kcal</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontWeight:700, color:C.blue }}>{entry.protein}g</div>
                          <div style={{ fontSize:10, color:C.muted }}>protein</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontWeight:700, color:C.orange }}>{entry.carbs}g</div>
                          <div style={{ fontSize:10, color:C.muted }}>carbs</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontWeight:700, color:C.purple }}>{entry.fat}g</div>
                          <div style={{ fontSize:10, color:C.muted }}>fat</div>
                        </div>
                        <button onClick={() => removeEntry(entry.id)} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", cursor:"pointer", color:C.muted, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.color=C.red; e.currentTarget.style.borderColor=C.red; }}
                          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.muted; e.currentTarget.style.borderColor=C.border; }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })
            )}

            {/* Daily totals row */}
            {log.length > 0 && (
              <div style={{ background:C.text, borderRadius:14, padding:"16px 20px", display:"grid", gridTemplateColumns:"1fr 60px 70px 60px 50px 36px", gap:8, alignItems:"center", fontSize:13 }}>
                <div style={{ fontWeight:800, color:C.white }}>Daily Total</div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontWeight:900, color:C.blue, fontSize:16 }}>{totals.calories}</div>
                  <div style={{ fontSize:10, color:C.muted }}>kcal</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontWeight:800, color:C.blue }}>{totals.protein}g</div>
                  <div style={{ fontSize:10, color:C.muted }}>protein</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontWeight:800, color:C.orange }}>{totals.carbs}g</div>
                  <div style={{ fontSize:10, color:C.muted }}>carbs</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontWeight:800, color:C.purple }}>{totals.fat}g</div>
                  <div style={{ fontSize:10, color:C.muted }}>fat</div>
                </div>
                <div />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search modal */}
      {showSearch && <FoodSearchModal onClose={() => setShowSearch(false)} onAdd={addEntry} />}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:C.text, color:C.white, padding:"12px 24px", borderRadius:12, fontSize:14, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", zIndex:2000, whiteSpace:"nowrap", animation:"fadeUp 0.2s ease" }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {toast}
        </div>
      )}
    </div>
  );
}
