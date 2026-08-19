import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { habitsApi, trackingApi } from "../services/api";
import { HabitCard } from "../components/HabitCard";
import { HabitModal } from "../components/HabitModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";

const CATEGORIES = ["All", "Fitness", "Health", "Productivity", "Learning", "Mindfulness", "Finance", "Lifestyle"];

export const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [modalOpen, setModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== "all") params.status = activeTab;
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await habitsApi.getHabits(params);
      if (res.data?.success) {
        setHabits(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [activeTab, selectedCategory, searchQuery]);

  const handleToggleHabit = async (habitId) => {
    try {
      const h = habits.find((x) => x.id === habitId);
      const currentStatus = h?.completed_today || false;

      const res = await trackingApi.toggleCompletion({
        habit_id: habitId,
        completed: !currentStatus,
      });

      if (res.data?.success) {
        setHabits((prev) =>
          prev.map((item) =>
            item.id === habitId
              ? {
                  ...item,
                  completed_today: res.data.data.completed,
                  streak: res.data.data.streak,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    }
  };

  const handleStatusChange = async (habitId, newStatus) => {
    try {
      await habitsApi.updateStatus(habitId, newStatus);
      fetchHabits();
    } catch (err) {
      console.error("Failed to change habit status:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;
    try {
      setDeleteLoading(true);
      await habitsApi.deleteHabit(habitToDelete.id);
      setDeleteConfirmOpen(false);
      setHabitToDelete(null);
      fetchHabits();
    } catch (err) {
      console.error("Failed to delete habit:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Create, customize, pause, or track all your routines
          </p>
        </div>

        <button
          onClick={() => {
            setHabitToEdit(null);
            setModalOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-150 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            {[
              { key: "active", label: "Active" },
              { key: "paused", label: "Paused" },
              { key: "archived", label: "Archived" },
              { key: "all", label: "All Habits" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl ${
                viewMode === "grid" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-xl ${
                viewMode === "list" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                  selectedCategory === cat
                    ? "bg-blue-50 dark:bg-blue-600/15 border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-400 font-bold"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Habit Cards Grid / List */}
      {loading ? (
        <LoadingSpinner text="Loading habits..." />
      ) : habits.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== "all" ? activeTab : ""} habits found`}
          description={
            searchQuery
              ? "No habits match your search query. Try clearing the filter."
              : "Start by creating your first daily habit to build consistency."
          }
          actionText="Create Habit"
          onAction={() => {
            setHabitToEdit(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-4"
          }
        >
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={habit.completed_today}
              streak={habit.streak?.current_streak || 0}
              onToggle={handleToggleHabit}
              onEdit={(h) => {
                setHabitToEdit(h);
                setModalOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onDelete={(h) => {
                setHabitToDelete(h);
                setDeleteConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
        onSaved={fetchHabits}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Habit"
        message={`Are you sure you want to permanently delete '${habitToDelete?.name}'? All history records and streak data will be lost.`}
        confirmText="Delete Habit"
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setHabitToDelete(null);
        }}
      />
    </div>
  );
};
