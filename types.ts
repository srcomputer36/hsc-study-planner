
export interface QuestionPair {
  question: string;
  answer: string;
}

export interface Subject {
  id: string;
  name: string;
  progress: number; // 0 to 100
}

export interface Profile {
  name: string;
  college: string;
  session: string;
  bio: string;
  targetGoal: string;
  photoUrl?: string;
}

export interface ExamQuestionBank {
  subjectId: string;
  subjectName: string;
  mcqs: QuestionPair[];
  cqs: QuestionPair[];
  lastUpdated: number; // Timestamp
}

export interface AppData {
  subjects: Subject[];
  profile: Profile;
  routine: Record<string, string>;
  examDate: string;
  isDarkMode: boolean;
}

export enum PomodoroStatus {
  IDLE = 'IDLE',
  STUDYING = 'STUDYING',
  BREAK = 'BREAK'
}
