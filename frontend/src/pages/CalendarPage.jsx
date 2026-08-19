import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
} from "lucide-react";
import { calendarApi } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const CalendarPage = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async (year, month) => {
    try {
      setLoading(true);
      const res = await calendarApi.getCalendar(year, month);
      if (res.data?.success) {
        setCalendarData(res.data.data);
        const todayStr = new Date().toISOString().split("T")[0];
        const match = res.data.data.days?.find((d) => d.date === todayStr);
        if (match) {
          setSelectedDay(match);
        } else if (res.data.data.days?.length > 0) {
          setSelectedDay(res.data.data.days[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  const getCellColor = (day) => {
    if (!day.total_habits || day.total_habits === 0) return "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-400";
    const pct = day.completion_percentage;
    if (pct === 100) return "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50 shadow-xs";
    if (pct >= 60) return "bg-blue-100 dark:bg-blue-500/25 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40";
    if (pct > 0) return "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";
    return "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Calendar History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Visual month-by-month consistency log and historical review
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-900 dark:text-white px-3 min-w-28 text-center">
            {calendarData?.month_name} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-500/30 transition-colors ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Generating calendar matrix..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Monthly Heat Calendar Matrix */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {calendarData?.month_name} Grid
                </h3>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /> 0%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 dark:bg-amber-500/30 border border-amber-300 dark:border-amber-500/50" /> 1-59%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-100 dark:bg-blue-500/30 border border-blue-300 dark:border-blue-500/50" /> 60-99%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-100 dark:bg-emerald-500/50 border border-emerald-300 dark:border-emerald-500" /> 100%
                </span>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {calendarData?.days?.map((day) => {
                const isSelected = selectedDay?.date === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-between border transition-all duration-200 ${getCellColor(
                      day
                    )} ${
                      isSelected
                        ? "ring-2 ring-blue-500 scale-105 shadow-md shadow-blue-500/20 z-10 font-bold"
                        : "hover:scale-102 hover:border-slate-400 dark:hover:border-slate-600"
                    } ${day.is_today ? "ring-2 ring-slate-900 dark:ring-white" : ""}`}
                  >
                    <div className="w-full flex items-center justify-between text-[10px]">
                      <span className="font-bold">{day.day}</span>
                      <span className="text-[9px] opacity-75 font-medium">{day.day_of_week}</span>
                    </div>

                    <div className="text-center my-auto">
                      {day.total_habits > 0 ? (
                        <span className="text-xs font-extrabold leading-none block">
                          {day.completed_count}/{day.total_habits}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </div>

                    <div className="w-full text-right">
                      {day.completion_percentage === 100 && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">★</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Date Inspection Drawer */}
          <div className="lg:col-span-4 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Day Breakdown
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedDay?.date
                  ? new Date(selectedDay.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a day"}
              </h3>
              {selectedDay && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {selectedDay.completed_count} of {selectedDay.total_habits} completed
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    ({selectedDay.completion_percentage}%)
                  </span>
                </div>
              )}
            </div>

            {/* List of habits on selected day */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {!selectedDay || selectedDay.habits?.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No habits logged for this date.</p>
              ) : (
                selectedDay.habits?.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      h.completed
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {h.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0" />
                      )}
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            h.completed ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {h.name}
                        </h4>
                        <span className="text-[10px] text-slate-500">{h.category}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        h.completed
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500"
                      }`}
                    >
                      {h.completed ? "Done" : "Missed"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
