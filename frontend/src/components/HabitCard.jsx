import React, { useState } from "react";
import {
  Check,
  Flame,
  Clock,
  MoreVertical,
  Edit2,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  Dumbbell,
  BookOpen,
  Droplets,
  Brain,
  Code2,
  Wallet,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";

const ICON_MAP = {
  CheckCircle2,
  Dumbbell,
  BookOpen,
  Droplets,
  Brain,
  Code2,
  Wallet,
  Sparkles,
  Sun,
  Moon,
};

export const HabitCard = ({
  habit,
  isCompleted = false,
  streak = 0,
  onToggle,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const IconComponent = ICON_MAP[habit.icon] || CheckCircle2;

  const handleCheckClick = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      if (!isCompleted) {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: [habit.color || "#3B82F6", "#10B981", "#F59E0B"],
        });
      }
      await onToggle(habit.id);
    } finally {
      setIsToggling(false);
    }
  };

  const priorityColors = {
    High: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all duration-300 relative group hover:shadow-lg ${
        isCompleted
          ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/10"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3.5">
          {/* Icon Badge */}
          <div
            style={{
              backgroundColor: `${habit.color}15`,
              color: habit.color,
              borderColor: `${habit.color}35`,
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3
                className={`font-bold text-base leading-tight transition-colors ${
                  isCompleted
                    ? "text-slate-500 dark:text-slate-400 line-through opacity-85"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {habit.name}
              </h3>
            </div>

            {habit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {habit.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Category */}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                {habit.category}
              </span>

              {/* Priority */}
              {habit.priority && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                    priorityColors[habit.priority] || priorityColors.Medium
                  }`}
                >
                  {habit.priority}
                </span>
              )}

              {/* Reminder Time */}
              {habit.reminder_time && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {habit.reminder_time}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Toggle Button & Options Menu */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 dark:fill-orange-400 text-orange-500 dark:text-orange-400" />
              <span>{streak}</span>
            </div>
          )}

          {/* Quick Complete Toggle Button */}
          {habit.status === "active" && (
            <button
              onClick={handleCheckClick}
              disabled={isToggling}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm ${
                isCompleted
                  ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/40"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-20 py-1.5 animate-fade-in text-xs font-semibold">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(habit);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Habit</span>
                  </button>

                  {habit.status === "active" ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onStatusChange(habit.id, "paused");
                      }}
                      className="w-full px-4 py-2 text-left text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Pause Habit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onStatusChange(habit.id, "active");
                      }}
                      className="w-full px-4 py-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume Habit</span>
                    </button>
                  )}

                  {habit.status !== "archived" && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onStatusChange(habit.id, "archived");
                      }}
                      className="w-full px-4 py-2 text-left text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(habit);
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Habit</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
