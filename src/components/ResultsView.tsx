import React, { useState, useEffect } from 'react';
import { ExamQuestion, UserAnswerRecord, FlaggedRecord } from '../types/exam';
import { Award, CheckCircle2, XCircle, RotateCcw, Upload, HelpCircle, Check, X, Sparkles, History, Sun, Moon, BookOpen } from 'lucide-react';
import { marked } from 'marked';
import confetti from 'canvas-confetti';

interface ResultsViewProps {
  examTitle: string;
  questions: ExamQuestion[];
  userAnswers: UserAnswerRecord;
  flaggedQuestions: FlaggedRecord;
  timeSpentSeconds: number;
  onRetake: () => void;
  onUploadNew: () => void;
  onOpenHistory: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  examTitle,
  questions,
  userAnswers,
  flaggedQuestions,
  timeSpentSeconds,
  onRetake,
  onUploadNew,
  onOpenHistory,
  isDark,
  onToggleTheme
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'flagged'>('incorrect');

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
  const isPassed = scorePercentage >= 70;

  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isPassed]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredQuestions = questions.filter((q) => {
    const userChoice = userAnswers[q.id]?.toUpperCase();
    const correctChoice = q.correctAnswer?.toUpperCase();
    const isCorrect = userChoice && correctChoice && userChoice === correctChoice;
    const isFlagged = !!flaggedQuestions[q.id];

    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isCorrect;
    if (filter === 'flagged') return isFlagged;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col min-h-screen text-slate-900 dark:text-slate-100">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400 tracking-tight">
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Marktest</span>
          </div>

          <button
            onClick={onUploadNew}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition border-l border-slate-200 dark:border-slate-800 pl-3"
          >
            ← Home / New Exam
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition shadow-xs flex items-center justify-center text-xs"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenHistory}
            className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>View All Saved History</span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        {/* Top Score Banner */}
        <div className={`p-8 rounded-3xl text-white shadow-xl mb-10 overflow-hidden relative ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-200 dark:shadow-none'
            : 'bg-gradient-to-br from-rose-600 to-amber-700 shadow-rose-200 dark:shadow-none'
        }`}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                {isPassed ? <Sparkles className="w-4 h-4 text-amber-300" /> : <Award className="w-4 h-4" />}
                <span>{isPassed ? 'Exam Passed!' : 'Exam Completed'}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">{examTitle}</h1>
              <p className="text-white/80 text-sm">
                Completed in {formatTime(timeSpentSeconds)} • Saved to History
              </p>
            </div>

            <div className="flex items-center gap-6 bg-white/15 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="text-center">
                <div className="text-5xl font-black tracking-tight">{scorePercentage}%</div>
                <div className="text-xs uppercase tracking-wider font-semibold text-white/70 mt-1">Final Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Questions</div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalQuestions}</div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs text-center">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">Correct</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{correctCount}</div>
          </div>

          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xs text-center">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase">Incorrect</div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{incorrectCount}</div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs text-center">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">Unanswered</div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{unansweredCount}</div>
          </div>
        </div>

        {/* Filter Tabs & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl text-sm font-semibold w-full sm:w-auto overflow-x-auto border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                filter === 'incorrect'
                  ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              Wrong ({incorrectCount + unansweredCount})
            </button>

            <button
              onClick={() => setFilter('correct')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                filter === 'correct'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Correct ({correctCount})
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({totalQuestions})
            </button>

            {Object.keys(flaggedQuestions).length > 0 && (
              <button
                onClick={() => setFilter('flagged')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'flagged'
                    ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onRetake}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Retake Exam
            </button>

            <button
              onClick={onUploadNew}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              New Exam
            </button>
          </div>
        </div>

        {/* Review Questions List */}
        <div className="space-y-8">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No questions found for this filter</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Great job! Switch tabs to inspect other questions.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const userChoice = userAnswers[q.id]?.toUpperCase();
              const correctChoice = q.correctAnswer?.toUpperCase();
              const isCorrect = userChoice && correctChoice && userChoice === correctChoice;
              const isUnanswered = !userChoice;

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-xs p-6 sm:p-8 transition ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/10'
                      : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/10'
                  }`}
                >
                  {/* Question Header Status */}
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Question {q.id}
                      </span>
                      {q.category && (
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                          {q.category}
                        </span>
                      )}
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Correct
                        </span>
                      ) : isUnanswered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full">
                          Unanswered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-full">
                          <X className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options Breakdown */}
                  <div className="space-y-2.5 mb-6">
                    {q.options.map((opt) => {
                      const isUserSelected = userChoice === opt.key;
                      const isRightOption = correctChoice === opt.key;

                      let optBg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                      let badge = null;

                      if (isRightOption) {
                        optBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-medium shadow-xs';
                        badge = (
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Correct Answer
                          </span>
                        );
                      } else if (isUserSelected && !isRightOption) {
                        optBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-950 dark:text-rose-200 font-medium';
                        badge = (
                          <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2.5 py-1 rounded-md flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Your Choice
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3.5 rounded-xl border-2 flex items-center justify-between gap-3 text-sm ${optBg}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-bold w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation Section */}
                  {q.explanation && (
                    <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl p-5 text-sky-950 dark:text-sky-200">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-2">
                        <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        Explanation & Reasoning
                      </div>
                      <div
                        className="markdown-body text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: marked.parse(q.explanation) }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 Marktest. Created by <span className="font-semibold text-slate-700 dark:text-slate-300">Hafezd El Daffa</span>. All rights reserved.</p>
      </footer>
    </div>
  );
};
