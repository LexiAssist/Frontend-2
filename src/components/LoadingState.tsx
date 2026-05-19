"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "pulse";
  message?: string;
  rows?: number;
  className?: string;
  showLongRunningMessage?: boolean;
  longRunningThreshold?: number;
}

/**
 * LoadingState Component
 * 
 * Reusable loading state with multiple variants:
 * - spinner: Animated spinning loader with optional message
 * - skeleton: Skeleton cards for content loading
 * - pulse: Pulse animation for generic loading states
 * 
 * Requirements: 22.1, 22.4, 22.6
 */
export function LoadingState({
  variant = "spinner",
  message = "Loading...",
  rows = 3,
  className = "",
  showLongRunningMessage = false,
  longRunningThreshold = 10000, // 10 seconds
}: LoadingStateProps) {
  const [showLongMessage, setShowLongMessage] = useState(false);

  // Show additional context for long-running operations (Requirement 22.6)
  useEffect(() => {
    if (showLongRunningMessage) {
      const timer = setTimeout(() => {
        setShowLongMessage(true);
      }, longRunningThreshold);

      return () => clearTimeout(timer);
    }
  }, [showLongRunningMessage, longRunningThreshold]);

  if (variant === "spinner") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-[var(--primary-500)]" />
        </motion.div>
        {message && (
          <p className="text-slate-600 text-sm font-medium">{message}</p>
        )}
        {showLongMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-500 text-xs"
          >
            This may take a minute...
          </motion.p>
        )}
      </motion.div>
    );
  }

  if (variant === "skeleton") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-4 ${className}`}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-100 rounded-xl p-4 space-y-3"
          >
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 bg-slate-200 rounded-lg w-20 animate-pulse" />
              <div className="h-8 bg-slate-200 rounded-lg w-20 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Pulse variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
    >
      <div className="w-12 h-12 bg-[var(--primary-200)] rounded-full animate-pulse" />
      {message && (
        <p className="text-slate-600 text-sm font-medium animate-pulse">{message}</p>
      )}
    </motion.div>
  );
}

/**
 * ButtonLoading Component
 * 
 * Small spinner for button loading states
 * Requirement 22.5: Disable form buttons during submission
 */
export function ButtonLoading({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Loader2 className="w-4 h-4" />
    </motion.div>
  );
}

/**
 * ProgressBar Component
 * 
 * Progress bar for file uploads and long-running operations
 * Requirement 22.3: Show progress bar for file uploads
 */
interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-slate-600">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full bg-[var(--primary-500)] rounded-full"
        />
      </div>
    </div>
  );
}

/**
 * AILoadingState Component
 * 
 * Specialized loading state for AI operations with descriptive text
 * Requirement 22.4: Display descriptive loading text for AI operations
 */
interface AILoadingStateProps {
  operation: 'flashcards' | 'quiz' | 'notes' | 'summary' | 'chat' | 'transcription';
  className?: string;
}

export function AILoadingState({ operation, className = "" }: AILoadingStateProps) {
  const messages = {
    flashcards: "Generating flashcards from your material...",
    quiz: "Creating quiz questions...",
    notes: "Generating structured notes...",
    summary: "Analyzing document and creating summary...",
    chat: "Thinking...",
    transcription: "Transcribing audio...",
  };

  return (
    <LoadingState
      variant="spinner"
      message={messages[operation]}
      showLongRunningMessage={operation !== 'chat'}
      className={className}
    />
  );
}

/**
 * FullPageLoading Component
 * 
 * Full-page loading indicator for initial page loads
 * Requirement 22.1: Display loading spinner during API requests
 */
export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <LoadingState variant="spinner" message={message} />
    </div>
  );
}

export default LoadingState;
