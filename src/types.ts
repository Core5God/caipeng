export interface IdentificationSection {
  title: string;
  icon: string; // Lucide icon name
  content: string;
}

export interface IdentificationResult {
  name: string;
  category: string;
  confidence: number;
  description: string;
  emoji: string; // Added emoji field
  sections: IdentificationSection[];
}

export interface FunFact {
  title: string;
  content: string;
  emoji: string; // Changed from imageUrl
}

export interface TrendingTopic {
  rank: number;
  title: string;
  summary: string;
  detail: string;
  emoji: string; // Changed from imageUrl
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
