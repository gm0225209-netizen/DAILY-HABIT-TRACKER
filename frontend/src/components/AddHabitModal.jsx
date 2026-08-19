/*
  MODULE: AddHabitModal.jsx
  ---------------------------
  A single form reused for both creating a new habit and editing an
  existing one — controlled by whether `initialHabit` is passed in.
*/

import { useState } from "react";

const ICON_CHOICES = ["✅", "💧", "📖", "🏃", "🧘", "🥗", "😴", "✍️"];
const COLOR_CHOICES = ["#2F6F63", "#E8A33D", "#4F6FA3", "#A34F6F", "#7F9B4F"];

export default function AddHabitModal({ initialHabit, onSave, onClose }) {
  const [title, setTitle] = useState(initialHabit?.title || "");
  const [icon, setIcon] = useState(initialHabit?.icon || ICON_CHOICES[0]);
  const [color, setColor] = useState(initialHabit?.color || COLOR_CHOICES[0]);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the habit a name.");
      return;
    }
    onSave({ title: title.trim(), icon, color });
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.heading}>{initialHabit ? "Edit habit" : "New habit"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Name
            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drink 2L of water"
              autoFocus
            />
          </label>

          <div>
            <span style={styles.label}>Icon</span>
            <div style={styles.pillRow}>
              {ICON_CHOICES.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  style={{
                    ...styles.pill,
                    borderColor: icon === ic ? "var(--link-today)" : "var(--ink-700)",
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={styles.label}>Color</span>
            <div style={styles.pillRow}>
              {COLOR_CHOICES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    ...styles.swatch,
                    background: c,
                    outline: color === c ? "2px solid var(--paper-100)" : "none",
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}

          <div style={styles.actions}>
            <button type="button" style={styles.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.save}>{initialHabit ? "Save changes" : "Create habit"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
  },
  modal: {
    width: 380, background: "var(--ink-900)", border: "1px solid var(--ink-700)",
    borderRadius: "var(--radius-md)", padding: 24, boxShadow: "var(--shadow-card)",
  },
  heading: { fontSize: 18, marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  label: { fontSize: 12, color: "var(--paper-300)", display: "block", marginBottom: 6 },
  input: {
    width: "100%", background: "var(--ink-950)", border: "1px solid var(--ink-700)",
    borderRadius: "var(--radius-sm)", padding: "10px 12px", color: "var(--paper-100)", fontSize: 14,
  },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  pill: {
    background: "var(--ink-950)", border: "1px solid var(--ink-700)",
    borderRadius: "var(--radius-sm)", width: 36, height: 36, fontSize: 16,
  },
  swatch: { width: 28, height: 28, borderRadius: "50%", border: "none" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  cancel: { background: "none", border: "1px solid var(--ink-700)", color: "var(--paper-300)", borderRadius: "var(--radius-sm)", padding: "8px 14px" },
  save: { background: "var(--link-done)", border: "none", color: "var(--paper-100)", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontWeight: 600 },
};
