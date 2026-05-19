'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  BookOpenText,
  ChevronDown,
  Paperclip,
  User,
  Bot,
  X,
  FileText,
  Loader2,
  Sparkles,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { FeatureHeader } from '@/components/FeatureHeader';
import { useAuthStore } from '@/store/authStore';
import { useAIChat, useConversation } from '@/hooks/useAI';
import { materialApi, aiApi } from '@/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedMessage } from '@/components/chat/FormattedMessage';

const starterCards = [
  {
    title: 'Summarize this into key points',
    icon: BookOpenText,
  },
  {
    title: 'Give me the most important ideas from this topic',
    icon: Sparkles,
  },
  {
    title: 'Explain empiricism in philosophy in simple terms',
    icon: BookOpenText,
  },
];

// Helper to check if AI response is a "no context" response
const isNoContextResponse = (response: string): boolean => {
  const noContextPatterns = [
    "don't have enough information",
    "no relevant context",
    "cannot find information",
    "no documents",
    "insufficient information",
    "context not found",
  ];
  return noContextPatterns.some(pattern => 
    response.toLowerCase().includes(pattern.toLowerCase())
  );
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export default function ChatAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  
  const { user } = useAuthStore();
  const chatMutation = useAIChat();
  
  const { data: conversationData, isLoading: isLoadingConversation } = useConversation(conversationId);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);
  
  useEffect(() => {
    if (conversationData && typeof conversationData === 'object' && 'messages' in conversationData) {
      const data = conversationData as { messages: Array<Record<string, unknown>> };
      if (data.messages && Array.isArray(data.messages)) {
        const loadedMessages: Message[] = data.messages.map((msg, idx) => ({
          id: typeof msg.id === 'string' ? msg.id : `loaded-${Date.now()}-${idx}`,
          role: (typeof msg.role === 'string' ? msg.role : 'user') as 'user' | 'assistant',
          content: typeof msg.content === 'string' ? msg.content : '',
          timestamp: typeof msg.timestamp === 'string' || typeof msg.timestamp === 'number' ? new Date(msg.timestamp) : new Date(),
          sources: Array.isArray(msg.sources) ? msg.sources : undefined,
        }));
        setMessages(loadedMessages);
      }
    }
  }, [conversationData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingMessage]);

  useEffect(() => {
    const textarea = chatInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [prompt, messages.length]);

  const openFilePicker = () => fileInputRef.current?.click();
  const openFolderPicker = () => folderInputRef.current?.click();

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const material = await materialApi.upload(file);
      toast.success(`Uploaded ${file.name}`);
      return material.id;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = files.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      status: 'uploading',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = newFiles[i].id;
      
      try {
        const materialId = await uploadFile(file);
        if (materialId && materialId.trim() !== '') {
          setUploadedFiles(prev => 
            prev.map(f => f.id === tempId ? { ...f, id: materialId, status: 'processing' } : f)
          );
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
        setUploadedFiles(prev => prev.filter(f => f.id !== tempId));
      }
    }
  };

  const handleFolderSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => 
      f.type.includes('pdf') || f.type.includes('text') || f.type.includes('document') ||
      f.name.endsWith('.pdf') || f.name.endsWith('.txt') || f.name.endsWith('.doc') || f.name.endsWith('.docx')
    );

    if (validFiles.length === 0) {
      toast.error('No valid documents found in folder');
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      status: 'uploading',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const tempId = newFiles[i].id;
      
      try {
        const materialId = await uploadFile(file);
        if (materialId && materialId.trim() !== '') {
          setUploadedFiles(prev => 
            prev.map(f => f.id === tempId ? { ...f, id: materialId, status: 'processing' } : f)
          );
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
        setUploadedFiles(prev => prev.filter(f => f.id !== tempId));
      }
    }
  };

  const removeFile = (fileId: string) => setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  const clearAllFiles = () => setUploadedFiles([]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    if (!user?.id) {
      toast.error('Please log in to use the chat assistant');
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsTyping(true);

    try {
      // Retrieve context chunks from the retrieval service
      let contextChunks: string[] = [];
      if (uploadedFiles.length > 0) {
        try {
          const retrievalResult = await aiApi.retrieveContext(
            userMessage.content,
            user.id,
            5 // top_k
          );
          contextChunks = retrievalResult.results?.map((c: { chunk_text?: string }) => c.chunk_text).filter((t): t is string => typeof t === 'string') || [];
        } catch (err) {
          console.warn('Failed to retrieve context:', err);
        }
      }

      let useStreamingFallback = false;
      if (useStreaming) {
        try {
          setStreamingMessage('');
          
          await aiApi.chatStream(
            userMessage.content,
            user.id,
            {
              conversationId,
              contextChunks,
            },
            (token: string) => {
              setStreamingMessage(prev => prev + token);
            },
            (response) => {
              if (response.conversation_id) {
                setConversationId(response.conversation_id);
              }

              let content = response.response;
              if (isNoContextResponse(content) && uploadedFiles.length === 0) {
                content = `I don't have any documents to reference yet. To get the most accurate answers, please upload your study materials using the attach button.\n\nIn the meantime, I can try to help with general knowledge questions, but my answers will be more helpful once I can reference your specific course materials.`;
              }

              const assistantMessage: Message = {
                id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                role: 'assistant',
                content: content,
                timestamp: new Date(),
                sources: response.sources,
              };

              setMessages(prev => [...prev, assistantMessage]);
              setStreamingMessage('');
              setIsTyping(false);
            },
            (error) => {
              console.error('Chat stream error:', error);
              useStreamingFallback = true;
            }
          );
        } catch (error) {
          console.warn('Streaming failed, falling back to standard chat:', error);
          useStreamingFallback = true;
        }
      }
      
      if (!useStreaming || useStreamingFallback) {
        const response = await chatMutation.mutateAsync({
          query: userMessage.content,
          userId: user.id,
          options: {
            conversationId,
            contextChunks,
          },
        });

        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        let content = response.response;
        if (isNoContextResponse(content) && uploadedFiles.length === 0) {
          content = `I don't have any documents to reference yet. To get the most accurate answers, please upload your study materials using the "Attach" button above.\n\nIn the meantime, I can try to help with general knowledge questions, but my answers will be more helpful once I can reference your specific course materials.`;
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: content,
          timestamp: new Date(),
          sources: response.sources,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setUploadedFiles([]);
    setPrompt('');
  };

  const AttachmentButton = ({ variant = 'default' }: { variant?: 'default' | 'compact' }) => (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.md"
        className="hidden"
        onChange={handleFileSelection}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFolderSelection}
      />
      
      {variant === 'default' ? (
        <div className="flex items-center overflow-hidden rounded-lg bg-slate-900 text-white">
          <button
            type="button"
            onClick={openFilePicker}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            <Paperclip className="h-4 w-4" />
            <span>Attach</span>
          </button>
          <button
            type="button"
            onClick={openFolderPicker}
            className="border-l border-white/15 px-2.5 py-2 transition hover:bg-slate-800"
            aria-label="Choose folder"
            title="Choose folder"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const UploadedFilesList = ({ compact = false }: { compact?: boolean }) => {
    if (uploadedFiles.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-2 ${compact ? 'mb-2' : 'px-4 py-3 bg-slate-50/80 border-t border-slate-100'}`}>
        {uploadedFiles.map((file) => (
          <span
            key={file.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border ${
              compact ? 'rounded-full' : 'rounded-lg'
            } ${
              file.status === 'uploading'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : file.status === 'processing'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-[var(--primary-50)] text-[var(--primary-700)] border-[var(--primary-200)]'
            }`}
          >
            {file.status === 'uploading' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span className={compact ? "max-w-[120px] truncate" : "max-w-[140px] truncate"}>{file.name}</span>
            {!compact && file.status === 'uploading' && <span className="text-[10px]">uploading…</span>}
            {!compact && file.status === 'processing' && <span className="text-[10px]">processing…</span>}
            <button 
              onClick={() => removeFile(file.id)} 
              className="ml-0.5 hover:text-red-500 transition-colors rounded-sm"
              disabled={file.status === 'uploading'}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {!compact && uploadedFiles.length > 0 && (
          <button
            onClick={clearAllFiles}
            className="text-xs text-slate-400 hover:text-slate-600 px-1"
          >
            Clear all
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-6xl flex-col lg:h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 pt-2 lg:pb-6 lg:pt-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--primary-500)] flex items-center justify-center text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LexiAssist Chat</h1>
            <p className="text-sm text-slate-500">
              {isLoadingConversation ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading conversation...
                </span>
              ) : conversationId ? (
                'Continuing conversation'
              ) : (
                'New conversation'
              )}
              {uploadedFiles.length > 0 && (
                <span className="ml-2 text-[var(--primary-600)] font-medium">
                  • {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} attached
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseStreaming(!useStreaming)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              useStreaming
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle streaming responses"
          >
            <MessageSquare className="w-3 h-3 inline mr-1" />
            {useStreaming ? 'Streaming' : 'Standard'}
          </button>
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          )}
          <FeatureHeader />
        </div>
      </div>

      {messages.length === 0 ? (
        /* Empty State */
        <section className="flex flex-1 flex-col items-center justify-center pb-12 overflow-y-auto">
          <div className="flex w-full max-w-[720px] flex-col items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center text-white shadow-lg mb-6"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>

            <h1 className="text-center text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Good afternoon, {user?.first_name || user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="mt-2 text-center text-lg text-slate-500">
              What would you like to learn today?
            </p>

            <div className="mt-8 w-full">
              <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:shadow-md focus-within:border-slate-300 transition-all">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[140px] w-full resize-none rounded-t-2xl border-0 bg-transparent px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Ask me anything about your studies…"
                />

                <UploadedFilesList />

                <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-2">
                  <div className="flex items-center gap-2">
                    <AttachmentButton />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || chatMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-500)] text-white text-sm font-medium hover:bg-[var(--primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <span>Send</span>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {starterCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.title}
                      type="button"
                      onClick={() => setPrompt(card.title)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex min-h-[96px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-[var(--primary-300)] hover:shadow-sm"
                    >
                      <p className="text-sm leading-relaxed text-slate-700 group-hover:text-slate-900 transition-colors">{card.title}</p>
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4 text-slate-400 group-hover:text-[var(--primary-500)] transition-colors" />
                        <ArrowUp className="h-3.5 w-3.5 text-slate-300 rotate-45 group-hover:text-[var(--primary-500)] transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Chat Interface */
        <section className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[var(--primary-500)] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-3 leading-relaxed text-[15px] ${
                        message.role === 'user'
                          ? 'bg-slate-900 text-white rounded-2xl rounded-tr-md'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">Sources</p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((source, idx) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200">
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] text-slate-400 px-1`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--primary-500)] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md shadow-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-100 bg-white p-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <UploadedFilesList compact />
              <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm focus-within:shadow-md focus-within:border-slate-300 transition-all">
                <div className="flex items-end gap-2 px-3 py-3">
                  <AttachmentButton variant="compact" />
                  <textarea
                    ref={chatInputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message StudyBuddy…"
                    rows={1}
                    className="flex-1 resize-none border-0 bg-transparent px-1 py-1.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 max-h-[160px] min-h-[24px]"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || chatMutation.isPending}
                    className="mb-0.5 p-2 rounded-lg bg-[var(--primary-500)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--primary-600)] transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Press <kbd className="font-sans px-1 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px]">Enter</kbd> to send, <kbd className="font-sans px-1 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px]">Shift</kbd> + <kbd className="font-sans px-1 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px]">Enter</kbd> for new line
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
