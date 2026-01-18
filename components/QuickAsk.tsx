
import React, { useState } from 'react';
import { Subject } from '../types';
import { getQuickAnswer, StudyTipResponse } from '../services/geminiService';

interface QuickAskProps {
  subjects: Subject[];
}

const QuickAsk: React.FC<QuickAskProps> = ({ subjects }) => {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || '');
  const [aiResponse, setAiResponse] = useState<StudyTipResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAiResponse(null);
    try {
      const res = await getQuickAnswer(selectedSubject, query);
      setAiResponse(res);
    } catch (error) {
      setAiResponse({ text: "দুঃখিত, উত্তর খুঁজে পাওয়া যায়নি।", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Powered by Gemini 3 Flash (Free)</span>
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">এআই ডাউট সলভার</h2>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">যেকোনো প্রশ্ন করুন, উত্তর পান তাৎক্ষণিক</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
        <form onSubmit={handleAsk} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-4 ring-primary/10 transition-all cursor-pointer shadow-sm"
            >
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="আপনার প্রশ্নটি এখানে লিখুন (যেমন: সালোকসংশ্লেষণ কী?)..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 ring-primary/10 transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? '...' : 'জিজ্ঞাসা করুন'}
              </button>
            </div>
          </div>
        </form>

        <div className="min-h-[350px] bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">শিক্ষক উত্তর তৈরি করছেন...</p>
            </div>
          ) : aiResponse ? (
            <div className="w-full animate-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">✨</div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white">শিক্ষকের ব্যাখ্যা</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verified by Gemini AI</p>
                  </div>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(aiResponse.text); alert("কপি হয়েছে!"); }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm"
                  title="কপি করুন"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2v2m-2-2v2"/></svg>
                </button>
              </div>

              <div className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap exam-content max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {aiResponse.text}
              </div>

              {aiResponse.sources && aiResponse.sources.length > 0 && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">তথ্যসূত্র ও সোর্স:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-all flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-40">
              <div className="text-6xl animate-bounce">💡</div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">যেকোনো গাণিতিক সমস্যা বা তাত্ত্বিক প্রশ্ন করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAsk;
