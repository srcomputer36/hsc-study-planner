
import React from 'react';
import { Subject } from '../types';

interface SubjectListProps {
  subjects: Subject[];
  onUpdateProgress: (id: string, progress: number) => void;
  onUpdateName: (id: string, name: string) => void;
}

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onUpdateProgress, onUpdateName }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <div 
          key={subject.id} 
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative"
        >
          <div className="flex justify-between items-center mb-4">
            <input 
              type="text" 
              value={subject.name}
              onChange={(e) => onUpdateName(subject.id, e.target.value)}
              className="bg-transparent font-black text-slate-800 dark:text-slate-100 outline-none border-b border-transparent focus:border-primary/30 w-full text-base"
            />
            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${subject.progress === 100 ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
              {subject.progress}%
            </div>
          </div>

          <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${subject.progress}%` }}
            ></div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {[0, 25, 50, 75, 100].map(val => (
              <button 
                key={val}
                onClick={() => onUpdateProgress(subject.id, val)}
                className={`text-[9px] px-2.5 py-1 rounded-full border transition-all ${
                  subject.progress === val 
                  ? 'bg-primary border-primary text-white font-bold' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
          
          {/* Subtle completion indicator */}
          {subject.progress === 100 && (
            <div className="absolute top-2 right-2 scale-125">✅</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SubjectList;
