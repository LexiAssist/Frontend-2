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
            onClick={() => setIsModalOpen(true)}
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
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-5 gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-[16px] sm:text-[17px] tracking-tight leading-snug">{goal.title}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1.5 leading-relaxed truncate-2-lines">{goal.description}</p>
                </div>
                <div className="p-3 bg-[#EAF4EE] text-[var(--primary-600)] rounded-xl shrink-0 shadow-inner">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2 px-0.5">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Progress</span>
                  <span className="text-sm font-bold text-slate-700">
                    {goal.current_value} / {goal.target_value}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, Math.max(0, ((goal.current_value ?? 0) / (goal.target_value ?? 1)) * 100))}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-bold tracking-tight">
                    {renderGoalStatus(goal.status ?? '')}
                  </div>
                  {goal.status === 'in_progress' && (
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
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 shadow-sm rounded-2xl border-dashed border-2 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#EAF4EE] text-[var(--primary-500)] rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Target className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-2">No learning goals yet</h2>
          <p className="text-slate-500 text-center max-w-sm mb-6 text-sm font-medium leading-relaxed">
            Set up goals to track your study hours, quiz scores, and course completion.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-xl hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-emerald-800/10"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">Create New Goal</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                  placeholder="e.g., Read Biology Chapter 3"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-700 leading-relaxed font-medium resize-none h-24"
                  placeholder="Additional details..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Value</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.target_score}
                  onChange={e => setFormData({...formData, target_score: Number(e.target.value)})}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                  placeholder="e.g., 60 (minutes, score, etc.)"
                />
                <p className="text-[11px] text-slate-400 font-semibold mt-2 leading-relaxed">Target value: minutes for study time, percentage for quiz scores, etc.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.target_date}
                  onChange={e => setFormData({...formData, target_date: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                />
              </div>
              
              <div className="pt-6 flex gap-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-emerald-800/10 disabled:opacity-50"
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