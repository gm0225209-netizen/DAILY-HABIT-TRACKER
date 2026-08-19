/*
  MODULE: HeatmapCalendar.jsx
  ------------------------------
  A 90-day grid (13 weeks x 7 days), GitHub-contributions style, for
  the habit-detail view. Separate from ChainStrip (which is the compact
  7-day interactive control on the dashboard card) — this one is a
  read-only, longer-range overview.

  Props:
    heatmap: { "2026-08-18": true, ... }  (from /analytics/habits/:id)
    color: hex accent for "done" cells
*/

function buildWeeks(heatmap) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 90 + 1);
  // align to the most recent Sunday on/before `start`
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let cursor = new Date(start);
  while (cursor <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: iso, done: !!heatmap[iso], future: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function HeatmapCalendar({ heatmap, color = "var(--link-done)" }) {
  const weeks = buildWeeks(heatmap);

  return (
    <div style={{ display: "flex", gap: 3, overflowX: "auto", padding: "4px 0" }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {week.map((day) => (
            <div
              key={day.date}
              title={day.date}
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                background: day.future ? "transparent" : day.done ? color : "var(--ink-700)",
                opacity: day.future ? 0 : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
