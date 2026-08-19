import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Flame,
  Calendar,
  AlertCircle,
  Sun,
  RefreshCw,
  Target,
  Lightbulb,
} from "lucide-react";
import { insightsApi } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

const ICON_MAP = {
  Sparkles,
  TrendingUp,
  Flame,
  Calendar,
  AlertCircle,
  Sun,
  RefreshCw,
  Target,
  Lightbulb,
};

export const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await insightsApi.getInsights();
        if (res.data?.success) {
          setInsights(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Analyzing behavioral trends and correlations..." size="lg" />;
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case "success":
      case "achievement":
        return {
          border: "border-emerald-200 dark:border-emerald-500/30",
          bg: "bg-emerald-50/60 dark:bg-emerald-950/10",
          iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
        };
      case "warning":
      case "tip":
        return {
          border: "border-amber-200 dark:border-amber-500/30",
          bg: "bg-amber-50/60 dark:bg-amber-950/10",
          iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
          badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
        };
      default:
        return {
          border: "border-blue-200 dark:border-blue-500/30",
          bg: "bg-blue-50/60 dark:bg-blue-950/10",
          iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
          badge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Behavioral Intelligence & Insights
          </h1>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
            Smart Engine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Rule-based behavioral data patterns, consistency analysis, and recommendations
        </p>
      </div>

      {/* Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-200 dark:border-blue-500/30 bg-blue-50/40 dark:bg-gradient-to-br dark:from-blue-600/10 dark:via-indigo-600/5 dark:to-transparent flex items-start space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            How Habit Intelligence Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
            Our algorithms evaluate your 30-day completion history, timestamp patterns, weekday vs
            weekend variance, and streak durability to deliver precise behavioral advice for maximum
            long-term habit formation.
          </p>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => {
          const IconComp = ICON_MAP[insight.icon] || Lightbulb;
          const style = getTypeStyle(insight.type);

          return (
            <div
              key={insight.id}
              className={`glass-card rounded-3xl p-6 border transition-all duration-300 space-y-4 hover:scale-101 ${style.border} ${style.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.iconBg}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                {insight.badge && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${style.badge}`}>
                    {insight.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {insight.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
