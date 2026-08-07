import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Question, ExamAttempt, SupabaseConfig } from '../types';

const STORAGE_KEY_CONFIG = 'senai_supabase_config_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConnected: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConnected: true,
        };
      }
    }
  } catch (e) {
    console.warn('Error reading Supabase config from localStorage:', e);
  }

  return {
    url: '',
    anonKey: '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const config = {
    url: url.trim(),
    anonKey: anonKey.trim(),
    isConnected: Boolean(url.trim() && anonKey.trim()),
  };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL e Anon Key do Supabase são obrigatórios.' };
    }
    const testClient = createClient(url.trim(), anonKey.trim());
    // Try querying a dummy table or questions table
    const { error } = await testClient.from('questions').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.questions" does not exist')) {
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (e: any) {
    return { success: false, message: `Erro de rede ou chave inválida: ${e?.message || e}` };
  }
}

// SQL DDL Script for Supabase Table Creation
export const SUPABASE_SQL_SETUP = `-- =======================================================
-- SCRIPT SQL DE CONFIGURAÇÃO DO BANCO SUPABASE COM POLÍTICAS RLS ATIVAS
-- Execute este script no SQL Editor do seu Painel do Supabase
-- =======================================================

-- 1. Criar Tabela de Questões
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer_index INTEGER NOT NULL,
  category TEXT DEFAULT 'Geral',
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar Tabela de Tentativas de Simulados (Histórico & Ranking)
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_picture TEXT,
  student_turma TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 20,
  percentage NUMERIC(5,2) NOT NULL,
  time_seconds INTEGER NOT NULL,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Segurança por Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas se existirem (evita duplicidade ao re-executar)
DROP POLICY IF EXISTS "Permitir Leitura Publica Questoes" ON public.questions;
DROP POLICY IF EXISTS "Permitir Insercao Questoes" ON public.questions;
DROP POLICY IF EXISTS "Permitir Atualizacao Questoes" ON public.questions;
DROP POLICY IF EXISTS "Permitir Exclusao Questoes" ON public.questions;

DROP POLICY IF EXISTS "Permitir Leitura Publica Tentativas" ON public.attempts;
DROP POLICY IF EXISTS "Permitir Insercao Tentativas" ON public.attempts;
DROP POLICY IF EXISTS "Permitir Atualizacao Tentativas" ON public.attempts;

-- 5. POLÍTICAS ATIVAS PARA TABELA 'QUESTIONS'
-- Permite leitura de questões para todos (alunos e visitantes anonimos)
CREATE POLICY "Permitir Leitura Publica Questoes"
  ON public.questions
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Permite inserção de novas questões (upload Excel e cadastro manual)
CREATE POLICY "Permitir Insercao Questoes"
  ON public.questions
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Permite atualização de questões existentes
CREATE POLICY "Permitir Atualizacao Questoes"
  ON public.questions
  FOR UPDATE
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Permite exclusão de questões pelo painel
CREATE POLICY "Permitir Exclusao Questoes"
  ON public.questions
  FOR DELETE
  TO public, anon, authenticated
  USING (true);

-- 6. POLÍTICAS ATIVAS PARA TABELA 'ATTEMPTS'
-- Permite leitura de todas as tentativas para montar o Ranking dos Alunos
CREATE POLICY "Permitir Leitura Publica Tentativas"
  ON public.attempts
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Permite salvar resultado de simulados concluídos
CREATE POLICY "Permitir Insercao Tentativas"
  ON public.attempts
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Permite atualização de tentativas se necessário
CREATE POLICY "Permitir Atualizacao Tentativas"
  ON public.attempts
  FOR UPDATE
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);
`;
