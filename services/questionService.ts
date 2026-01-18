
import { LOCAL_QUESTION_BANK, DEFAULT_QUESTIONS } from '../data/questionBank';
import { ExamQuestionsResponse } from './geminiService';
import { QuestionPair } from '../types';

const CUSTOM_QUESTIONS_KEY = 'hsc_user_custom_questions';

export function getUserCustomQuestions(): Record<string, { mcqs: QuestionPair[], cqs: QuestionPair[] }> {
  const saved = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
  return saved ? JSON.parse(saved) : {};
}

/**
 * পুরো অ্যাপের ডাটা (Profile, Routine, Questions) একটি মাস্টার ফাইলে রূপান্তর করে।
 */
export function generateMasterFileSync(): string {
  const profile = localStorage.getItem('hsc_profile');
  const routine = localStorage.getItem('hsc_routine');
  const questions = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
  const subjects = localStorage.getItem('hsc_subjects');

  const masterData = {
    appName: "HSC Study Planner",
    version: "1.2.5",
    lastSync: new Date().toISOString(),
    payload: {
      profile: profile ? JSON.parse(profile) : null,
      routine: routine ? JSON.parse(routine) : null,
      questions: questions ? JSON.parse(questions) : {},
      subjects: subjects ? JSON.parse(subjects) : []
    }
  };

  return JSON.stringify(masterData, null, 2);
}

/**
 * ওয়ান-ক্লিক লোকাল ব্যাকআপ ডাউনলোড
 */
export function downloadBackupFile() {
  const content = generateMasterFileSync();
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HSC_Backup_${new Date().toLocaleDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * ড্রাইভ বা ফাইল থেকে পাওয়া মাস্টার ফাইলটি সিস্টেমে ইমপোর্ট করে।
 */
export function restoreFromMasterFile(jsonContent: string): boolean {
  try {
    const master = JSON.parse(jsonContent);
    const p = master.payload || master; // Handle both master format and direct payload
    
    if (p.profile) localStorage.setItem('hsc_profile', JSON.stringify(p.profile));
    if (p.routine) localStorage.setItem('hsc_routine', JSON.stringify(p.routine));
    if (p.questions) localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(p.questions));
    if (p.subjects) localStorage.setItem('hsc_subjects', JSON.stringify(p.subjects));
    return true;
  } catch (e) {
    console.error("Restore Failed:", e);
    return false;
  }
}

export function saveBulkUserQuestions(subjectName: string, mcqs: QuestionPair[], cqs: QuestionPair[]) {
  const name = subjectName.trim();
  const allCustom = getUserCustomQuestions();
  if (!allCustom[name]) allCustom[name] = { mcqs: [], cqs: [] };
  allCustom[name].mcqs = [...allCustom[name].mcqs, ...mcqs];
  allCustom[name].cqs = [...allCustom[name].cqs, ...cqs];
  localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(allCustom));
}

export function saveUserQuestion(subjectName: string, type: 'mcq' | 'cq', questionPair: QuestionPair) {
  const name = subjectName.trim();
  const allCustom = getUserCustomQuestions();
  if (!allCustom[name]) allCustom[name] = { mcqs: [], cqs: [] };
  if (type === 'mcq') allCustom[name].mcqs.push(questionPair);
  else allCustom[name].cqs.push(questionPair);
  localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(allCustom));
}

export function getLocalQuestions(subjectName: string, count: number = 25): ExamQuestionsResponse {
  const name = subjectName.trim();
  const bank = LOCAL_QUESTION_BANK[name] || DEFAULT_QUESTIONS;
  const customBank = getUserCustomQuestions()[name] || { mcqs: [], cqs: [] };
  const allMcqs = [...customBank.mcqs, ...bank.mcqs];
  const allCqs = [...customBank.cqs, ...bank.cqs];

  const selectUnique = (source: QuestionPair[], target: number) => {
    return source.sort(() => 0.5 - Math.random()).slice(0, target);
  };

  return { mcqs: selectUnique(allMcqs, count), cqs: selectUnique(allCqs, 10) };
}

export function getDatabaseStats(subjectName: string) {
  const name = subjectName.trim();
  const bank = LOCAL_QUESTION_BANK[name];
  const customBank = getUserCustomQuestions()[name];
  const total = (bank ? bank.mcqs.length : 0) + (customBank ? (customBank.mcqs.length + customBank.cqs.length) : 0);
  return { total, remaining: total, user: customBank ? (customBank.mcqs.length + customBank.cqs.length) : 0 };
}
