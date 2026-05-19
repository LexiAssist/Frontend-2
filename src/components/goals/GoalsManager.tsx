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
import { useGoals, useCreateGoal, useCompleteGoal } from "@/hooks/useAnalytics";
import type { CreateGoalData } from "@/services/api";
import { toast } from "sonner";
import type { LearningGoal } from "@/services/api";

interface GoalFormData {
  title: string;
  description: string;
  targetScore: number;
  targetDate: string;
  courseId?: string;
}

function GoalCard({
  goal,
  onComplete,
  isCompleting,
}: {
  goal: LearningGoal;
  onComplete: (id: string) => void;
  isCompleting: boolean;
}) {
  const Icon = Target;
  const progress = goal.target_value ? Math.min(100, ((goal.current_value || 0) / goal.target_value) * 100) : 0;
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
            <div>
              <h4 className="font-medium text-slate-900 truncate">{goal.title}</h4>
              {goal.description && (
                <p className="text-sm text-slate-500 mt-0.5">{goal.description}</p>
              )}
            </div>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">
                {goal.current_value || 0} / {goal.target_value || 0}
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

            {!isCompleted && progress >= 100 && (
              <Button
                size="sm"
                onClick={() => onComplete(goal.id)}
                isLoading={isCompleting}
                className="text-xs"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateGoalDialog({ onCreate }: { onCreate: (data: GoalFormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    description: "",
    targetScore: 60,
    targetDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(formData);
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        targetScore: 60,
        targetDate: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--primary-500)]" />
            Create Learning Goal
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
              Target Score
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
              <span className="text-sm text-slate-500">e.g., minutes, score %</span>
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
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Create Goal
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

  const handleCreateGoal = async (formData: GoalFormData) => {
    await createGoal.mutateAsync({
      title: formData.title,
      description: formData.description,
      target_score: formData.targetScore,
      target_date: formData.targetDate || undefined,
      course_id: formData.courseId,
    });
  };

  const handleComplete = (id: string) => {
    completeGoal.mutate(id);
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
        <CreateGoalDialog onCreate={handleCreateGoal} />
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
              />
            ))}
            {completedGoals.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onComplete={handleComplete}
                isCompleting={completeGoal.isPending}
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
    </div>
  );
}

export default GoalsManager;
