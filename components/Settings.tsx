
import React, { useRef, useState, useEffect } from 'react';
import { Profile, Subject, QuestionPair } from '../types';
import { 
  getUserCustomQuestions, 
  saveBulkUserQuestions, 
  saveUserQuestion,
  generateMasterFileSync, 
  restoreFromMasterFile,
  downloadBackupFile,
  getDatabaseStats
} from '../services/questionService';
import { generateAiQuestions } from '../services/geminiService';
import { 
  authenticateGoogleDrive, 
  findMasterFile, 
  uploadMasterFile, 
  downloadMasterFile,
  getStoredClientId 
} from '../services/googleDriveService';

interface SettingsProps {
  profile: Profile;
  subjects: Subject[];
  onUpdateProfile: (profile: Profile) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, subjects, onUpdateProfile, isDarkMode, toggleTheme }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'dev_hub' | 'storage' | 'about'>('profile');
  const [clientId, setClientId] = useState(getStoredClientId());
  const [driveToken, setDriveToken] = useState<string | null>(localStorage.getItem('hsc_drive_token'));
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [genLoading, setGenLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || '');
  const [stats, setStats] = useState({ total: 0, user: 0 });
  const [quotaAlert, setQuotaAlert] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshStats();
  }, [selectedSubject]);

  const refreshStats = () => {
    const s = getDatabaseStats(selectedSubject);
    setStats({ total: s.total, user: s.user });
  };

  const handleAiGen = async () => {
    if (!selectedSubject) return;
    setGenLoading(true);
    setQuotaAlert(null);
    try {
      const res = await generateAiQuestions(selectedSubject);
      saveBulkUserQuestions(selectedSubject, res.mcqs, res.cqs);
      refreshStats();
      alert(`✨ সফল! ${selectedSubject} এর জন্য নতুন প্রশ্ন ডাটাবেজে যোগ হয়েছে।`);
    } catch (err: any) {
      setQuotaAlert(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleSaveClientId = () => {
    localStorage.setItem('hsc_google_client_id', clientId);
    alert("✅ Client ID সেভ হয়েছে। এখন ক্লাউড সিঙ্ক বাটন ব্যবহার করুন।");
  };

  const handleCopyId = () => {
    if (!clientId) {
      alert("⚠️ কপি করার জন্য কোনো আইডি পাওয়া যায়নি। আগে আইডি লিখে সেভ করুন।");
      return;
    }
    navigator.clipboard.writeText(clientId);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleConnectDrive = async () => {
    setSyncing(true);
    setError(null);
    try {
      const token = await authenticateGoogleDrive();
      localStorage.setItem('hsc_drive_token', token);
      setDriveToken(token);

      const fileId = await findMasterFile(token);
      if (fileId) {
        localStorage.setItem('hsc_drive_file_id', fileId);
        const content = await downloadMasterFile(token, fileId);
        if (restoreFromMasterFile(content)) {
          alert("✅ ক্লাউড থেকে ডাটা সফলভাবে রিস্টোর হয়েছে! অ্যাপ রিলোড হচ্ছে...");
          window.location.reload();
        }
      } else {
        const content = generateMasterFileSync();
        const newFileId = await uploadMasterFile(token, content);
        localStorage.setItem('hsc_drive_file_id', newFileId);
        alert("✅ প্রথমবার ক্লাউড ব্যাকআপ সফলভাবে তৈরি হয়েছে!");
      }
    } catch (err: any) {
      setError(err.message);
      alert(`❌ সিঙ্ক ব্যর্থ হয়েছে: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">সিস্টেম কনফিগারেশন</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">অ্যাডভান্সড কন্ট্রোল ও ডাটাবেজ ম্যানেজমেন্ট</p>
      </div>

      <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-3xl border border-slate-200 dark:border-slate-800 w-full sm:w-fit mx-auto shadow-xl ring-1 ring-black/5 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveSubTab('profile')} className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'profile' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>👤 প্রোফাইল</button>
        <button onClick={() => setActiveSubTab('dev_hub')} className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'dev_hub' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>⚡ এআই ল্যাব</button>
        <button onClick={() => setActiveSubTab('storage')} className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'storage' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>💾 ক্লাউড সিঙ্ক</button>
        <button onClick={() => setActiveSubTab('about')} className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'about' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>👨‍💻 ডেভেলপার</button>
      </div>

      {activeSubTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-8 animate-in slide-in-from-bottom-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
             <span className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg">👤</span>
             ব্যক্তিগত প্রোফাইল
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">আপনার নাম</label>
              <input type="text" value={profile.name} onChange={(e) => onUpdateProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">কলেজের নাম</label>
              <input type="text" value={profile.college} onChange={(e) => onUpdateProfile({...profile, college: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-primary transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
             <div>
               <h4 className="font-black text-slate-800 dark:text-white">ডার্ক মুড থিম</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">আপনার চোখের আরামের জন্য</p>
             </div>
             <button onClick={toggleTheme} className={`w-16 h-8 rounded-full p-1 transition-all ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`}>
               <div className={`w-6 h-6 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-8' : 'translate-x-0 shadow-sm'}`}></div>
             </button>
          </div>
        </div>
      )}

      {activeSubTab === 'dev_hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">এআই প্রশ্ন জেনারেটর</h3>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mt-1">Gemini AI দ্বারা পরিচালিত</p>
               </div>
               <div className="space-y-4">
                 <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-black outline-none appearance-none">
                   {subjects.map(s => <option key={s.id} value={s.name} className="text-slate-900">{s.name}</option>)}
                 </select>
                 <button onClick={handleAiGen} disabled={genLoading} className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                    {genLoading ? 'জেনারেটিং...' : '✨ ডাইনামিক প্রশ্ন তৈরি'}
                 </button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="text-2xl font-black">{stats.total}</div>
                    <div className="text-[8px] font-black uppercase opacity-60 tracking-widest">মোট ডাটাবেজ</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="text-2xl font-black">{stats.user}</div>
                    <div className="text-[8px] font-black uppercase opacity-60 tracking-widest">এআই জেনারেটেড</div>
                  </div>
               </div>
            </div>
            {quotaAlert && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                <p className="text-xs font-bold text-red-500 leading-relaxed">⚠️ {quotaAlert}</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">⚡</div>
             <h3 className="text-xl font-black text-slate-800 dark:text-white">অ্যাডভান্সড এআই কন্ট্রোল</h3>
             <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-sm">আপনার লোকাল ডাটাবেজে যদি নতুন প্রশ্ন যোগ করতে চান, তবে এআই জেনারেটর ব্যবহার করুন। এটি সরাসরি গুগল জেমিনি এপিআই ব্যবহার করে বোর্ড স্ট্যান্ডার্ড প্রশ্ন তৈরি করে।</p>
          </div>
        </div>
      )}
      
      {activeSubTab === 'storage' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-28 h-28 bg-indigo-500/10 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner ring-1 ring-indigo-500/20">☁️</div>
                <div className="flex-1 text-center md:text-left space-y-3">
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white">গুগল ড্রাইভ ক্লাউড সিঙ্ক</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">একাধিক ডিভাইসে একই ডাটা ব্যবহার করতে আপনার Google Client ID সেটআপ করুন।</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 px-2">
                   <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Client ID</label>
                      <a href="https://console.cloud.google.com/" target="_blank" className="text-[9px] font-black text-indigo-500 hover:underline uppercase tracking-tighter">GCP কনসোল ↗</a>
                   </div>
                   {clientId && (
                      <button 
                         onClick={handleCopyId}
                         className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-all shadow-sm"
                      >
                         {copying ? 'কপি হয়েছে! ✅' : 'কুইক কপি 📋'}
                      </button>
                   )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                   <div className="md:col-span-8">
                      <input 
                         type="password" 
                         value={clientId} 
                         onChange={(e) => setClientId(e.target.value)} 
                         placeholder="আপনার GCP Client ID এখানে পেস্ট করুন..." 
                         className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 ring-primary/10 transition-all shadow-inner" 
                      />
                   </div>
                   <div className="md:col-span-4 flex gap-3">
                      <button onClick={handleSaveClientId} className="flex-1 py-4 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95">সেভ আইডি</button>
                      <button onClick={handleConnectDrive} disabled={syncing} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">{syncing ? 'সিঙ্ক হচ্ছে...' : 'কানেক্ট ও সিঙ্ক'}</button>
                </div>
             </div>
          </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
             <div className="w-28 h-28 bg-green-500/10 text-green-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner ring-1 ring-green-500/20">📥</div>
             <div className="flex-1 text-center md:text-left space-y-3">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">ম্যানুয়াল লোকাল ব্যাকআপ</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">ক্লাউড ব্যবহার করতে না চাইলে সরাসরি ডাটা ফাইল ডাউনলোড করে রাখুন।</p>
                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                   <button onClick={downloadBackupFile} className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">📥 ডাউনলোড ব্যাকআপ</button>
                   <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all">📤 ফাইল রিস্টোর</button>
                   <input type="file" ref={fileInputRef} onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (!file) return;
                     const reader = new FileReader();
                     reader.onload = (event) => {
                       if (restoreFromMasterFile(event.target?.result as string)) {
                         alert("✅ রিস্টোর সফল! অ্যাপ রিলোড হচ্ছে...");
                         window.location.reload();
                       }
                     };
                     reader.readAsText(file);
                   }} accept=".json" className="hidden" />
                </div>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'about' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700">
           <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 group">
              <div className="h-32 bg-gradient-to-r from-primary via-indigo-600 to-secondary relative">
                 <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl">
                    <div className="w-28 h-28 bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:scale-105 duration-500">
                       👨‍💻
                    </div>
                 </div>
              </div>
              <div className="pt-20 pb-12 px-10 text-center space-y-6">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Iftiar Hasan Fazayel</h3>
                    <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mt-1">Lead Developer & HSC Companion</p>
                 </div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                    "এইচএসসি পরীক্ষার্থীদের পড়াশোনা সহজ করতে আমি এই এআই-পাওয়ারড প্ল্যাটফর্মটি তৈরি করেছি। আমার লক্ষ্য হলো প্রতিটি শিক্ষার্থীর জন্য একটি পার্সোনালাইজড স্টাডি অ্যাসিস্ট্যান্ট নিশ্চিত করা।"
                 </p>
                 <div className="flex justify-center gap-4">
                    <button className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </button>
                    <button className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    </button>
                 </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="text-xl">🎓</div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Build Version</p>
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-200">v1.2.5 (Stable)</p>
                    </div>
                 </div>
                 <div className="text-xs font-black text-primary bg-primary/10 px-4 py-2 rounded-xl">HSC 2026 Companion</div>
              </div>
           </div>
           <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-50">MADE WITH ❤️ IN BANGLADESH</p>
        </div>
      )}
    </div>
  );
};

export default Settings;
