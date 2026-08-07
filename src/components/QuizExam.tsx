import React, { useState, useEffect } from 'react';
import { Question, ExamAttempt, Student } from '../types';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Send
} from 'lucide-react';

interface QuizExamProps {
  questions: Question[]; // Exactly 20 questions
  student: Student;
  onFinishExam: (attempt: ExamAttempt) => void;
  onCancelExam: () => void;
}

export const QuizExam: React.FC<QuizExamProps> = ({
  questions,
  student,
  onFinishExam,
  onCancelExam,
}) => {
  const TOTAL_COUNT = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // User answers map: questionId -> selectedOptionIndex (0, 1, 2, or 3)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // Flagged questions for review
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Countdown timer in seconds (30 minutes default)
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmission();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleFinalSubmission = () => {
    // Calculate score
    let correctCount = 0;
    const answerSummaries = questions.map((q) => {
      const userAns = answers[q.id];
      const isCorrect = userAns === q.correctAnswerIndex;
      if (isCorrect) correctCount += 1;

      return {
        questionId: q.id,
        questionText: q.text,
        options: q.options,
        userAnswerIndex: userAns !== undefined ? userAns : -1,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation || '',
        category: q.category || 'Geral',
      };
    });

    const percentage = Number(((correctCount / TOTAL_COUNT) * 100).toFixed(1));
    const totalTimeSpent = 30 * 60 - secondsRemaining;

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPicture: student.picture,
      studentTurma: student.turma || 'SENAI 103',
      score: correctCount,
      totalQuestions: TOTAL_COUNT,
      percentage,
      timeSeconds: Math.max(1, totalTimeSpent),
      completedAt: new Date().toISOString(),
      answers: answerSummaries,
    };

    onFinishExam(attempt);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-slate-900 animate-fade-in">
      
      {/* Top Header Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">Simulado ServiceNow CSA</h2>
            <p className="text-xs text-slate-400 font-medium">
              Questão {currentIndex + 1} de {TOTAL_COUNT} • {answeredCount} respondida(s)
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold shadow-sm ${
          secondsRemaining < 300 
            ? 'bg-red-50 border-red-300 text-red-600 animate-pulse' 
            : 'bg-slate-900 border-slate-800 text-emerald-400'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* Main Exam Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Question & Options (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative">
            
            {/* Category Tag & Flag Action */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                {currentQuestion.category || 'Módulo CSA'}
              </span>

              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all ${
                  flagged[currentQuestion.id]
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${flagged[currentQuestion.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{flagged[currentQuestion.id] ? 'Revisar Depois' : 'Marcar p/ Revisão'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-6 leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((optText, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-slate-900 ring-1 ring-emerald-500/50 shadow-sm'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {optionLetters[optIdx]}
                    </span>
                    <span className="text-sm font-medium leading-normal pt-0.5">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Navigation Controls */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <button
                onClick={() => {
                  if (currentIndex < TOTAL_COUNT - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  } else {
                    setIsSubmitModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 text-xs transition-all"
              >
                <span>{currentIndex === TOTAL_COUNT - 1 ? 'Revisar & Finalizar' : 'Próxima'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Question Grid Matrix (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Navegador de Questões
            </h4>

            {/* Grid 1..20 */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold relative flex items-center justify-center transition-all border ${
                      isCurrent
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 text-slate-900 bg-emerald-50'
                        : isAnswered
                        ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] space-y-2 text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                <span>Não respondida</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-500" />
                <span>Questão atual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Marcada p/ revisão</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Finalizar Simulado</span>
            </button>
          </div>
        </div>

      </div>

      {/* CONFIRMATION SUBMIT MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Finalizar Simulado?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Você respondeu <strong className="text-emerald-600 font-bold">{answeredCount}</strong> de <strong className="text-slate-800">{TOTAL_COUNT}</strong> questões.
              </p>
            </div>

            {answeredCount < TOTAL_COUNT && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs mb-5 text-center font-medium">
                Atenção: Restam {TOTAL_COUNT - answeredCount} questão(ões) sem resposta. Elas serão contabilizadas como incorretas.
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-wider"
              >
                Continuar
              </button>
              <button
                onClick={handleFinalSubmission}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-md text-xs"
              >
                Sim, Enviar Respostas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
