import React from "react";
import { Flame, Trophy, Award, Zap } from "lucide-react";

export const StreakCard = ({ currentStreak = 0, longestStreak = 0, weeklyRate = 0 }) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
            <Flame className="w-7 h-7 fill-white animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Active Streaks</h3>
            <p className="text-2xl font-extrabold text-white light:text-slate-900 flex items-baseline gap-1.5">
              <span>{currentStreak}</span>
              <span className="text-sm font-medium text-slate-400">days streak</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 light:border-slate-200">
        <div className="flex items-center space-x-2 bg-slate-900/40 light:bg-slate-100 p-2.5 rounded-xl">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="text-[11px] text-slate-400">Best Streak</div>
            <div className="text-sm font-bold text-white light:text-slate-800">{longestStreak} Days</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/40 light:bg-slate-100 p-2.5 rounded-xl">
          <Zap className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-[11px] text-slate-400">Weekly Rate</div>
            <div className="text-sm font-bold text-white light:text-slate-800">{weeklyRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
