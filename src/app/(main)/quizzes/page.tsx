"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, X, Upload, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { FeatureHeader } from '@/components/FeatureHeader';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGenerateQuiz, useQuizzes, useCreateQuiz, useStartQuizAttempt, useSubmitAnswer, useCompleteQuizAttempt } from '@/hooks/useQuizzes';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: Array<{ text: string; is_correct: boolean }>;
  correct_answer?: string;
  explanation?: string;
  points: number;
}

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  time_limit_minutes: number;
}

type ViewState = 'upload' | 'ready' | 'generated' | 'taking' | 'results' | 'textInput';

function Header() {
  return (
    <header className="flex items-center justify-between mb-10">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1a1a1a]">
        Quizzes
      </h1>
      <FeatureHeader />
    </header>
  );
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF5F3] via-[#FDF0EE] to-[#FADCD8] border border-[#E07B6A]/20 mb-8 shadow-[0_8px_30px_rgba(224,123,106,0.06)]">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #E07B6A 1px, transparent 1px),
            linear-gradient(to bottom, #E07B6A 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex items-center gap-8 px-6 sm:px-8 lg:px-10 py-8 lg:py-10">
        <div className="hidden sm:block flex-shrink-0 hover:scale-105 transition-transform duration-500 ease-out">
          <div className="relative h-[160px] w-[200px] lg:h-[200px] lg:w-[240px] p-2">
            <svg viewBox="0 0 200 180" fill="none" className="h-full w-full">
              <rect x="20" y="40" width="140" height="100" rx="8" fill="white" fillOpacity="0.9" />
              <rect x="35" y="55" width="100" height="8" rx="4" fill="#E07B6A" fillOpacity="0.3" />
              <rect x="35" y="70" width="80" height="6" rx="3" fill="#E07B6A" fillOpacity="0.2" />
              <rect x="35" y="82" width="90" height="6" rx="3" fill="#E07B6A" fillOpacity="0.2" />
              <rect x="35" y="94" width="70" height="6" rx="3" fill="#E07B6A" fillOpacity="0.2" />
              <circle cx="160" cy="50" r="18" fill="white" />
              <path d="M152 50L157 55L168 44" stroke="#E07B6A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="100" cy="165" rx="35" ry="10" fill="rgba(0,0,0,0.05)" />
              <circle cx="100" cy="110" r="25" fill="#2d3748" />
              <path d="M75 140 Q100 120 125 140 L125 170 L75 170 Z" fill="#2d3748" />
              <rect x="60" y="130" width="80" height="50" rx="4" fill="white" />
              <rect x="65" y="135" width="70" height="35" rx="2" fill="#e2e8f0" />
            </svg>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold tracking-[-0.03em] text-[#3E1F1A]">Quizzes</h2>
          <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-[#6D3930]/95 font-medium">
            Upload a document or enter text and we&apos;ll automatically generate questions to test your understanding of the content.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadSection({ 
  onFileSelect, 
  onTextInput 
}: { 
  onFileSelect: () => void;
  onTextInput: () => void;
}) {
  return (
    <div className="space-y-5">
      <button
        onClick={onFileSelect}
        className="w-full p-8 border-2 border-dashed border-[#E07B6A]/35 bg-[#FAF9F5]/80 hover:bg-[#FAF9F5] hover:scale-[1.01] active:scale-[0.995] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E07B6A] to-[#C95C4A] shadow-[0_8px_20px_-4px_rgba(224,123,106,0.3)] flex items-center justify-center">
          <Upload className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 tracking-[-0.02em]">Click to upload a document</p>
          <p className="text-sm font-medium text-slate-400 mt-1">PDF, DOC, TXT (max 25MB)</p>
        </div>
      </button>
      
      <div className="flex items-center justify-center gap-3">
        <div className="h-[1px] w-8 bg-slate-200" />
        <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">or</span>
        <div className="h-[1px] w-8 bg-slate-200" />
      </div>
      
      <button
        onClick={onTextInput}
        className="w-full py-4 px-6 rounded-xl border border-[#E07B6A]/40 text-[#CA5A48] font-bold hover:bg-[#FDF5F4] active:scale-[0.99] transition-all duration-200"
      >
        Type or paste your content
      </button>
    </div>
  );
}

function DocumentCard({ 
  name, 
  onRemove, 
  onSubmit, 
  isLoading 
}: { 
  name: string; 
  onRemove: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="max-w-md bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
      <h3 className="mb-4 text-[15px] font-semibold text-slate-600">
        Document uploaded
      </h3>

      <div className="flex items-center gap-4 rounded-xl bg-[#FAF9F5] border border-[#E07B6A]/15 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E07B6A]">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-semibold text-slate-800">
            {name}
          </p>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">PDF</p>
        </div>
        <button 
          onClick={onRemove}
          className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Button
        onClick={onSubmit}
        isLoading={isLoading}
        className="mt-6 w-full rounded-xl py-3 font-bold bg-[#E07B6A] hover:bg-[#C95C4A] shadow-[0_4px_12px_rgba(224,123,106,0.15)]"
      >
        Generate Quiz
      </Button>
    </div>
  );
}

function TextInputSection({ 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [text, setText] = useState('');

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-800 tracking-[-0.015em] mb-4">
          Enter your study material
        </h3>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes, textbook excerpt, or any study material here..."
          className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-[#E07B6A] focus:ring-[3px] focus:ring-[#E07B6A]/10 outline-none resize-none text-[15px] leading-relaxed text-slate-700 transition-all"
        />
        
        <div className="flex gap-4 mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 rounded-xl py-3 text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(text)}
            isLoading={isLoading}
            disabled={!text.trim()}
            className="flex-1 rounded-xl py-3 text-sm font-bold bg-[#E07B6A] hover:bg-[#C95C4A]"
          >
            Generate Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuizDisplay({ 
  quiz, 
  onStart 
}: { 
  quiz: GeneratedQuiz;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-6 lg:p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">{quiz.title}</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-lg shrink-0">
          <Clock className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-semibold">{quiz.time_limit_minutes} min</span>
        </div>
      </div>

      <div className="space-y-3 mb-8 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF4EE] text-[var(--primary-500)] flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">{quiz.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF4EE] text-[var(--primary-500)] flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Multiple choice & true/false format</span>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full rounded-xl py-3.5 text-base font-bold bg-[var(--primary-500)] hover:bg-[var(--primary-600)] shadow-md shadow-emerald-800/10 active:scale-[0.98] transition-all"
      >
        Start Quiz
      </Button>
    </motion.div>
  );
}

function QuizTaker({ 
  quiz, 
  onComplete, 
  onExit,
  attemptId,
  onSubmitAnswer,
}: { 
  quiz: GeneratedQuiz;
  onComplete: (answers: Record<string, string>) => void;
  onExit: () => void;
  attemptId: string | null;
  onSubmitAnswer: (questionId: string, answer: string, timeTaken: number) => Promise<void>;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(() => Date.now());

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = async () => {
    if (!selectedOption || !attemptId) return;
    
    const timeTaken = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    
    try {
      await onSubmitAnswer(question.id, selectedOption, timeTaken);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to submit answer');
      return;
    }
    
    setAnswers(prev => ({ ...prev, [question.id]: selectedOption }));
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      questionStartTimeRef.current = Date.now();
      setQuestionStartTime(Date.now());
    } else {
      onComplete({ ...answers, [question.id]: selectedOption });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs sm:text-sm font-bold text-[var(--primary-600)]">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 leading-relaxed">
          {question.question_text}
        </h3>

        {question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option.text)}
                className={`w-full p-4 rounded-xl border text-left font-medium active:scale-[0.995] transition-all duration-200 ${
                  selectedOption === option.text
                    ? 'border-[var(--primary-500)] bg-[rgba(60,131,80,0.08)] text-[var(--primary-700)] shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-bold text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>{' '}
                <span className="text-slate-700">{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {question.question_type === 'true_false' && (
          <div className="flex gap-4">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`flex-1 p-4 rounded-xl border font-bold active:scale-[0.99] transition-all duration-200 ${
                  selectedOption === option
                    ? 'border-[var(--primary-500)] bg-[rgba(60,131,80,0.08)] text-[var(--primary-700)] shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-4 mt-8 border-t border-slate-100 pt-6">
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 rounded-xl py-3 font-semibold"
          >
            Exit Quiz
          </Button>
          <Button
            onClick={handleAnswer}
            disabled={!selectedOption}
            className="flex-1 rounded-xl py-3 font-bold bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next Question'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function QuizResults({ 
  quiz, 
  answers, 
  onRetry, 
  onNewQuiz 
}: { 
  quiz: GeneratedQuiz;
  answers: Record<string, string>;
  onRetry: () => void;
  onNewQuiz: () => void;
}) {
  let correctCount = 0;
  quiz.questions.forEach(q => {
    if (answers[q.id] === q.correct_answer) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-8 lg:p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 border border-emerald-200/50 flex items-center justify-center shadow-inner">
          <CheckCircle className="w-8 h-8 text-[var(--primary-500)]" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base mb-6">
          You scored <span className="font-bold text-slate-800">{correctCount}</span> out of <span className="font-bold text-slate-800">{quiz.questions.length}</span> correct
        </p>

        <div className="inline-block px-8 py-4 rounded-3xl bg-[#EAF4EE]/60 border border-[#6B9E7C]/20 text-4xl font-extrabold text-[var(--primary-600)] mb-8 tracking-tight shadow-sm">
          {score}%
        </div>

        <div className="flex gap-4 justify-center border-t border-slate-100 pt-6">
          <Button
            onClick={onRetry}
            variant="outline"
            className="rounded-xl px-6 py-2.5 font-semibold"
          >
            Retry Quiz
          </Button>
          <Button
            onClick={onNewQuiz}
            className="rounded-xl px-6 py-2.5 font-bold bg-[var(--primary-500)] hover:bg-[var(--primary-600)] shadow-md shadow-emerald-800/10 active:scale-[0.98] transition-all"
          >
            New Quiz
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-base sm:text-lg font-bold tracking-tight mb-4 text-slate-800">Review Answers</h3>
        <div className="space-y-4">
          {quiz.questions.map((q, idx) => {
            const isCorrect = answers[q.id] === q.correct_answer;
            return (
              <div 
                key={q.id}
                className={`p-5 rounded-2xl border shadow-sm transition-all duration-200 ${
                  isCorrect 
                    ? 'border-emerald-100 bg-[#F4FBF7]' 
                    : 'border-rose-100 bg-[#FEF6F6]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-rose-100 text-rose-700 shrink-0">
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 leading-relaxed text-[15px]">{idx + 1}. {q.question_text}</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium">
                      <p className="text-slate-600">
                        Your answer: <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{answers[q.id] || 'None'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-[#3C8350]">
                          Correct answer: <span className="font-bold">{q.correct_answer}</span>
                        </p>
                      )}
                    </div>
                    {q.explanation && (
                      <div className="text-xs sm:text-sm text-slate-500 mt-3 p-3 bg-white/70 border border-slate-100/50 rounded-xl leading-relaxed">
                        <span className="font-bold text-slate-700 block mb-0.5">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function QuizzesPage() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string; rawFile?: File } | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const generateMutation = useGenerateQuiz();
  const createQuizMutation = useCreateQuiz();
  const startAttemptMutation = useStartQuizAttempt();
  const submitAnswerMutation = useSubmitAnswer(currentAttemptId || '');
  const completeAttemptMutation = useCompleteQuizAttempt();
  const { data: existingQuizzes } = useQuizzes(10, 0);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedFile({
        name: file.name.replace(/\.[^/.]+$/, ""),
        content: content,
        rawFile: file,
      });
      setViewState('ready');
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      setUploadedFile({
        name: file.name.replace(/\.[^/.]+$/, ""),
        content: `Generate a quiz about: ${file.name}`,
        rawFile: file,
      });
      setViewState('ready');
    }
    
    event.target.value = '';
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setViewState('upload');
  };

  const handleGenerate = async (content: string | File) => {
    if (!user?.id) {
      toast.error('Please log in to generate quizzes');
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        content,
        userId: user.id,
        quizType: 'multiple_choice',
        numQuestions: 5,
      });

      console.log('[Quizzes] API response:', result);

      // Transform API response to component format
      // API returns { questions: [{question, options, correct_answer, explanation, topic}, ...] }
      const questionsArray = result.questions;
      
      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        toast.warning('No questions were generated. Please try with different content.');
        return;
      }

      // Map backend format to frontend format
      const parsedQuiz: GeneratedQuiz = {
        title: `Quiz - ${result.filename || 'Generated'}`,
        description: `AI-generated ${result.quiz_type} quiz with ${questionsArray.length} questions`,
        time_limit_minutes: Math.max(5, questionsArray.length * 2),
        questions: questionsArray.map((q: any, idx: number) => ({
          id: `q-${idx}`,
          question_text: q.question,
          question_type: 'multiple_choice' as const,
          options: q.options ? [
            { text: q.options.A, is_correct: q.correct_answer === 'A' },
            { text: q.options.B, is_correct: q.correct_answer === 'B' },
            { text: q.options.C, is_correct: q.correct_answer === 'C' },
            { text: q.options.D, is_correct: q.correct_answer === 'D' },
          ] : [],
          correct_answer: q.options?.[q.correct_answer] || q.correct_answer,
          explanation: q.explanation,
          points: 10,
        })),
      };
      
      // Save the quiz to the backend (Requirement 14.2)
      // We must save first to get actual database IDs for questions
      try {
        const savedQuiz = await createQuizMutation.mutateAsync({
          title: parsedQuiz.title,
          description: parsedQuiz.description,
          time_limit_minutes: parsedQuiz.time_limit_minutes,
          questions: parsedQuiz.questions.map((q, idx) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            points: q.points,
            order_index: idx,
          })),
        });
        
        setSavedQuizId(savedQuiz.id);
        
        // Use the saved quiz data which has actual database IDs for questions
        // This is critical for answer submission to work correctly
        setGeneratedQuiz({
          title: savedQuiz.title,
          description: savedQuiz.description || parsedQuiz.description,
          time_limit_minutes: savedQuiz.time_limit_minutes || parsedQuiz.time_limit_minutes,
          questions: savedQuiz.questions.map((q) => ({
            id: q.id,  // Use actual database ID
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            points: q.points,
          })),
        });
        
        toast.success(`Generated ${questionsArray.length} questions successfully!`);
      } catch (saveError) {
        console.error('Failed to save quiz:', saveError);
        toast.warning('Quiz generated but not saved to backend');
        // Fall back to using the parsed quiz (won't be able to submit answers)
        setGeneratedQuiz(parsedQuiz);
      }
      
      setViewState('generated');
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz');
    }
  };

  const handleStartQuiz = async () => {
    if (!savedQuizId) {
      toast.error('Quiz not saved. Please regenerate.');
      return;
    }
    
    try {
      // Start quiz attempt in backend (Requirement 14.3)
      const attempt = await startAttemptMutation.mutateAsync(savedQuizId);
      setCurrentAttemptId(attempt.id);
      setQuizAnswers({});
      setViewState('taking');
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast.error('Failed to start quiz attempt');
    }
  };

  const handleCompleteQuiz = async (answers: Record<string, string>) => {
    if (!currentAttemptId) {
      toast.error('No active quiz attempt');
      return;
    }
    
    setQuizAnswers(answers);
    
    try {
      // Submit all answers to backend (Requirement 14.4)
      // Note: In a real implementation, answers would be submitted as they're answered
      // For now, we'll submit them all at completion
      
      // Complete the quiz attempt (Requirement 14.5)
      const result = await completeAttemptMutation.mutateAsync(currentAttemptId);
      
      // Display results (Requirement 14.6)
      setViewState('results');
      toast.success(`Quiz completed! Score: ${result.score}/${result.total_points}`);
    } catch (error) {
      console.error('Failed to complete quiz:', error);
      toast.error('Failed to complete quiz');
    }
  };

  const handleRetry = () => {
    setQuizAnswers({});
    setCurrentAttemptId(null);
    setViewState('generated');
  };

  const handleNewQuiz = () => {
    setUploadedFile(null);
    setGeneratedQuiz(null);
    setQuizAnswers({});
    setCurrentAttemptId(null);
    setSavedQuizId(null);
    setViewState('upload');
  };

  const handleSubmitAnswer = async (questionId: string, answer: string, timeTaken: number) => {
    if (!currentAttemptId) {
      throw new Error('No active quiz attempt');
    }
    
    await submitAnswerMutation.mutateAsync({
      question_id: questionId,
      answer: answer,
      time_taken_seconds: timeTaken,
    });
  };

  return (
    <div className="max-w-4xl">
      <Header />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          {viewState === 'upload' && (
            <p className="text-slate-500 mt-1 text-sm">Test your knowledge with AI-generated questions.</p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewState === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroBanner />
            <UploadSection 
              onFileSelect={handleFileSelect}
              onTextInput={() => setViewState('textInput')}
            />
            
            {existingQuizzes && existingQuizzes.length > 0 && (
              <div className="mt-12 border-t border-slate-100 pt-10">
                <h3 className="text-lg font-bold tracking-tight mb-5 text-slate-800">Your Quizzes</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  {existingQuizzes.map((quiz: any) => (
                    <div 
                      key={quiz.id}
                      className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-[var(--primary-300)] hover:scale-[1.01] active:scale-[0.995] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <h4 className="font-bold text-slate-800 text-[15px] sm:text-[16px]">{quiz.title}</h4>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2 leading-relaxed">{quiz.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {viewState === 'textInput' && (
          <motion.div
            key="textInput"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroBanner />
            <TextInputSection
              onSubmit={handleGenerate}
              onCancel={() => setViewState('upload')}
              isLoading={generateMutation.isPending}
            />
          </motion.div>
        )}

        {viewState === 'ready' && uploadedFile && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroBanner />
            <DocumentCard
              name={uploadedFile.name}
              onRemove={handleRemoveFile}
              onSubmit={() => handleGenerate(uploadedFile.rawFile || uploadedFile.content)}
              isLoading={generateMutation.isPending}
            />
          </motion.div>
        )}

        {viewState === 'generated' && generatedQuiz && (
          <motion.div
            key="generated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizDisplay
              quiz={generatedQuiz}
              onStart={handleStartQuiz}
            />
          </motion.div>
        )}

        {viewState === 'taking' && generatedQuiz && (
          <motion.div
            key="taking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizTaker
              quiz={generatedQuiz}
              onComplete={handleCompleteQuiz}
              onExit={() => setViewState('generated')}
              attemptId={currentAttemptId}
              onSubmitAnswer={handleSubmitAnswer}
            />
          </motion.div>
        )}

        {viewState === 'results' && generatedQuiz && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizResults
              quiz={generatedQuiz}
              answers={quizAnswers}
              onRetry={handleRetry}
              onNewQuiz={handleNewQuiz}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}