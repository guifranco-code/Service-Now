import React, { useState, useEffect } from 'react';
import { Question, ExamAttempt, Student } from './types';
import { 
  loadQuestions, 
  loadAttempts, 
  saveExamAttempt, 
  appendQuestions, 
  deleteQuestionById,
  deleteDefaultQuestions,
  clearAllQuestions,
  getRandomExamQuestions,
  getLocalStudent,
  setLocalStudent
} from './lib/storage';
import { getStoredSupabaseConfig } from './lib/supabase';
import { Header } from './components/Header';
import { AdminModal } from './components/AdminModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { QuizExam } from './components/QuizExam';
import { QuizResult } from './components/QuizResult';
import { Leaderboard } from './components/Leaderboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'result' | 'leaderboard' | 'admin'>('home');

  // Core Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);

  // Modal controls
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Supabase state indicator
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initial Data Fetching
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const q = await loadQuestions();
      setQuestions(q);

      const a = await loadAttempts();
      setAttempts(a);

      const sb = getStoredSupabaseConfig();
      setIsSupabaseConnected(sb.isConnected);
    } catch (err) {
      console.error('Error initializing app data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedStudent = getLocalStudent();
    if (savedStudent) setStudent(savedStudent);
    refreshData();
  }, []);

  // Handlers
  const handleStudentLogin = (newStudent: Student) => {
    setStudent(newStudent);
    setLocalStudent(newStudent);
  };

  const handleStudentLogout = () => {
    setStudent(null);
    setLocalStudent(null);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const handleStartExam = () => {
    if (!student) {
      setIsAuthModalOpen(true);
      return;
    }

    if (questions.length === 0) {
      alert('Nenhuma questão cadastrada. O administrador precisa cadastrar ou enviar uma planilha.');
      return;
    }

    // Pick 20 random questions
    const selected = getRandomExamQuestions(questions, 20);
    setExamQuestions(selected);
    setActiveTab('quiz');
  };

  const handleFinishExam = async (completedAttempt: ExamAttempt) => {
    await saveExamAttempt(completedAttempt);
    setLastAttempt(completedAttempt);
    
    // Refresh global attempts
    const updatedAttempts = await loadAttempts();
    setAttempts(updatedAttempts);

    setActiveTab('result');
  };

  const handleAddQuestions = async (newQs: Question[]) => {
    const updated = await appendQuestions(newQs);
    setQuestions(updated);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta questão do banco de dados?')) {
      const updated = await deleteQuestionById(id);
      setQuestions(updated);
    }
  };

  const handleDeleteDefaultQuestions = async () => {
    if (confirm('Tem certeza que deseja apagar todas as questões padrão do sistema (sn-csa-*) e manter apenas as que foram importadas via Excel/manualmente?')) {
      const updated = await deleteDefaultQuestions();
      setQuestions(updated);
    }
  };

  const handleClearAllQuestions = async () => {
    if (confirm('ATENÇÃO: Tem certeza que deseja apagar TODAS as questões do banco de dados?')) {
      const updated = await clearAllQuestions();
      setQuestions(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900">
      
      {/* App Top Bar */}
      <Header
        student={student}
        isAdmin={isAdmin}
        activeTab={activeTab === 'result' ? 'quiz' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'quiz' && activeTab !== 'quiz') {
            handleStartExam();
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogoutStudent={handleStudentLogout}
        onLogoutAdmin={handleAdminLogout}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Container */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Carregando Simulados SENAI...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <StudentDashboard
                student={student}
                attempts={attempts}
                totalQuestionsCount={questions.length}
                onStartExam={handleStartExam}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onGoToLeaderboard={() => setActiveTab('leaderboard')}
              />
            )}

            {activeTab === 'quiz' && student && (
              <QuizExam
                questions={examQuestions}
                student={student}
                onFinishExam={handleFinishExam}
                onCancelExam={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'result' && lastAttempt && (
              <QuizResult
                attempt={lastAttempt}
                onRetakeExam={handleStartExam}
                onGoToLeaderboard={() => setActiveTab('leaderboard')}
              />
            )}

            {activeTab === 'leaderboard' && (
              <Leaderboard
                attempts={attempts}
                onStartNewExam={handleStartExam}
              />
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminDashboard
                questions={questions}
                attempts={attempts}
                onAddQuestions={handleAddQuestions}
                onDeleteQuestion={handleDeleteQuestion}
                onDeleteDefaultQuestions={handleDeleteDefaultQuestions}
                onClearAllQuestions={handleClearAllQuestions}
                onRefreshData={refreshData}
                isSupabaseConnected={isSupabaseConnected}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-700">SENAI 103 — ServiceNow Mastery</span>
          </div>
          <p>© {new Date().getFullYear()} Plataforma de Simulados & Ranking. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Modals */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin');
        }}
      />

      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleStudentLogin}
      />

    </div>
  );
}
