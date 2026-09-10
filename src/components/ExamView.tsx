import React, { useState, useEffect } from 'react';
import { ExamQuestion, UserAnswerRecord, FlaggedRecord } from '../types/exam';
import { Clock, Flag, ChevronLeft, ChevronRight, Grid, Send, X, Sun, Moon, LogOut, BookOpen } from 'lucide-react';

interface ExamViewProps {
  examTitle: string;
  questions: ExamQuestion[];
  userAnswers: UserAnswerRecord;
  flaggedQuestions: FlaggedRecord;
  onSelectAnswer: (questionId: number, optionKey: string) => void;
  onToggleFlag: (questionId: number) => void;
  onSubmitExam: (timeSpentSeconds: number) => void;
  onQuitExam: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  examTitle,
  questions,
  userAnswers,
  flaggedQuestions,
  onSelectAnswer,
  onToggleFlag,
  onSubmitExam,
  onQuitExam,
  isDark,
  onToggleTheme
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirmModal) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F'].includes(key)) {
        const match = currentQuestion.options.find((opt) => opt.key === key);
        if (match) {
          onSelectAnswer(currentQuestion.id, match.key);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key.toLowerCase() === 'f') {
        onToggleFlag(currentQuestion.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion, totalQuestions, showConfirmModal, onSelectAnswer, onToggleFlag]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedKey = userAnswers[currentQuestion.id];
  const isFlagged = !!flaggedQuestions[currentQuestion.id];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100">
      {/* Top Sticky Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Exit & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onQuitExam}
              className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Exit practice test"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="font-black text-sm text-indigo-600 dark:text-indigo-400 hidden sm:inline">Marktest</span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                {examTitle}
              </h2>
            </div>
          </div>

          {/* Center: Timer & Progress */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-white px-3.5 py-1.5 rounded-lg text-sm font-extrabold shadow-xs border border-indigo-700 dark:border-indigo-400 tracking-wide">
              <Clock className="w-4 h-4 text-indigo-100" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>
          </div>

          {/* Right: Drawer toggle, Theme toggle & Submit */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition text-xs"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
              title="Question Palette"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8">
          {/* Question Header Metadata */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              {currentQuestion.category && (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  {currentQuestion.category}
                </span>
              )}
            </div>

            <button
              onClick={() => onToggleFlag(currentQuestion.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                isFlagged
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedKey === option.key;

              return (
                <button
                  key={option.key}
                  onClick={() => onSelectAnswer(currentQuestion.id, option.key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition flex items-start gap-4 ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition ${
                    isSelected
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {option.key}
                  </div>
                  <div className="text-base text-slate-900 dark:text-slate-100 font-normal pt-0.5 leading-snug">
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                currentIndex === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold">A</kbd>-<kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold">D</kbd> to select
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIndex === totalQuestions - 1}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                currentIndex === totalQuestions - 1
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Copyright */}
        <footer className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Marktest. Created by <span className="font-semibold text-slate-700 dark:text-slate-300">Hafezd El Daffa</span>. All rights reserved.</p>
        </footer>
      </div>

      {/* Drawer Slide-over / Modal for Question Navigation */}
      {showDrawer && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Question Palette</h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const answered = !!userAnswers[q.id];
                  const flagged = !!flaggedQuestions[q.id];
                  const isCurrent = idx === currentIndex;

                  let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                  if (answered) {
                    btnStyle = 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowDrawer(false);
                      }}
                      className={`relative aspect-square rounded-xl border flex items-center justify-center text-sm font-semibold transition ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                    >
                      {idx + 1}
                      {flagged && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-indigo-600 dark:bg-indigo-500 rounded-md" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-amber-500 rounded-full" />
                <span>Flagged</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Submit Your Exam?</h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to finish and submit your exam?
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 text-sm mb-6 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Total Questions:</span>
                <span className="font-semibold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Answered:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Unanswered:</span>
                <span className={`font-semibold ${totalQuestions - answeredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                  {totalQuestions - answeredCount}
                </span>
              </div>
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400">
                  <span>Flagged Questions:</span>
                  <span className="font-semibold">{flaggedCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
              >
                Continue Exam
              </button>
              <button
                onClick={() => onSubmitExam(secondsElapsed)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition text-sm shadow-xs"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
