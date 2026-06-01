'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { FeatureHeader } from '@/components/FeatureHeader';
import { audioApi, readingApi } from '@/services/api';
import { useTTSLanguages } from '@/hooks/useAI';

interface VoiceOption {
  id: string;
  name: string;
  lang: string;
}

const speedOptions = [
  { value: '0.5', label: '0.5x' },
  { value: '0.75', label: '0.75x' },
  { value: '1', label: '1.0x' },
  { value: '1.25', label: '1.25x' },
  { value: '1.5', label: '1.5x' },
  { value: '2', label: '2.0x' },
];

const readingOptions = [
  { value: 'word', label: 'Word by Word' },
  { value: 'line', label: 'Line by Line' },
  { value: 'paragraph', label: 'Paragraph' },
];

const tintedColors = [
  '#FFF9E6',
  '#FFF5E6',
  '#F0F7F1',
  '#E8F4F8',
  '#F5E6FF',
  '#FFE6F0',
  '#E6F5FF',
  '#F5F5DC',
  '#F0E6D3',
  '#E6D3C0',
  '#D3C0E6',
  '#C0E6D3',
  '#E6C0D3',
  '#C0D3E6',
  '#D3E6C0',
  '#FFFFFF',
];

const highlightColors = [
  '#C8B5FF',
  '#FFB5B5',
  '#B5FFB5',
  '#B5D4FF',
  '#FFE4B5',
  '#FFB5E4',
  '#E4FFB5',
  '#B5FFE4',
  '#FFD700',
  '#FFA500',
  '#87CEEB',
  '#98FB98',
  '#DDA0DD',
  '#F0E68C',
  '#FFB6C1',
  '#20B2AA',
];

const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
        <polygon points="14,2 42,2 56,26 42,46 14,46 0,26" fill="none" stroke="#3D6E4E" strokeWidth="1.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

export default function TextToSpeechPage() {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'reading'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);

  const [selectedVoice, setSelectedVoice] = useState<string>('en');
  const [speed, setSpeed] = useState<string>('1');
  const [readingMode, setReadingMode] = useState<string>('word');
  const [dimSurrounding, setDimSurrounding] = useState(false);
  const [tintedBgEnabled, setTintedBgEnabled] = useState(false);
  const [tintedBgColor, setTintedBgColor] = useState('#FFF9E6');
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [highlightColor, setHighlightColor] = useState('#C8B5FF');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [lastTtsRequest, setLastTtsRequest] = useState<number>(0);
  
  const { data: languagesData, isLoading: isLoadingLanguages } = useTTSLanguages();
  
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await audioApi.healthCheck();
      if (!isHealthy) {
        console.warn('[TTS] Audio service health check failed');
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (languagesData && typeof languagesData === 'object' && 'supported_languages' in languagesData) {
      const data = languagesData as any;
      if (data.supported_languages) {
        const backendVoices: VoiceOption[] = Object.entries(data.supported_languages).map(([code, name]) => ({
          id: code,
          name: name as string,
          lang: code,
        }));
        setVoices(backendVoices);
        if (!selectedVoice && backendVoices.length > 0) {
          setSelectedVoice(backendVoices[0].id);
        }
      }
    } else {
      const gttsVoices: VoiceOption[] = [
        { id: 'en', name: 'English (US)', lang: 'en' },
        { id: 'en-uk', name: 'English (UK)', lang: 'en-uk' },
        { id: 'en-au', name: 'English (Australia)', lang: 'en-au' },
        { id: 'en-in', name: 'English (India)', lang: 'en-in' },
        { id: 'en-ca', name: 'English (Canada)', lang: 'en-ca' },
        { id: 'es', name: 'Spanish (Spain)', lang: 'es' },
        { id: 'es-us', name: 'Spanish (Mexico)', lang: 'es-us' },
        { id: 'fr', name: 'French (France)', lang: 'fr' },
        { id: 'fr-ca', name: 'French (Canada)', lang: 'fr-ca' },
        { id: 'de', name: 'German', lang: 'de' },
        { id: 'it', name: 'Italian', lang: 'it' },
        { id: 'pt', name: 'Portuguese (Portugal)', lang: 'pt' },
        { id: 'pt-br', name: 'Portuguese (Brazil)', lang: 'pt-br' },
        { id: 'nl', name: 'Dutch', lang: 'nl' },
        { id: 'pl', name: 'Polish', lang: 'pl' },
        { id: 'tr', name: 'Turkish', lang: 'tr' },
        { id: 'sv', name: 'Swedish', lang: 'sv' },
        { id: 'cs', name: 'Czech', lang: 'cs' },
        { id: 'el', name: 'Greek', lang: 'el' },
        { id: 'hu', name: 'Hungarian', lang: 'hu' },
        { id: 'ro', name: 'Romanian', lang: 'ro' },
        { id: 'da', name: 'Danish', lang: 'da' },
        { id: 'fi', name: 'Finnish', lang: 'fi' },
        { id: 'no', name: 'Norwegian', lang: 'no' },
        { id: 'sk', name: 'Slovak', lang: 'sk' },
        { id: 'bg', name: 'Bulgarian', lang: 'bg' },
        { id: 'hr', name: 'Croatian', lang: 'hr' },
        { id: 'uk', name: 'Ukrainian', lang: 'uk' },
        { id: 'ca', name: 'Catalan', lang: 'ca' },
        { id: 'ja', name: 'Japanese', lang: 'ja' },
        { id: 'zh', name: 'Chinese (Simplified)', lang: 'zh' },
        { id: 'zh-tw', name: 'Chinese (Traditional)', lang: 'zh-tw' },
        { id: 'ko', name: 'Korean', lang: 'ko' },
        { id: 'th', name: 'Thai', lang: 'th' },
        { id: 'vi', name: 'Vietnamese', lang: 'vi' },
        { id: 'id', name: 'Indonesian', lang: 'id' },
        { id: 'ms', name: 'Malay', lang: 'ms' },
        { id: 'tl', name: 'Filipino', lang: 'tl' },
        { id: 'ta', name: 'Tamil', lang: 'ta' },
        { id: 'ar', name: 'Arabic', lang: 'ar' },
        { id: 'iw', name: 'Hebrew', lang: 'iw' },
        { id: 'fa', name: 'Persian', lang: 'fa' },
        { id: 'hi', name: 'Hindi', lang: 'hi' },
        { id: 'bn', name: 'Bengali', lang: 'bn' },
        { id: 'mr', name: 'Marathi', lang: 'mr' },
        { id: 'te', name: 'Telugu', lang: 'te' },
        { id: 'ur', name: 'Urdu', lang: 'ur' },
        { id: 'sw', name: 'Swahili', lang: 'sw' },
        { id: 'af', name: 'Afrikaans', lang: 'af' },
        { id: 'ru', name: 'Russian', lang: 'ru' },
        { id: 'sr', name: 'Serbian', lang: 'sr' },
        { id: 'mk', name: 'Macedonian', lang: 'mk' },
        { id: 'sl', name: 'Slovenian', lang: 'sl' },
        { id: 'lt', name: 'Lithuanian', lang: 'lt' },
        { id: 'lv', name: 'Latvian', lang: 'lv' },
        { id: 'et', name: 'Estonian', lang: 'et' },
      ];
      setVoices(gttsVoices);
      if (!selectedVoice) {
        setSelectedVoice('en');
      }
    }
  }, [languagesData, selectedVoice]);
  
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
      if (previewAudio) previewAudio.pause();
    };
  }, [audioUrl, previewAudioUrl, previewAudio]);

  useEffect(() => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
    }
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    setPreviewingVoice(null);
  }, [selectedVoice, speed, extractedText]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, [selectedVoice, speed, extractedText]);

  const handlePreviewAudio = async () => {
    if (!extractedText) {
      toast.error('No text to preview');
      return;
    }
    const now = Date.now();
    if (now - lastTtsRequest < 3000) {
      toast.info('Please wait a moment before generating audio again');
      return;
    }
    if (previewAudio && !previewAudio.paused) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewingVoice(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    if (previewAudioUrl && previewAudio) {
      previewAudio.play();
      setPreviewingVoice('preview');
      return;
    }

    setPreviewingVoice('preview');
    setIsGenerating(true);
    setLastTtsRequest(now);

    try {
      const previewText = extractedText.slice(0, 500);
      const audioBlob = await audioApi.textToSpeech(previewText, selectedVoice, parseFloat(speed) < 1.0);
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
      const url = URL.createObjectURL(audioBlob);
      setPreviewAudioUrl(url);
      const audio = new Audio(url);
      setPreviewAudio(audio);
      audio.onended = () => setPreviewingVoice(null);
      audio.onerror = () => {
        setPreviewingVoice(null);
        toast.error('Error playing preview');
      };
      audio.playbackRate = parseFloat(speed);
      await audio.play();
      toast.success('Playing preview of document');
    } catch (error: any) {
      console.error('Preview error:', error);
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('Rate limit') || error?.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a few seconds.');
      } else if (error?.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (errorMessage.includes('empty')) {
        toast.error('TTS service returned empty audio. Please check the service logs.');
      } else {
        toast.error(`TTS failed: ${errorMessage}`);
      }
      setPreviewingVoice(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (!content || content.trim().length === 0) {
            reject(new Error('File is empty'));
            return;
          }
          resolve(content);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }
    const isSupported =
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx');

    if (isSupported) {
      const result = await readingApi.extractText(file);
      return result.text;
    }

    throw new Error('Unsupported file type. Accepted: .pdf, .doc, .docx, .txt');
  };

  const handleFileUpload = async (file: File) => {
    const isSupported =
      file.type === 'text/plain' ||
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx');

    if (!isSupported) {
      toast.error('Please upload a .txt, .pdf, .doc, or .docx file');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }
    setUploadedFile(file);
    try {
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      setWords(text.split(/\s+/));
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      toast.success(`File "${file.name}" loaded successfully (${text.split(/\s+/).length} words)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read file';
      toast.error(message);
      console.error(error);
      setUploadedFile(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }
    if (!extractedText || extractedText.trim().length === 0) {
      toast.error('No text content found in file');
      return;
    }
    setCurrentStep('reading');
    toast.success('Document loaded successfully');
  };

  const handlePlayPause = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        startSpeech();
      }
    }
  };

  const generateAndPlaySpeech = async () => {
    if (!extractedText || extractedText.trim().length === 0) {
      toast.error('No text to speak. Please upload a file first.');
      return;
    }
    const now = Date.now();
    if (now - lastTtsRequest < 3000) {
      toast.info('Please wait a moment before generating audio again');
      return;
    }
    setLastTtsRequest(now);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewingVoice(null);
    }
    setIsGenerating(true);

    try {
      const audioBlob = await audioApi.textToSpeech(extractedText, selectedVoice, parseFloat(speed) < 1.0);
      const url = URL.createObjectURL(audioBlob);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      };
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => {
        toast.error('Error playing audio');
        setIsPlaying(false);
      };
      audio.playbackRate = parseFloat(speed);
      await audio.play();
      toast.success('Playing text-to-speech audio');
    } catch (error: any) {
      console.error('TTS Error:', error);
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a few seconds before trying again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please refresh the page and log in again.');
      } else {
        toast.error('Failed to generate speech. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const startSpeech = () => generateAndPlaySpeech();

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setCurrentStep('upload');
    setUploadedFile(null);
  };

  const handleExportAudio = () => {
    const urlToDownload = audioUrl || previewAudioUrl;
    if (!urlToDownload) {
      toast.info('Please generate audio first by clicking Play or Preview');
      return;
    }
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const baseName = documentTitle?.trim() || 'text-to-speech';
      const filename = `${baseName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}_${timestamp}.mp3`;
      const link = document.createElement('a');
      link.href = urlToDownload;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download audio. Please try again.');
    }
  };

  const renderHighlightedText = () => {
    if (!highlightEnabled || currentWordIndex < 0) return <span>{extractedText}</span>;
    const allWords = extractedText.split(/(\s+)/);
    let wordCounter = 0;
    return (
      <>
        {allWords.map((word, index) => {
          if (word.trim().length === 0) return <span key={index}>{word}</span>;
          const isCurrentWord = wordCounter === currentWordIndex;
          wordCounter++;
          return (
            <span
              key={index}
              style={{
                backgroundColor: isCurrentWord ? highlightColor : 'transparent',
                padding: isCurrentWord ? '2px 4px' : '0',
                borderRadius: isCurrentWord ? '4px' : '0',
                transition: 'background-color 0.1s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-12">
      <div className="flex items-center justify-between pt-6 border-b border-slate-100 pb-6 mb-8">
        <div className="flex flex-col gap.1.5">
          <h1 className="text-slate-900 text-2xl sm:text-3xl tracking-tight font-extrabold leading-tight">
            {currentStep === 'upload' ? `Hello, ${user?.first_name || user?.name?.split(' ')[0] || 'Student'}!` : 'Text to Speech'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {currentStep === 'upload' ? 'Pick a tool to get started with' : 'Turn text into sound and learn by listening.'}
          </p>
        </div>
        <FeatureHeader />
      </div>

      {currentStep === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full space-y-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-55/50 to-[var(--primary-50)]/20 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <HexPattern />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="relative h-[120px] w-[160px] shrink-0 p-2 select-none pointer-events-none transition-transform duration-300 hover:scale-105">
                <Image
                  src="/images/reading assitant svg (lady and envelope).svg"
                  alt="Text to Speech Illustration"
                  width={225}
                  height={168}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full max-w-[498px] text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Text to Speech</h2>
                <p className="pt-3 text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
                  Turn text into sound. Sit back, listen & watch the words light up as you learn.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.005, borderColor: "var(--primary-500)", backgroundColor: "rgba(234, 244, 238, 0.4)" }}
            whileTap={{ scale: 0.995 }}
            className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center py-14 sm:py-20 px-6 sm:px-10 gap-5 w-full ${
              dragging 
                ? 'border-[var(--primary-500)] bg-[var(--primary-50)]/50 scale-[1.01]' 
                : 'border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)]'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-500)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary-500)]/15 transition-transform duration-300 hover:scale-105 active:scale-95">
              <Icon name="upload" size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-bold text-base">
                Click to upload <span className="font-medium text-slate-400">or drag and drop</span>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium">PDF, DOC, DOCX, or TXT (max 25MB)</p>
            </div>
          </motion.div>

          <AnimatePresence>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 w-full"
              >
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Document uploaded</p>
                <div className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-50)] border border-[var(--primary-100)]/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="document" size={24} className="text-[var(--primary-600)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate leading-snug">{uploadedFile.name.replace(/\.[^/.]+$/, '')}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{uploadedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                  >
                    <Icon name="close" size={20} />
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(60, 131, 80, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full bg-[var(--primary-500)] text-white font-bold py-4 px-6 rounded-xl hover:bg-[var(--primary-600)] transition-all duration-300 shadow-md shadow-[var(--primary-500)]/10"
                >
                  Submit Document
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {currentStep === 'reading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="flex-1 min-w-0">
            <div
              className="rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden transition-all duration-300"
              style={{ backgroundColor: tintedBgEnabled ? tintedBgColor : '#ffffff' }}
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-50)] border border-[var(--primary-100)]/30 flex items-center justify-center">
                    <Icon name="document" size={20} className="text-[var(--primary-600)]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-[240px]">
                    {uploadedFile?.name || `${documentTitle}.txt`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleSkipBack} 
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors active:scale-90"
                    title="Restart"
                  >
                    <Icon name="skip-back" size={20} />
                  </button>
                  <button 
                    onClick={handlePlayPause} 
                    disabled={isGenerating} 
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white shadow-md shadow-[var(--primary-500)]/15 disabled:opacity-50 transition-all active:scale-95"
                    title={isPlaying ? "Pause" : "Play Speech"}
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon name={isPlaying ? 'pause' : 'play'} size={20} className="ml-0.5" />
                    )}
                  </button>
                  <button 
                    onClick={handleSkipForward} 
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors active:scale-90"
                    title="Stop & Clear Highlight"
                  >
                    <Icon name="skip-forward" size={20} />
                  </button>
                  <div className="h-6 w-px bg-slate-200/60 mx-1"></div>
                  <button 
                    onClick={handleClose} 
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors text-slate-400 active:scale-90"
                    title="Exit reader"
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 sm:p-12">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">{documentTitle || 'Document'}</h3>
                <div
                  className="text-base sm:text-lg leading-9 text-slate-800 whitespace-pre-wrap transition-opacity duration-300 font-medium tracking-wide"
                  style={{ opacity: dimSurrounding && isPlaying ? 0.35 : 1 }}
                >
                  {extractedText ? renderHighlightedText() : (
                    <span className="text-slate-400 italic">No content loaded. Please go back and upload a file.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 flex-shrink-0 relative" style={{ isolation: 'isolate' }}>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 space-y-6">
              <div className="flex items-center justify-between mb-1 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Control Panel</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Option</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isLoadingLanguages}>
                    <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl h-11 text-sm font-medium hover:border-slate-300 transition-colors focus:ring-0">
                      <SelectValue placeholder={isLoadingLanguages ? "Loading languages..." : "Select voice"} />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" sideOffset={4} className="max-h-64 bg-white border border-slate-200 shadow-xl rounded-xl">
                      {voices.length > 0 ? (
                        voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id} className="focus:bg-slate-50 focus:text-slate-900 cursor-pointer py-2">
                            {voice.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="en" className="py-2">English (US)</SelectItem>
                          <SelectItem value="en-uk" className="py-2">English (UK)</SelectItem>
                          <SelectItem value="es" className="py-2">Spanish</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  onClick={handlePreviewAudio}
                  disabled={isGenerating}
                  className="w-full bg-white border border-[var(--primary-200)] text-[var(--primary-600)] font-semibold py-2.5 px-4 rounded-xl hover:bg-[var(--primary-50)]/40 hover:border-[var(--primary-400)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] text-sm shadow-sm"
                >
                  {isGenerating && previewingVoice === 'preview' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--primary-600)] border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : previewingVoice === 'preview' ? (
                    <>
                      <Icon name="pause" size={18} />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Icon name="volume" size={18} />
                      Preview Voice
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speed</label>
                <Select value={speed} onValueChange={setSpeed}>
                  <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl h-11 text-sm font-medium hover:border-slate-300 transition-colors">
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" sideOffset={4} className="bg-white border border-slate-200 shadow-xl rounded-xl">
                    {speedOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="cursor-pointer py-2">{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reading Options</label>
                <Select value={readingMode} onValueChange={setReadingMode}>
                  <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl h-11 text-sm font-medium hover:border-slate-300 transition-colors">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" sideOffset={4} className="bg-white border border-slate-200 shadow-xl rounded-xl">
                    {readingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="cursor-pointer py-2">{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dim surrounding</span>
                <Switch checked={dimSurrounding} onCheckedChange={setDimSurrounding} className="data-[state=checked]:bg-[var(--primary-500)]" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tinted background</span>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-7 h-7 rounded-lg border border-slate-200 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer" style={{ backgroundColor: tintedBgColor }} />
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 bg-white border border-slate-200 shadow-2xl rounded-xl" align="end" side="bottom" sideOffset={4}>
                      <div className="grid grid-cols-5 gap-2">
                        {tintedColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setTintedBgColor(color);
                              setTintedBgEnabled(true);
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${tintedBgColor === color ? 'border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/20' : 'border-slate-100'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-semibold">Enable tint</span>
                        <Switch checked={tintedBgEnabled} onCheckedChange={setTintedBgEnabled} className="data-[state=checked]:bg-[var(--primary-500)]" />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highlight colour</span>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-7 h-7 rounded-lg border border-slate-200 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer" style={{ backgroundColor: highlightColor }} />
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 bg-white border border-slate-200 shadow-2xl rounded-xl" align="end" side="bottom" sideOffset={4}>
                      <div className="grid grid-cols-5 gap-2">
                        {highlightColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setHighlightColor(color);
                              setHighlightEnabled(true);
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${highlightColor === color ? 'border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/20' : 'border-slate-100'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-semibold">Enable highlight</span>
                        <Switch checked={highlightEnabled} onCheckedChange={setHighlightEnabled} className="data-[state=checked]:bg-[var(--primary-500)]" />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <button
                onClick={handleExportAudio}
                disabled={!audioUrl && !previewAudioUrl}
                className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  audioUrl || previewAudioUrl 
                    ? 'bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] shadow-[var(--primary-500)]/15 hover:shadow-lg hover:scale-[1.01]' 
                    : 'bg-slate-50 text-slate-400 border border-slate-150/40 shadow-none'
                }`}
              >
                <Icon name="download" size={18} />
                {audioUrl || previewAudioUrl ? 'Export Audio (MP3)' : 'Generate Audio First'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}