import React from 'react';
import { Student, ExamAttempt, Question } from '../types';
import { 
  BookOpen, 
  Award, 
  Play, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  UserCheck, 
  ShieldCheck, 
  Zap,
  HelpCircle
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student | null;
  attempts: ExamAttempt[];
  totalQuestionsCount: number;
  onStartExam: () => void;
  onOpenAuthModal: () => void;
  onGoToLeaderboard: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  attempts,
  totalQuestionsCount,
  onStartExam,
  onOpenAuthModal,
  onGoToLeaderboard,
}) => {
  // Filter student's attempts if logged in
  const studentAttempts = student
    ? attempts.filter((a) => a.studentEmail === student.email)
    : [];

  const studentBestPct = studentAttempts.length > 0
    ? Math.max(...studentAttempts.map((a) => a.percentage))
    : 0;

  const studentAvgPct = studentAttempts.length > 0
    ? (studentAttempts.reduce((acc, a) => acc + a.percentage, 0) / studentAttempts.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-900 animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        
        {/* Subtle Emerald Circle Overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 opacity-30 rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex-1 max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Simulado Técnico SENAI 103</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
              {student ? `Olá, ${student.name.split(' ')[0]}!` : 'ServiceNow Mastery'}
            </h1>

            <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed">
              Pronto para testar seus conhecimentos? O simulado contém <strong>20 questões aleatórias</strong> do banco oficial para a certificação <strong>Certified System Administrator (CSA)</strong>.
            </p>

            {/* Quick Metrics Line */}
            <div className="flex flex-wrap items-center gap-8 my-6 py-4 border-y border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Média Geral</span>
                <span className="text-3xl font-light text-slate-900">{studentAvgPct.toFixed(0)}<span className="text-lg">%</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulados</span>
                <span className="text-3xl font-light text-slate-900">{studentAttempts.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Melhor Score</span>
                <span className="text-3xl font-light text-emerald-600">{studentBestPct.toFixed(0)}<span className="text-lg">%</span></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onStartExam}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all text-base flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-900" />
                <span>Iniciar Novo Simulado</span>
              </button>

              {!student && (
                <button
                  onClick={onOpenAuthModal}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cadastrar Conta Gmail</span>
                </button>
              )}
            </div>

          </div>

          {/* Student Profile / Quick Stats Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md w-full lg:w-80 shrink-0">
            {student ? (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
                  <img
                    src={student.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`}
                    alt={student.name}
                    className="w-12 h-12 rounded-full border-2 border-emerald-500/40 object-cover bg-slate-800"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-white text-sm truncate">{student.name}</p>
                    <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    <span className="inline-block mt-1 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/20">
                      {student.turma || 'SENAI 103'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Simulados Feitos</span>
                    <span className="font-bold text-white text-sm">{studentAttempts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Melhor Score</span>
                    <span className="font-bold text-emerald-400 text-sm">{studentBestPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Média Pessoal</span>
                    <span className="font-bold text-emerald-400 text-sm">{studentAvgPct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-white text-sm">Entrar com Gmail</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Cadastre-se para garantir que seus pontos e posição no ranking sejam salvos.
                </p>
                <button
                  onClick={onOpenAuthModal}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Identificar-me Agora
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Banco de Dados</h3>
          <p className="text-xl font-bold text-slate-800 mb-1">{totalQuestionsCount} Questões</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sorteio aleatório de 20 perguntas do repositório a cada tentativa de simulado.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ranking Global</h3>
          <p className="text-xl font-bold text-slate-800 mb-1">Score em %</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Classificação automática baseada na média percentual e tempo de conclusão.
          </p>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Base de Dados</h3>
            <p className="text-2xl font-light text-slate-100">Excel & Supabase</p>
          </div>
          <div className="flex flex-col my-3">
            <span className="text-3xl font-bold text-emerald-400">{totalQuestionsCount}</span>
            <span className="text-xs text-slate-400">Questões Ativas</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-3 border-t border-slate-800">
            <span>Admin: Senai 103</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Conectado
            </span>
          </div>
        </div>
      </div>

      {/* Student Recent Attempt History */}
      {student && studentAttempts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Histórico Recente
            </h3>
            <button
              onClick={onGoToLeaderboard}
              className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
            >
              Ver Ranking Completo →
            </button>
          </div>

          <div className="space-y-3">
            {studentAttempts.slice(0, 5).map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    Simulado CSA — 20 Questões
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(att.completedAt).toLocaleString('pt-BR')} • {Math.floor(att.timeSeconds / 60)}m {att.timeSeconds % 60}s
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    att.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {att.percentage.toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-slate-400">{att.score} / {att.totalQuestions} acertos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
