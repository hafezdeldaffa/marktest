import React, { useState, useEffect } from 'react';
import { ViewState, ExamQuestion, UserAnswerRecord, FlaggedRecord } from './types/exam';
import { ParseResult } from './utils/markdownParser';
import { getExamHistory, saveExamHistory, deleteExamHistory, clearAllHistory, HistoryRecord } from './utils/historyStorage';
import { UploadView } from './components/UploadView';
import { ExamView } from './components/ExamView';
import { ResultsView } from './components/ResultsView';
import { HistoryModal } from './components/HistoryModal';

export const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [examTitle, setExamTitle] = useState<string>('Mock Practice Exam');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedRecord>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // History state
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    setHistoryRecords(getExamHistory());
  }, []);

  const handleStartExam = (parseResult: ParseResult) => {
    setExamTitle(parseResult.title);
    setQuestions(parseResult.questions);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeSpentSeconds(0);
    setViewState('exam');
  };

  const handleSelectAnswer = (questionId: number, optionKey: string) => {
    setUserAnswers((prev) => {
      if (prev[questionId] === optionKey) {
        const next = { ...prev };
        delete next[questionId];
        return next;
      }
      return {
        ...prev,
        [questionId]: optionKey
      };
    });
  };

  const handleToggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitExam = (finalTimeSpentSeconds: number) => {
    setTimeSpentSeconds(finalTimeSpentSeconds);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      const userChoice = userAnswers[q.id]?.toUpperCase();
      const correctChoice = q.correctAnswer?.toUpperCase();

      if (!userChoice) {
        unansweredCount++;
      } else if (correctChoice && userChoice === correctChoice) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correctCount / (totalQuestions || 1)) * 100);

    saveExamHistory({
      examTitle,
      scorePercentage,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions,
      timeSpentSeconds: finalTimeSpentSeconds,
      questions,
      userAnswers,
      flaggedQuestions
    });

    setHistoryRecords(getExamHistory());
    setViewState('results');
  };

  const handleRetake = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeSpentSeconds(0);
    setViewState('exam');
  };

  const handleUploadNew = () => {
    setViewState('upload');
    setQuestions([]);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeSpentSeconds(0);
  };

  const handleReviewHistoryRecord = (record: HistoryRecord) => {
    setExamTitle(record.examTitle);
    setQuestions(record.questions);
    setUserAnswers(record.userAnswers);
    setFlaggedQuestions(record.flaggedQuestions || {});
    setTimeSpentSeconds(record.timeSpentSeconds);
    setIsHistoryOpen(false);
    setViewState('results');
  };

  const handleRetakeHistoryRecord = (record: HistoryRecord) => {
    setExamTitle(record.examTitle);
    setQuestions(record.questions);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeSpentSeconds(0);
    setIsHistoryOpen(false);
    setViewState('exam');
  };

  const handleDeleteHistoryRecord = (id: string) => {
    const updated = deleteExamHistory(id);
    setHistoryRecords(updated);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all exam history?')) {
      clearAllHistory();
      setHistoryRecords([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {viewState === 'upload' && (
        <UploadView
          onStartExam={handleStartExam}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={historyRecords.length}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {viewState === 'exam' && (
        <ExamView
          examTitle={examTitle}
          questions={questions}
          userAnswers={userAnswers}
          flaggedQuestions={flaggedQuestions}
          onSelectAnswer={handleSelectAnswer}
          onToggleFlag={handleToggleFlag}
          onSubmitExam={handleSubmitExam}
          onQuitExam={handleUploadNew}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {viewState === 'results' && (
        <ResultsView
          examTitle={examTitle}
          questions={questions}
          userAnswers={userAnswers}
          flaggedQuestions={flaggedQuestions}
          timeSpentSeconds={timeSpentSeconds}
          onRetake={handleRetake}
          onUploadNew={handleUploadNew}
          onOpenHistory={() => setIsHistoryOpen(true)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      )}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyRecords={historyRecords}
        onReviewRecord={handleReviewHistoryRecord}
        onRetakeRecord={handleRetakeHistoryRecord}
        onDeleteRecord={handleDeleteHistoryRecord}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
};

export default App;
