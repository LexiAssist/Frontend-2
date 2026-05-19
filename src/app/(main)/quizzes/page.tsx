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
    <div className="relative overflow-hidden rounded-2xl bg-[#df7361] mb-8">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex items-center gap-8 px-6 sm:px-8 lg:px-10 py-8 lg:py-10">
        <div className="hidden sm:block flex-shrink-0">
          <div className="relative h-[160px] w-[200px] lg:h-[200px] lg:w-[240px] p-2">
            <svg viewBox="0 0 200 180" fill="none" className="h-full w-full">
              <rect x="20" y="40" width="140" height="100" rx="8" fill="white" fillOpacity="0.9" />
              <rect x="35" y="55" width="100" height="8" rx="4" fill="#df7361" fillOpacity="0.3" />
              <rect x="35" y="70" width="80" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <rect x="35" y="82" width="90" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <rect x="35" y="94" width="70" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <circle cx="160" cy="50" r="18" fill="white" />
              <path d="M152 50L157 55L168 44" stroke="#df7361" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="100" cy="165" rx="35" ry="10" fill="rgba(0,0,0,0.1)" />
              <circle cx="100" cy="110" r="25" fill="#2d3748" />
              <path d="M75 140 Q100 120 125 140 L125 170 L75 170 Z" fill="#2d3748" />
              <rect x="60" y="130" width="80" height="50" rx="4" fill="white" />
              <rect x="65" y="135" width="70" height="35" rx="2" fill="#e2e8f0" />
            </svg>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <h2 className="text-2xl lg:text-[32px] font-bold text-white">Quizzes</h2>
          <p className="mt-3 text-sm lg:text-[15px] leading-relaxed text-white/95">
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
    <div className="space-y-4">
      <button
        onClick={onFileSelect}
        className="w-full p-8 border-2 border-dashed border-[var(--primary-500)] rounded-2xl bg-[var(--primary-50)] hover:bg-[var(--primary-100)]/40 transition-colors flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--primary-500)] flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Click to upload a document</p>
          <p className="text-sm text-slate-500 mt-1">PDF, DOC, TXT (max 25MB)</p>
        </div>
      </button>
      
      <div className="text-center">
        <span className="text-sm text-slate-400">or</span>
      </div>
      
      <button
        onClick={onTextInput}
        className="w-full py-4 px-6 rounded-xl border border-[var(--primary-500)] text-[var(--primary-500)] font-semibold hover:bg-[var(--primary-50)] transition-colors"
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
    <div className="max-w-md">
      <h3 className="mb-4 text-base font-medium text-slate-600">
        Document uploaded
      </h3>

      <div className="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-500)]">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-semibold text-slate-900">
            {name}
          </p>
          <p className="text-sm text-slate-400">PDF</p>
        </div>
        <button 
          onClick={onRemove}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Button
        onClick={onSubmit}
        isLoading={isLoading}
        className="mt-4 w-full rounded-xl"
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Enter your study material
        </h3>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes, textbook excerpt, or any study material here..."
          className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] outline-none resize-none"
        />
        
        <div className="flex gap-3 mt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(text)}
            isLoading={isLoading}
            disabled={!text.trim()}
            className="flex-1 rounded-xl"
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
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{quiz.title}</h2>
          <p className="text-slate-500 mt-1">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{quiz.time_limit_minutes} min</span>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[var(--primary-500)]" />
          <span className="text-slate-700">{quiz.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--primary-500)]" />
          <span className="text-slate-700">Multiple choice & true/false</span>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full rounded-xl py-3.5 text-base font-semibold"
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
    
    // Submit answer to backend (Requirement 14.4)
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-slate-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary-500)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          {question.question_text}
        </h3>

        {question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option.text)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedOption === option.text
                    ? 'border-[var(--primary-500)] bg-[var(--primary-50)]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-slate-900">{String.fromCharCode(65 + idx)}.</span>{' '}
                <span className="text-slate-800">{option.text}</span>
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
                className={`flex-1 p-4 rounded-xl border font-semibold transition-all ${
                  selectedOption === option
                    ? 'border-[var(--primary-500)] bg-[var(--primary-50)] text-[var(--primary-600)]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Exit
          </Button>
          <Button
            onClick={handleAnswer}
            disabled={!selectedOption}
            className="flex-1 rounded-xl"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--primary-50)] flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[var(--primary-500)]" />
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Quiz Complete!</h2>
        <p className="text-slate-500 mb-6">
          You scored {correctCount} out of {quiz.questions.length} correct
        </p>

        <div className="text-4xl font-bold text-[var(--primary-500)] mb-8">
          {score}%
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={onRetry}
            variant="outline"
            className="rounded-xl px-6"
          >
            Retry Quiz
          </Button>
          <Button
            onClick={onNewQuiz}
            className="rounded-xl px-6"
          >
            New Quiz
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Review Answers</h3>
        <div className="space-y-4">
          {quiz.questions.map((q, idx) => {
            const isCorrect = answers[q.id] === q.correct_answer;
            return (
              <div 
                key={q.id}
                className={`p-4 rounded-xl border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{idx + 1}. {q.question_text}</p>
                    <p className="text-sm mt-1">
                      Your answer: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{answers[q.id]}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct answer: <span className="font-medium">{q.correct_answer}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-sm text-slate-600 mt-2">{q.explanation}</p>
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
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
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
      });
      setViewState('ready');
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      setUploadedFile({
        name: file.name.replace(/\.[^/.]+$/, ""),
        content: `Generate a quiz about: ${file.name}`,
      });
      setViewState('ready');
    }
    
    event.target.value = '';
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setViewState('upload');
  };

  const handleGenerate = async (content: string) => {
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
              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Your Quizzes</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {existingQuizzes.map((quiz: any) => (
                    <div 
                      key={quiz.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[var(--primary-300)] hover:shadow-sm transition-all cursor-pointer"
                    >
                      <h4 className="font-semibold text-slate-900">{quiz.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>
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
              onSubmit={() => handleGenerate(uploadedFile.content)}
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