'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureHeader } from '@/components/FeatureHeader';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { writingApi } from '@/services/api';
import { 
  Mic, 
  Square, 
  Wand2, 
  Copy, 
  Check, 
  ChevronRight,
  ChevronDown,
  Type,
  AlignJustify,
  Palette,
  X,
  History,
  Trash2,
  FileDown,
  FileText
} from 'lucide-react';

// Types
type FontChoice = 'default' | 'opendyslexic' | 'roboto';
type SpacingOption = 'letter' | 'word' | 'line';
type BackgroundTint = 'none' | 'yellow' | 'cream' | 'beige' | 'tan' | 'peach' | 'sky' | 'mint' | 'lavender' | 'blue' | 'green' | 'sage' | 'pink' | 'rose' | 'warm' | 'cool';

// Background tint colors
const TINT_COLORS: { id: BackgroundTint; color: string }[] = [
  { id: 'yellow', color: '#FFF9C4' },
  { id: 'cream', color: '#FFF8E1' },
  { id: 'beige', color: '#F5F5DC' },
  { id: 'tan', color: '#D2B48C' },
  { id: 'peach', color: '#FFDAB9' },
  { id: 'sky', color: '#E0F7FA' },
  { id: 'mint', color: '#F0FFF0' },
  { id: 'lavender', color: '#E6E6FA' },
  { id: 'blue', color: '#E3F2FD' },
  { id: 'green', color: '#E8F5E9' },
  { id: 'sage', color: '#E8F3E8' },
  { id: 'pink', color: '#FCE4EC' },
  { id: 'rose', color: '#FFF0F3' },
  { id: 'warm', color: '#FFF8E7' },
  { id: 'cool', color: '#F0F8FF' },
];

// Audio Waveform Visualization Component
const AudioWaveform = ({ 
  level, 
  isRecording, 
  analyserRef 
}: { 
  level: number; 
  isRecording: boolean;
  analyserRef?: React.RefObject<AnalyserNode | null>;
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(Array(12).fill(20));
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isRecording || !analyserRef?.current) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateFrequencies = () => {
      analyser.getByteFrequencyData(dataArray);
      const bands = 12;
      const newFrequencies = Array(bands).fill(0).map((_, i) => {
        const startIndex = Math.floor((i / bands) * (dataArray.length / 2));
        const endIndex = Math.floor(((i + 1) / bands) * (dataArray.length / 2));
        let sum = 0;
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        const avg = sum / (endIndex - startIndex);
        return Math.max(10, Math.min(100, (avg / 255) * 100));
      });
      
      setFrequencies(newFrequencies);
      animationRef.current = requestAnimationFrame(updateFrequencies);
    };
    
    updateFrequencies();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, analyserRef]);
  
  const bars = 12;
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {Array.from({ length: bars }).map((_, i) => {
        const height = isRecording ? frequencies[i] || 20 : 20;
        return (
          <motion.div
            key={i}
            className="w-[3px] bg-gradient-to-t from-red-600 to-red-400 rounded-full"
            animate={{
              height: isRecording ? `${height}%` : '20%',
              opacity: isRecording ? Math.max(0.4, height / 100) : 0.4,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.5,
            }}
          />
        );
      })}
    </div>
  );
};

export default function WritingAssistantPage() {
  // UI State
  const [toolsOpen, setToolsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontChoice, setFontChoice] = useState<FontChoice>('roboto');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
  const [showTintPicker, setShowTintPicker] = useState(false);
  const [backgroundTint, setBackgroundTint] = useState<BackgroundTint>('none');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSpacingPanel, setShowSpacingPanel] = useState(false);

  // AI Backend Integration State
  const { user } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Audio visualization state
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Stats
  const wordCount = transcript?.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript?.length || 0;
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | undefined>(undefined);
  
  // Refs for click outside handling
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const spacingDropdownRef = useRef<HTMLDivElement>(null);
  const tintPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setShowFontDropdown(false);
      }
      if (spacingDropdownRef.current && !spacingDropdownRef.current.contains(e.target as Node)) {
        setShowSpacingDropdown(false);
      }
      if (tintPickerRef.current && !tintPickerRef.current.contains(e.target as Node)) {
        setShowTintPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleClear = () => {
    if (!transcript) return;
    if (confirm('Are you sure you want to clear all text?')) {
      setTranscript('');
      setSessionId(undefined);
      sessionIdRef.current = undefined;
      toast.success('Text cleared');
    }
  };

  const getFontFamily = () => {
    switch (fontChoice) {
      case 'opendyslexic': return 'OpenDyslexic, sans-serif';
      case 'roboto': return 'Roboto, sans-serif';
      default: return 'inherit';
    }
  };

  const getBackgroundColor = () => {
    if (backgroundTint === 'none') return '#ffffff';
    return TINT_COLORS.find(t => t.id === backgroundTint)?.color || '#ffffff';
  };

  const sendChunk = async (blob: Blob) => {
    if (!user) return;
    
    try {
      const currentSessionId = sessionIdRef.current;
      const res = await writingApi.transcribe(blob, 'en', currentSessionId);
      const reader = res.body?.getReader();
      if (!reader) {
        toast.error('Failed to start transcription');
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let chunkText = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          
          for (const event of events) {
            if (!event.trim()) continue;
            
            const lines = event.split('\n');
            let eventType = '';
            let eventData = '';
            
            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim();
              } else if (line.startsWith('data: ')) {
                eventData = line.substring(6).trim();
              }
            }
            
            if (eventType === 'session_id' && eventData && !sessionIdRef.current) {
              setSessionId(eventData);
              sessionIdRef.current = eventData;
            }
            
            if (eventData && eventData !== '[DONE]' && eventType !== 'session_id') {
              chunkText += eventData;
            }
          }
        }
      }
      
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.substring(7).trim();
          } else if (line.startsWith('data: ') && eventType !== 'session_id') {
            const text = line.substring(6).trim();
            if (text && text !== '[DONE]') chunkText += text;
          }
        }
      }
      
      if (chunkText.trim()) {
        setTranscript(prev => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + separator + chunkText.trim();
        });
      }
    } catch(err) {
      console.error('Transcription error:', err);
      toast.error('Failed to transcribe audio');
    }
  };

  const recordNextChunk = () => {
     if (!isRecordingRef.current || !streamRef.current) return;
     
     const mr = new MediaRecorder(streamRef.current, { 
       mimeType: 'audio/webm;codecs=opus' 
     });
     
     mr.ondataavailable = async (e) => {
       if (e.data.size > 0) {
          await sendChunk(e.data);
       }
     };
     
     mr.onerror = (e) => {
       console.error('MediaRecorder error:', e);
       toast.error('Recording error occurred');
       stopRecording();
     };
     
     mr.start();
     mediaRecorderRef.current = mr;
     
     timeoutRef.current = setTimeout(() => {
       if (mr.state === 'recording') mr.stop();
       if (isRecordingRef.current) recordNextChunk();
     }, 5000); 
  };

  const startRecording = async () => {
    if (!user) {
      toast.error('You must be logged in to use the writing assistant');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isRecordingRef.current = true;
      setIsRecording(true);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (!isRecordingRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 128);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
      
      toast.success("Recording started");
      recordNextChunk();
    } catch (err) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setAudioLevel(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    toast.success('Recording stopped');
  };

  const handleGenerateNotes = async () => {
    if (!transcript || !sessionId || !user) {
      toast.error('No transcription to process');
      return;
    }
    setIsProcessing(true);
    try {
      const response = await writingApi.generateNotes(sessionId, transcript, 'Meeting Notes', user.id);
      setTranscript(response.structured_notes);
      toast.success('Notes processed and structured');
    } catch(err) {
      console.error('Note generation error:', err);
      toast.error('Failed to generate structured notes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!transcript) {
      toast.error('No content to download');
      return;
    }
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Markdown downloaded');
  };

  const handleDownloadPDF = () => {
    if (!transcript) {
      toast.error('No content to download');
      return;
    }
    toast.info('PDF export coming soon. Use markdown export for now.');
  };

  const handleViewHistory = async () => {
    if (!user) {
      toast.error('You must be logged in to view history');
      return;
    }
    setShowHistory(true);
    setIsLoadingHistory(true);
    try {
      const sessions = await writingApi.getHistory(user.id);
      setHistory(sessions);
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('Failed to load history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadSession = (session: any) => {
    setTranscript(session.structured_notes || session.raw_text);
    setSessionId(session.session_id);
    setShowHistory(false);
    toast.success('Session loaded');
  };

  const renderText = () => {
    if (!transcript || transcript.trim() === '') {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
          <div className={`p-6 rounded-full mb-5 transition-all duration-500 ${isRecording ? 'bg-red-50 animate-pulse' : 'bg-slate-100'}`}>
            <Mic className={`w-10 h-10 transition-all duration-500 ${isRecording ? 'text-red-400' : 'text-slate-300'}`} />
          </div>
          <p className="text-center text-sm font-medium">
            {isRecording 
              ? "Listening... Your words will appear here as you speak." 
              : "Click 'Start Recording' to transcribe your lecture or notes."}
          </p>
          <p className="text-center text-xs text-slate-400 mt-2">
            Speak clearly for best results
          </p>
        </div>
      );
    }
    
    const lines = transcript.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2 text-slate-900">{line.substring(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold mt-3 mb-2 text-slate-900">{line.substring(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-semibold mt-2 mb-1 text-slate-900">{line.substring(4)}</h3>;
          if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 text-slate-800">{line.substring(2)}</li>;
          if (/^\d+\.\s/.test(line)) return <li key={idx} className="ml-4 text-slate-800">{line.replace(/^\d+\.\s/, '')}</li>;
          if (line.includes('**')) {
            const parts = line.split('**');
            return (
              <p key={idx} className="text-slate-800">
                {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part)}
              </p>
            );
          }
          if (line.trim()) return <p key={idx} className="text-slate-800">{line}</p>;
          return <br key={idx} />;
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-6rem)] pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Writing Assistant</h1>
          <p className="text-slate-500 mt-1 text-sm">Dictate, refine, and structure your thoughts effortlessly.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewHistory}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <History className="w-4 h-4" />
            History
          </button>
          <FeatureHeader />
        </div>
      </div>

      {/* Editor + Tools Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Editor */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <div className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-2 rounded-full border border-red-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <AudioWaveform level={audioLevel} isRecording={isRecording} analyserRef={analyserRef} />
                    </div>
                    <div className="h-6 w-px bg-red-200 mx-1"></div>
                    <button 
                      onClick={stopRecording} 
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-1.5 font-semibold text-sm rounded-full flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Stop
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D6E4E] text-white text-sm font-semibold hover:bg-[#345e43] transition-all shadow-md active:scale-95"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                )}
              </div>

              <button 
                onClick={handleGenerateNotes}
                disabled={!transcript || isProcessing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {isProcessing ? 'Structuring…' : 'Clean & Structure'}
              </button>
            </div>

            {/* Text Content */}
            <div 
              className="px-6 sm:px-10 py-8 sm:py-10 min-h-[420px] transition-colors duration-200"
              style={{ backgroundColor: getBackgroundColor() }}
            >
              <div 
                className="max-w-3xl mx-auto writing-content"
                style={{ 
                  fontFamily: getFontFamily(),
                  letterSpacing: `${letterSpacing}px`,
                  wordSpacing: `${wordSpacing}px`,
                  lineHeight: lineHeight,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}
              >
                <div className="text-slate-800 text-[15px] leading-7 whitespace-pre-line">
                  {renderText()}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {charCount} characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {transcript && (
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  disabled={!transcript}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied 
                      ? 'bg-[#3D6E4E] text-white border-[#3D6E4E]' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Panel - Desktop always visible, Mobile drawer */}
        <div className={`
          fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-out
          lg:static lg:transform-none lg:shadow-none lg:w-80 lg:rounded-2xl lg:border lg:border-slate-200 lg:h-fit
          ${toolsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full lg:h-auto flex flex-col p-6">
            {/* Mobile drawer header */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-semibold text-slate-900">Tools</h2>
              <button 
                onClick={() => setToolsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop panel header */}
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#E8F3EA] text-[#3D6E4E]">
                <Type className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Formatting Tools</h2>
            </div>

            <div className="space-y-6">
              {/* Font Choice */}
              <div className="relative" ref={fontDropdownRef}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Font</label>
                <button
                  onClick={() => {
                    setShowFontDropdown(!showFontDropdown);
                    setShowSpacingDropdown(false);
                    setShowTintPicker(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span className="capitalize">{fontChoice === 'opendyslexic' ? 'OpenDyslexic' : fontChoice === 'roboto' ? 'Roboto' : 'System Default'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFontDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                    {(['default', 'opendyslexic', 'roboto'] as FontChoice[]).map((font) => (
                      <button
                        key={font}
                        onClick={() => { setFontChoice(font); setShowFontDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          fontChoice === font 
                            ? 'bg-[#E8F3EA] text-[#3D6E4E] font-medium' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {font === 'opendyslexic' ? 'OpenDyslexic' : font === 'roboto' ? 'Roboto' : 'System Default'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Spacing */}
              <div className="relative" ref={spacingDropdownRef}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Spacing</label>
                <button
                  onClick={() => {
                    setShowSpacingDropdown(!showSpacingDropdown);
                    setShowFontDropdown(false);
                    setShowTintPicker(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span>Adjust spacing</span>
                  <AlignJustify className="w-4 h-4 text-slate-400" />
                </button>

                {showSpacingDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                    {(['letter', 'word', 'line'] as SpacingOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => { 
                          setShowSpacingDropdown(false);
                          setShowSpacingPanel(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="capitalize">{option} spacing</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {showSpacingPanel && (
                  <div className="mt-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-700">Spacing controls</span>
                      <button 
                        onClick={() => setShowSpacingPanel(false)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Hide
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs text-slate-600 font-medium">Letter spacing</label>
                          <span className="text-xs text-slate-500">{letterSpacing}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="5" 
                          step="0.5" 
                          value={letterSpacing}
                          onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs text-slate-600 font-medium">Word spacing</label>
                          <span className="text-xs text-slate-500">{wordSpacing}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="1" 
                          value={wordSpacing}
                          onChange={(e) => setWordSpacing(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs text-slate-600 font-medium">Line height</label>
                          <span className="text-xs text-slate-500">{lineHeight.toFixed(1)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="3" 
                          step="0.1" 
                          value={lineHeight}
                          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tinted Background Colour */}
              <div className="relative" ref={tintPickerRef}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Background Tint</label>
                <button
                  onClick={() => {
                    setShowTintPicker(!showTintPicker);
                    setShowFontDropdown(false);
                    setShowSpacingDropdown(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span className="capitalize">{backgroundTint === 'none' ? 'No tint' : backgroundTint}</span>
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: getBackgroundColor() }}
                  />
                </button>

                {showTintPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-20">
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        onClick={() => setBackgroundTint('none')}
                        className={`w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center transition-all ${
                          backgroundTint === 'none' ? 'ring-2 ring-[#3D6E4E] ring-offset-2' : 'hover:scale-105'
                        }`}
                        title="No tint"
                      >
                        <span className="block w-3 h-0.5 bg-slate-400 rounded-full" />
                      </button>
                      {TINT_COLORS.map((tint) => (
                        <button
                          key={tint.id}
                          onClick={() => setBackgroundTint(tint.id)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            backgroundTint === tint.id ? 'ring-2 ring-[#3D6E4E] ring-offset-2' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: tint.color }}
                          title={tint.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={handleDownloadMarkdown}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export as Markdown
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle + backdrop */}
      <div className="lg:hidden">
        {!toolsOpen && (
          <button
            onClick={() => setToolsOpen(true)}
            className="fixed right-4 bottom-6 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#3D6E4E] text-white text-sm font-medium shadow-lg hover:bg-[#345e43] active:scale-95 transition-colors"
          >
            <Palette className="w-4 h-4" />
            Tools
          </button>
        )}
        {toolsOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 transition-opacity"
            onClick={() => setToolsOpen(false)}
          />
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#3D6E4E]" />
                <h2 className="text-xl font-bold text-slate-900">Note History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D6E4E]"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No previous sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((session) => (
                    <div
                      key={session.session_id}
                      className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleLoadSession(session)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {session.subject || 'Untitled Session'}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {session.structured_notes || session.raw_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}