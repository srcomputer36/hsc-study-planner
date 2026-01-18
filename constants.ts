
import { Subject, Profile } from './types';

export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
];

export const INITIAL_PROFILE: Profile = {
  name: 'শিক্ষার্থীর নাম',
  college: 'কলেজের নাম',
  session: '২০২৪-২৫',
  bio: 'আমি আমার সেরাটা দিতে প্রস্তুত!',
  targetGoal: 'A+',
  photoUrl: ''
};

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'বাংলা ১ম পত্র', progress: 0 },
  { id: '2', name: 'বাংলা ২য় পত্র', progress: 0 },
  { id: '3', name: 'ইংরেজি ১ম পত্র', progress: 0 },
  { id: '4', name: 'ইংরেজি ২য় পত্র', progress: 0 },
  { id: '5', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', progress: 0 },
  { id: '6', name: 'পদার্থবিজ্ঞান ১ম পত্র', progress: 0 },
  { id: '7', name: 'পদার্থবিজ্ঞান ২য় পত্র', progress: 0 },
  { id: '8', name: 'রসায়ন ১ম পত্র', progress: 0 },
  { id: '9', name: 'রসায়ন ২য় পত্র', progress: 0 },
  { id: '10', name: 'উচ্চতর গণিত ১ম পত্র', progress: 0 },
  { id: '11', name: 'উচ্চতর গণিত ২য় পত্র', progress: 0 },
  { id: '12', name: 'জীববিজ্ঞান ১ম পত্র', progress: 0 },
  { id: '13', name: 'জীববিজ্ঞান ২য় পত্র', progress: 0 },
  { id: '14', name: 'পৌরনীতি ও সুশাসন', progress: 0 },
  { id: '15', name: 'অর্থনীতি ১ম পত্র', progress: 0 },
  { id: '16', name: 'অর্থনীতি ২য় পত্র', progress: 0 },
  { id: '17', name: 'যুক্তবিদ্যা ১ম পত্র', progress: 0 },
  { id: '18', name: 'যুক্তবিদ্যা ২য় পত্র', progress: 0 },
  { id: '19', name: 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম', progress: 0 },
  { id: '20', name: 'ইসলামের ইতিহাস ও সংস্কৃতি ২য়', progress: 0 },
];
