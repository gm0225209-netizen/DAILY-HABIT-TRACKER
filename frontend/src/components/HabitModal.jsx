import React, { useState, useEffect } from "react";
import { X, Check, Dumbbell, BookOpen, Droplets, Brain, Code2, Wallet, Sparkles, Sun, Moon, CheckCircle2 } from "lucide-react";
import { habitsApi } from "../services/api";

const COLOR_PRESETS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#6366F1", // Indigo
];

const ICON_PRESETS = [
  { name: "CheckCircle2", icon: CheckCircle2 },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "BookOpen", icon: BookOpen },
  { name: "Droplets", icon: Droplets },
  { name: "Brain", icon: Brain },
  { name: "Code2", icon: Code2 },
  { name: "Wallet", icon: Wallet },
  { name: "Sparkles", icon: Sparkles },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
];

const CATEGORIES = [
  "Fitness",
  "Health",
  "Productivity",
  "Mindfulness",
  "Learning",
  "Finance",
  "Lifestyle",
  "General",
];

export const HabitModal = ({ isOpen, onClose, habitToEdit, onSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Fitness",
    frequency: "daily",
    priority: "Medium",
    target: 1,
    reminder_time: "08:00",
    color: "#3B82F6",
    icon: "CheckCircle2",
    start_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (habitToEdit) {
      setFormData({
        name: habitToEdit.name || "",
        description: habitToEdit.description || "",
        category: habitToEdit.category || "Fitness",
        frequency: habitToEdit.frequency || "daily",
        priority: habitToEdit.priority || "Medium",
        target: habitToEdit.target || 1,
        reminder_time: habitToEdit.reminder_time || "",
        color: habitToEdit.color || "#3B82F6",
        icon: habitToEdit.icon || "CheckCircle2",
        start_date: habitToEdit.start_date || new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "Fitness",
        frequency: "daily",
        priority: "Medium",
        target: 1,
        reminder_time: "08:00",
        color: "#3B82F6",
        icon: "CheckCircle2",
        start_date: new Date().toISOString().split("T")[0],
      });
    }
    setError("");
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a habit name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (habitToEdit) {
        await habitsApi.updateHabit(habitToEdit.id, formData);
      } else {
        await habitsApi.createHabit(formData);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {habitToEdit ? "Edit Habit" : "Create New Habit"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Define your daily rhythm and consistent milestones
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Morning 30-min Jogging"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Why this habit matters to your goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Frequency Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["High", "Medium", "Low"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`py-2 text-xs rounded-xl border transition-all ${
                      formData.priority === p
                        ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-400 font-bold"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reminder Time & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={formData.reminder_time}
                onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Days</option>
              </select>
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    formData.color === c ? "scale-125 ring-2 ring-slate-900 dark:ring-white shadow-lg" : "hover:scale-110 opacity-85"
                  }`}
                >
                  {formData.color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Icon
            </label>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {ICON_PRESETS.map(({ name, icon: IconComp }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={`p-2.5 rounded-xl flex items-center justify-center border transition-all ${
                    formData.icon === name
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30 scale-105"
                      : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-150 active:scale-95 flex items-center space-x-2"
            >
              {loading ? <span>Saving...</span> : <span>{habitToEdit ? "Save Changes" : "Create Habit"}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
