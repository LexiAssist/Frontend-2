'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, BookOpenText, Sparkles, Volume2, X, Focus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FeatureHeader } from '@/components/FeatureHeader';
import dynamic from 'next/dynamic';
import { readingApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const BookLoverCuate = dynamic(() => import('@/components/illustrations/BookLoverCuate'), {
  loading: () => <div className="w-40 h-32 bg-slate-100 rounded-xl animate-pulse" />,
  ssr: false
});

type ViewState = 'home' | 'upload' | 'reading';
type TextMode = 'original' | 'simplified' | 'summarized';
type Difficulty = 'beginner' | 'intermediate';
type FontChoice = 'default' | 'opendyslexic' | 'roboto';
type BackgroundTint = 'none' | 'yellow' | 'blue' | 'green' | 'beige' | 'cream' | 'pink' | 'lavender' | 'mint' | 'peach' | 'sky' | 'rose' | 'sage' | 'warm' | 'cool';

interface VocabWord {
  term: string;
  definition: string;
  context_snippet: string;
}

const BACKGROUND_TINTS: Record<BackgroundTint, string> = {
  none: '#ffffff',
  yellow: '#FFF9E6',
  blue: '#E8F4FD',
  green: '#E8F5E9',
  beige: '#F5F5DC',
  cream: '#FFFDD0',
  pink: '#FFE4E1',
  lavender: '#E6E6FA',
  mint: '#F0FFF0',
  peach: '#FFDAB9',
  sky: '#E0F7FA',
  rose: '#FFF0F3',
  sage: '#E8F3E8',
  warm: '#FFF8E7',
  cool: '#F0F8FF',
};

const TINT_COLORS = [
  { id: 'yellow', color: '#FFF9E6' },
  { id: 'blue', color: '#E8F4FD' },
  { id: 'green', color: '#E8F5E9' },
  { id: 'beige', color: '#F5F5DC' },
  { id: 'cream', color: '#FFFDD0' },
  { id: 'pink', color: '#FFE4E1' },
  { id: 'lavender', color: '#E6E6FA' },
  { id: 'mint', color: '#F0FFF0' },
  { id: 'peach', color: '#FFDAB9' },
  { id: 'sky', color: '#E0F7FA' },
  { id: 'rose', color: '#FFF0F3' },
  { id: 'sage', color: '#E8F3E8' },
  { id: 'warm', color: '#FFF8E7' },
  { id: 'cool', color: '#F0F8FF' },
];

export default function ReadingAssistantPage() {
  const [viewState, setViewState] = useState<ViewState>('home');
  const [textMode, setTextMode] = useState<TextMode>('original');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [focusMode, setFocusMode] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [toolsCollapsed, setToolsCollapsed] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  
  const [fontChoice, setFontChoice] = useState<FontChoice>('default');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [backgroundTint, setBackgroundTint] = useState<BackgroundTint>('none');
  const [showTintPicker, setShowTintPicker] = useState(false);
  const [dimSurrounding, setDimSurrounding] = useState(false);
  const [showSpacingPanel, setShowSpacingPanel] = useState(false);
  
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const [originalText, setOriginalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [simplifiedCache, setSimplifiedCache] = useState<{beginner?: string; intermediate?: string}>({});
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [summarizedText, setSummarizedText] = useState('');
  const [vocabList, setVocabList] = useState<VocabWord[]>([]);
  const [ttsAudioB64, setTtsAudioB64] = useState<string>('');
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/wav');
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  const [streamStage, setStreamStage] = useState<'idle' | 'extracting' | 'storing' | 'summarizing' | 'vocab' | 'tts' | 'complete'>('idle');
  const [streamingSummary, setStreamingSummary] = useState('');
  const [streamingVocab, setStreamingVocab] = useState<VocabWord[]>([]);
  const [streamProgress, setStreamProgress] = useState(0);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  
  const streamingSummaryRef = useRef(streamingSummary);
  const streamingVocabRef = useRef(streamingVocab);
  
  useEffect(() => { streamingSummaryRef.current = streamingSummary; }, [streamingSummary]);
  useEffect(() => { streamingVocabRef.current = streamingVocab; }, [streamingVocab]);
  
  useEffect(() => {
    if (isProcessing && streamStage !== 'complete') {
      const timer = setTimeout(() => {
        setIsSlowConnection(true);
      }, 30000);
      return () => clearTimeout(timer);
    } else {
      setIsSlowConnection(false);
    }
  }, [isProcessing, streamStage]);
  
  const { user } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = () => {
      setShowFontDropdown(false);
      setShowDifficultyDropdown(false);
      setShowTintPicker(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileUpload = (file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Please upload PDF, DOC, TXT, or image');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File must be under 25MB');
      return;
    }
    setUploadedFile(file);
    setViewState('upload');
    toast.success(`"${file.name}" uploaded`);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setViewState('home');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsProcessing(true);
    setStreamStage('extracting');
    setStreamingSummary('');
    setStreamingVocab([]);
    setStreamProgress(0);
    
    try {
      const result = await readingApi.analyseAsync(
        uploadedFile,
        user.id,
        (progress, message) => {
          setStreamProgress(progress);
          console.log('[Analysis Progress]', progress, message);
          
          if (progress < 20) setStreamStage('extracting');
          else if (progress < 40) setStreamStage('storing');
          else if (progress < 70) setStreamStage('summarizing');
          else if (progress < 90) setStreamStage('vocab');
          else if (progress < 100) setStreamStage('tts');
          else setStreamStage('complete');
        },
        'concise',
        'Zephyr',
        1.0
      );
      
      setSummarizedText(result.summary);
      setVocabList(result.vocab_terms.map((t: any) => ({
        term: t.term,
        definition: t.definition,
        context_snippet: t.context_snippet || ''
      })));
      setTtsAudioB64(result.tts_audio_b64 || '');
      setCurrentSessionId(result.session_id);
      
      setOriginalText(`[Document: ${uploadedFile.name}]\n\nThe original text is currently unavailable, but your summary and vocabulary have been successfully generated.`);
      setSimplifiedText(`[Document: ${uploadedFile.name}]\n\nSimplified version is currently unavailable.`);
      
      setViewState('reading');
      setTextMode('summarized');
      setIsProcessing(false);
      setStreamStage('complete');
      toast.success('Document analysed successfully');
      
    } catch (error: any) {
      setIsProcessing(false);
      setStreamStage('idle');
      toast.error(error.message || 'Failed to analyse document');
    }
  };

  const handleSummarize = () => {
    toast.info('Summary was automatically generated during upload.');
    setTextMode('summarized');
  };

  const loadPreviousSession = async (sessionId: string) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      setIsProcessing(true);
      const session = await readingApi.getSession(sessionId, user.id);
      
      setSummarizedText(session.summary);
      setVocabList(session.vocab_terms.map(t => ({
        term: t.term,
        definition: t.definition,
        context_snippet: t.context_snippet || ''
      })));
      setTtsAudioB64(session.tts_audio_b64);
      setCurrentSessionId(session.session_id);
      
      setOriginalText(`[Document: ${session.filename || 'Previous Session'}]\n\nThe original text is currently unavailable.`);
      setSimplifiedText(`[Document: ${session.filename || 'Previous Session'}]\n\nSimplified version is currently unavailable.`);
      
      setViewState('reading');
      setTextMode('summarized');
      toast.success('Previous session loaded');
    } catch (error: any) {
      console.error('Failed to load session:', error);
      toast.error(error.message || 'Failed to load previous session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWordClick = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const vocab = vocabList.find(v => v.term.toLowerCase() === term.toLowerCase());
    if (vocab) {
      setSelectedWord(vocab);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const getFontFamily = () => {
    switch (fontChoice) {
      case 'opendyslexic': return 'OpenDyslexic, sans-serif';
      case 'roboto': return 'Roboto, sans-serif';
      default: return 'inherit';
    }
  };

  const getCurrentText = () => {
    if (textMode === 'summarized') return summarizedText;
    if (textMode === 'simplified') return simplifiedText;
    return originalText;
  };

  const handleDifficultySelect = async (level: Difficulty) => {
    if (!user || !summarizedText) return;
    
    setDifficulty(level);
    setTextMode('simplified');
    setShowDifficultyDropdown(false);
    
    if (simplifiedCache[level]) {
      setSimplifiedText(simplifiedCache[level]!);
      return;
    }
    
    setIsSimplifying(true);
    try {
      const result = await readingApi.simplify(summarizedText, level);
      setSimplifiedText(result.simplified_text);
      setSimplifiedCache(prev => ({ ...prev, [level]: result.simplified_text }));
    } catch (error: any) {
      console.error('Failed to simplify text:', error);
      toast.error('Failed to generate simplified text');
      setSimplifiedText(summarizedText);
    } finally {
      setIsSimplifying(false);
    }
  };

  if (focusMode) {
    const currentText = getCurrentText();
    const hasSummary = !!summarizedText;
    const displayText = currentText || (hasSummary ? summarizedText : 'No content available');
    
    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: BACKGROUND_TINTS[backgroundTint] }}>
        <div className="sticky top-0 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between" style={{ backgroundColor: `${BACKGROUND_TINTS[backgroundTint]}f0` }}>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm shadow-sm">
            <BookOpenText className="w-4 h-4 text-[#3D6E4E]" />
            <span className="text-slate-900 font-medium hidden sm:inline truncate max-w-[200px]">{uploadedFile?.name || 'Document'}</span>
            <span className="text-slate-900 font-medium sm:hidden">Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTextMode('original')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${textMode === 'original' ? 'bg-[#3D6E4E] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#3D6E4E]'}`}>Original</button>
            {summarizedText && (
              <button onClick={() => setTextMode('summarized')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${textMode === 'summarized' ? 'bg-[#3D6E4E] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#3D6E4E]'}`}>Summary</button>
            )}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowDifficultyDropdown(!showDifficultyDropdown); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 transition-all ${textMode === 'simplified' ? 'bg-[#3D6E4E] text-white border-[#3D6E4E] shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-[#3D6E4E]'}`}>
                <span className="hidden sm:inline">Simplified</span>
                <span className="sm:hidden">Simple</span>
              </button>
              {showDifficultyDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-slate-200 py-2 w-36 z-50">
                  <button onClick={() => handleDifficultySelect('beginner')} disabled={isSimplifying} className={`block w-full text-left px-4 py-2 text-sm ${difficulty === 'beginner' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-medium' : 'text-slate-600 hover:bg-slate-50'} ${isSimplifying ? 'opacity-50 cursor-not-allowed' : ''}`}>Beginner</button>
                  <button onClick={() => handleDifficultySelect('intermediate')} disabled={isSimplifying} className={`block w-full text-left px-4 py-2 text-sm ${difficulty === 'intermediate' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-medium' : 'text-slate-600 hover:bg-slate-50'} ${isSimplifying ? 'opacity-50 cursor-not-allowed' : ''}`}>Intermediate</button>
                </div>
              )}
            </div>
            {ttsAudioB64 && (
              <audio 
                controls 
                src={`data:${audioMimeType};base64,${ttsAudioB64}`} 
                className="h-8 w-32 sm:w-48"
              />
            )}
            <button 
              onClick={() => setFocusMode(false)} 
              className="flex items-center justify-center p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            {!currentText && hasSummary ? 'Summary' : textMode === 'summarized' ? 'Summary' : textMode === 'simplified' ? `Simplified (${difficulty})` : (uploadedFile?.name || 'Document Content')}
          </h1>
          {isSimplifying ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-5 h-5 border-2 border-[#3D6E4E] border-t-transparent rounded-full animate-spin" />
                <span>Generating {difficulty} version...</span>
              </div>
            </div>
          ) : (
            <DimmedText content={displayText} dimmed={dimSurrounding} fontFamily={getFontFamily()} letterSpacing={letterSpacing} wordSpacing={wordSpacing} lineHeight={lineHeight} vocabList={vocabList} onWordClick={handleWordClick} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-8 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Reading Assistant</h1>
          <p className="text-slate-500 mt-1 text-sm">Simplify complex text and learn at your own pace.</p>
        </div>
        <div className="flex items-center gap-3">
          {viewState === 'reading' && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileTools(!showMobileTools)} 
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:shadow-md transition-all border border-slate-200"
              aria-label="Reading Tools"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </motion.button>
          )}
          <FeatureHeader />
        </div>
      </div>

      {viewState === 'home' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full space-y-6"
        >
          <Card className="relative overflow-hidden border-0 rounded-2xl bg-[#EBF3FF] shadow-sm p-0">
            <div className="absolute inset-0 opacity-[0.08]">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="p1" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 30 Q15 15 30 30 Q45 45 60 30" fill="none" stroke="#407BFF" strokeWidth="1.5"/>
                  <path d="M30 0 Q45 15 30 30 Q15 45 30 60" fill="none" stroke="#407BFF" strokeWidth="1.5"/>
                </pattern></defs>
                <rect width="100%" height="100%" fill="url(#p1)"/>
              </svg>
            </div>
            <CardContent className="relative z-10 p-8 flex items-center gap-8">
              <div className="flex-shrink-0 w-40 h-32" aria-hidden="true">
                <BookLoverCuate />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Reading Assistant</h2>
                <p className="text-[15px] text-slate-600 leading-relaxed">Study with confidence as words are simplified into easy-to-understand bits</p>
              </div>
            </CardContent>
          </Card>

          <motion.button
            whileTap={{ scale: 0.99 }}
            className="rounded-2xl border-2 border-dashed border-[#D4E8D7] bg-[#F0F7F1] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 gap-4 sm:gap-5 hover:border-[#3D6E4E] hover:bg-[#E8F3EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6E4E] focus-visible:ring-offset-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3D6E4E] flex items-center justify-center text-white shadow-lg transition-transform duration-200 active:scale-95">
              <Upload className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="text-center">
              <p className="text-[#3D6E4E] font-semibold text-sm sm:text-base">
                <span className="font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                PDF, DOC, TXT, or Image files (max 25MB)
              </p>
            </div>
          </motion.button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
        </motion.div>
      )}

      {viewState === 'upload' && uploadedFile && (
        <div className="w-full space-y-6">
          <Card className="relative overflow-hidden border-0 rounded-2xl bg-[#EBF3FF] shadow-sm p-0">
            <div className="absolute inset-0 opacity-[0.06]">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="p2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 30 Q15 15 30 30" fill="none" stroke="#407BFF" strokeWidth="1.5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#p2)"/>
              </svg>
            </div>
            <CardContent className="relative z-10 p-8 flex items-center gap-6">
              <div className="flex-shrink-0 w-28 h-22" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Reading Assistant</h2>
                <p className="text-sm text-slate-600">Study with confidence</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5 max-w-md">
            <p className="text-base font-semibold text-slate-900">Document uploaded</p>
            
            <div className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-[#E8F3EA] flex items-center justify-center">
                <BookOpenText className="w-6 h-6 text-[#3D6E4E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{uploadedFile.name.replace(/\.[^/.]+$/, '')}</p>
                <p className="text-xs text-slate-400">{uploadedFile.name.split('.').pop()?.toUpperCase()}</p>
              </div>
              <button onClick={removeFile} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Button onClick={handleSubmit} isLoading={isProcessing} className="w-full rounded-xl py-4 text-base font-semibold shadow-lg">
              Submit Document
            </Button>
            
            {isProcessing && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">
                    {streamStage === 'extracting' && '📄 Extracting text...'}
                    {streamStage === 'storing' && '💾 Storing document...'}
                    {streamStage === 'summarizing' && '✨ Generating summary...'}
                    {streamStage === 'vocab' && '📚 Extracting vocabulary...'}
                    {streamStage === 'tts' && '🔊 Generating audio...'}
                    {streamStage === 'complete' && '✅ Complete!'}
                  </span>
                  {streamStage === 'tts' && (
                    <span className="text-xs text-slate-500">{streamProgress}%</span>
                  )}
                </div>
                
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#3D6E4E] transition-all duration-300 rounded-full"
                    style={{ 
                      width: streamStage === 'extracting' ? '10%' :
                             streamStage === 'storing' ? '25%' :
                             streamStage === 'summarizing' ? '50%' :
                             streamStage === 'vocab' ? '70%' :
                             streamStage === 'tts' ? `${streamProgress}%` :
                             streamStage === 'complete' ? '100%' : '0%'
                    }}
                  />
                </div>
                
                {streamingSummary && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Summary Preview:</p>
                    <p className="text-sm text-slate-900 line-clamp-4">{streamingSummary}</p>
                  </div>
                )}
                
                {streamingVocab.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Vocabulary ({streamingVocab.length} terms):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {streamingVocab.slice(0, 5).map((v, i) => (
                        <span key={i} className="px-2 py-1 bg-[#EBF3FF] text-[#407BFF] text-xs rounded-lg">
                          {v.term}
                        </span>
                      ))}
                      {streamingVocab.length > 5 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg">
                          +{streamingVocab.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {isSlowConnection && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800 flex items-center gap-2">
                      <span>⏱️</span>
                      <span>This is taking longer than usual. Please don&apos;t close this page.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {viewState === 'reading' && (
        <div className="flex gap-6">
          <div className="flex-1">
            <Card 
              className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden" 
              style={{ backgroundColor: BACKGROUND_TINTS[backgroundTint] }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200" style={{ backgroundColor: `${BACKGROUND_TINTS[backgroundTint]}f0` }}>
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm shadow-sm">
                  <BookOpenText className="w-4 h-4 text-[#3D6E4E]" />
                  <span className="text-slate-900 font-medium truncate max-w-[140px]">{uploadedFile?.name || 'Document'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTextMode('original')} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      textMode === 'original'
                        ? 'bg-white text-slate-900 border border-[#3D6E4E] shadow-sm'
                        : 'bg-transparent text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    Original
                  </button>
                  {summarizedText && (
                    <button 
                      onClick={() => setTextMode('summarized')} 
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        textMode === 'summarized'
                          ? 'bg-[#3D6E4E] text-white border-[#3D6E4E] shadow-sm'
                          : 'bg-transparent text-slate-600 hover:bg-white/50'
                      }`}
                    >
                      Summary
                    </button>
                  )}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDifficultyDropdown(!showDifficultyDropdown); }} 
                      className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 transition-all ${
                        textMode === 'simplified'
                          ? 'bg-[#3D6E4E] text-white border-[#3D6E4E] shadow-sm'
                          : 'bg-transparent text-slate-600 hover:bg-white/50 border-transparent'
                      }`}
                    >
                      Simplified
                    </button>
                    {showDifficultyDropdown && (
                      <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-slate-200 py-2 w-36 z-50" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleDifficultySelect('beginner')} disabled={isSimplifying} className={`block w-full text-left px-4 py-2.5 text-sm ${difficulty === 'beginner' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-semibold' : 'text-slate-600 hover:bg-slate-50'} ${isSimplifying ? 'opacity-50 cursor-not-allowed' : ''}`}>Beginner</button>
                        <button onClick={() => handleDifficultySelect('intermediate')} disabled={isSimplifying} className={`block w-full text-left px-4 py-2.5 text-sm ${difficulty === 'intermediate' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-semibold' : 'text-slate-600 hover:bg-slate-50'} ${isSimplifying ? 'opacity-50 cursor-not-allowed' : ''}`}>Intermediate</button>
                      </div>
                    )}
                  </div>
                  {summarizedText && (
                    <button 
                      onClick={() => setFocusMode(true)} 
                      className="p-2.5 rounded-lg hover:bg-black/5 text-slate-600 transition-colors ml-1" 
                      title="Focus Mode (Fullscreen)"
                    >
                      <Focus className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setViewState('home')} className="p-2.5 rounded-lg hover:bg-black/5 text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {!getCurrentText() && summarizedText ? 'Summary' : textMode === 'summarized' ? 'Summary' : textMode === 'simplified' ? `Simplified (${difficulty})` : (uploadedFile?.name || 'Document Content')}
                  </h2>
                  {ttsAudioB64 && (
                    <audio 
                      controls 
                      src={`data:${audioMimeType};base64,${ttsAudioB64}`} 
                      className="h-10 w-full sm:w-auto"
                    />
                  )}
                </div>
                {isSimplifying ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-5 h-5 border-2 border-[#3D6E4E] border-t-transparent rounded-full animate-spin" />
                      <span>Generating {difficulty} version...</span>
                    </div>
                  </div>
                ) : (
                  <DimmedText content={getCurrentText()} dimmed={dimSurrounding} fontFamily={getFontFamily()} letterSpacing={letterSpacing} wordSpacing={wordSpacing} lineHeight={lineHeight} vocabList={vocabList} onWordClick={handleWordClick} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${toolsCollapsed ? 'w-12' : 'w-64'}`}>
            <ToolsPanel 
              collapsed={toolsCollapsed} 
              setCollapsed={setToolsCollapsed}
              fontChoice={fontChoice}
              setFontChoice={setFontChoice}
              showFontDropdown={showFontDropdown}
              setShowFontDropdown={setShowFontDropdown}
              letterSpacing={letterSpacing}
              setLetterSpacing={setLetterSpacing}
              wordSpacing={wordSpacing}
              setWordSpacing={setWordSpacing}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              backgroundTint={backgroundTint}
              setBackgroundTint={setBackgroundTint}
              showTintPicker={showTintPicker}
              setShowTintPicker={setShowTintPicker}
              dimSurrounding={dimSurrounding}
              setDimSurrounding={setDimSurrounding}
              showSpacingPanel={showSpacingPanel}
              setShowSpacingPanel={setShowSpacingPanel}
              isProcessing={isProcessing}
              handleSummarize={handleSummarize}
              vocabList={vocabList}
              handleWordClick={handleWordClick}
              isMobile={false}
            />
          </div>

          {showMobileTools && (
            <>
              <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setShowMobileTools(false)} />
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Reading Tools</h3>
                    <button onClick={() => setShowMobileTools(false)} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <ToolsPanel 
                    collapsed={false}
                    setCollapsed={() => {}}
                    fontChoice={fontChoice}
                    setFontChoice={setFontChoice}
                    showFontDropdown={showFontDropdown}
                    setShowFontDropdown={setShowFontDropdown}
                    letterSpacing={letterSpacing}
                    setLetterSpacing={setLetterSpacing}
                    wordSpacing={wordSpacing}
                    setWordSpacing={setWordSpacing}
                    lineHeight={lineHeight}
                    setLineHeight={setLineHeight}
                    backgroundTint={backgroundTint}
                    setBackgroundTint={setBackgroundTint}
                    showTintPicker={showTintPicker}
                    setShowTintPicker={setShowTintPicker}
                    dimSurrounding={dimSurrounding}
                    setDimSurrounding={setDimSurrounding}
                    showSpacingPanel={showSpacingPanel}
                    setShowSpacingPanel={setShowSpacingPanel}
                    isProcessing={isProcessing}
                    handleSummarize={handleSummarize}
                    vocabList={vocabList}
                    handleWordClick={handleWordClick}
                    isMobile={true}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {selectedWord && (
        <div className="fixed z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 w-64" style={{ left: Math.min(tooltipPosition.x, window.innerWidth - 280), top: Math.min(tooltipPosition.y + 20, window.innerHeight - 180) }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-slate-900">{selectedWord.term}</h4>
              <button className="text-[#3D6E4E] hover:scale-110 transition-transform"><Volume2 className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setSelectedWord(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">{selectedWord.definition}</p>
          <div className="border-t border-slate-100 pt-2">
            <p className="text-xs text-[#3D6E4E] font-semibold">Context: <span className="text-slate-400 font-normal">{selectedWord.context_snippet}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ToolsPanelProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  fontChoice: FontChoice;
  setFontChoice: (v: FontChoice) => void;
  showFontDropdown: boolean;
  setShowFontDropdown: (v: boolean) => void;
  letterSpacing: number;
  setLetterSpacing: (v: number) => void;
  wordSpacing: number;
  setWordSpacing: (v: number) => void;
  lineHeight: number;
  setLineHeight: (v: number) => void;
  backgroundTint: BackgroundTint;
  setBackgroundTint: (v: BackgroundTint) => void;
  showTintPicker: boolean;
  setShowTintPicker: (v: boolean) => void;
  dimSurrounding: boolean;
  setDimSurrounding: (v: boolean) => void;
  showSpacingPanel: boolean;
  setShowSpacingPanel: (v: boolean) => void;
  isProcessing: boolean;
  handleSummarize: () => void;
  vocabList: VocabWord[];
  handleWordClick: (word: string, e: React.MouseEvent) => void;
  isMobile: boolean;
}

function ToolsPanel({ 
  collapsed, setCollapsed, fontChoice, setFontChoice, showFontDropdown, setShowFontDropdown,
  letterSpacing, setLetterSpacing, wordSpacing, setWordSpacing, lineHeight, setLineHeight,
  backgroundTint, setBackgroundTint, showTintPicker, setShowTintPicker, dimSurrounding, setDimSurrounding,
  showSpacingPanel, setShowSpacingPanel, isProcessing, handleSummarize, vocabList, handleWordClick, isMobile
}: ToolsPanelProps) {
  const cardBase = isMobile 
    ? "bg-slate-50 rounded-2xl p-5 border border-slate-200" 
    : "bg-white rounded-2xl p-5 border border-slate-200 shadow-sm";
  
  if (collapsed && !isMobile) {
    return (
      <div className="sticky top-0">
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors" title="Expand tools">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? '' : 'sticky top-0'}`}>
      {!isMobile && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-[#3D6E4E]">Tools</h3>
          <button onClick={() => setCollapsed(true)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={cardBase}>
        <button onClick={(e) => { e.stopPropagation(); setShowFontDropdown(!showFontDropdown); setShowSpacingPanel(false); }} className="w-full flex items-center justify-between text-sm font-semibold text-slate-900">
          Font Choice 
          <span className={`transition-transform text-slate-400 ${showFontDropdown ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showFontDropdown && (
          <div className="mt-3 bg-white rounded-xl shadow-lg border border-slate-200 py-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {(['default', 'opendyslexic', 'roboto'] as FontChoice[]).map((font) => (
              <button key={font} onClick={() => { setFontChoice(font); setShowFontDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm capitalize transition-colors ${fontChoice === font ? 'bg-[#f0f7f1] text-[#3D6E4E] font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                {font === 'opendyslexic' ? 'OpenDyslexic' : font === 'roboto' ? 'Roboto' : 'Default'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={cardBase}>
        <button onClick={() => { setShowSpacingPanel(!showSpacingPanel); setShowFontDropdown(false); }} className="w-full flex items-center justify-between text-sm font-semibold text-slate-900">
          Spacing 
          <span className={`transition-transform text-slate-400 ${showSpacingPanel ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showSpacingPanel && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Letter spacing</label>
                <span className="text-xs text-slate-400">{letterSpacing}px</span>
              </div>
              <input type="range" min="0" max="5" step="0.5" value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-[#3D6E4E] cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Word spacing</label>
                <span className="text-xs text-slate-400">{wordSpacing}px</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={wordSpacing} onChange={(e) => setWordSpacing(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-[#3D6E4E] cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Line height</label>
                <span className="text-xs text-slate-400">{lineHeight.toFixed(1)}</span>
              </div>
              <input type="range" min="1" max="3" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-[#3D6E4E] cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      <div className={`${cardBase} flex items-center justify-between`}>
        <span className="text-sm font-semibold text-slate-900">Dim surrounding</span>
        <button onClick={() => setDimSurrounding(!dimSurrounding)} className={`w-11 h-6 rounded-full transition-colors relative ${dimSurrounding ? 'bg-[#3D6E4E]' : 'bg-slate-200'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${dimSurrounding ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      <div className={cardBase}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-900">Background</span>
          <button onClick={() => setShowTintPicker(!showTintPicker)} className="text-xs font-semibold text-[#3D6E4E] hover:underline">
            {showTintPicker ? 'Hide' : 'Show'} colors
          </button>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          <button onClick={() => setBackgroundTint('none')} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white transition-all ${backgroundTint === 'none' ? 'border-[#3D6E4E] ring-2 ring-[#3D6E4E]/20' : 'border-slate-200'}`} title="White">
            <X className="w-3 h-3 text-slate-400" />
          </button>
          {TINT_COLORS.map((tint) => (
            <button key={tint.id} onClick={() => setBackgroundTint(tint.id as BackgroundTint)} className={`w-7 h-7 rounded-full border-2 transition-all ${backgroundTint === tint.id ? 'border-[#3D6E4E] ring-2 ring-[#3D6E4E]/20 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: tint.color }} />
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-400 text-center font-medium">
          {backgroundTint === 'none' ? 'White (default)' : TINT_COLORS.find(t => t.id === backgroundTint)?.id.charAt(0).toUpperCase() + TINT_COLORS.find(t => t.id === backgroundTint)!.id.slice(1)}
        </div>
      </div>

      <Button 
        onClick={handleSummarize} 
        isLoading={isProcessing} 
        variant="outline" 
        className="w-full rounded-xl py-3.5 text-sm font-semibold border-2 border-[#3D6E4E] text-[#3D6E4E] hover:bg-[#f0f7f1] transition-colors" 
      >
        Summarize Text
      </Button>

      <div className={cardBase}>
        <h4 className="text-sm font-bold text-[#3D6E4E] mb-3">Vocabulary List</h4>
        <div className="space-y-1">
          {vocabList.map((vocab) => (
            <button key={vocab.term} onClick={(e) => handleWordClick(vocab.term, e)} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-900 hover:bg-[#f0f7f1] transition-colors">
              {vocab.term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DimmedText({ 
  content, 
  dimmed, 
  fontFamily, 
  letterSpacing, 
  wordSpacing, 
  lineHeight, 
  vocabList, 
  onWordClick 
}: { 
  content: string; 
  dimmed: boolean; 
  fontFamily: string; 
  letterSpacing: number; 
  wordSpacing: number; 
  lineHeight: number; 
  vocabList: VocabWord[]; 
  onWordClick: (word: string, e: React.MouseEvent) => void;
}) {
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const paragraphs = content.split('\n').filter(p => p.trim());

  return (
    <div className="text-[15px] text-slate-900 leading-7" style={{ fontFamily, letterSpacing: `${letterSpacing}px`, wordSpacing: `${wordSpacing}px`, lineHeight }}>
      {paragraphs.map((paragraph, idx) => {
        if (paragraph.trim().startsWith('•')) {
          return (
            <div key={idx} className={`mb-4 pl-5 relative transition-opacity duration-300 ${dimmed && activeParagraph !== idx ? 'opacity-30' : 'opacity-100'}`} onMouseEnter={() => dimmed && setActiveParagraph(idx)} onMouseLeave={() => dimmed && setActiveParagraph(null)}>
              <span className="absolute left-0 text-[#3D6E4E] text-lg">•</span>
              <span>{paragraph.replace('•', '').trim()}</span>
            </div>
          );
        }
        
        const words = paragraph.split(/(\s+)/);
        const highlighted = vocabList.map(v => v.term.toLowerCase());
        
        return (
          <p key={idx} className={`mb-5 transition-opacity duration-300 ${dimmed && activeParagraph !== idx ? 'opacity-30' : 'opacity-100'}`} onMouseEnter={() => dimmed && setActiveParagraph(idx)} onMouseLeave={() => dimmed && setActiveParagraph(null)}>
            {words.map((word, wIdx) => {
              const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
              if (highlighted.includes(clean) && clean.length > 0) {
                const vocab = vocabList.find(v => v.term.toLowerCase() === clean);
                return <span key={wIdx} className="bg-[#EBF3FF] px-1 rounded cursor-pointer hover:bg-[#d4e5ff] transition-colors border-b-2 border-[#407BFF] font-medium" onClick={(e) => onWordClick(word, e)} title={vocab?.definition}>{word}</span>;
              }
              return <span key={wIdx}>{word}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}