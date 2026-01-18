
import React, { useState, useEffect, useMemo } from 'react';
import { Subject, ExamQuestionBank, QuestionPair } from '../types';
import { gradeExamSubmission, GradingResult } from '../services/geminiService';
import { getLocalQuestions, getDatabaseStats } from '../services/questionService';

interface ExamSectionProps {
  subjects: Subject[];
}

const ExamSection: React.FC<ExamSectionProps> = ({ subjects }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [examData, setExamData] = useState<Record<string, ExamQuestionBank>>(() => {
    const saved = localStorage.getItem('hsc_exam_bank');
    return saved ? JSON.parse(saved) : {};
  });
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('hsc_user_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mcq' | 'cq'>('mcq');
  const [scoreResult, setScoreResult] = useState<GradingResult | null>(null);
  const [localResult, setLocalResult] = useState<{ score: number, total: number, type: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, remaining: 0, user: 0 });

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const currentBank = selectedSubjectId ? examData[selectedSubjectId] : null;

  const refreshStats = () => {
    if (currentSubject) {
      setStats(getDatabaseStats(currentSubject.name));
    }
  };

  useEffect(() => {
    refreshStats();
  }, [selectedSubjectId]);

  const activeQuestions = useMemo(() => {
    if (!currentBank) return [];
    return viewMode === 'mcq' ? currentBank.mcqs : currentBank.cqs;
  }, [currentBank, viewMode]);

  const handleGenerate = () => {
    if (!currentSubject) return;
    setLoading(true);
    setError(null);
    setLocalResult(null);
    setScoreResult(null);
    
    setTimeout(() => {
      try {
        const result = getLocalQuestions(currentSubject.name, 20); 
        setExamData(prev => ({
          ...prev,
          [currentSubject.id]: {
            subjectId: currentSubject.id,
            subjectName: currentSubject.name,
            mcqs: result.mcqs,
            cqs: result.cqs,
            lastUpdated: Date.now()
          }
        }));
        setRevealedAnswers({});
        setUserAnswers({});
        refreshStats();
      } catch (err) {
        setError("প্রশ্নপত্র লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleUserAnswerChange = (qIndex: number, val: string) => {
    setUserAnswers(prev => ({ ...prev, [`${selectedSubjectId}_${viewMode}_${qIndex}`]: val }));
  };

  const toggleAnswer = (qIndex: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qIndex]: !prev[qIndex] }));
  };

  const handleLocalGrade = () => {
    if (viewMode === 'mcq') {
      let score = 0;
      activeQuestions.forEach((q, idx) => {
        const uAns = (userAnswers[`${selectedSubjectId}_mcq_${idx}`] || "").trim().toLowerCase();
        const cAns = q.answer.trim().toLowerCase();
        if (uAns && (cAns.includes(uAns) || uAns.includes(cAns))) score++;
      });
      setLocalResult({ score, total: activeQuestions.length, type: 'MCQ' });
    } else {
      // CQ Local "Self-Marking" Logic
      setLocalResult({ score: 0, total: activeQuestions.length, type: 'CQ (Self-Review)' });
    }
    setRevealedAnswers(activeQuestions.reduce((acc, _, i) => ({...acc, [i]: true}), {}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGradeExamAi = async () => {
    if (activeQuestions.length === 0) return;
    setGrading(true);
    setError(null);
    try {
      const answers = activeQuestions.map((_, i) => userAnswers[`${selectedSubjectId}_${viewMode}_${i}`] || "");
      const result = await gradeExamSubmission(activeQuestions as QuestionPair[], answers);
      setScoreResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "গ্রেডিং এ সমস্যা হয়েছে। লোকাল গ্রেডিং ট্রাই করুন।");
    } finally {
      setGrading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('hsc_exam_bank', JSON.stringify(examData));
    localStorage.setItem('hsc_user_answers', JSON.stringify(userAnswers));
  }, [examData, userAnswers]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {(scoreResult || localResult) && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-500">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.4rem] space-y-6 text-center">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">ফলাফল ও মূল্যায়ন</h2>
            {localResult?.type === 'CQ (Self-Review)' ? (
               <div className="space-y-4">
                  <div className="text-4xl font-black text-indigo-500">Self Review Mode</div>
                  <p className="text-sm font-bold text-slate-500">আপনার উত্তরের সাথে মডেল উত্তরগুলো নিচে মিলিয়ে দেখুন।</p>
               </div>
            ) : (
              <div className="text-6xl font-black text-indigo-500 tabular-nums">
                {scoreResult ? `${scoreResult.totalScore}/${scoreResult.maxScore}` : `${localResult?.score}/${localResult?.total}`}
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl text-left">
              <p className="font-bold text-slate-600 dark:text-slate-300 italic text-center">
                {scoreResult ? `" ${scoreResult.remarks} "` : `আপনার ${localResult?.type} পারফরম্যান্স চেক করা হয়েছে। সঠিক উত্তরগুলো নিচে হাইলাইট করা হয়েছে।`}
              </p>
            </div>
            <button onClick={() => { setScoreResult(null); setLocalResult(null); }} className="px-10 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black shadow-xl">চালিয়ে যান</button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-red-500 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-lg ring-4 ring-indigo-500/10">📝</div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white text-xl">বোর্ড এক্সাম পোর্টাল</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100 dark:border-indigo-800/50">
                   Database: {stats.total} Questions
                </span>
                <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-green-100 dark:border-green-800/50">
                   Offline Ready
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-2">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">বিষয় নির্বাচন করুন</label>
             <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-4 ring-indigo-500/10 transition-all"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!currentBank ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl shadow-inner">📖</div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-800 dark:text-white">পরীক্ষা শুরু করতে রেডি?</h4>
            <p className="text-sm text-slate-500 font-bold max-w-md mx-auto">লোকাল ডাটাবেজের {stats.total}টি প্রশ্ন থেকে বোর্ড স্ট্যান্ডার্ড র‍্যান্ডম প্রশ্নপত্র তৈরি হবে।</p>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="px-14 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-3">
            {loading ? (
               <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : '✨ প্রশ্নপত্র তৈরি করুন'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 w-fit mx-auto shadow-lg ring-1 ring-black/5">
            <button onClick={() => setViewMode('mcq')} className={`px-12 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${viewMode === 'mcq' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}>MCQ</button>
            <button onClick={() => setViewMode('cq')} className={`px-12 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${viewMode === 'cq' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>CQ (Creative)</button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between px-4">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{viewMode === 'mcq' ? 'বহুনির্বাচনি প্রশ্ন' : 'সৃজনশীল প্রশ্ন'} তালিকা ({activeQuestions.length})</h4>
               <button onClick={handleGenerate} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">🔄 প্রশ্ন পরিবর্তন করুন</button>
            </div>

            {activeQuestions.map((q, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 group transition-all hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/30">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-black flex-shrink-0 shadow-sm">{idx + 1}</div>
                  <div className="space-y-1 pt-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{q.question}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Board Standard Analysis</p>
                  </div>
                </div>
                
                <textarea 
                  value={userAnswers[`${selectedSubjectId}_${viewMode}_${idx}`] || ''}
                  onChange={(e) => handleUserAnswerChange(idx, e.target.value)}
                  placeholder={viewMode === 'mcq' ? "আপনার উত্তর লিখুন (যেমন: ক/খ/গ/ঘ)..." : "উত্তরটি এখানে লিখুন (এআই মূল্যায়নের জন্য)..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  rows={viewMode === 'mcq' ? 1 : 4}
                />

                <div className="flex justify-end gap-3">
                  <button onClick={() => toggleAnswer(idx)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all">
                    {revealedAnswers[idx] ? 'উত্তর লুকান 🙈' : 'উত্তর দেখুন 👁️'}
                  </button>
                </div>

                {revealedAnswers[idx] && (
                  <div className="p-7 bg-green-50 dark:bg-green-950/20 rounded-[2rem] border border-green-100 dark:border-green-900/30 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       <p className="text-[10px] uppercase font-black text-green-600 dark:text-green-400 tracking-widest">মডেল উত্তর ও ব্যাখ্যা</p>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{q.answer}</p>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 mb-10">
              <button 
                onClick={handleLocalGrade} 
                className="px-12 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest border border-black/10"
              >
                {viewMode === 'mcq' ? '📊 লোকাল মূল্যায়ন (Offline)' : '✅ সেলফ রিভিউ (Offline)'}
              </button>
              
              <button 
                onClick={handleGradeExamAi} 
                disabled={grading} 
                className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-3"
              >
                {grading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    মূল্যায়ন চলছে...
                  </>
                ) : (
                  <>✨ এআই টিচার মূল্যায়ন (Online)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSection;
