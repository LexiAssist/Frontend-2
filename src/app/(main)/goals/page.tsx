"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { FeatureHeader } from "@/components/FeatureHeader";
import {
  Target,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Pencil,
  Trophy,
  BookOpen,
  Flame,
} from "lucide-react";
import { useGoals, useCreateGoal, useCompleteGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useAnalytics";
import type { LearningGoal, CreateGoalData } from "@/services/api";
import { toast } from "sonner";

const goalTypeConfig: Record<string, { label: string; icon: React.ElementType; unit: string }> = {
  study_time: { label: "Study Time", icon: Clock, unit: "min" },
  quiz_score: { label: "Quiz Score", icon: Trophy, unit: "%" },
  streak: { label: "Streak", icon: Flame, unit: "days" },
  course_completion: { label: "Completion", icon: BookOpen, unit: "quizzes" },
};

export default function GoalsPage() {
  const { user } = useAuthStore();
  const { data: goals, isLoading } = useGoals();
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal();
  const { mutate: completeGoal } = useCompleteGoal();
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateGoal();
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_date: "",
    target_score: 60,
    goal_type: "study_time" as LearningGoal["goal_type"],
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target_date: "",
      target_score: 60,
      goal_type: "study_time",
    });
    setIsEditMode(false);
    setEditingGoalId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (goal: LearningGoal) => {
    setFormData({
      title: goal.title,
      description: goal.description || "",
      target_date: goal.target_date || "",
      target_score: goal.target_score || 0,
      goal_type: goal.goal_type || "study_time",
    });
    setIsEditMode(true);
    setEditingGoalId(goal.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (formData.target_score <= 0) {
      toast.error("Target must be greater than 0");
      return;
    }

    const apiData: CreateGoalData = {
      title: formData.title,
      description: formData.description,
      target_date: formData.target_date || undefined,
      target_score: formData.target_score,
      goal_type: formData.goal_type,
    };

    if (isEditMode && editingGoalId) {
      updateGoal(
        { id: editingGoalId, data: apiData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createGoal(apiData, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(goalId);
    }
  };

  const renderGoalStatus = (goal: LearningGoal) => {
    if (goal.is_completed || goal.status === "completed") {
      return (
        <span className="flex items-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" /> Completed
        </span>
      );
    }
    if (goal.status === "failed") {
      return (
        <span className="flex items-center text-sm text-red-600">
          <XCircle className="w-4 h-4 mr-1" /> Failed
        </span>
      );
    }
    return (
      <span className="flex items-center text-sm text-amber-600">
        <Clock className="w-4 h-4 mr-1" /> In Progress
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 pt-8 gap-5 border-b border-slate-100 pb-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-[-0.035em] font-black leading-tight">
            Learning Goals
          </h1>
          <p className="text-[#555c56] text-sm sm:text-[15px] font-medium leading-relaxed">
            Set targets and track your academic progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[var(--primary-500)] text-white px-5 py-2.5 rounded-xl hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-emerald-800/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
          <FeatureHeader />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const config = goalTypeConfig[goal.goal_type || "study_time"] || goalTypeConfig.study_time;
            const TypeIcon = config.icon;
            const target = goal.target_score || 0;
            const current = goal.current_value || 0;
            const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
            const isCompleted = goal.is_completed || goal.status === "completed";

            return (
              <div
                key={goal.id}
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col ${
                  isCompleted ? "border-green-200 bg-green-50/30" : "border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start mb-5 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-[16px] sm:text-[17px] tracking-tight leading-snug truncate">
                        {goal.title}
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed truncate-2-lines">
                      {goal.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`p-3 rounded-xl shrink-0 shadow-inner ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-[#EAF4EE] text-[var(--primary-600)]"
                      }`}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      {!isCompleted && (
                        <button
                          onClick={() => openEditModal(goal)}
                          className="p-1.5 text-slate-400 hover:text-[var(--primary-500)] hover:bg-[var(--primary-50)] rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(goal.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2 px-0.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {current} / {target} {config.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500"
                          : progress >= 75
                          ? "bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)]"
                          : progress >= 50
                          ? "bg-amber-400"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="font-bold tracking-tight">
                      {renderGoalStatus(goal)}
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => completeGoal(goal.id)}
                        className="text-xs font-bold bg-[#EAF4EE] hover:bg-[#D5EADF] text-[#2D5A3D] px-3.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 shadow-sm rounded-2xl border-dashed border-2 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#EAF4EE] text-[var(--primary-500)] rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Target className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-2">
            No learning goals yet
          </h2>
          <p className="text-slate-500 text-center max-w-sm mb-6 text-sm font-medium leading-relaxed">
            Set up goals to track your study hours, quiz scores, and course completion.
          </p>
          <button
            onClick={openCreateModal}
            className="bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-xl hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-emerald-800/10"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                {isEditMode ? "Edit Goal" : "Create New Goal"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                  placeholder="e.g., Read Biology Chapter 3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-700 leading-relaxed font-medium resize-none h-24"
                  placeholder="Additional details..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Goal Type
                </label>
                <select
                  value={formData.goal_type}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_type: e.target.value as LearningGoal["goal_type"] })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                >
                  <option value="study_time">Study Time (minutes)</option>
                  <option value="quiz_score">Quiz Score (%)</option>
                  <option value="streak">Study Streak (days)</option>
                  <option value="course_completion">Course Completion (quizzes)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target ({goalTypeConfig[formData.goal_type || "study_time"].unit})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.target_score}
                  onChange={(e) =>
                    setFormData({ ...formData, target_score: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                  placeholder="e.g., 60"
                />
                <p className="text-[11px] text-slate-400 font-semibold mt-2 leading-relaxed">
                  {goalTypeConfig[formData.goal_type || "study_time"].label} target
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                />
              </div>

              <div className="pt-6 flex gap-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-3 text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-emerald-800/10 disabled:opacity-50"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : isEditMode
                    ? "Update Goal"
                    : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
