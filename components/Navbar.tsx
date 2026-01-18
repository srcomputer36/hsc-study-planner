
import React from 'react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  collegeName: string;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme, collegeName }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
          H
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-tight truncate max-w-[200px] sm:max-w-[400px]">
            {collegeName || 'কলেজের নাম'}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">HSC Study Planner</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>
          ) : (
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
