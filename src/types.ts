export interface Question {
  id: string;
  text: string;
  options: string[]; // 4 options [A, B, C, D]
  correctAnswerIndex: number; // 0, 1, 2, or 3
  category: string; // e.g. "CSA - Admin", "Tabelas e CMDB", "Flow Designer", "ACL e Segurança", "Client & Server Scripts"
  explanation?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  picture?: string;
  turma?: string; // e.g., "SENAI 103", "Turma A"
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPicture?: string;
  studentTurma?: string;
  score: number; // number of correct answers out of 20
  totalQuestions: number; // always 20
  percentage: number; // e.g. 85.0
  timeSeconds: number; // total time taken in seconds
  completedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    options: string[];
    userAnswerIndex: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
    explanation?: string;
    category: string;
  }[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface ExcelQuestionRow {
  'Pergunta'?: string;
  'Question'?: string;
  'Opção A'?: string;
  'Opcao A'?: string;
  'Option A'?: string;
  'Opção B'?: string;
  'Opcao B'?: string;
  'Option B'?: string;
  'Opção C'?: string;
  'Opcao C'?: string;
  'Option C'?: string;
  'Opção D'?: string;
  'Opcao D'?: string;
  'Option D'?: string;
  'Resposta Correta'?: string | number;
  'Resposta'?: string | number;
  'Correct Answer'?: string | number;
  'Categoria'?: string;
  'Módulo'?: string;
  'Category'?: string;
  'Explicação'?: string;
  'Explicacao'?: string;
  'Explanation'?: string;
  [key: string]: any;
}
