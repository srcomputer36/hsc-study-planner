
import React, { useState, useEffect, useCallback } from 'react';
import { Subject, Profile as ProfileType } from './types';
import { INITIAL_SUBJECTS, INITIAL_PROFILE } from './constants';
import { getLatestBoardNews, StudyTipResponse } from './services/geminiService';
import { getLocalQuestions, generateMasterFileSync } from './services/questionService';
import { uploadMasterFile } from './services/googleDriveService';

// Component Imports
import Navbar from './components/Navbar';
import Countdown from './components/Countdown';
import SubjectList from './components/SubjectList';
import RoutinePlanner from './components/RoutinePlanner';
import AICard from './components/AICard';
import Settings from './components/Settings';
import BoardNews from './components/BoardNews';
import ExamSection from './components/ExamSection';
import QuickAsk from './components/QuickAsk';

const App: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('hsc_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [profile, setProfile] = useState<ProfileType>(() => {
    const saved = localStorage.getItem('hsc_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [routine, setRoutine] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('hsc_routine');
    return saved ? JSON.parse(saved) : {};
  });

  const [examDate, setExamDate] = useState<string>(() => {
    return localStorage.getItem('hsc_exam_date') || '2026-06-30';
  });

  const [lastCheck, setLastCheck] = useState<string>(() => {
    return localStorage.getItem('hsc_last_check') || '';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hsc_theme');
    return saved === 'dark';
  });

  const [activeTab, setActiveTab] = useState<'routine' | 'subjects' | 'exam' | 'settings' | 'news' | 'ask'>('subjects');
  const [aiResponse, setAiResponse] = useState<StudyTipResponse>({ text: '', sources: [] });
  const [boardNews, setBoardNews] = useState<StudyTipResponse>({ text: 'বোর্ড নোটিশ খোঁজা হচ্ছে...', sources: [] });
  const [selectedAiSubject, setSelectedAiSubject] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [isDateSynced, setIsDateSynced] = useState(() => {
    return localStorage.getItem('hsc_is_synced') === 'true';
  });

  // Global Auto-Sync to Google Drive
  const triggerGlobalSync = useCallback(async () => {
    const token = localStorage.getItem('hsc_drive_token');
    const fileId = localStorage.getItem('hsc_drive_file_id');
    if (token) {
      try {
        const content = generateMasterFileSync();
        await uploadMasterFile(token, content, fileId || undefined);
        console.log("Global Auto-Sync Successful");
      } catch (e) {
        console.error("Global Auto-Sync Failed", e);
      }
    }
  }, []);

  useEffect(() => {
    if (subjects.length > 0 && !selectedAiSubject) {
      setSelectedAiSubject(subjects[0].name);
    }
  }, [subjects]);

  useEffect(() => {
    const lastCheckTs = localStorage.getItem('hsc_last_check_ts');
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    if (!lastCheckTs || now - parseInt(lastCheckTs) > sixHours) {
      handleFetchNews();
    } else {
      const cachedNews = localStorage.getItem('hsc_cached_news');
      if (cachedNews) setBoardNews(JSON.parse(cachedNews));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hsc_subjects', JSON.stringify(subjects));
    localStorage.setItem('hsc_profile', JSON.stringify(profile));
    localStorage.setItem('hsc_routine', JSON.stringify(routine));
    localStorage.setItem('hsc_exam_date', examDate);
    localStorage.setItem('hsc_last_check', lastCheck);
    localStorage.setItem('hsc_is_synced', isDateSynced ? 'true' : 'false');
    localStorage.setItem('hsc_theme', isDarkMode ? 'dark' : 'light');

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Trigger Cloud Sync after 2 seconds of inactivity
    const timer = setTimeout(() => triggerGlobalSync(), 2000);
    return () => clearTimeout(timer);
  }, [subjects, profile, routine, examDate, isDarkMode, lastCheck, isDateSynced, triggerGlobalSync]);

  const updateProgress = (id: string, progress: number) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, progress } : s));
  };

  const updateSubjectName = (id: string, name: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateRoutine = (time: string, subjectId: string) => {
    setRoutine(prev => ({ ...prev, [time]: subjectId }));
  };

  const handleFetchTips = () => {
    if (!selectedAiSubject) return;
    setLoadingAi(true);
    
    setTimeout(() => {
      const localData = getLocalQuestions(selectedAiSubject, 20);
      let formattedText = `### ${selectedAiSubject} বোর্ড সাজেশন ২০২৬\n\n`;
      
      formattedText += `#### গুরুত্বপূর্ণ MCQ সমূহ:\n`;
      localData.mcqs.forEach((q, i) => {
        formattedText += `${i+1}. ${q.question} (উত্তর: ${q.answer})\n`;
      });
      
      formattedText += `\n#### গুরুত্বপূর্ণ সৃজনশীল (ক/খ):\n`;
      localData.cqs.forEach((q, i) => {
        formattedText += `${i+1}. ${q.question}\n   সংকেত: ${q.answer}\n`;
      });

      setAiResponse({ 
        text: formattedText, 
        sources: [{ title: "HSC 14,000+ Question Database", uri: "#" }] 
      });
      setLoadingAi(false);
    }, 600);
  };

  const handleFetchNews = async () => {
    setLoadingNews(true);
    const result = await getLatestBoardNews();
    setBoardNews(result);
    setLoadingNews(false);
    
    const nowTs = Date.now();
    const nowStr = new Date().toLocaleString('bn-BD');
    
    setLastCheck(nowStr);
    localStorage.setItem('hsc_last_check_ts', nowTs.toString());
    localStorage.setItem('hsc_cached_news', JSON.stringify(result));

    if (result.detectedDate) {
      if (result.detectedDate !== examDate) {
        setExamDate(result.detectedDate);
      }
      setIsDateSynced(true);
    }
  };

  const navItems = [
    { id: 'subjects', label: 'অগ্রগতি', icon: '📊' },
    { id: 'routine', label: 'রুটিন', icon: '📅' },
    { id: 'exam', label: 'পরীক্ষা', icon: '📝' },
    { id: 'ask', label: 'সলভার', icon: '💡' },
    { id: 'news', label: 'নিউজ', icon: '🔔' },
    { id: 'settings', label: 'সেটিংস', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 transition-colors duration-500">
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        collegeName={profile.college}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        {activeTab !== 'settings' && activeTab !== 'exam' && activeTab !== 'ask' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-5">
              <Countdown 
                targetDate={examDate} 
                onDateChange={(d) => { setExamDate(d); setIsDateSynced(false); }} 
                isSynced={isDateSynced}
                lastCheck={lastCheck}
              />
            </div>
            <div className="lg:col-span-7">
              <AICard 
                response={aiResponse} 
                onFetch={handleFetchTips} 
                loading={loadingAi} 
                subjects={subjects.map(s => s.name)}
                selectedSubject={selectedAiSubject}
                onSubjectChange={setSelectedAiSubject}
              />
            </div>
          </div>
        )}

        <div className="transition-all duration-500 transform animate-in fade-in slide-in-from-bottom-4">
          {activeTab === 'settings' && (
            <Settings 
              profile={profile} 
              subjects={subjects} 
              onUpdateProfile={setProfile}
              isDarkMode={isDarkMode}
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          )}
          {activeTab === 'exam' && <ExamSection subjects={subjects} />}
          {activeTab === 'ask' && <QuickAsk subjects={subjects} />}
          {activeTab === 'subjects' && <SubjectList subjects={subjects} onUpdateProgress={updateProgress} onUpdateName={updateSubjectName} />}
          {activeTab === 'routine' && <RoutinePlanner routine={routine} subjects={subjects} onUpdateRoutine={updateRoutine} />}
          {activeTab === 'news' && <BoardNews news={boardNews} loading={loadingNews} onRefresh={handleFetchNews} lastSynced={lastCheck} />}
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl z-[100] p-2 flex items-center justify-around ring-1 ring-black/5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-2xl transition-all duration-500 ${
              activeTab === item.id 
              ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/40 -translate-y-1' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="mt-12 mb-8 text-center text-slate-400 text-[10px] uppercase tracking-widest font-black opacity-50">
        ১৪,০০০+ বোর্ড প্রশ্ন লোড করা হয়েছে • এআই পাওয়ারড ডাইনামিক জেনারেটর
      </footer>
    </div>
  );
};

export default App;
