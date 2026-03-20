import { useState, useEffect, useRef } from "react";
import "./Calendar.css";

const STORAGE_KEY = "freddyfit-calendar-events";

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/* ── date helpers ── */
function fmt(d) {
  return d.toISOString().slice(0, 10);
}
function pretty(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function weekday(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
  });
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function startOfWeek(d) {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

/* ── natural-language date parser ── */
function parseMessage(text) {
  const cleaned = text.trim();

  // Try patterns like "on 12/31/2026 I have a dentist" or "12/31/2026 dentist appointment"
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(?:on\s+)?(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(?:i have\s+(?:a\s+)?|i got\s+(?:a\s+)?|there(?:'s| is)\s+(?:a\s+)?|add\s+)?(.+)/i,
    // "dentist on 12/31/2026"
    /(.+?)\s+(?:on|for)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
    // YYYY-MM-DD
    /(?:on\s+)?(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(?:i have\s+(?:a\s+)?|i got\s+(?:a\s+)?|there(?:'s| is)\s+(?:a\s+)?|add\s+)?(.+)/i,
    // "tomorrow ...", "next monday ..."
  ];

  // Pattern 1: date then description (MM/DD/YYYY ... description)
  let m = cleaned.match(datePatterns[0]);
  if (m) {
    const [, mo, da, yr, desc] = m;
    const date = `${yr}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`;
    if (!isNaN(new Date(date + "T00:00:00").getTime())) {
      return { date, title: capitalize(desc.trim()) };
    }
  }

  // Pattern 2: description then date
  m = cleaned.match(datePatterns[1]);
  if (m) {
    const [, desc, mo, da, yr] = m;
    const date = `${yr}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`;
    if (!isNaN(new Date(date + "T00:00:00").getTime())) {
      return { date, title: capitalize(desc.trim()) };
    }
  }

  // Pattern 3: YYYY-MM-DD format
  m = cleaned.match(datePatterns[2]);
  if (m) {
    const [, yr, mo, da, desc] = m;
    const date = `${yr}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`;
    if (!isNaN(new Date(date + "T00:00:00").getTime())) {
      return { date, title: capitalize(desc.trim()) };
    }
  }

  // Relative dates: "tomorrow", "next monday", etc.
  const today = new Date();
  const lower = cleaned.toLowerCase();

  if (lower.startsWith("tomorrow")) {
    const desc = cleaned.replace(/^tomorrow\s*/i, "").replace(/^i have\s+(?:a\s+)?/i, "");
    if (desc) return { date: fmt(addDays(today, 1)), title: capitalize(desc.trim()) };
  }
  if (lower.startsWith("today")) {
    const desc = cleaned.replace(/^today\s*/i, "").replace(/^i have\s+(?:a\s+)?/i, "");
    if (desc) return { date: fmt(today), title: capitalize(desc.trim()) };
  }

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const nextDayMatch = lower.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+(.+)/i);
  if (nextDayMatch) {
    const targetDay = dayNames.indexOf(nextDayMatch[1].toLowerCase());
    const currentDay = today.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7;
    const desc = nextDayMatch[2].replace(/^i have\s+(?:a\s+)?/i, "");
    return { date: fmt(addDays(today, diff)), title: capitalize(desc.trim()) };
  }

  return null;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Main Component ── */
export default function Calendar() {
  const [events, setEvents] = useState(loadEvents);
  const [chatMessages, setChatMessages] = useState([
    {
      from: "bot",
      text: 'Hi! Tell me about your upcoming events. Try saying "On 12/31/2026 I have a dentist appointment" and I\'ll add it to your calendar.',
    },
  ]);
  const [input, setInput] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const chatEndRef = useRef(null);

  useEffect(() => saveEvents(events), [events]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ── chat handler ── */
  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setChatMessages((prev) => [...prev, { from: "user", text: userMsg }]);

    // Check for delete/remove commands
    const deleteMatch = userMsg.match(
      /(?:delete|remove|cancel)\s+(?:the\s+)?(.+?)(?:\s+on\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}))?$/i
    );
    if (deleteMatch && deleteMatch[2]) {
      const [, desc, mo, da, yr] = deleteMatch;
      const date = `${yr}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`;
      const before = events.length;
      const filtered = events.filter(
        (ev) => !(ev.date === date && ev.title.toLowerCase().includes(desc.toLowerCase().trim()))
      );
      if (filtered.length < before) {
        setEvents(filtered);
        setChatMessages((prev) => [
          ...prev,
          { from: "bot", text: `Done! Removed "${desc.trim()}" from ${pretty(date)}.` },
        ]);
        return;
      }
    }

    const parsed = parseMessage(userMsg);
    if (parsed) {
      const newEvent = { id: Date.now(), date: parsed.date, title: parsed.title };
      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
      setChatMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `Got it! Added "${parsed.title}" on ${pretty(parsed.date)} to your calendar.`,
        },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: 'I couldn\'t quite understand that. Try something like:\n• "On 3/25/2026 I have a team meeting"\n• "Dentist appointment on 4/15/2026"\n• "Tomorrow gym session"\n• "Delete dentist on 12/31/2026"',
        },
      ]);
    }
  }

  /* ── weekly view data ── */
  const weekDays = Array.from({ length: 7 }, (_, i) => fmt(addDays(currentWeekStart, i)));
  const weekEvents = weekDays.map((d) => ({
    date: d,
    events: events.filter((ev) => ev.date === d),
  }));

  /* ── 60-day view data ── */
  const today = fmt(new Date());
  const sixtyDaysOut = fmt(addDays(new Date(), 60));
  const upcoming = events.filter((ev) => ev.date >= today && ev.date <= sixtyDaysOut);

  // Group upcoming by month
  const upcomingByMonth = {};
  upcoming.forEach((ev) => {
    const monthKey = ev.date.slice(0, 7);
    if (!upcomingByMonth[monthKey]) upcomingByMonth[monthKey] = [];
    upcomingByMonth[monthKey].push(ev);
  });

  function deleteEvent(id) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  const isToday = (d) => d === today;

  return (
    <div className="cal-page">
      {/* ── Left: Calendar Views ── */}
      <div className="cal-main">
        <header className="cal-header">
          <h1>FreddyFit Calendar</h1>
          <p className="cal-subtitle">Your schedule at a glance</p>
        </header>

        {/* Weekly Agenda */}
        <section className="cal-section">
          <div className="cal-section-header">
            <h2>Weekly Agenda</h2>
            <div className="cal-week-nav">
              <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
                &larr; Prev
              </button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date()))}>Today</button>
              <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
                Next &rarr;
              </button>
            </div>
          </div>

          <div className="cal-week-grid">
            {weekEvents.map(({ date, events: dayEvents }) => (
              <div key={date} className={`cal-day-card ${isToday(date) ? "cal-today" : ""}`}>
                <div className="cal-day-label">
                  <span className="cal-day-name">{weekday(date)}</span>
                  <span className="cal-day-date">
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {dayEvents.length === 0 ? (
                  <p className="cal-no-events">No events</p>
                ) : (
                  dayEvents.map((ev) => (
                    <div key={ev.id} className="cal-event-chip">
                      <span>{ev.title}</span>
                      <button className="cal-delete-btn" onClick={() => deleteEvent(ev.id)} title="Delete">
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 60-Day Upcoming */}
        <section className="cal-section">
          <h2>Coming Up (Next 60 Days)</h2>
          {upcoming.length === 0 ? (
            <p className="cal-empty">No upcoming events. Use the chat to add some!</p>
          ) : (
            Object.entries(upcomingByMonth).map(([monthKey, monthEvents]) => (
              <div key={monthKey} className="cal-month-group">
                <h3 className="cal-month-label">
                  {new Date(monthKey + "-01T00:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="cal-upcoming-list">
                  {monthEvents.map((ev) => (
                    <div key={ev.id} className="cal-upcoming-item">
                      <div className="cal-upcoming-date">
                        <span className="cal-upcoming-day">
                          {new Date(ev.date + "T00:00:00").getDate()}
                        </span>
                        <span className="cal-upcoming-weekday">{weekday(ev.date).slice(0, 3)}</span>
                      </div>
                      <div className="cal-upcoming-title">{ev.title}</div>
                      <button className="cal-delete-btn" onClick={() => deleteEvent(ev.id)} title="Delete">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* ── Right: Chatbot ── */}
      <aside className="cal-chat">
        <div className="cal-chat-header">
          <h2>Calendar Assistant</h2>
        </div>
        <div className="cal-chat-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`cal-chat-bubble cal-chat-${msg.from}`}>
              {msg.text.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form className="cal-chat-input" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. On 4/15/2026 I have a dentist..."
          />
          <button type="submit">Send</button>
        </form>
      </aside>
    </div>
  );
}
