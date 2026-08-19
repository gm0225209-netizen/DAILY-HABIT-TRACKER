import React, { useState, useEffect } from "react";
import {
  Award,
  Flame,
  CheckCircle2,
  Trophy,
  Zap,
  Star,
  ShieldCheck,
  Crown,
  Layers,
  Target,
  Footprints,
  Lock,
} from "lucide-react";
import { achievementsApi } from "../services/api";
import { ProgressBar } from "../components/ProgressBar";
import { LoadingSpinner } from "../components/LoadingSpinner";

const ICON_MAP = {
  Award,
  Flame,
  CheckCircle2,
  Trophy,
  Zap,
  Star,
  ShieldCheck,
  Crown,
  Layers,
  Target,
  Footprints,
};

export const Achievements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await achievementsApi.getAll();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load achievements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Polishing your trophy cabinet..." size="lg" />;
  }

  const { achievements = [], unlocked_count = 0, total_count = 0, progress_percentage = 0 } = data || {};

  const categories = ["All", ...new Set(achievements.map((a) => a.category))];

  const filteredAchievements = achievements.filter((a) =>
    selectedCategory === "All" ? true : a.category === selectedCategory
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Achievements & Badges
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Gamified milestone rewards earned through persistence and consistency
        </p>
      </div>

      {/* Progress Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-orange-500/5 dark:to-transparent space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Milestone Trophy Room
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {unlocked_count} of {total_count} Badges Unlocked
              </h2>
            </div>
          </div>

          <div className="text-right self-end sm:self-auto">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{progress_percentage}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Completion Rate</span>
          </div>
        </div>

        <ProgressBar
          progress={unlocked_count}
          max={total_count}
          color="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
              selectedCategory === cat
                ? "bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-400 font-bold shadow-xs"
                : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((badge) => {
          const IconComp = ICON_MAP[badge.icon] || Award;
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.badge}
              className={`glass-card rounded-3xl p-6 border transition-all duration-300 relative space-y-4 ${
                isUnlocked
                  ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 hover:border-amber-400 dark:hover:border-amber-500/60"
                  : "border-slate-200 dark:border-slate-800/60 opacity-60 bg-slate-50 dark:bg-slate-950/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    isUnlocked
                      ? "bg-amber-100 dark:bg-gradient-to-tr dark:from-amber-500/30 dark:to-yellow-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 shadow-xs"
                      : "bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-600 border-slate-300 dark:border-slate-800"
                  }`}
                >
                  <IconComp className="w-6 h-6" />
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {badge.category}
                  </span>
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              <div>
                <h3
                  className={`text-base font-bold ${
                    isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className={isUnlocked ? "text-amber-700 dark:text-amber-400 font-bold" : "text-slate-400 font-medium"}>
                  {isUnlocked ? "Unlocked ✓" : "In Progress..."}
                </span>

                {isUnlocked && badge.earned_at && (
                  <span className="text-slate-500">
                    Earned: {new Date(badge.earned_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
