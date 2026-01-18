
import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
  onDateChange: (date: string) => void;
  isSynced?: boolean;
  lastCheck?: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onDateChange, isSynced, lastCheck }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setIsOver(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60)
        });
      } else {
        setIsOver(true);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full flex flex-col justify-center border border-white/10 ring-1 ring-white/5">
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOver ? 'bg-slate-500' : 'bg-red-500 animate-pulse'} shadow-[0_0_15px_rgba(239,68,68,0.6)]`}></div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">HSC ২০২৬ লাইভ কাউন্টডাউন</h2>
            </div>
            <div className="flex flex-col gap-1">
              {isSynced && (
                <span className="text-[9px] bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full border border-green-500/30 font-black uppercase tracking-widest flex items-center gap-1.5 w-fit shadow-lg shadow-green-500/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  বোর্ড রুটিনের সাথে সিঙ্ক করা
                </span>
              )}
              {lastCheck && (
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">সর্বশেষ চেক: {lastCheck}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <input 
              type="date" 
              value={targetDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-[10px] bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none text-indigo-200 font-bold cursor-pointer hover:bg-white/10 transition-all focus:ring-2 ring-indigo-500/50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'দিন', value: timeLeft.days },
            { label: 'ঘণ্টা', value: timeLeft.hours },
            { label: 'মিনিট', value: timeLeft.mins },
            { label: 'সেকেন্ড', value: timeLeft.secs }
          ].map((unit, i) => (
            <div key={i} className="group flex flex-col items-center bg-black/40 backdrop-blur-xl rounded-2xl py-5 sm:py-7 border border-white/5 shadow-inner transition-all hover:border-primary/30">
              <div className="text-3xl sm:text-5xl font-black text-white mb-1 tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">টার্গেট ডেট:</div>
            <div className="px-4 py-1.5 bg-white/5 rounded-xl text-xs font-black text-indigo-200 border border-white/10 shadow-lg">
              {new Date(targetDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="flex-1 w-full sm:w-32 h-2 bg-black/50 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-[pulse-slow_infinite] transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: isOver ? '100%' : '75%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
