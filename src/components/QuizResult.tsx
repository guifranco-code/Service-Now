import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ExamAttempt } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface QuizResultProps {
  attempt: ExamAttempt;
  onRetakeExam: () => void;
  onGoToLeaderboard: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  attempt,
  onRetakeExam,
  onGoToLeaderboard,
}) => {
  const isPassed = attempt.percentage >= 70.0;

  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isPassed]);

  // Group performance by Category
  const categoryStats: Record<string, { total: number; correct: number }> = {};
  attempt.answers.forEach((ans) => {
    const cat = ans.category || 'Geral';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, correct: 0 };
    }
    categoryStats[cat].total += 1;
    if (ans.isCorrect) categoryStats[cat].correct += 1;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-900 animate-fade-in">
      
      {/* Result Hero Banner */}
      <div className="bg-white rounded-2xl p-8 mb-8 text-center border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full -mr-20 -mt-20 pointer-events-none ${
          isPassed ? 'bg-emerald-100' : 'bg-red-100'
        }`} />

        {/* Badge Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border bg-slate-50">
          {isPassed ? (
            <span className="text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Aprovado no Simulado SENAI
            </span>
          ) : (
            <span className="text-amber-700 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-500" /> Requer Mais Estudo (Meta: 70%)
            </span>
          )}
        </div>

        {/* Big Percentage Display */}
        <div className="mb-2">
          <span className={`text-6xl sm:text-7xl font-extrabold tracking-tight ${
            isPassed ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {attempt.percentage.toFixed(1)}%
          </span>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Porcentagem de Acerto
          </p>
        </div>

        <p className="text-sm text-slate-500 max-w-lg mx-auto mb-6">
          {isPassed
            ? `Parabéns, ${attempt.studentName}! Você obteve uma excelente pontuação, compatível com o exame oficial ServiceNow Certified System Administrator (CSA).`
            : `Boa tentativa, ${attempt.studentName}! Revise as explicações abaixo para reforçar seus conhecimentos para o próximo simulado.`}
        </p>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acertos</p>
            <p className="text-xl font-bold text-emerald-600">{attempt.score} / {attempt.totalQuestions}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Erros</p>
            <p className="text-xl font-bold text-amber-600">{attempt.totalQuestions - attempt.score}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tempo</p>
            <p className="text-xl font-bold text-slate-800">
              {Math.floor(attempt.timeSeconds / 60)}m {attempt.timeSeconds % 60}s
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRetakeExam}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-7 py-3.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Fazer Novo Simulado</span>
          </button>

          <button
            onClick={onGoToLeaderboard}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-7 py-3.5 rounded-xl border border-slate-200 transition-all text-sm flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Ver Ranking da Turma</span>
          </button>
        </div>

      </div>

      {/* Performance by Category */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Desempenho por Módulo ServiceNow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryStats).map(([catName, stats]) => {
            const catPct = (stats.correct / stats.total) * 100;
            return (
              <div key={catName} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700">{catName}</span>
                  <span className={catPct >= 70 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {stats.correct}/{stats.total} ({catPct.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${catPct >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Revisão Detalhada das 20 Questões
        </h3>

        <div className="space-y-4">
          {attempt.answers.map((ans, idx) => {
            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={idx}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                  ans.isCorrect ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-600">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {ans.category}
                    </span>
                  </div>

                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                    ans.isCorrect
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {ans.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correta
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> Incorreta
                      </>
                    )}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-800 mb-4 leading-relaxed">
                  {ans.questionText}
                </p>

                {/* Options Review List */}
                <div className="space-y-2 text-xs">
                  {ans.options.map((optText, oIdx) => {
                    const isUserChoice = ans.userAnswerIndex === oIdx;
                    const isCorrectChoice = ans.correctAnswerIndex === oIdx;

                    let optionStyle = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (isCorrectChoice) {
                      optionStyle = 'bg-emerald-50 border-emerald-400 text-slate-900 font-bold';
                    } else if (isUserChoice && !ans.isCorrect) {
                      optionStyle = 'bg-red-50 border-red-300 text-red-900 font-bold';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${optionStyle}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono font-bold">{optionLetters[oIdx]}:</span>
                          <span>{optText}</span>
                        </div>

                        {isUserChoice && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 shrink-0">
                            Sua Escolha
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {ans.explanation && (
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
                    <strong className="text-slate-800 block mb-1">Explicação:</strong>
                    {ans.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
