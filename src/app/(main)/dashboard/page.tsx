"use client";

import { useAuthStore } from "@/store/authStore";
import { Clock, FileText, TrendingUp, Target, Award, BookOpen, Brain } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FeatureHeader } from "@/components/FeatureHeader";
import { useStudyStats, useStudyStreak, useTopicMastery } from "@/hooks/useAnalytics";
import { useFlashcardDecks } from "@/hooks/useFlashcards";
import { useQuizzes } from "@/hooks/useQuizzes";
import { LoadingState } from "@/components/LoadingState";
import { GoalsManager } from "@/components/goals";

// Lazy load illustrations for better performance
const ReadingALetterRafiki = dynamic(
  () => import("@/components/illustrations/ReadingALetterRafiki"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);
const BookLoverCuate = dynamic(
  () => import("@/components/illustrations/BookLoverCuate"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);
const StudyBuddy = dynamic(
  () => import("@/components/illustrations/StudyBuddy"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);
const WritingAssistant = dynamic(
  () => import("@/components/illustrations/WritingAssistant"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);

// Puzzle piece pattern for card background
function PuzzlePattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full opacity-40 ${className}`}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Puzzle piece pattern */}
      <g opacity="0.3">
        {/* Row 1 */}
        <path
          d="M20 20 h50 a5 5 0 0 1 5 5 v20 a5 5 0 0 0 10 0 v-20 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-20 a5 5 0 0 0 0 10 h20 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 0 -10 0 v20 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-115 a5 5 0 0 1 5 -5 z"
          fill="white"
        />
        <path
          d="M150 20 h50 a5 5 0 0 1 5 5 v20 a5 5 0 0 0 10 0 v-20 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-20 a5 5 0 0 0 0 10 h20 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 0 -10 0 v20 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-115 a5 5 0 0 1 5 -5 z"
          fill="white"
        />
        <path
          d="M280 20 h50 a5 5 0 0 1 5 5 v20 a5 5 0 0 0 10 0 v-20 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v115 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 0 -10 0 v20 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-50 a5 5 0 0 1 5 -5 h20 a5 5 0 0 0 0 -10 h-20 a5 5 0 0 1 -5 -5 v-50 a5 5 0 0 1 5 -5 z"
          fill="white"
        />
      </g>
    </svg>
  );
}

// Tool Card Component - Rebuilt Design Style
interface ToolCardProps {
  title: string;
  description: string;
  bgColor: string;
  illustration: React.ReactNode;
  href: string;
}

function ToolCard({
  title,
  description,
  bgColor,
  illustration,
  href,
}: ToolCardProps) {
  return (
    <Link href={href} className="block group h-full">
      <motion.div
        whileHover={{ 
          y: -6, 
          boxShadow: "0 25px 30px -10px rgba(0, 0, 0, 0.04), 0 10px 15px -8px rgba(0, 0, 0, 0.02)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="relative overflow-hidden rounded-2xl cursor-pointer border border-black/5 p-6 min-h-[175px] sm:min-h-[195px] flex items-center transition-all duration-300 w-full"
        style={{ backgroundColor: bgColor }}
      >
        {/* Puzzle pattern background */}
        <PuzzlePattern />

        <div className="relative z-10 flex items-center justify-between gap-4 w-full h-full">
          {/* Text Content - Left aligned */}
          <div className="flex flex-col gap-1.5 max-w-[65%] text-left">
            <h3 className="text-slate-800 text-base sm:text-lg tracking-tight leading-snug font-bold whitespace-pre-line group-hover:text-slate-900 transition-colors">
              {title}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mt-1">
              {description}
            </p>
          </div>

          {/* Illustration - Right side */}
          <div className="w-[80px] h-[80px] sm:w-[95px] sm:h-[95px] flex-shrink-0 select-none pointer-events-none overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
            {illustration}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03)" 
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[var(--primary-200)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase leading-none">{title}</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium mt-2">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-[var(--primary-50)]/70 text-[var(--primary-600)] rounded-xl border border-[var(--primary-100)]/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--primary-100)]/45">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-4 text-xs font-medium ${
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
        }`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
        </div>
      )}
    </motion.div>
  );
}

// Quick Action Button
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function QuickAction({ title, description, icon, href, color }: QuickActionProps) {
  return (
    <Link href={href} className="group">
      <motion.div
        whileHover={{ 
          y: -4, 
          boxShadow: "0 15px 20px -8px rgba(0, 0, 0, 0.05)" 
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.02)] hover:border-[var(--primary-200)] hover:bg-slate-50/40 transition-all duration-300 bg-white"
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug">{title}</h4>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  
  // Fetch real data from backend
  const { data: studyStats, isLoading: statsLoading } = useStudyStats();
  const { data: studyStreak, isLoading: streakLoading } = useStudyStreak();
  const { data: topicMastery, isLoading: masteryLoading } = useTopicMastery();
  const { data: flashcardDecks, isLoading: decksLoading } = useFlashcardDecks(5, 0);
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes(5, 0);

  const tools = [
    {
      title: "Text to speech\nLearning Hub",
      description:
        "Turn text into sound. Sit back, listen & watch the words light up as you learn.",
      bgColor: "rgba(60, 131, 80, 0.12)",
      illustration: <ReadingALetterRafiki />,
      href: "/text-to-speech",
    },
    {
      title: "Reading Assistant",
      description: "Study with confidence as words are simplified into bits",
      bgColor: "rgba(137, 207, 240, 0.15)",
      illustration: <BookLoverCuate />,
      href: "/reading-assistant",
    },
    {
      title: "StudyBuddy",
      description:
        "A smart assistant that helps you understand your notes better. Just upload!",
      bgColor: "rgba(126, 87, 194, 0.10)",
      illustration: <StudyBuddy />,
      href: "/chat-assistant",
    },
    {
      title: "Speech to Text\n(Writing Assistant)",
      description: "Writing made easier! Just speak and we will do the writing",
      bgColor: "rgba(197, 63, 63, 0.10)",
      illustration: <WritingAssistant />,
      href: "/writing-assistant",
    },
  ];

  const quickActions = [
    {
      title: "Create Flashcards",
      description: "Generate from your notes",
      icon: <BookOpen className="w-5 h-5 text-white" />,
      href: "/flashcards",
      color: "#3C8350",
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge",
      icon: <Target className="w-5 h-5 text-white" />,
      href: "/quizzes",
      color: "#df7361",
    },
  ];

  const isLoading = statsLoading || streakLoading || masteryLoading || decksLoading || quizzesLoading;

  return (
    <div className="flex flex-col h-full gap-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 border-b border-slate-100 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-slate-800 text-2xl sm:text-3xl tracking-tight font-extrabold leading-tight">
            Hello, {user?.first_name || user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Ready to continue your learning journey?
          </p>
        </div>
        <FeatureHeader />
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-50 border border-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Study Streak"
            value={studyStreak?.current_streak || 0}
            subtitle="days in a row"
            icon={<Award className="w-5 h-5" />}
            trend="up"
          />
          <StatCard
            title="Study Time"
            value={`${Math.round((studyStats?.total_study_minutes || 0) / 60)}h`}
            subtitle="total hours studied"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Quizzes"
            value={studyStats?.total_quizzes_completed || 0}
            subtitle="completed"
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title="Materials"
            value={studyStats?.total_materials_reviewed || 0}
            subtitle="reviewed"
            icon={<FileText className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Topic Mastery Section - Requirement 19.3 */}
      {!masteryLoading && topicMastery && topicMastery.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight mb-4">Topic Mastery</h2>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topicMastery.map((topic, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-[var(--primary-600)]" />
                      <span className="font-semibold text-slate-700 text-sm truncate max-w-[150px]">{topic.topic}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {Math.round(topic.mastery_score)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        topic.mastery_score >= 80 
                          ? 'bg-emerald-500' 
                          : topic.mastery_score >= 60 
                          ? 'bg-[var(--primary-600)]' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, topic.mastery_score))}%` }}
                    />
                  </div>
                  {topic.last_reviewed && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      Last reviewed: {new Date(topic.last_reviewed).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section - Tools */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight mb-4">Learning Tools</h2>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                  },
                }}
              >
                <ToolCard
                  title={tool.title}
                  description={tool.description}
                  bgColor={tool.bgColor}
                  illustration={tool.illustration}
                  href={tool.href}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-[320px] flex flex-col gap-8">
          {/* Actions Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Quick Actions</h2>
            {quickActions.map((action) => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>

          {/* Recent Section */}
          <div className="flex flex-col gap-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {/* Recent Flashcards */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Flashcards</h3>
              {decksLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-50 border border-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : flashcardDecks && flashcardDecks.length > 0 ? (
                <div className="space-y-2">
                  {flashcardDecks.slice(0, 3).map((deck: any) => (
                    <Link 
                      key={deck.id} 
                      href={`/flashcards?deck=${deck.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100/50 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary-50)] border border-[var(--primary-100)]/30 flex items-center justify-center transition-colors group-hover:bg-[var(--primary-100)]/40">
                        <BookOpen className="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 text-sm truncate leading-snug group-hover:text-slate-800">{deck.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {deck.cards?.length || 0} cards
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No flashcards yet</p>
                  <Link 
                    href="/flashcards" 
                    className="text-[var(--primary-600)] text-sm font-semibold hover:underline mt-1 inline-block"
                  >
                    Create your first deck
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Quizzes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Quizzes</h3>
              {quizzesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-50 border border-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <div className="space-y-2">
                  {quizzes.slice(0, 3).map((quiz: any) => (
                    <Link 
                      key={quiz.id} 
                      href={`/quizzes?quiz=${quiz.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100/50 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/30 flex items-center justify-center transition-colors group-hover:bg-rose-100/40">
                        <Target className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 text-sm truncate leading-snug group-hover:text-slate-800">{quiz.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {quiz.questions?.length || 0} questions
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No quizzes yet</p>
                  <Link 
                    href="/quizzes" 
                    className="text-[var(--primary-600)] text-sm font-semibold hover:underline mt-1 inline-block"
                  >
                    Create your first quiz
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <GoalsManager />
          </div>
        </div>
      </div>
    </div>
  );
}