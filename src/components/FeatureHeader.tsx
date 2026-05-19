"use client";

import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface FeatureHeaderProps {
  showSettings?: boolean;
  className?: string;
}

/**
 * FeatureHeader Component
 * 
 * Provides Settings icon button for all main feature pages.
 * Positioned in the top-right corner.
 * 
 * Features:
 * - High-contrast white background button
 * - Settings gear icon linking to settings page
 * - Consistent sizing and spacing
 * - Smooth hover/active animations
 */
export function FeatureHeader({ 
  showSettings = true, 
  className = "" 
}: FeatureHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showSettings && (
        <Link href="/settings">
          <motion.button
            className="group flex items-center justify-center h-11 w-11 rounded-xl bg-white shadow-md shadow-slate-200/50 border border-slate-100 text-slate-700 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 hover:text-[var(--primary-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)] transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </Link>
      )}
    </div>
  );
}

export default FeatureHeader;
