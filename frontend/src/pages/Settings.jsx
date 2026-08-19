import React, { useState } from "react";
import { Settings as SettingsIcon, Bell, Moon, Sun, Clock, Calendar, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Settings = () => {
  const { settings, updateUserSettings } = useAuth();

  const [theme, setTheme] = useState(settings?.theme || "dark");
  const [notificationEnabled, setNotificationEnabled] = useState(settings?.notification_enabled ?? true);
  const [reminderEnabled, setReminderEnabled] = useState(settings?.reminder_enabled ?? true);
  const [timeFormat, setTimeFormat] = useState(settings?.time_format || "12h");
  const [dateFormat, setDateFormat] = useState(settings?.date_format || "YYYY-MM-DD");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);

      const res = await updateUserSettings({
        theme,
        notification_enabled: notificationEnabled,
        reminder_enabled: reminderEnabled,
        time_format: timeFormat,
        date_format: dateFormat,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Customize UI theme, notification reminders, and display formats
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Preferences updated and applied immediately!</span>
        </div>
      )}

      {/* Theme Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Interface Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose between dark aesthetic or crisp daylight mode</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
              theme === "dark"
                ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-slate-900 dark:text-white font-bold ring-2 ring-blue-500"
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <span className="text-sm block font-bold">Dark Theme</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">OLED midnight mode</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
              theme === "light"
                ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-slate-900 dark:text-white font-bold ring-2 ring-blue-500"
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <span className="text-sm block font-bold">Light Theme</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Clean crisp daylight</span>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications & Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control reminder notifications and milestone banners</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">In-App Notifications</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive badges, achievement alerts, and streak updates</p>
            </div>
            <input
              type="checkbox"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Daily Habit Reminders</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled reminders for habits configured with reminder times</p>
            </div>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Formatting & Localization */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Format & Localization</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose preferred time and date representations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Time Format
            </label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12h">12-Hour Format (e.g. 08:30 PM)</option>
              <option value="24h">24-Hour Format (e.g. 20:30)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-18)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (18/08/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (08/18/2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-95 flex items-center space-x-2"
        >
          {saving ? <span>Saving Settings...</span> : <span>Save All Settings</span>}
        </button>
      </div>
    </div>
  );
};
