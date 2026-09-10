import { ExamQuestion, UserAnswerRecord, FlaggedRecord } from '../types/exam';

export interface HistoryRecord {
  id: string;
  examTitle: string;
  completedAt: string; // ISO string format
  scorePercentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  questions: ExamQuestion[];
  userAnswers: UserAnswerRecord;
  flaggedQuestions: FlaggedRecord;
}

const STORAGE_KEY = 'mock_exam_history_v1';

export function getExamHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load exam history from localStorage:', err);
    return [];
  }
}

export function saveExamHistory(
  entry: Omit<HistoryRecord, 'id' | 'completedAt'>
): HistoryRecord {
  const history = getExamHistory();
  const newRecord: HistoryRecord = {
    ...entry,
    id: 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    completedAt: new Date().toISOString()
  };

  // Prepend to show newest first
  const updated = [newRecord, ...history];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save exam history to localStorage:', err);
  }

  return newRecord;
}

export function deleteExamHistory(id: string): HistoryRecord[] {
  const history = getExamHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
  return updated;
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear exam history:', err);
  }
}
