import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api`
  : "/api";

const api = axios.create({
  baseURL: apiBase,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("habit_tracker_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if expired
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        localStorage.removeItem("habit_tracker_token");
        localStorage.removeItem("habit_tracker_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API Methods organized by module
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

export const dashboardApi = {
  getDashboard: () => api.get("/dashboard"),
};

export const habitsApi = {
  getHabits: (params) => api.get("/habits", { params }),
  getHabit: (id) => api.get(`/habits/${id}`),
  createHabit: (data) => api.post("/habits", data),
  updateHabit: (id, data) => api.put(`/habits/${id}`, data),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  updateStatus: (id, status) => api.patch(`/habits/${id}/status`, { status }),
};

export const trackingApi = {
  toggleCompletion: (data) => api.post("/tracking", data),
  getToday: () => api.get("/tracking/today"),
  getHistory: (params) => api.get("/tracking/history", { params }),
  updateRecord: (id, data) => api.put(`/tracking/${id}`, data),
};

export const streaksApi = {
  getUserStreaks: () => api.get("/streaks"),
  getHabitStreak: (habitId) => api.get(`/streaks/${habitId}`),
};

export const calendarApi = {
  getCalendar: (year, month) => {
    if (year && month) {
      return api.get(`/calendar/${year}/${month}`);
    }
    return api.get("/calendar");
  },
};

export const analyticsApi = {
  getWeekly: () => api.get("/analytics/weekly"),
  getMonthly: () => api.get("/analytics/monthly"),
  getHabitsComparison: () => api.get("/analytics/habits"),
};

export const progressApi = {
  getOverview: () => api.get("/progress"),
  getHabitProgress: (habitId) => api.get(`/progress/${habitId}`),
};

export const goalsApi = {
  getGoals: (status) => api.get("/goals", { params: { status } }),
  getGoal: (id) => api.get(`/goals/${id}`),
  createGoal: (data) => api.post("/goals", data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  updateProgress: (id, payload) => api.patch(`/goals/${id}/progress`, payload),
};

export const achievementsApi = {
  getAll: () => api.get("/achievements"),
  getUserEarned: () => api.get("/achievements/user"),
};

export const notificationsApi = {
  getNotifications: () => api.get("/notifications"),
  createNotification: (data) => api.post("/notifications", data),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const insightsApi = {
  getInsights: () => api.get("/insights"),
};

export const profileApi = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data) => api.put("/profile", data),
  getSettings: () => api.get("/settings"),
  updateSettings: (data) => api.put("/settings", data),
};

export default api;
