import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, profileApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    theme: "dark",
    notification_enabled: true,
    reminder_enabled: true,
    time_format: "12h",
    date_format: "YYYY-MM-DD",
  });
  const [token, setToken] = useState(localStorage.getItem("habit_tracker_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (settings?.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [settings?.theme]);

  // Load current user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("habit_tracker_token");
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data?.success) {
            setUser(res.data.data.user);
            if (res.data.data.settings) {
              setSettings(res.data.data.settings);
            }
          }
        } catch (err) {
          console.error("Auth initialization failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.success) {
      const { user: userData, settings: userSettings, token: authToken } = res.data.data;
      setUser(userData);
      if (userSettings) setSettings(userSettings);
      setToken(authToken);
      localStorage.setItem("habit_tracker_token", authToken);
      localStorage.setItem("habit_tracker_user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: res.data?.message || "Login failed" };
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data?.success) {
      const { user: userData, settings: userSettings, token: authToken } = res.data.data;
      setUser(userData);
      if (userSettings) setSettings(userSettings);
      setToken(authToken);
      localStorage.setItem("habit_tracker_token", authToken);
      localStorage.setItem("habit_tracker_user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: res.data?.message || "Registration failed" };
  };

  const logout = () => {
    try {
      authApi.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("habit_tracker_token");
      localStorage.removeItem("habit_tracker_user");
    }
  };

  const updateProfileData = async (data) => {
    const res = await profileApi.updateProfile(data);
    if (res.data?.success) {
      setUser(res.data.data);
      localStorage.setItem("habit_tracker_user", JSON.stringify(res.data.data));
      return { success: true, user: res.data.data };
    }
    return { success: false, message: res.data?.message };
  };

  const updateUserSettings = async (data) => {
    const res = await profileApi.updateSettings(data);
    if (res.data?.success) {
      setSettings(res.data.data);
      return { success: true, settings: res.data.data };
    }
    return { success: false, message: res.data?.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfileData,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
