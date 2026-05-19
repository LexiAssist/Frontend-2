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
    <div className="relative overflow-hidden rounded-lg bg-[#ff9a05] px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22px 22px, rgba(198,122,0,0.55) 0 20px, transparent 21px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="relative z-10 flex min-h-[160px] sm:min-h-[180px] lg:min-h-[206px] flex-col sm:flex-row items-center justify-center gap-4 sm:gap-[32px] lg:gap-[52px]">
        <div className="relative h-[120px] w-[160px] sm:h-[140px] sm:w-[180px] lg:h-[206px] lg:w-[225px] shrink-0">
          <Image
            src="/images/flashcard.jpg"
            alt="Flashcards illustration"
            fill
            className="object-contain mix-blend-screen"
          />
        </div>
        <div className="w-full max-w-[498px] text-center sm:text-left">
          <h2 className="text-[20px] sm:text-[24px] lg:text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#272A28]">
            Flashcards
          </h2>
          <p className="pt-3 sm:pt-5 lg:pt-7 text-[16px] sm:text-[18px] lg:text-[20px] leading-[1.3] sm:leading-[1.2] tracking-[-0.02em] text-[#555C56]">
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={onChooseFile}
        className="flex min-h-[220px] sm:min-h-[260px] lg:min-h-[286px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[var(--primary-500)] bg-[rgba(60,131,80,0.18)] px-4 sm:px-8 text-center touch-target hover:bg-[rgba(60,131,80,0.25)] transition-colors"
      >
        <div className="flex h-[56px] w-[56px] sm:h-[68px] sm:w-[68px] lg:h-[78px] lg:w-[78px] items-center justify-center rounded-full bg-[var(--primary-500)]">
          <CloudUpload className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-[var(--primary-50)]" />
        </div>
        <p className="pt-3 sm:pt-4 text-[18px] sm:text-[20px] lg:text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--primary-500)]">
          Click to upload or drag and drop
        </p>
        <p className="pt-2 text-[14px] sm:text-[16px] lg:text-[18px] leading-[1.45] text-black/60">
          PDF, DOC, TXT (max 25MB)
        </p>
      </button>
      
      <div className="text-center">
        <span className="text-sm text-gray-500">or</span>
      </div>
      
      <button
        type="button"
        onClick={onTextInput}
        className="w-full py-4 px-6 rounded-lg border border-[var(--primary-500)] text-[var(--primary-500)] font-medium hover:bg-[var(--primary-50)] transition-colors"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="w-full"
    >
      <p className="text-[16px] sm:text-[20px] font-medium leading-[1.2] tracking-[-0.02em] text-[#6b6f6c] mb-4">
        Enter your content
      </p>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your study material here..."
        className="w-full min-h-[200px] p-4 rounded-lg border border-gray-200 focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] outline-none resize-none"
      />
      
      <div className="flex gap-3 mt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(text)}
          isLoading={isLoading}
          disabled={!text.trim()}
          className="flex-1"
        >
          Generate Flashcards
        </Button>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="w-full"
    >
      <p className="text-[16px] sm:text-[20px] font-medium leading-[1.2] tracking-[-0.02em] text-[#6b6f6c]">
        Document uploaded
      </p>

      <div className="mt-4 sm:mt-5 flex h-[56px] sm:h-[64px] w-full max-w-[380px] items-center justify-between rounded-lg bg-[#efefef] px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-[var(--primary-500)] shrink-0">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 fill-current stroke-[1.6]" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] sm:text-[16px] font-medium text-[#555C56] truncate">
              {document.name}
            </p>
            <p className="pt-0.5 text-[12px] sm:text-[14px] text-[#888d89]">
              {document.extension}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-full p-2 text-black transition hover:bg-white disabled:opacity-50 touch-target shrink-0"
          aria-label="Remove selected document"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Button
        onClick={onSubmit}
        isLoading={isLoading}
        className="mt-5 sm:mt-6 w-full max-w-[380px] h-[48px] sm:h-[52px] rounded-full text-[14px] sm:text-[16px] font-semibold"
      >
        Generate Flashcards
      </Button>
    </motion.div>
  );
}

function SideCard({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={[
        "hidden h-[214px] w-[180px] rounded-md bg-[#6ca378] px-5 py-6 lg:block lg:h-[258px] lg:w-[180px]",
        side === "left"
          ? "origin-right scale-[0.98]"
          : "origin-left scale-[0.98]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col justify-center gap-5">
        <div className="h-4 w-[85%] rounded-full bg-[rgba(236,243,238,0.85)]" />
        <div className="h-4 w-[65%] rounded-full bg-[rgba(236,243,238,0.85)]" />
        <div className="h-4 w-[85%] rounded-full bg-[rgba(236,243,238,0.85)]" />
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="pt-4 sm:pt-8"
    >
      <div className="mx-auto flex max-w-[760px] items-center justify-center gap-4 sm:gap-[32px] lg:gap-[46px] px-4 sm:px-0">
        <SideCard side="left" />

        <div 
          onClick={onFlip}
          className="relative h-[280px] w-[210px] sm:h-[321px] sm:w-[241px] lg:h-[360px] lg:w-[290px] overflow-hidden rounded-md bg-[var(--primary-500)] px-4 sm:px-6 py-5 sm:py-7 text-white shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <div className="relative z-10 flex h-full flex-col items-center text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-[3px] border-white">
              <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <p className="pt-2 text-[16px] sm:text-[18px] font-semibold">{currentIndex + 1}/{flashcards.length}</p>
            <p className="max-w-[180px] sm:max-w-[205px] pt-5 sm:pt-7 text-[16px] sm:text-[18px] lg:text-[20px] font-semibold leading-[1.35]">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>

            <div className="mt-auto pb-2 sm:pb-3">
              <span className="text-sm text-white/70">
                {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-[-12%] h-[60px] sm:h-[86px] w-[60%] rounded-[50%] bg-[rgba(236,243,238,0.22)]" />
          <div className="absolute bottom-0 right-[-14%] h-[60px] sm:h-[86px] w-[60%] rounded-[50%] bg-[rgba(25,55,34,0.45)]" />
        </div>

        <SideCard side="right" />
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-10 pt-8 sm:pt-14">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[var(--primary-500)] text-[var(--primary-500)] transition hover:bg-[var(--primary-50)] touch-target disabled:opacity-50"
          aria-label="Previous flashcard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[var(--primary-500)] text-[var(--primary-500)] transition hover:bg-[var(--primary-50)] touch-target disabled:opacity-50"
          aria-label="Next flashcard"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Save Deck Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onSaveDeck}
          isLoading={isSaving}
          className="px-8"
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
