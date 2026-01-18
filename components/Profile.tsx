
import React from 'react';
import { Profile as ProfileType, Subject } from '../types';

interface ProfileProps {
  profile: ProfileType;
  subjects: Subject[];
  onUpdateProfile: (profile: ProfileType) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, subjects, onUpdateProfile }) => {
  const avgProgress = Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdateProfile({ ...profile, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Profile Image Placeholder */}
        <div className="relative group">
          <div className="w-32 h-32 bg-gradient-to-tr from-primary to-secondary rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-lg transform group-hover:rotate-3 transition-transform">
            {profile.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 p-2 rounded-xl shadow-md border border-slate-100 dark:border-slate-600">
            🎓
          </div>
        </div>

        <div className="flex-1 space-y-4 w-full text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 ml-1">নাম</label>
              <input 
                type="text" 
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 ml-1">কলেজ</label>
              <input 
                type="text" 
                name="college"
                value={profile.college}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 ml-1">সেশন</label>
              <input 
                type="text" 
                name="session"
                value={profile.session}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 ml-1">নিজের সম্পর্কে কিছু কথা</label>
            <textarea 
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary/20 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
          <div className="text-4xl font-black text-primary mb-1">{avgProgress}%</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">মোট অগ্রগতি</div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-4">
            <div className="h-full bg-primary rounded-full" style={{ width: `${avgProgress}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
          <div className="text-4xl font-black text-secondary mb-1">১৪</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">নির্ধারিত বিষয়</div>
          <div className="mt-4 flex gap-1">
             <div className="w-2 h-2 rounded-full bg-secondary"></div>
             <div className="w-2 h-2 rounded-full bg-secondary/50"></div>
             <div className="w-2 h-2 rounded-full bg-secondary/20"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
          <div className="text-4xl font-black text-orange-500 mb-1">A+</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">লক্ষ্য</div>
          <div className="mt-3 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-[10px] font-bold">
            স্মার্ট প্রিপারেশন
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
