/*
  MODULE: api.js
  ---------------
  The ONLY file in the frontend that knows the backend's URLs. Every
  component imports functions from here instead of calling fetch()
  directly — so if the API shape changes, this is the one file to edit.
*/

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("habit_tracker_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ---- Auth ----
export const registerUser = (name, email, password) =>
  request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const loginUser = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const fetchMe = () => request("/auth/me");

// ---- Habits ----
export const fetchHabits = () => request("/habits");

export const createHabit = (habit) =>
  request("/habits", { method: "POST", body: JSON.stringify(habit) });

export const updateHabit = (id, patch) =>
  request(`/habits/${id}`, { method: "PUT", body: JSON.stringify(patch) });

export const deleteHabit = (id) =>
  request(`/habits/${id}`, { method: "DELETE" });

export const toggleCheckin = (id, date) =>
  request(`/habits/${id}/toggle`, { method: "POST", body: JSON.stringify({ date }) });

export const fetchLogs = (id) => request(`/habits/${id}/logs`);

// ---- Analytics ----
export const fetchHabitStats = (id) => request(`/analytics/habits/${id}`);
export const fetchOverview = () => request("/analytics/overview");
