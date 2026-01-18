
import React, { useMemo } from 'react';
import { Subject } from '../types';
import { TIME_SLOTS } from '../constants';

interface RoutinePlannerProps {
  routine: Record<string, string>;
  subjects: Subject[];
  onUpdateRoutine: (time: string, subjectId: string) => void;
}

const RoutinePlanner: React.FC<RoutinePlannerProps> = ({ routine, subjects, onUpdateRoutine }) => {
  const currentHour = new Date().getHours();
  
  // ক্যালকুলেট স্টাডি প্রগ্রেস ফর টুডে
  const dailyProgress = useMemo(() => {
    const totalSlots = TIME_SLOTS.length;
    const filledSlots = Object.values(routine).filter(val => val && val !== 'break').length;
    return Math.round((filledSlots / totalSlots) * 100);
  }, [routine]);

  const getTimeCategory = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 9) return { label: 'ভোর ও সকাল', icon: '🌅', color: 'text-orange-500', bg: 'bg-orange-50' };
    if (hour >= 9 && hour < 14) return { label: 'দুপুর', icon: '☀️', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (hour >= 14 && hour < 18) return { label: 'বিকাল', icon: '🌇', color: 'text-indigo-500', bg: 'bg-indigo-50' };
    return { label: 'রাত', icon: '🌙', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  const getSlotStyle = (val: string) => {
    if (val === 'break') return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30';
    if (val === 'revision') return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/20 dark:border-green-900/30';
    if (val === 'exam') return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:border-red-900/30';
    if (val) return 'bg-primary/5 text-primary border-primary/20 dark:bg-primary/10 dark:border-primary/30';
    return 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">আপনার স্টাডি শিডিউল</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              আজ: {new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-primary">{dailyProgress}%</div>
              <p className="text-[10px] font-black uppercase text-slate-400">ব্যস্ততা</p>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
            <div className="w-32 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" style={{ width: `${dailyProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TIME_SLOTS.map((time) => {
          const category = getTimeCategory(time);
          const isCurrent = parseInt(time.split(':')[0]) === currentHour;
          const selectedValue = routine[time] || '';
          
          return (
            <div 
              key={time} 
              className={`group relative p-6 rounded-[2rem] border transition-all duration-500 ${isCurrent ? 'ring-4 ring-primary/10 border-primary bg-white dark:bg-slate-900 shadow-2xl scale-105 z-20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className={`text-xl font-black ${isCurrent ? 'text-primary' : 'text-slate-800 dark:text-white'} tabular-nums`}>{time}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${category.color} flex items-center gap-1`}>
                    {category.icon} {category.label}
                  </span>
                </div>
                {isCurrent && (
                  <span className="bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/30 animate-pulse">Now Active</span>
                )}
              </div>

              <div className="relative">
                <select 
                  value={selectedValue}
                  onChange={(e) => onUpdateRoutine(time, e.target.value)}
                  className={`w-full appearance-none px-5 py-4 text-xs font-black rounded-2xl border-2 transition-all outline-none cursor-pointer ${getSlotStyle(selectedValue)}`}
                >
                  <option value="" className="dark:bg-slate-900 text-slate-400">বিষয় নির্বাচন করুন...</option>
                  <optgroup label="HSC বিষয়সমূহ" className="dark:bg-slate-900">
                    {subjects.map(s => (
                      <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="অন্যান্য" className="dark:bg-slate-900">
                    <option value="break" className="dark:bg-slate-900">☕ বিশ্রাম ও নাস্তা</option>
                    <option value="revision" className="dark:bg-slate-900">🔄 রিভিশন সেশন</option>
                    <option value="exam" className="dark:bg-slate-900">📝 পরীক্ষা প্র্যাকটিস</option>
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>

              {selectedValue && selectedValue !== 'break' && (
                <div className="mt-4 flex gap-2">
                  <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md uppercase">বই পড়া</span>
                  <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md uppercase">নোট করা</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-600/5 dark:bg-indigo-600/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 text-center space-y-3">
        <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">প্রো টিপস</h4>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
          বিগত ১০ বছরের বোর্ড প্রশ্ন অ্যানালাইসিস করে দেখা গেছে, যারা প্রতিদিন অন্তত ২ ঘণ্টা রিভিশনের জন্য রাখেন, তাদের রেজাল্ট অন্যদের তুলনায় ১৫% বেশি ভালো হয়। রুটিনে অন্তত একটি <b>রিভিশন সেশন</b> রাখুন!
        </p>
      </div>
    </div>
  );
};

export default RoutinePlanner;
