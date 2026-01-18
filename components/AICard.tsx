
import React, { useState } from 'react';
import { StudyTipResponse } from '../services/geminiService';

interface AICardProps {
  response: StudyTipResponse;
  onFetch: () => void;
  loading: boolean;
  subjects: string[];
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const AICard: React.FC<AICardProps> = ({ response, onFetch, loading, subjects, selectedSubject, onSubjectChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (response.text) {
      navigator.clipboard.writeText(response.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasError = !!response.error;

  return (
    <div className="h-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white leading-tight text-base">বোর্ড প্রশ্ন ভাণ্ডার (লোকাল)</h3>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">বিগত ১০ বছরের বোর্ড অ্যানালাইসিস</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            disabled={loading}
            className="flex-1 sm:flex-none text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 dark:text-slate-200 focus:ring-2 ring-primary/20 transition-all disabled:opacity-50"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {response.text && !loading && !hasError && (
            <button 
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary transition-colors"
              title="কপি করুন"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2v2m-2-2v2"/></svg>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">বোর্ড ডাটাবেজ থেকে প্রশ্ন খোঁজা হচ্ছে...</span>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-5/6"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-4/6"></div>
            </div>
          </div>
        ) : hasError ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 text-xl animate-bounce">⚠️</div>
            <div className="max-w-[240px] space-y-3">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed">{response.error}</p>
              <button 
                onClick={onFetch} 
                className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        ) : response.text ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium">
              {response.text}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl opacity-50">📑</div>
            <div className="max-w-[240px]">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">গুরুত্বপূর্ণ বোর্ড প্রশ্ন ও সাজেশন পেতে নিচের বাটনে চাপ দিন।</p>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={onFetch}
        disabled={loading}
        className="mt-6 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            অ্যানালাইজ হচ্ছে...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            বোর্ড প্রশ্ন ও সাজেশন দেখুন
          </>
        )}
      </button>
    </div>
  );
};

export default AICard;
