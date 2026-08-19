/*
  MODULE: AuthForm.jsx
  ---------------------
  Handles both sign-up and log-in behind one toggle. On success it
  stores the JWT in localStorage and calls onAuthed(user) so the parent
  (App.jsx) can switch to the Dashboard.
*/

import { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await loginUser(form.email, form.password)
          : await registerUser(form.name, form.email, form.password);

      localStorage.setItem("habit_tracker_token", result.token);
      onAuthed(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Don't break the chain.</h1>
        <p style={styles.subtitle}>
          {mode === "login" ? "Welcome back." : "Start your first chain today."}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <input
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChange={update("name")}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update("email")}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password (6+ characters)"
            value={form.password}
            onChange={update("password")}
            minLength={6}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button
          style={styles.toggle}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--ink-950)",
  },
  card: {
    width: 360,
    background: "var(--ink-900)",
    border: "1px solid var(--ink-700)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)",
    padding: "32px 28px",
  },
  title: { fontSize: 26, marginBottom: 6 },
  subtitle: { color: "var(--paper-300)", marginTop: 0, marginBottom: 24, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    background: "var(--ink-950)",
    border: "1px solid var(--ink-700)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    color: "var(--paper-100)",
    fontSize: 14,
  },
  submit: {
    marginTop: 6,
    background: "var(--link-done)",
    color: "var(--paper-100)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "11px 0",
    fontWeight: 600,
    fontSize: 14,
  },
  toggle: {
    background: "none",
    border: "none",
    color: "var(--paper-300)",
    fontSize: 13,
    marginTop: 16,
    padding: 0,
    textDecoration: "underline",
  },
  error: { color: "var(--danger)", fontSize: 13, margin: 0 },
};
