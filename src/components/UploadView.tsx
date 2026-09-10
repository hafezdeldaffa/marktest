import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Play, HelpCircle, ChevronDown, ChevronUp, BookOpen, History, Sun, Moon, Sparkles } from 'lucide-react';
import { parseExamFiles, ParseResult } from '../utils/markdownParser';

interface UploadViewProps {
  onStartExam: (parseResult: ParseResult) => void;
  onOpenHistory: () => void;
  historyCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onStartExam,
  onOpenHistory,
  historyCount,
  isDark,
  onToggleTheme
}) => {
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [answersFile, setAnswersFile] = useState<File | null>(null);
  const [questionsContent, setQuestionsContent] = useState<string>('');
  const [answersContent, setAnswersContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);

  const handleFileRead = (file: File, type: 'questions' | 'answers') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (type === 'questions') {
        setQuestionsFile(file);
        setQuestionsContent(text);
      } else {
        setAnswersFile(file);
        setAnswersContent(text);
      }
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleStart = () => {
    if (!questionsContent.trim()) {
      setErrorMsg('Please upload a Questions Markdown file before starting.');
      return;
    }

    const result = parseExamFiles(questionsContent, answersContent);
    if (result.error || result.questions.length === 0) {
      setErrorMsg(result.error || 'No questions parsed. Please check your markdown file format.');
      return;
    }

    onStartExam(result);
  };

  const handleLoadSample = async () => {
    setLoadingSample(true);
    setErrorMsg(null);
    try {
      const qRes = await fetch('/samples/sample-questions.md');
      const aRes = await fetch('/samples/sample-answers.md');

      if (!qRes.ok || !aRes.ok) {
        throw new Error('Could not load sample files');
      }

      const qText = await qRes.text();
      const aText = await aRes.text();

      setQuestionsContent(qText);
      setAnswersContent(aText);
      
      setQuestionsFile(new File([qText], "sample-questions.md", { type: "text/markdown" }));
      setAnswersFile(new File([aText], "sample-answers.md", { type: "text/markdown" }));

      const result = parseExamFiles(qText, aText);
      onStartExam(result);
    } catch (err: any) {
      setErrorMsg('Failed to load sample exam files: ' + (err.message || err));
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col min-h-screen">
      {/* Top Navbar Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400 tracking-tight">
          <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>Marktest</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition shadow-xs flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenHistory}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Exam History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center my-8 flex-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Markdown Exam Studio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">Marktest</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Your personal study companion! Simply upload your Markdown files for questions and answer keys, take interactive practice tests under realistic timed conditions, and review your performance with instant auto-grading and wrong answer explanations.
        </p>

        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl flex items-start gap-3 max-w-2xl mx-auto text-left">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 text-left">
          {/* Questions File Card */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${
            questionsFile 
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs' 
              : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md">
                Step 1: Questions File
              </span>
              {questionsFile && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Questions Markdown File</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Contains your practice questions & choices (A, B, C, D)</p>

            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".md,.txt,.markdown"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileRead(e.target.files[0], 'questions');
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Upload className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {questionsFile ? questionsFile.name : 'Click to select Questions .md file'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {questionsFile ? `${(questionsFile.size / 1024).toFixed(1)} KB` : 'or drag & drop here'}
                </span>
              </div>
            </label>
          </div>

          {/* Answers File Card */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${
            answersFile 
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs' 
              : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                Step 2: Answer Key & Explanations
              </span>
              {answersFile && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Answers & Explanations File</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Contains answer keys & detailed explanations</p>

            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".md,.txt,.markdown"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileRead(e.target.files[0], 'answers');
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <FileText className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {answersFile ? answersFile.name : 'Click to select Answers .md file'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {answersFile ? `${(answersFile.size / 1024).toFixed(1)} KB` : 'or drag & drop here (Optional if included in Q file)'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={handleStart}
            disabled={!questionsContent}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${
              questionsContent
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            Start Practice Exam
          </button>

          <button
            onClick={handleLoadSample}
            disabled={loadingSample}
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            {loadingSample ? 'Loading...' : 'Try CAPM Sample Exam (10 Questions)'}
          </button>
        </div>

        {/* Accordion Markdown Format Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs text-left">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Supported Markdown Format Guide</span>
            </div>
            {showGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showGuide && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300 space-y-4">
              <p>You can structure your markdown files using simple headers and list choices:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wider">Questions File (.md)</h4>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto">
{`### Question 1 (Initiating)

**Which input to Develop Project Charter is the PM reviewing?**

A. Benefits Management Plan
B. Business Case
C. Project Scope Statement
D. Assumption Log

---`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wider">Answers File (.md)</h4>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto">
{`### Question 1

**Correct Answer:** B

**Explanation:** The Business Case contains the necessary economic and strategic justification.

---`}
                  </pre>
                </div>
              </div>
            </div>
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
