"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { FeatureHeader } from "@/components/FeatureHeader";
import { Target, Plus, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { useGoals, useCreateGoal, useCompleteGoal } from "@/hooks/useAnalytics";
import type { LearningGoal, CreateGoalData } from "@/services/api";
import { toast } from "sonner";

export default function GoalsPage() {
  const { user } = useAuthStore();
  const { data: goals, isLoading } = useGoals();
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal();
  const { mutate: completeGoal } = useCompleteGoal();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_date: "",
    target_score: 60, // Default: 60 minutes of study time
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (formData.target_score <= 0) {
      toast.error('Target score must be greater than 0');
      return;
    }
    
    // Prepare data for API
    const apiData: CreateGoalData = {
      title: formData.title,
      description: formData.description,
      target_date: formData.target_date || undefined,
      target_score: formData.target_score,
    };
    
    console.log('[Goals] Creating goal with data:', apiData);
    createGoal(apiData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({
          title: "",
          description: "",
          target_date: "",
          target_score: 60,
        });
      }
    });
  };

  const renderGoalStatus = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> Completed</span>;
      case "failed":
        return <span className="flex items-center text-sm text-red-600"><XCircle className="w-4 h-4 mr-1" /> Failed</span>;
      default:
        return <span className="flex items-center text-sm text-amber-600"><Clock className="w-4 h-4 mr-1" /> In Progress</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 sm:mb-10 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-tight font-bold">
            Learning Goals
          </h1>
          <p className="text-[#555c56] text-sm sm:text-base">
            Set targets and track your academic progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--primary-500)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-600)] transition-colors"
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
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{goal.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{goal.description}</p>
                </div>
                <div className="p-2 bg-[var(--primary-50)] text-[var(--primary-600)] rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">Progress</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {goal.current_value} / {goal.target_value}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                  <div 
                    className="bg-[var(--primary-500)] h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, ((goal.current_value ?? 0) / (goal.target_value ?? 1)) * 100))}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  {renderGoalStatus(goal.status ?? '')}
                  {goal.status === 'in_progress' && (
                    <button 
                      onClick={() => completeGoal(goal.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-[var(--primary-50)] text-[var(--primary-500)] rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No learning goals yet</h2>
          <p className="text-slate-500 text-center max-w-md mb-6">
            Set up goals to track your study hours, quiz scores, and course completion.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--primary-600)] transition-colors font-medium"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Modal for creating a new goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create New Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent outline-none"
                  placeholder="e.g., Read Biology Chapter 3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent outline-none resize-none h-20"
                  placeholder="Additional details..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Score</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.target_score}
                  onChange={e => setFormData({...formData, target_score: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent outline-none"
                  placeholder="e.g., 60 (minutes, score, etc.)"
                />
                <p className="text-xs text-slate-500 mt-1">Target value: minutes for study time, percentage for quiz scores, etc.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.target_date}
                  onChange={e => setFormData({...formData, target_date: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent outline-none"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
