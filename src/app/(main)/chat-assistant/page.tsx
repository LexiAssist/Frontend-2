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

    const newFiles: UploadedFile