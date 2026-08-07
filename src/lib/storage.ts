import { Question, ExamAttempt, Student } from '../types';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';
import { getSupabaseClient } from './supabase';

const QUESTIONS_KEY = 'senai_servicenow_questions_v2';
const ATTEMPTS_KEY = 'senai_servicenow_attempts_v2';
const STUDENT_KEY = 'senai_current_student_v2';

// Localstorage Helpers
export function getLocalStudent(): Student | null {
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalStudent(student: Student | null): void {
  if (student) {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
  } else {
    localStorage.removeItem(STUDENT_KEY);
  }
}

// ----------------------------------------------------
// QUESTIONS API & PERSISTENCE
// ----------------------------------------------------
export async function loadQuestions(): Promise<Question[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const questions: Question[] = data
          .map((q: any) => ({
            id: q.id,
            text: q.text,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctAnswerIndex: Number(q.correct_answer_index ?? q.correctAnswerIndex ?? 0),
            category: q.category || 'Geral',
            explanation: q.explanation || '',
            createdAt: q.created_at || q.createdAt,
          }))
          .filter((q) => !q.id.startsWith('sn-csa-'));

        // Update local cache
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
        return questions;
      }
    } catch (e) {
      console.warn('Supabase questions fetch fallback to local:', e);
    }
  }

  // Local Storage Fallback
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) {
      const parsed: Question[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out default mock questions starting with 'sn-csa-'
        const userQuestions = parsed.filter((q) => !q.id.startsWith('sn-csa-'));
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(userQuestions));
        return userQuestions;
      }
    }
  } catch (e) {
    console.error('Error reading local questions:', e);
  }

  // Initial Seed
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
  return INITIAL_QUESTIONS;
}

export async function saveAllQuestions(questions: Question[]): Promise<void> {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));

  const client = getSupabaseClient();
  if (client) {
    try {
      // Upsert to Supabase
      const payload = questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correct_answer_index: q.correctAnswerIndex,
        category: q.category || 'Geral',
        explanation: q.explanation || '',
      }));
      await client.from('questions').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.error('Failed to sync questions to Supabase:', e);
    }
  }
}

export async function appendQuestions(newQuestions: Question[]): Promise<Question[]> {
  const current = await loadQuestions();
  // Filter out duplicates based on exact text or ID
  const existingTexts = new Set(current.map((q) => q.text.trim().toLowerCase()));
  
  const filteredNew = newQuestions.filter(
    (q) => !existingTexts.has(q.text.trim().toLowerCase())
  );

  const updated = [...filteredNew, ...current];
  await saveAllQuestions(updated);
  return updated;
}

export async function deleteQuestionById(id: string): Promise<Question[]> {
  const current = await loadQuestions();
  const updated = current.filter((q) => q.id !== id);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('questions').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting question from Supabase:', e);
    }
  }

  return updated;
}

export async function deleteDefaultQuestions(): Promise<Question[]> {
  const current = await loadQuestions();
  // Filter out default mock questions starting with 'sn-csa-'
  const updated = current.filter((q) => !q.id.startsWith('sn-csa-'));
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('questions').delete().like('id', 'sn-csa-%');
    } catch (e) {
      console.error('Error deleting default questions from Supabase:', e);
    }
  }

  return updated;
}

export async function clearAllQuestions(): Promise<Question[]> {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify([]));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('questions').delete().neq('id', '');
    } catch (e) {
      console.error('Error clearing all questions from Supabase:', e);
    }
  }

  return [];
}


// ----------------------------------------------------
// EXAM ATTEMPTS & RANKING
// ----------------------------------------------------
export async function loadAttempts(): Promise<ExamAttempt[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      if (!error && data) {
        const attempts: ExamAttempt[] = data.map((a: any) => ({
          id: a.id,
          studentId: a.student_id || a.studentId,
          studentName: a.student_name || a.studentName,
          studentEmail: a.student_email || a.studentEmail,
          studentPicture: a.student_picture || a.studentPicture,
          studentTurma: a.student_turma || a.studentTurma,
          score: Number(a.score),
          totalQuestions: Number(a.total_questions || a.totalQuestions || 20),
          percentage: Number(a.percentage),
          timeSeconds: Number(a.time_seconds || a.timeSeconds),
          completedAt: a.completed_at || a.completedAt,
          answers: typeof a.answers === 'string' ? JSON.parse(a.answers) : (a.answers || []),
        }));
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
        return attempts;
      }
    } catch (e) {
      console.warn('Supabase attempts fetch fallback to local:', e);
    }
  }

  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local attempts:', e);
  }

  return [];
}

export async function saveExamAttempt(attempt: ExamAttempt): Promise<void> {
  const current = await loadAttempts();
  const updated = [attempt, ...current];
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('attempts').insert({
        id: attempt.id,
        student_id: attempt.studentId,
        student_name: attempt.studentName,
        student_email: attempt.studentEmail,
        student_picture: attempt.studentPicture || '',
        student_turma: attempt.studentTurma || '',
        score: attempt.score,
        total_questions: attempt.totalQuestions,
        percentage: attempt.percentage,
        time_seconds: attempt.timeSeconds,
        completed_at: attempt.completedAt,
        answers: attempt.answers,
      });
    } catch (e) {
      console.error('Failed to save attempt to Supabase:', e);
    }
  }
}

// Helper to select 20 random questions for a new exam attempt
export function getRandomExamQuestions(allQuestions: Question[], count = 20): Question[] {
  if (allQuestions.length <= count) {
    return [...allQuestions];
  }
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
