import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Flame,
  Trophy,
  Target,
  Award,
  Sparkles,
  ArrowUpRight,
  Plus,
  Check,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { dashboardApi, trackingApi } from "../services/api";
import { CircularProgress } from "../components/CircularProgress";
import { ProgressBar } from "../components/ProgressBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import confetti from "canvas-confetti";

export const Dashboard = () => {
  const { onOpenCreateHabit } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getDashboard();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleHabitUpdate = () => fetchDashboard();
    window.addEventListener("habit_updated", handleHabitUpdate);
    return () => window.removeEventListener("habit_updated", handleHabitUpdate);
  }, []);

  const handleToggleHabit = async (habitId, currentCompleted) => {
    if (togglingId) return;
    setTogglingId(habitId);

    try {
      if (!currentCompleted) {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.75 },
        });
      }

      await trackingApi.toggleCompletion({
        habit_id: habitId,
        completed: !currentCompleted,
      });

      await fetchDashboard();
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Preparing your habits dashboard..." size="lg" />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    user,
    today_date_formatted,
    stats,
    today_habits = [],
    weekly_progress = [],
    recent_achievements = [],
    active_goals = [],
  } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good day, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {today_date_formatted || new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <button
          onClick={onOpenCreateHabit}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-150 active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Habits Card */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Habits
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_habits || 0}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {stats?.completed_habits || 0} completed · {stats?.pending_habits || 0} pending
          </div>
        </div>

        {/* Completion Rate with Circular meter */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Today's Score
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {stats?.completion_percentage || 0}%
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              Daily Target
            </span>
          </div>
          <div className="shrink-0">
            <CircularProgress
              percentage={stats?.completion_percentage || 0}
              size={64}
              strokeWidth={6}
              color="#10B981"
            />
          </div>
        </div>

        {/* Current Streak */}
        <div className="glass-card rounded-3xl p-5 border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-gradient-to-br dark:from-amber-500/10 dark:to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Active Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500 dark:fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.current_streak || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">days in a row</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400/90 font-semibold">Keep the fire burning! 🔥</div>
        </div>

        {/* Longest Streak */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Best Record
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.longest_streak || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">days max</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">All-time record</div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Today's Habits (Left) + Weekly Chart & Goals (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Actionable Habits List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Today's Habits</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  {stats?.completed_habits || 0}/{stats?.total_habits || 0} Done
                </span>
              </h2>
            </div>

            <Link
              to="/habits"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 group"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {today_habits.length === 0 ? (
            <EmptyState
              title="No active habits for today"
              description="Create your first habit to start building streaks and achieving goals."
              actionText="Create Habit"
              onAction={onOpenCreateHabit}
            />
          ) : (
            <div className="space-y-3">
              {today_habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`glass-card rounded-2xl p-4 border transition-all flex items-center justify-between ${
                    habit.completed
                      ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <button
                      onClick={() => handleToggleHabit(habit.id, habit.completed)}
                      disabled={togglingId === habit.id}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        habit.completed
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div>
                      <h4
                        className={`text-sm font-bold transition-colors ${
                          habit.completed
                            ? "text-slate-500 dark:text-slate-400 line-through"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {habit.category}
                        </span>
                        {habit.reminder_time && (
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            {habit.reminder_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {habit.current_streak > 0 && (
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 dark:fill-orange-400" />
                      <span>{habit.current_streak}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Trend Chart & Active Goals */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weekly Bar Chart */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Completion Rate</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Habits checked off past 7 days</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                {stats?.weekly_rate || 0}% avg
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly_progress} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs shadow-xl">
                            <p className="font-bold text-slate-900 dark:text-white">{d.day} ({d.date})</p>
                            <p className="text-blue-600 dark:text-blue-400 mt-1 font-semibold">Completed: {d.completed} / {d.total}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold">Rate: {d.rate}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {weekly_progress.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate >= 80 ? "#10B981" : entry.rate >= 50 ? "#3B82F6" : "#F59E0B"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Goals Section */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Goals</h3>
              </div>
              <Link to="/goals" className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-bold">
                View all
              </Link>
            </div>

            {active_goals.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No active goals. Set one in Goals tab!</p>
            ) : (
              <div className="space-y-4">
                {active_goals.map((goal) => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {goal.title}
                      </span>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        {goal.progress} / {goal.target} {goal.unit} ({goal.percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      progress={goal.progress}
                      max={goal.target}
                      color="bg-gradient-to-r from-purple-500 to-indigo-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Badges / Achievements */}
          {recent_achievements.length > 0 && (
            <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Badges Earned
                  </h3>
                </div>
                <Link to="/achievements" className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline">
                  Trophies
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {recent_achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 flex items-center space-x-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{ach.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{ach.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
