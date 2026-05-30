"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CloudUpload,
  FileText,
  HelpCircle,
  X,
} from "lucide-react";
import { FeatureHeader } from '@/components/FeatureHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGenerateFlashcards, useCreateFlashcardDeck } from '@/hooks/useFlashcards';
import { flashcardApi } from '@/services/api';

type ViewState = "upload" | "ready" | "generated" | "list" | "textInput";

type SelectedDocument = {
  name: string;
  extension: string;
  content?: string;
};

type GeneratedFlashcard = {
  id: string;
  front: string;
  back: string;
};

const transitionProps = { duration: 0.22, ease: "easeOut" as const };

function getExtension(name: string) {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext && ext !== name.toUpperCase() ? ext : "FILE";
}

function getDisplayName(name: string) {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return withoutExt || name;
}

function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-[22px] sm:text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#272A28]">
        {title}
      </h1>
      <FeatureHeader />
    </div>
  );
}

function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] border border-[#F5A623]/25 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10 shadow-[0_8px_30px_rgba(245,166,35,0.08)]">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22px 22px, #F5A623 0 20px, transparent 21px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="relative z-10 flex min-h-[160px] sm:min-h-[180px] lg:min-h-[206px] flex-col sm:flex-row items-center justify-center gap-6 sm:gap-[40px] lg:gap-[52px]">
        <div className="relative h-[120px] w-[160px] sm:h-[140px] sm:w-[180px] lg:h-[206px] lg:w-[225px] shrink-0 hover:scale-105 transition-transform duration-500 ease-out">
          <Image
            src="/images/flashcard.jpg"
            alt="Flashcards illustration"
            fill
            className="object-contain mix-blend-multiply"
          />
        </div>
        <div className="w-full max-w-[498px] text-center sm:text-left">
          <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-[#2C200C]">
            Flashcards
          </h2>
          <p className="pt-3 sm:pt-4 lg:pt-5 text-[15px] sm:text-[17px] lg:text-[19px] leading-[1.45] tracking-[-0.015em] text-[#63481B]/90 font-medium">
            Learn more effectively with AI-generated flashcards. Upload a document or enter text to get started.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadDropzone({ onChooseFile, onTextInput }: { onChooseFile: () => void; onTextInput: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={transitionProps}
      className="space-y-5"
    >
      <button
        type="button"
        onClick={onChooseFile}
        className="flex min-h-[220px] sm:min-h-[260px] lg:min-h-[286px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#F5A623]/35 bg-[#FAF9F5]/80 px-4 sm:px-8 text-center hover:bg-[#FAF9F5] hover:scale-[1.01] active:scale-[0.995] shadow-sm hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex h-[56px] w-[56px] sm:h-[68px] sm:w-[68px] lg:h-[78px] lg:w-[78px] items-center justify-center rounded-full bg-gradient-to-br from-[#F5A623] to-[#E28704] shadow-[0_8px_20px_-4px_rgba(245,166,35,0.3)]">
          <CloudUpload className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-white" />
        </div>
        <p className="pt-5 sm:pt-6 text-[18px] sm:text-[20px] lg:text-[22px] font-bold leading-[1.2] tracking-[-0.025em] text-[#8F5500]">
          Click to upload or drag and drop
        </p>
        <p className="pt-2 text-[13px] sm:text-[15px] lg:text-[16px] font-medium leading-[1.45] text-[#8F5500]/60">
          PDF, DOC, TXT (max 25MB)
        </p>
      </button>
      
      <div className="flex items-center justify-center gap-3">
        <div className="h-[1px] w-8 bg-slate-200" />
        <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">or</span>
        <div className="h-[1px] w-8 bg-slate-200" />
      </div>
      
      <button
        type="button"
        onClick={onTextInput}
        className="w-full py-4 px-6 rounded-xl border border-[#F5A623]/40 text-[#D97706] font-semibold hover:bg-[#FFFBEB] active:scale-[0.99] transition-all duration-200"
      >
        Type or paste your content
      </button>
    </motion.div>
  );
}

function TextInputState({ 
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={transitionProps}
      className="w-full"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8">
        <p className="text-[16px] sm:text-[18px] font-semibold tracking-[-0.015em] text-slate-800 mb-4">
          Enter your content
        </p>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your study material here..."
          className="w-full min-h-[220px] p-4 rounded-xl border border-slate-200 focus:border-[#F5A623] focus:ring-[3px] focus:ring-[#F5A623]/10 transition-all outline-none resize-none text-[15px] leading-relaxed text-slate-700"
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
            className="flex-1 rounded-xl py-3 text-sm font-semibold bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
          >
            Generate Flashcards
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ReadyState({
  document,
  onCancel,
  onSubmit,
  isLoading,
}: {
  document: SelectedDocument;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={transitionProps}
      className="w-full"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8 max-w-md">
        <p className="text-[15px] sm:text-[17px] font-semibold text-slate-800 tracking-[-0.015em]">
          Document uploaded
        </p>

        <div className="mt-4 flex h-[60px] sm:h-[68px] w-full items-center justify-between rounded-xl bg-[#FAF9F5] border border-[#F5A623]/15 px-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center text-[#D97706] bg-[#FFFBEB] rounded-lg shrink-0">
              <FileText className="h-6 w-6 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] sm:text-[15px] font-semibold text-slate-700 truncate">
                {document.name}
              </p>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                {document.extension}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 shrink-0"
            aria-label="Remove selected document"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Button
          onClick={onSubmit}
          isLoading={isLoading}
          className="mt-6 w-full h-[48px] sm:h-[50px] rounded-xl text-[14px] sm:text-[15px] font-bold shadow-[0_4px_12px_rgba(60,131,80,0.15)] bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
        >
          Generate Flashcards
        </Button>
      </div>
    </motion.div>
  );
}

function SideCard({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={[
        "hidden h-[214px] w-[180px] rounded-2xl bg-gradient-to-br from-[#EAF4EE] to-[#D5EADF] border border-[#6B9E7C]/20 px-5 py-6 lg:block lg:h-[258px] lg:w-[180px] opacity-40 shadow-sm",
        side === "left"
          ? "origin-right scale-[0.96]"
          : "origin-left scale-[0.96]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col justify-center gap-5">
        <div className="h-3 w-[85%] rounded-full bg-[#6B9E7C]/30" />
        <div className="h-3 w-[65%] rounded-full bg-[#6B9E7C]/30" />
        <div className="h-3 w-[80%] rounded-full bg-[#6B9E7C]/30" />
      </div>
    </div>
  );
}

function GeneratedState({ 
  flashcards, 
  currentIndex, 
  onNext, 
  onPrev, 
  onFlip, 
  isFlipped,
  onSaveDeck,
  isSaving
}: { 
  flashcards: GeneratedFlashcard[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onFlip: () => void;
  isFlipped: boolean;
  onSaveDeck: () => void;
  isSaving: boolean;
}) {
  const currentCard = flashcards[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={transitionProps}
      className="pt-4 sm:pt-8"
    >
      <div className="mx-auto flex max-w-[760px] items-center justify-center gap-4 sm:gap-[32px] lg:gap-[46px] px-4 sm:px-0">
        <SideCard side="left" />

        <div 
          onClick={onFlip}
          className={`relative h-[280px] w-[210px] sm:h-[321px] sm:w-[241px] lg:h-[360px] lg:w-[290px] overflow-hidden rounded-3xl px-6 py-6 text-white cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] active:scale-[0.975] ${
            isFlipped 
              ? 'bg-gradient-to-br from-[#D97706] via-[#C26B05] to-[#8C4B00] border border-amber-400/20 shadow-[0_25px_60px_-12px_rgba(217,119,6,0.35)]' 
              : 'bg-gradient-to-br from-[#3C8350] via-[#2F653E] to-[#1F452A] border border-emerald-400/20 shadow-[0_25px_60px_-12px_rgba(60,131,80,0.35)]'
          }`}
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-between text-center py-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm shadow-inner">
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            
            <div className="space-y-4 my-auto">
              <p className="text-[12px] uppercase font-black tracking-widest text-white/50">{isFlipped ? 'Answer' : 'Question'}</p>
              <p className="max-w-[190px] sm:max-w-[210px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold leading-[1.35] tracking-tight">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="pb-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-white/60 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                {currentIndex + 1} of {flashcards.length}
              </span>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-black/15 blur-lg pointer-events-none" />
        </div>

        <SideCard side="right" />
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-8 pt-8 sm:pt-10">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous flashcard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next flashcard"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Save Deck Button */}
      <div className="flex justify-center pt-8">
        <Button
          onClick={onSaveDeck}
          isLoading={isSaving}
          className="px-8 rounded-xl font-bold py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] shadow-md shadow-emerald-800/10 active:scale-[0.98] transition-all"
        >
          Save Flashcard Deck
        </Button>
      </div>
    </motion.div>
  );
}

export default function FlashcardsPage() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);
  const [inputText, setInputText] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();
  const generateMutation = useGenerateFlashcards();
  const createDeckMutation = useCreateFlashcardDeck();

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSelectedDocument({
        name: getDisplayName(file.name),
        extension: getExtension(file.name),
        content: content,
      });
      setViewState("ready");
    };
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      // For other file types, just store metadata
      setSelectedDocument({
        name: getDisplayName(file.name),
        extension: getExtension(file.name),
        content: `Generate flashcards from the document: ${file.name}`,
      });
      setViewState("ready");
    }
    
    event.target.value = "";
  };

  const resetUpload = () => {
    setSelectedDocument(null);
    setInputText('');
    setViewState("upload");
  };

  const handleGenerate = useCallback(async (content: string) => {
    if (!user?.id) {
      toast.error('Please log in to generate flashcards');
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        content,
        userId: user.id,
      });

      console.log('[Flashcards] API response:', result);

      // The API returns { flashcards: [{front, back, topic}, ...] }
      const flashcardsArray = result.flashcards;
      
      if (!Array.isArray(flashcardsArray)) {
        console.error('[Flashcards] Expected array but got:', typeof flashcardsArray, flashcardsArray);
        throw new Error('Invalid response format: expected flashcards array');
      }
      
      if (flashcardsArray.length === 0) {
        toast.warning('No flashcards were generated. Please try with different content.');
        return;
      }

      // Map API response to our component format
      const parsedFlashcards = flashcardsArray.map((card: any, index: number) => ({
        id: `card-${index}`,
        front: String(card.front || card.question || ''),
        back: String(card.back || card.answer || ''),
      }));
      
      if (parsedFlashcards.length === 0) {
        toast.warning('Could not parse flashcards from AI response. Please try again.');
        return;
      }
      
      setGeneratedFlashcards(parsedFlashcards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setViewState("generated");
      
      toast.success(`Generated ${parsedFlashcards.length} flashcards!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate flashcards');
    }
  }, [user, generateMutation]);

  const handleTextSubmit = (text: string) => {
    setInputText(text);
    handleGenerate(text);
  };

  const handleDocumentSubmit = () => {
    if (selectedDocument?.content) {
      handleGenerate(selectedDocument.content);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < generatedFlashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSaveDeck = useCallback(async () => {
    if (!user?.id || generatedFlashcards.length === 0) {
      toast.error('No flashcards to save');
      return;
    }

    try {
      // Generate a title based on the source
      const title = selectedDocument?.name 
        ? `Flashcards: ${selectedDocument.name}`
        : `Flashcards - ${new Date().toLocaleDateString()}`;

      await createDeckMutation.mutateAsync({
        title,
        description: `Generated from ${selectedDocument?.name || 'text input'}`,
        cards: generatedFlashcards.map((card, index) => ({
          front: card.front,
          back: card.back,
          order_index: index,
        })),
      });

      toast.success('Flashcard deck saved successfully!');
    } catch (error) {
      console.error('Save deck error:', error);
      // Error toast is already shown by the mutation
    }
  }, [user, generatedFlashcards, selectedDocument, createDeckMutation]);

  const headerTitle =
    viewState === "generated" && selectedDocument
      ? selectedDocument.name
      : "FlashCards";

  return (
    <div className="mx-auto w-full max-w-[1008px] pb-8">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />

      <div className="space-y-[42px] pt-8">
        <PageHeader title={headerTitle} />

        <AnimatePresence mode="wait">
          {viewState === "generated" ? (
            <motion.div
              key="generated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GeneratedState 
                flashcards={generatedFlashcards}
                currentIndex={currentCardIndex}
                onNext={handleNextCard}
                onPrev={handlePrevCard}
                onFlip={handleFlip}
                isFlipped={isFlipped}
                onSaveDeck={handleSaveDeck}
                isSaving={createDeckMutation.isPending}
              />
            </motion.div>
          ) : (
            <motion.div
              key={viewState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-[42px]"
            >
              <Banner />

              {viewState === "upload" ? (
                <UploadDropzone 
                  onChooseFile={handleOpenPicker} 
                  onTextInput={() => setViewState('textInput')}
                />
              ) : viewState === "textInput" ? (
                <TextInputState
                  onSubmit={handleTextSubmit}
                  onCancel={() => setViewState('upload')}
                  isLoading={generateMutation.isPending}
                />
              ) : selectedDocument ? (
                <ReadyState
                  document={selectedDocument}
                  onCancel={resetUpload}
                  onSubmit={handleDocumentSubmit}
                  isLoading={generateMutation.isPending}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
