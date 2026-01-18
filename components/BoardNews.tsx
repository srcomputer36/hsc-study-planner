
import React from 'react';
import { StudyTipResponse } from '../services/geminiService';

interface BoardNewsProps {
  news: StudyTipResponse;
  loading: boolean;
  onRefresh: () => void;
  lastSynced?: string;
}

const BoardNews: React.FC<BoardNewsProps> = ({ news, loading, onRefresh, lastSynced }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 p-6 flex justify-between items-center text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight leading-none mb-1">সিলেট বোর্ড নোটিশ টার্মিনাল</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Live Official Data Sync</p>
            </div>
          </div>
          
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-all border border-white/20 active:scale-95 disabled:opacity-50 group"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {loading ? (
            <div className="space-y-6 py-10">
              <div className="flex items-center gap-4 justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">সার্ভার অনুসন্ধান করা হচ্ছে...</span>
              </div>
              <div className="max-w-md mx-auto space-y-3">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6 mx-auto animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Main News Content */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-transparent rounded-full"></div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner group-hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Breaking News</span>
                    <span className="text-[10px] text-slate-400 font-bold">{lastSynced}</span>
                  </div>
                  <div className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap exam-content">
                    {news.text}
                  </div>
                </div>
              </div>

              {/* Detected Date Alert */}
              {news.detectedDate && (
                <div className="flex items-center gap-4 p-5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl animate-in zoom-in duration-500">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg text-xl">📅</div>
                  <div>
                    <h4 className="text-sm font-black text-green-700 dark:text-green-400">পরীক্ষার সম্ভাব্য তারিখ ডিটেক্ট করা হয়েছে!</h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{news.detectedDate} - তারিখটি আপনার কাউন্টডাউনে অটো-সিঙ্ক হয়েছে।</p>
                  </div>
                </div>
              )}

              {/* Sources Section */}
              {news.sources.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                    অফিসিয়াল সোর্স ও লিংক
                    <span className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {news.sources.map((source, i) => (
                      <a 
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm"
                      >
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 group-hover/link:bg-red-100 dark:group-hover/link:bg-red-900/50 group-hover/link:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.242m-4.242 4.242l1.272-1.272m2.828-2.828l1.272-1.272m4.95 4.95l1.272-1.272"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate group-hover/link:text-red-600 transition-colors">{source.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Click to visit site</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="text-3xl">🛡️</div>
                  <div>
                    <h5 className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-1">নিরাপদ তথ্য ব্যবহার করুন</h5>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                      এই নিউজটি সরাসরি এআই-এর মাধ্যমে সিলেট বোর্ড ও সরকারি নিউজ পোর্টাল থেকে সংগৃহীত। পরীক্ষার চূড়ান্ত সিদ্ধান্তের জন্য সর্বদা অফিসিয়াল ওয়েবসাইট চেক করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mini Footer Info */}
      <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-50">
        SYLHET BOARD • HSC ADVISOR • AI POWERED
      </p>
    </div>
  );
};

export default BoardNews;
