import React, { useState } from 'react';
import { ExamAttempt } from '../types';
import { 
  Award, 
  Trophy, 
  Medal, 
  Search, 
  Users, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Filter,
  Eye,
  X
} from 'lucide-react';

interface LeaderboardProps {
  attempts: ExamAttempt[];
  onStartNewExam: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ attempts, onStartNewExam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('Todas');
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState<ExamAttempt | null>(null);

  // Sort attempts: Percentage DESC, Score DESC, Time ASC
  const sortedAttempts = [...attempts].sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timeSeconds - b.timeSeconds;
  });

  const turmasList = ['Todas', ...Array.from(new Set(attempts.map((a) => a.studentTurma || 'SENAI 103')))];

  const filteredAttempts = sortedAttempts.filter((att) => {
    const matchesSearch = 
      att.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTurma = selectedTurma === 'Todas' || att.studentTurma === selectedTurma;
    return matchesSearch && matchesTurma;
  });

  // Calculate stats
  const totalSimulados = attempts.length;
  const highestPercentage = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const averagePercentage = attempts.length > 0 
    ? (attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-900 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">
              <Trophy className="w-4 h-4" />
              Ranking Global SENAI 103
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Classificação dos Alunos</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">
              Top scores da turma calculados pela porcentagem de acertos nos simulados ServiceNow CSA de 20 questões.
            </p>
          </div>

          <button
            onClick={onStartNewExam}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-6 py-3.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all text-sm flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
          >
            <Award className="w-5 h-5" />
            <span>Fazer Meu Simulado Agora</span>
          </button>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulados Realizados</p>
              <p className="text-2xl font-light text-slate-900">{totalSimulados}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maior Pontuação</p>
              <p className="text-2xl font-light text-emerald-600">{highestPercentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Média da Turma</p>
              <p className="text-2xl font-light text-slate-900">{averagePercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail de aluno..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">Turma:</label>
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {turmasList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ranking Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredAttempts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-semibold text-slate-600">Nenhum resultado no ranking ainda</p>
            <p className="text-xs mt-1 text-slate-400">Seja o primeiro aluno a realizar o simulado!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Pos</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Turma</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Score %</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acertos</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((att, idx) => {
                  const rank = idx + 1;
                  
                  // Medal styling for top 3
                  let rankBadge = (
                    <span className="text-xs font-bold text-slate-400">
                      {rank}
                    </span>
                  );

                  if (rank === 1) {
                    rankBadge = (
                      <span className="w-6 h-6 flex items-center justify-center bg-yellow-400 text-slate-900 rounded-full text-xs font-bold mx-auto">
                        1
                      </span>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-300 text-slate-900 rounded-full text-xs font-bold mx-auto">
                        2
                      </span>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <span className="w-6 h-6 flex items-center justify-center bg-amber-600 text-white rounded-full text-xs font-bold mx-auto">
                        3
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={att.id}
                      className={`transition-colors ${
                        rank === 1 ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-center">{rankBadge}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={att.studentPicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(att.studentName)}`}
                            alt=""
                            className="w-8 h-8 rounded-full bg-slate-100 object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-sm text-slate-800">{att.studentName}</p>
                            <p className="text-[10px] text-slate-400">{att.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{att.studentTurma || 'SENAI 103'}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 text-sm">
                        {att.percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {Math.floor(att.timeSeconds / 60)}m {att.timeSeconds % 60}s
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(att.completedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedAttemptDetail(att)}
                          className="text-xs font-bold text-slate-600 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Ver respostas deste simulado"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL FOR SPECIFIC ATTEMPT */}
      {selectedAttemptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-900 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAttemptDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Desempenho de {selectedAttemptDetail.studentName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedAttemptDetail.studentTurma} • {new Date(selectedAttemptDetail.completedAt).toLocaleString('pt-BR')}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Porcentagem</p>
                <p className="text-xl font-extrabold text-emerald-600">{selectedAttemptDetail.percentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acertos</p>
                <p className="text-xl font-extrabold text-slate-800">{selectedAttemptDetail.score} / {selectedAttemptDetail.totalQuestions}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tempo</p>
                <p className="text-xl font-extrabold text-slate-600">{Math.floor(selectedAttemptDetail.timeSeconds / 60)}m {selectedAttemptDetail.timeSeconds % 60}s</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedAttemptDetail.answers?.map((ans, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs ${
                  ans.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                }`}>
                  <p className="font-semibold text-slate-800 mb-1">
                    {idx + 1}. {ans.questionText}
                  </p>
                  <p className="text-slate-600">
                    Sua resposta: <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                      {ans.options?.[ans.userAnswerIndex] || 'Não respondida'}
                    </strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
