"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Flame,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals, useCreateGoal, useCompleteGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useAnalytics";
import type { CreateGoalData, LearningGoal } from "@/services/api";
import { toast } from "sonner";

interface GoalFormData {
  title: string;
  description: string;
  targetScore: number;
  targetDate: string;
  goalType: LearningGoal["goal_type"];
  courseId?: string;
}

const goalTypeConfig: Record<string, { label: string; icon: React.ElementType; unit: string }> = {
  study_time: { label: "Study Time", icon: Clock, unit: "minutes" },
  quiz_score: { label: "Quiz Score", icon: Trophy, unit: "%" },
  streak: { label: "Study Streak", icon: Flame, unit: "days" },
  course_completion: { label: "Course Completion", icon: BookOpen, unit: "quizzes" },
};

function GoalCard({
  goal,
  onComplete,
  isCompleting,
  onEdit,
  onDelete,
  isDeleting,
}: {
  goal: LearningGoal;
  onComplete: (id: string) => void;
  isCompleting: boolean;
  onEdit: (goal: LearningGoal) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const config = goalTypeConfig[goal.goal_type || "study_time"] || goalTypeConfig.study_time;
  const Icon = config.icon;
  const target = goal.target_score || 0;
  const current = goal.current_value || 0;
  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const isCompleted = goal.is_completed || goal.status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-xl border transition-all ${
        isCompleted
          ? "bg-green-50 border-green-200"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            isCompleted ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-slate-900 truncate">{goal.title}</h4>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {config.label}
                </span>
              </div>
              {goal.description && (
                <p className="text-sm text-slate-500 mt-0.5">{goal.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isCompleted && (
                <button
                  onClick={() => onEdit(goal)}
                  className="p-1.5 text-slate-400 hover:text-[var(--primary-500)] hover:bg-[var(--primary-50)] rounded-lg transition"
                  title="Edit goal"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Delete this goal?')) onDelete(goal.id);
                }}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete goal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">
                {current} / {target} {config.unit}
              </span>
              <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-500"
                    : progress >= 75
                    ? "bg-[var(--primary-500)]"
                    : progress >= 50
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {goal.target_date
                ? `Due ${new Date(goal.target_date).toLocaleDateString()}`
                : "No due date"}
            </div>

            {!isCompleted && (
              <Button
                size="sm"
                onClick={() => onComplete(goal.id)}
                isLoading={isCompleting}
                className="text-xs"
              >
                {progress >= 100 ? "Complete" : "Mark Done"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GoalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: GoalFormData;
  title: string;
}) {
  const [formData, setFormData] = useState<GoalFormData>(
    initialData || {
      title: "",
      description: "",
      targetScore: 60,
      targetDate: "",
      goalType: "study_time",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--primary-500)]" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Goal Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete Physics Chapter 3"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Description (Optional)
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about this goal"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Goal Type
            </label>
            <Select
              value={formData.goalType}
              onValueChange={(v) => setFormData({ ...formData, goalType: v as LearningGoal["goal_type"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="study_time">Study Time (minutes)</SelectItem>
                <SelectItem value="quiz_score">Quiz Score (%)</SelectItem>
                <SelectItem value="streak">Study Streak (days)</SelectItem>
                <SelectItem value="course_completion">Course Completion (quizzes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Target ({goalTypeConfig[formData.goalType || "study_time"]?.unit})
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                value={formData.targetScore}
                onChange={(e) =>
                  setFormData({ ...formData, targetScore: parseInt(e.target.value) || 0 })
                }
                className="w-32"
              />
              <span className="text-sm text-slate-500">
                {goalTypeConfig[formData.goalType || "study_time"]?.label} target
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Target Date (Optional)
            </label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GoalsManager() {
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const completeGoal = useCompleteGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);

  const handleCreateGoal = async (formData: GoalFormData) => {
    await createGoal.mutateAsync({
      title: formData.title,
      description: formData.description,
      target_score: formData.targetScore,
      target_date: formData.targetDate || undefined,
      goal_type: formData.goalType,
      course_id: formData.courseId,
    });
    setCreateOpen(false);
  };

  const handleUpdateGoal = async (formData: GoalFormData) => {
    if (!editingGoal) return;
    await updateGoal.mutateAsync({
      id: editingGoal.id,
      data: {
        title: formData.title,
        description: formData.description,
        target_score: formData.targetScore,
        target_date: formData.targetDate || undefined,
        goal_type: formData.goalType,
        course_id: formData.courseId,
      },
    });
    setEditOpen(false);
    setEditingGoal(null);
  };

  const handleComplete = (id: string) => {
    completeGoal.mutate(id);
  };

  const handleEdit = (goal: LearningGoal) => {
    setEditingGoal(goal);
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGoal.mutate(id);
  };

  const activeGoals = goals?.filter((g) => !g.is_completed && g.status !== "completed") || [];
  const completedGoals = goals?.filter((g) => g.is_completed || g.status === "completed") || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Learning Goals</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Learning Goals</h3>
          <p className="text-sm text-slate-500">
            {activeGoals.length} active, {completedGoals.length} completed
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <GoalFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSubmit={handleCreateGoal}
            isSubmitting={createGoal.isPending}
            title="Create Learning Goal"
          />
        </Dialog>
      </div>

      {goals && goals.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onComplete={handleComplete}
                isCompleting={completeGoal.isPending}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteGoal.isPending}
              />
            ))}
            {completedGoals.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onComplete={handleComplete}
                isCompleting={completeGoal.isPending}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteGoal.isPending}
              />
            ))}
          </AnimatePresence>

          {completedGoals.length > 3 && (
            <p className="text-center text-sm text-slate-500 py-2">
              +{completedGoals.length - 3} more completed goals
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No learning goals yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Create your first goal to track your progress
          </p>
        </div>
      )}

      {editingGoal && (
        <GoalFormDialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditingGoal(null);
          }}
          onSubmit={handleUpdateGoal}
          isSubmitting={updateGoal.isPending}
          title="Edit Learning Goal"
          initialData={{
            title: editingGoal.title,
            description: editingGoal.description || "",
            targetScore: editingGoal.target_score || 0,
            targetDate: editingGoal.target_date || "",
            goalType: editingGoal.goal_type || "study_time",
            courseId: editingGoal.course_id,
          }}
        />
      )}
    </div>
  );
}

export default GoalsManager;
