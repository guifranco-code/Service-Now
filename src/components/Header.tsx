import React, { useState } from 'react';
import { Student } from '../types';
import { 
  ShieldCheck, 
  User, 
  LogOut, 
  Database, 
  Award, 
  BookOpen, 
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  student: Student | null;
  isAdmin: boolean;
  activeTab: 'home' | 'quiz' | 'leaderboard' | 'admin';
  setActiveTab: (tab: 'home' | 'quiz' | 'leaderboard' | 'admin') => void;
  onOpenAdminModal: () => void;
  onOpenAuthModal: () => void;
  onLogoutStudent: () => void;
  onLogoutAdmin: () => void;
  isSupabaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  isAdmin,
  activeTab,
  setActiveTab,
  onOpenAdminModal,
  onOpenAuthModal,
  onLogoutStudent,
  onLogoutAdmin,
  isSupabaseConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900 text-sm shadow-sm">
              SN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tight text-white">
                  ServiceNow <span className="text-emerald-400 font-light">Mastery</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  SENAI 103
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-emerald-500 text-slate-900 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Início
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-500 text-slate-900 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Award className="w-4 h-4" />
              Ranking
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-900 font-bold shadow-sm'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Painel ADM
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            
            {/* Supabase Indicator */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                isSupabaseConnected 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isSupabaseConnected ? 'Conectado ao Banco de Dados Supabase' : 'Modo Armazenamento Local (Supabase Opcional)'}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">
                {isSupabaseConnected ? 'Supabase Connected' : 'DB Local'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            </div>

            {/* Admin Badge/Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-semibold hidden sm:inline">ADM Ativo</span>
                <button
                  onClick={onLogoutAdmin}
                  title="Sair do modo administrador"
                  className="ml-1 text-amber-400 hover:text-amber-200 transition-colors p-0.5 rounded"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-300 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
                title="Acesso Administrador (senha senai103)"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>ADM</span>
              </button>
            )}

            {/* Student Auth Section */}
            {student ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] text-slate-400 font-medium leading-none mb-1 uppercase tracking-wider">ESTUDANTE</p>
                  <p className="text-sm font-semibold text-white leading-none">{student.name}</p>
                </div>
                <img
                  src={student.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`}
                  alt={student.name}
                  className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-500/30 object-cover"
                />
                <button
                  onClick={onLogoutStudent}
                  title="Sair da Conta"
                  className="text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-bold text-[10px]"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Entrar com Gmail</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Submenu Tabs */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 py-2 px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-medium ${
            activeTab === 'home' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Início
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-medium ${
            activeTab === 'leaderboard' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Ranking
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'admin' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-amber-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ADM
          </button>
        )}
      </div>
    </header>
  );
};
