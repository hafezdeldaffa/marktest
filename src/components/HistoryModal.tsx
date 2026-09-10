import React from 'react';
import { HistoryRecord } from '../utils/historyStorage';
import { History, Calendar, Clock, Award, Trash2, Eye, RotateCcw, X } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyRecords: HistoryRecord[];
  onReviewRecord: (record: HistoryRecord) => void;
  onRetakeRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyRecords,
  onReviewRecord,
  onRetakeRecord,
  onDeleteRecord,
  onClearAll
}) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Exam History</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved test results & performance tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyRecords.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 font-semibold px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {historyRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No exam history recorded yet</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Completed practice exams will automatically be stored here so you can review wrong answers or retake tests anytime.
              </p>
            </div>
          ) : (
            historyRecords.map((record) => {
              const isPassed = record.scorePercentage >= 70;

              return (
                <div
                  key={record.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isPassed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}>
                        {record.scorePercentage}% {isPassed ? 'PASSED' : 'NEEDS REVIEW'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.completedAt)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{record.examTitle}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Correct: <strong className="text-emerald-600 dark:text-emerald-400">{record.correctCount}</strong>/{record.totalQuestions}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(record.timeSpentSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onReviewRecord(record)}
                      className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </button>

                    <button
                      onClick={() => onRetakeRecord(record)}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake
                    </button>

                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
