/**
 * Mock API Service
 * Returns fake data for development when backend is not available
 */

import { User, Quiz, StudySet, Summary } from '@/types';

// Mock User Data
export const mockUser: User = {
  id: '1',
  email: 'student@lexiassist.com',
  name: 'Alex Johnson',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'student',
  school: 'Stanford University',
  department: 'Computer Science',
  level: 'Undergraduate',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock Quiz Data
export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Python Basics',
    description: 'Test your understanding of Python fundamentals',
    subject: 'Computer Science',
    difficulty: 'easy',
    time_limit_minutes: 30,
    questions: [
      {
        id: 'q1',
        question_type: 'multiple_choice',
        question_text: 'What is the correct way to define a function in Python?',
        options: [
          { text: 'function myFunc():', is_correct: false },
          { text: 'def myFunc():', is_correct: true },
          { text: 'func myFunc():', is_correct: false },
          { text: 'define myFunc():', is_correct: false },
        ],
        correct_answer: 'def myFunc():',
        explanation: 'In Python, functions are defined using the "def" keyword.',
        points: 10,
      },
      {
        id: 'q2',
        question_type: 'true_false',
        question_text: 'Python is a statically typed language.',
        correct_answer: 'false',
        explanation: 'Python is dynamically typed, meaning variable types are determined at runtime.',
        points: 10,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Data Structures',
    description: 'Arrays, linked lists, trees, and more',
    subject: 'Computer Science',
    difficulty: 'medium',
    time_limit_minutes: 45,
    questions: [
      {
        id: 'q3',
        question_type: 'multiple_choice',
        question_text: 'What is the time complexity of binary search?',
        options: [
          { text: 'O(n)', is_correct: false },
          { text: 'O(log n)', is_correct: true },
          { text: 'O(n²)', is_correct: false },
          { text: 'O(1)', is_correct: false },
        ],
        correct_answer: 'O(log n)',
        explanation: 'Binary search divides the search space in half each iteration.',
        points: 15,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock Materials
export const mockMaterials = [
  {
    id: '1',
    name: 'Introduction to Biology.pdf',
    type: 'pdf',
    size: 2500000,
    uploadedAt: new Date().toISOString(),
    subject: 'Biology',
  },
  {
    id: '2',
    name: 'World History Notes.docx',
    type: 'docx',
    size: 1200000,
    uploadedAt: new Date().toISOString(),
    subject: 'History',
  },
];

// Mock Study Sets
export const mockStudySets: StudySet[] = [
  {
    id: '1',
    title: 'Biology 101',
    description: 'Basic biology concepts and definitions',
    cards: [
      { id: 'c1', front: 'What is photosynthesis?', back: 'The process by which plants convert light energy into chemical energy.', category: 'Biology' },
      { id: 'c2', front: 'What is mitosis?', back: 'Cell division that results in two daughter cells with identical DNA.', category: 'Biology' },
      { id: 'c3', front: 'What is DNA?', back: 'Deoxyribonucleic acid, the molecule that carries genetic instructions.', category: 'Biology' },
    ],
    subject: 'Biology',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'World History',
    description: 'Key historical events and figures',
    cards: [
      { id: 'c4', front: 'When did World War II end?', back: '1945', category: 'History' },
      { id: 'c5', front: 'Who was the first President of the United States?', back: 'George Washington', category: 'History' },
    ],
    subject: 'History',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock AI Response
export function generateMockAIResponse(prompt: string, type: string) {
  const responses: Record<string, string> = {
    explain: `Here's an explanation of "${prompt.slice(0, 50)}...":\n\nThis concept involves several key principles:\n\n1. **Fundamental Understanding**: At its core, this topic relates to how systems process and organize information.\n\n2. **Key Components**: The main elements include structure, function, and interaction patterns.\n\n3. **Practical Applications**: You can apply this knowledge in real-world scenarios such as problem-solving and analysis.\n\nWould you like me to elaborate on any specific aspect?`,
    
    summarize: `Summary of the provided text:\n\n**Main Points:**\n• The text discusses important concepts related to the subject matter\n• Key arguments and evidence are presented systematically\n• Conclusions are drawn based on the analysis provided\n\n**Key Takeaway:** The material emphasizes the importance of understanding fundamental principles before advancing to complex applications.`,
    
    rewrite: `Here's the enhanced version:\n\n${prompt}\n\n**Improvements made:**\n• Enhanced clarity and flow\n• Improved sentence structure\n• Fixed grammatical issues\n• Made the text more engaging and professional`,
    
    quiz: JSON.stringify({
      questions: [
        {
          id: '1',
          type: 'multiple_choice',
          question: 'What is the main concept discussed in the material?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option B',
          explanation: 'This is the correct answer based on the context provided.',
          points: 10,
        },
        {
          id: '2',
          type: 'true_false',
          question: 'The text supports this statement.',
          correctAnswer: true,
          explanation: 'The text clearly indicates this is true.',
          points: 10,
        },
      ],
    }),
    
    flashcards: JSON.stringify({
      cards: [
        { front: 'Key Concept 1', back: 'Definition and explanation of concept 1' },
        { front: 'Key Concept 2', back: 'Definition and explanation of concept 2' },
        { front: 'Key Concept 3', back: 'Definition and explanation of concept 3' },
      ],
    }),
    
    chat: `I'd be happy to help with that! Based on your question about "${prompt.slice(0, 30)}...", here's what I know:\n\nThis is an interesting topic that involves multiple perspectives. Let me break it down for you:\n\n**Key Points:**\n1. First, it's important to understand the foundational concepts\n2. Then, we can explore how they apply in different contexts\n3. Finally, we can look at practical examples\n\nDoes this help? Feel free to ask follow-up questions!`,
  };

  return responses[type] || responses.chat;
}

// Mock API Handlers
export const mockApi = {
  // Auth
  getCurrentUser: () => mockUser,
  logout: () => ({ success: true }),
  
  // Quizzes
  getQuizzes: () => mockQuizzes,
  getQuizById: (id: string) => mockQuizzes.find(q => q.id === id),
  submitQuizAttempt: (quizId: string, answers: Record<string, string>) => ({
    score: 85,
    maxScore: 100,
    correctAnswers: 7,
    totalQuestions: 10,
    feedback: 'Great job! You have a solid understanding of the material.',
  }),
  
  // Study Sets / Flashcards
  getStudySets: () => mockStudySets,
  getStudySetById: (id: string) => mockStudySets.find(s => s.id === id),
  
  // Materials
  getMaterials: () => mockMaterials,
  uploadMaterial: (file: File) => ({
    id: String(mockMaterials.length + 1),
    name: file.name,
    type: file.name.split('.').pop() || 'unknown',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    subject: 'General',
  }),
  
  // AI
  generateContent: (prompt: string, type: string) => ({
    content: generateMockAIResponse(prompt, type),
    type,
    metadata: { model: 'mock-llm', tokens: 150 },
  }),
  
  getModels: () => [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'claude', name: 'Claude', description: 'Anthropic\'s AI assistant' },
  ],
};

export default mockApi;
