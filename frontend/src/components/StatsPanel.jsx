/*
  MODULE: StatsPanel.jsx
  -------------------------
  The top summary strip: how many habits total, how many done today,
  and the best streak across everything. Pulled from /analytics/overview.
  Purely presentational — receives `overview` as a prop.
*/

export default function StatsPanel({ overview }) {
  if (!overview) return null;

  const items = [
    { label: "Habits tracked", value: overview.total_habits },
    { label: "Done today", value: `${overview.done_today}/${overview.total_habits}` },
    { label: "Best streak", value: `${overview.best_streak_overall}d` },
  ];

  return (
    <div style={styles.row}>
      {items.map((item) => (
        <div key={item.label} style={styles.stat}>
          <div style={styles.value}>{item.value}</div>
          <div style={styles.label}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: { display: "flex", gap: 24, marginBottom: 28 },
  stat: {
    background: "var(--ink-900)",
    border: "1px solid var(--ink-700)",
    borderRadius: "var(--radius-md)",
    padding: "14px 22px",
    minWidth: 120,
  },
  value: { fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--link-today)" },
  label: { fontSize: 12, color: "var(--paper-300)", marginTop: 4 },
};
