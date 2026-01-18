
import React, { useState, useEffect, useRef } from 'react';
import { PomodoroStatus } from '../types';

const Pomodoro: React.FC = () => {
  const [status, setStatus] = useState<PomodoroStatus>(PomodoroStatus.IDLE);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins
  // Browser based interval typing
  const timerRef = useRef<number | null>(null);

  const startStudy = () => {
    setStatus(PomodoroStatus.STUDYING);
    setTimeLeft(20 * 60);
  };

  const startBreak = () => {
    setStatus(PomodoroStatus.BREAK);
    setTimeLeft(5 * 60);
  };

  const reset = () => {
    setStatus(PomodoroStatus.IDLE);
    setTimeLeft(20 * 60);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (status !== PomodoroStatus.IDLE && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (status === PomodoroStatus.STUDYING) {
        alert("পড়ার ২০ মিনিট শেষ! ৫ মিনিটের বিরতি নাও।");
        startBreak();
      } else if (status === PomodoroStatus.BREAK) {
        alert("বিরতি শেষ! আবার পড়া শুরু করো।");
        startStudy();
      }
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [status, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
      <div className={`mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
        status === PomodoroStatus.STUDYING ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
        status === PomodoroStatus.BREAK ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
        'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
      }`}>
        {status === PomodoroStatus.STUDYING ? 'পড়ার সময় 📖' : status === PomodoroStatus.BREAK ? 'বিরতির সময় ☕' : 'রেডি? 🚀'}
      </div>

      <div className="text-8xl font-black text-slate-800 dark:text-white tabular-nums mb-10">
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-4">
        {status === PomodoroStatus.IDLE ? (
          <button 
            onClick={startStudy}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            পড়া শুরু করো
          </button>
        ) : (
          <>
            <button 
              onClick={reset}
              className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              বন্ধ করো
            </button>
          </>
        )}
      </div>

      <p className="mt-8 text-sm text-slate-400 text-center max-w-xs leading-relaxed">
        আমরা সাজেস্ট করি ২০ মিনিট পড়া এবং ৫ মিনিট বিরতি। এই পদ্ধতিতে মনোযোগ সবচেয়ে বেশি থাকে।
      </p>
    </div>
  );
};

export default Pomodoro;
