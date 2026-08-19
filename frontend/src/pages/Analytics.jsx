import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  PieChart as PieChartIcon,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { analyticsApi } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

const CATEGORY_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#6366F1", // Indigo
];

export const Analytics = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [habitsData, setHabitsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [weeklyRes, monthlyRes, habitsRes] = await Promise.all([
        analyticsApi.getWeekly(),
        analyticsApi.getMonthly(),
        analyticsApi.getHabitsComparison(),
      ]);

      if (weeklyRes.data?.success) setWeeklyData(weeklyRes.data.data);
      if (monthlyRes.data?.success) setMonthlyData(monthlyRes.data.data);
      if (habitsRes.data?.success) setHabitsData(habitsRes.data.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing habit performance metrics..." size="lg" />;
  }

  const { most_successful, least_successful, category_breakdown = [], habits = [] } = habitsData || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Performance & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Deep behavioral insights, habit comparison, and trajectory analytics
        </p>
      </div>

      {/* Top Highlights Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Most Consistent Habit */}
        <div className="glass-card rounded-3xl p-5 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Top Performer
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {most_successful?.name || "None yet"}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
              {most_successful ? `${most_successful.completion_rate_30d}% 30-day rate` : "Keep tracking"}
            </p>
          </div>
        </div>

        {/* Needs Attention Habit */}
        <div className="glass-card rounded-3xl p-5 border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-gradient-to-br dark:from-amber-500/10 dark:to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Needs Focus
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {least_successful?.name || "All habits on track!"}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-0.5">
              {least_successful ? `${least_successful.completion_rate_30d}% 30-day rate` : "Great balance"}
            </p>
          </div>
        </div>

        {/* Monthly Rate */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              30-Day Adherence
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {monthlyData?.monthly_rate || 0}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">overall</span>
          </div>
        </div>

        {/* Trend Growth */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Weekly Trajectory
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span
              className={`text-3xl font-extrabold ${
                (weeklyData?.trend_difference || 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {(weeklyData?.trend_difference || 0) >= 0 ? `+${weeklyData?.trend_difference}%` : `${weeklyData?.trend_difference}%`}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">vs prior week</span>
          </div>
        </div>
      </div>

      {/* 30-Day Area Chart Trend */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">30-Day Completion Trend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daily consistency trajectory over the past month</p>
          </div>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-500/20">
            {monthlyData?.total_completed || 0} Total Check-ins
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData?.daily_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs shadow-xl">
                        <p className="font-bold text-slate-900 dark:text-white">{d.day} ({d.date})</p>
                        <p className="text-blue-600 dark:text-blue-400 mt-1 font-bold">Daily Rate: {d.rate}%</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Habits Done: {d.completed}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Comparison & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Habit Comparison Bar Chart */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Habit Adherence Comparison</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">30-day completion rate per individual habit</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={habits}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs shadow-xl">
                          <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                          <p className="text-blue-600 dark:text-blue-400 mt-1 font-bold">30-Day Rate: {d.completion_rate_30d}%</p>
                          <p className="text-amber-600 dark:text-amber-400 font-semibold">Streak: {d.current_streak} days</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completion_rate_30d" radius={[0, 6, 6, 0]}>
                  {habits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#3B82F6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut Chart */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of habits by life dimension</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {category_breakdown.length === 0 ? (
              <p className="text-xs text-slate-500">No habit categories recorded</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_breakdown}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {category_breakdown.map((entry, index) => (
                      <Cell
                        key={`cat-cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs shadow-xl">
                            <p className="font-bold text-slate-900 dark:text-white">{d.category}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold">{d.count} Habits ({d.completed_total} check-ins)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
