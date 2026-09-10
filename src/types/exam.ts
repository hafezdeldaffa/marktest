export interface QuestionOption {
  key: string; // e.g. "A", "B", "C", "D"
  text: string;
}

export interface ParsedQuestion {
  id: number;
  title: string;
  category?: string;
  questionText: string;
  options: QuestionOption[];
}

export interface ParsedAnswer {
  id: number;
  correctAnswer: string; // e.g. "B" or "A, C"
  explanation: string;
}

export interface ExamQuestion extends ParsedQuestion {
  correctAnswer?: string;
  explanation?: string;
}

export interface ExamConfig {
  title: string;
  questions: ExamQuestion[];
}

export type ViewState = 'upload' | 'exam' | 'results';

export interface UserAnswerRecord {
  [questionId: number]: string; // questionId -> selected option key (e.g., "B")
}

export interface FlaggedRecord {
  [questionId: number]: boolean;
}

export interface ExamSummary {
  scorePercentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
}
