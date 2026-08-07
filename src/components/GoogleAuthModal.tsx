import React, { useState } from 'react';
import { Student } from '../types';
import { X, CheckCircle2, User, Mail, GraduationCap, Sparkles } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (student: Student) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [turma, setTurma] = useState('SENAI 103');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSimulatedGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido (ex: aluno@gmail.com).');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const student: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      turma: turma.trim() || 'SENAI 103',
      createdAt: new Date().toISOString(),
    };

    onLoginSuccess(student);
    onClose();
  };

  const handleQuickDemoStudent = (demoName: string, demoEmail: string) => {
    const student: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: demoName,
      email: demoEmail,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(demoName)}`,
      turma: 'SENAI 103',
      createdAt: new Date().toISOString(),
    };
    onLoginSuccess(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#10b981" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#10b981" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#10b981" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#10b981" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">Cadastro de Aluno SENAI</h3>
          <p className="text-xs text-slate-500 mt-1">Conecte sua conta Gmail para salvar seu histórico e pontuação no Ranking</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSimulatedGoogleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nome Completo do Aluno
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Ex: Gabriel Silva"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-all pl-10"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              E-mail Gmail / Institucional
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="exemplo@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-all pl-10"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Turma SENAI
            </label>
            <div className="relative">
              <select
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-all pl-10 appearance-none"
              >
                <option value="SENAI 103">SENAI 103 (Principal)</option>
                <option value="SENAI 103 - Manhã">SENAI 103 - Manhã</option>
                <option value="SENAI 103 - Tarde">SENAI 103 - Tarde</option>
                <option value="SENAI 103 - Noite">SENAI 103 - Noite</option>
              </select>
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-700 font-medium bg-red-50 border border-red-200 p-2.5 rounded-lg text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider mt-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Cadastrar e Iniciar Simulado</span>
          </button>
        </form>

        {/* Quick Demo Options */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Ou selecione um perfil de teste rápido:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoStudent('Lucas Andrade', 'lucas.senai103@gmail.com')}
              className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
            >
              <p className="font-bold text-slate-800">Lucas Andrade</p>
              <p className="text-[10px] text-slate-500 truncate">lucas.senai103@gmail.com</p>
            </button>

            <button
              onClick={() => handleQuickDemoStudent('Mariana Costa', 'mariana.costa@gmail.com')}
              className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
            >
              <p className="font-bold text-slate-800">Mariana Costa</p>
              <p className="text-[10px] text-slate-500 truncate">mariana.costa@gmail.com</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
