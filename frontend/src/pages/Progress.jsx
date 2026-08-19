import React, { useState, useEffect } from "react";
import { TrendingUp, CheckCircle2, Target, Clock, Zap } from "lucide-react";
import { progressApi } from "../services/api";
import { CircularProgress } from "../components/CircularProgress";
import { ProgressBar } from "../components/ProgressBar";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Progress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await progressApi.getOverview();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Calculating progress gauges..." size="lg" />;
  }

  const { today, goals } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Progress Visualizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Real-time daily gauges, target progress meters, and habit completion efficiency
        </p>
      </div>

      {/* Hero Progress Gauge */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 flex justify-center">
          <CircularProgress
            percentage={today?.completion_percentage || 0}
            size={160}
            strokeWidth={14}
            color="#3B82F6"
            trackColor="currentColor"
            subtitle="Today's Target"
          />
        </div>

        <div className="md:col-span-8 space-y-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Daily Rhythm
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {today?.completed_habits} of {today?.total_habits} Habits Completed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {today?.completion_percentage >= 100
                ? "🏆 Spectacular job! You've checked off 100% of your scheduled habits today."
                : today?.completion_percentage >= 50
                ? "⚡ Great momentum! You're more than halfway through your daily goals."
                : "🚀 Time to build momentum! Complete your top priority habits to close the gap."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Done</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{today?.completed_habits}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Pending</span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{today?.pending_habits}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Goal Avg</span>
              <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{goals?.average_percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habit-by-Habit Progress Meters */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Habit Efficiency Gauges</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current status and fulfillment level for active routines</p>
        </div>

        <div className="space-y-4">
          {today?.habits_progress?.map((h) => (
            <div
              key={h.habit_id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    style={{ backgroundColor: `${h.color}15`, color: h.color }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                  >
                    {h.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{h.category} · Priority: {h.priority}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-extrabold ${
                      h.completed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {h.percentage}%
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      h.completed
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400"
                        : "bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {h.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>

              <ProgressBar
                progress={h.progress}
                max={1}
                color={h.completed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
