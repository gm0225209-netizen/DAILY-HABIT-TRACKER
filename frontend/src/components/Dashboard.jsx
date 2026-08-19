/*
  MODULE: Dashboard.jsx
  ------------------------
  The "smart" module: fetches habits, logs, and overview stats, and
  wires user actions (create/edit/delete/toggle) to the API. Everything
  visual is delegated to StatsPanel / HabitCard / AddHabitModal so this
  file stays focused on data flow, not markup.
*/

import { useEffect, useState, useCallback } from "react";
import {
  fetchHabits, createHabit, updateHabit, deleteHabit,
  toggleCheckin, fetchLogs, fetchOverview,
} from "../api";
import StatsPanel from "./StatsPanel";
import HabitCard from "./HabitCard";
import AddHabitModal from "./AddHabitModal";

export default function Dashboard({ user, onLogout }) {
  const [habits, setHabits] = useState([]);
  const [logsByHabit, setLogsByHabit] = useState({});   // { habitId: Set(dateStrings) }
  const [streaksByHabit, setStreaksByHabit] = useState({});
  const [overview, setOverview] = useState(null);
  const [modalHabit, setModalHabit] = useState(null);    // null | {} (new) | habit (edit)
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [habitList, overviewData] = await Promise.all([fetchHabits(), fetchOverview()]);
    setHabits(habitList);
    setOverview(overviewData);

    const logEntries = await Promise.all(habitList.map((h) => fetchLogs(h.id)));
    const logsMap = {};
    const streakMap = {};
    logEntries.forEach((logs, i) => {
      const dateSet = new Set(logs.map((l) => l.date));
      logsMap[habitList[i].id] = dateSet;
      streakMap[habitList[i].id] = computeCurrentStreak(dateSet);
    });
    setLogsByHabit(logsMap);
    setStreaksByHabit(streakMap);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleToggleDay(habitId, date) {
    await toggleCheckin(habitId, date);
    // optimistic-ish: just reload logs for that habit + overview
    const logs = await fetchLogs(habitId);
    const dateSet = new Set(logs.map((l) => l.date));
    setLogsByHabit((prev) => ({ ...prev, [habitId]: dateSet }));
    setStreaksByHabit((prev) => ({ ...prev, [habitId]: computeCurrentStreak(dateSet) }));
    setOverview(await fetchOverview());
  }

  async function handleSaveHabit(payload) {
    if (modalHabit?.id) {
      await updateHabit(modalHabit.id, payload);
    } else {
      await createHabit(payload);
    }
    setModalHabit(null);
    await loadAll();
  }

  async function handleDelete(habitId) {
    if (!confirm("Delete this habit and all its history?")) return;
    await deleteHabit(habitId);
    await loadAll();
  }

  if (loading) return <div style={styles.loading}>Loading your habits…</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Hi {user.name.split(" ")[0]} 👋</h1>
          <p style={styles.sub}>Keep the chain going.</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.newBtn} onClick={() => setModalHabit({})}>+ New habit</button>
          <button style={styles.logout} onClick={onLogout}>Log out</button>
        </div>
      </header>

      <StatsPanel overview={overview} />

      {habits.length === 0 ? (
        <div style={styles.empty}>
          <p>No habits yet. Start your first chain — add one above.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logDates={logsByHabit[habit.id] || new Set()}
              streak={streaksByHabit[habit.id] || 0}
              onToggleDay={handleToggleDay}
              onEdit={setModalHabit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalHabit !== null && (
        <AddHabitModal
          initialHabit={modalHabit.id ? modalHabit : null}
          onSave={handleSaveHabit}
          onClose={() => setModalHabit(null)}
        />
      )}
    </div>
  );
}

// mirrors the backend's streak logic for instant UI feedback
function computeCurrentStreak(dateSet) {
  let streak = 0;
  const cursor = new Date();
  if (!dateSet.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1); // allow "not done yet today"
  }
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const styles = {
  page: { maxWidth: 900, margin: "0 auto", padding: "40px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  h1: { fontSize: 28 },
  sub: { color: "var(--paper-300)", marginTop: 4 },
  headerActions: { display: "flex", gap: 10 },
  newBtn: { background: "var(--link-today)", border: "none", color: "var(--ink-950)", fontWeight: 700, borderRadius: "var(--radius-sm)", padding: "10px 16px" },
  logout: { background: "none", border: "1px solid var(--ink-700)", color: "var(--paper-300)", borderRadius: "var(--radius-sm)", padding: "10px 16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  empty: { border: "1px dashed var(--ink-700)", borderRadius: "var(--radius-md)", padding: 40, textAlign: "center", color: "var(--paper-300)" },
  loading: { color: "var(--paper-300)", textAlign: "center", marginTop: 100 },
};
