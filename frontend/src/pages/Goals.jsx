import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { goalsApi } from "../services/api";
import { GoalModal } from "../components/GoalModal";
import { ProgressBar } from "../components/ProgressBar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import confetti from "canvas-confetti";

export const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.getGoals(statusTab);
      if (res.data?.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [statusTab]);

  const handleProgressDelta = async (goal, delta) => {
    try {
      const newProgress = Math.max(0, goal.progress + delta);
      const res = await goalsApi.updateProgress(goal.id, { delta });
      if (res.data?.success) {
        if (newProgress >= goal.target && goal.status !== "completed") {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to update goal progress:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await goalsApi.deleteGoal(goalToDelete.id);
      setDeleteConfirmOpen(false);
      setGoalToDelete(null);
      fetchGoals();
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Target Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track short-term objectives and long-term milestones
          </p>
        </div>

        <button
          onClick={() => {
            setGoalToEdit(null);
            setModalOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-purple-500/25 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold w-fit">
        {[
          { key: "all", label: "All Goals" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              statusTab === tab.key
                ? "bg-purple-600 text-white shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <LoadingSpinner text="Loading goals..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          description="Create short-term and long-term targets to stay disciplined and driven."
          actionText="Create Goal"
          onAction={() => {
            setGoalToEdit(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`glass-card rounded-3xl p-6 border transition-all duration-300 relative space-y-4 hover:border-purple-400 dark:hover:border-purple-500/40 ${
                goal.status === "completed"
                  ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      goal.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                    }`}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {goal.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 leading-snug">
                      {goal.title}
                    </h3>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === goal.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                      <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-20 py-1 text-xs">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setGoalToEdit(goal);
                            setModalOpen(true);
                          }}
                          className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Goal</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setGoalToDelete(goal);
                            setDeleteConfirmOpen(true);
                          }}
                          className="w-full px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {goal.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{goal.description}</p>
              )}

              {/* Progress Bar & Value */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {goal.progress} / {goal.target} {goal.unit}
                  </span>
                  <span
                    className={`font-extrabold ${
                      goal.status === "completed" ? "text-emerald-600 dark:text-emerald-400" : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {goal.percentage}%
                  </span>
                </div>
                <ProgressBar
                  progress={goal.progress}
                  max={goal.target}
                  color={
                    goal.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500"
                  }
                />
              </div>

              {/* Quick Stepper Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleProgressDelta(goal, -1)}
                    disabled={goal.progress <= 0}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Quick adjust</span>
                  <button
                    onClick={() => handleProgressDelta(goal, 1)}
                    className="p-1 rounded-lg text-purple-600 dark:text-purple-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>

                {goal.end_date && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Due: {goal.end_date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
        onSaved={fetchGoals}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Goal"
        message={`Are you sure you want to delete goal '${goalToDelete?.title}'?`}
        confirmText="Delete Goal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setGoalToDelete(null);
        }}
      />
    </div>
  );
};
