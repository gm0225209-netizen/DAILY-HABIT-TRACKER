import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Sparkles,
  User,
  Settings,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Habits", path: "/habits", icon: CheckSquare },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Achievements", path: "/achievements", icon: Award },
  { name: "Smart Insights", path: "/insights", icon: Sparkles, badge: "AI" },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header at top of Sidebar */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center space-x-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                HabitTracker
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 ml-2 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                PRO
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>
          {NAV_ITEMS.map(({ name, path, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{name}</span>
              </div>
              {badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer info pill */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-2xl p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-center">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-300">Daily Habit Tracker</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Continuous consistency</p>
          </div>
        </div>
      </aside>
    </>
  );
};
