import React, { useState, useRef } from 'react';
import { Question, ExamAttempt } from '../types';
import { parseExcelQuestions, downloadSampleExcelTemplate } from '../lib/excel';
import { testSupabaseConnection, saveSupabaseConfig, getStoredSupabaseConfig, SUPABASE_SQL_SETUP } from '../lib/supabase';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Edit3, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ListOrdered, 
  HelpCircle, 
  Copy, 
  Check, 
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  questions: Question[];
  attempts: ExamAttempt[];
  onAddQuestions: (questions: Question[]) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onDeleteDefaultQuestions?: () => Promise<void>;
  onClearAllQuestions?: () => Promise<void>;
  onRefreshData: () => Promise<void>;
  isSupabaseConnected: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  questions,
  attempts,
  onAddQuestions,
  onDeleteQuestion,
  onDeleteDefaultQuestions,
  onClearAllQuestions,
  onRefreshData,
  isSupabaseConnected,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'excel' | 'questions' | 'attempts'>('excel');
  
  // Excel upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Question[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Manual Question Modal states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newCategory, setNewCategory] = useState('CSA - Geral');
  const [newExplanation, setNewExplanation] = useState('');

  // Question search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Supabase config form states
  const currentSupabase = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabase.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentSupabase.anonKey);
  const [testingStatus, setTestingStatus] = useState<{ loading: boolean; msg: string; success?: boolean }>({ loading: false, msg: '' });
  const [copiedSql, setCopiedSql] = useState(false);

  // Detail Modal for Student Attempt
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);

  // Handle Excel File Drop/Change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadErrors([]);
    setUploadSuccessMsg('');
    setParsedPreview([]);

    try {
      const { questions: parsed, errors } = await parseExcelQuestions(file);
      setParsedPreview(parsed);
      setUploadErrors(errors);
      if (parsed.length > 0) {
        setUploadSuccessMsg(`${parsed.length} questão(ões) extraída(s) com sucesso da planilha Excel!`);
      }
    } catch (err: any) {
      setUploadErrors([err.message || 'Erro ao processar planilha Excel.']);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImportExcel = async () => {
    if (parsedPreview.length === 0) return;
    try {
      await onAddQuestions(parsedPreview);
      setUploadSuccessMsg(`${parsedPreview.length} questão(ões) importada(s) para o banco de dados com sucesso!`);
      setParsedPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      setUploadErrors([`Erro ao salvar questões: ${e?.message || e}`]);
    }
  };

  const handleCreateManualQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOptA.trim() || !newOptB.trim() || !newOptC.trim() || !newOptD.trim()) {
      alert('Por favor, preencha o enunciado e as 4 opções de resposta.');
      return;
    }

    const q: Question = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newQuestionText.trim(),
      options: [newOptA.trim(), newOptB.trim(), newOptC.trim(), newOptD.trim()],
      correctAnswerIndex: newCorrectIdx,
      category: newCategory.trim() || 'CSA - Geral',
      explanation: newExplanation.trim(),
      createdAt: new Date().toISOString(),
    };

    await onAddQuestions([q]);

    // Reset Form
    setNewQuestionText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewExplanation('');
    setIsManualModalOpen(false);
  };

  const handleSaveSupabaseSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingStatus({ loading: true, msg: 'Testando conexão com o Supabase...' });
    
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    if (res.success) {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      setTestingStatus({ loading: false, msg: res.message, success: true });
      await onRefreshData();
    } else {
      setTestingStatus({ loading: false, msg: res.message, success: false });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filter questions for display
  const categoriesList = ['Todas', ...Array.from(new Set(questions.map((q) => q.category || 'Geral')))];
  
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = 
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'Todas' || q.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full">Painel do Professor / ADM</span>
              <span className="text-slate-400">• Senha Autenticada</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Questões & Banco de Dados</h1>
            <p className="text-sm text-slate-500 mt-1">
              Envie simulados via planilha Excel, gerencie o repositório de perguntas e acompanhe o histórico de notas dos alunos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Questão
            </button>
            <button
              onClick={downloadSampleExcelTemplate}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
              title="Baixar Modelo de Excel em formato .xlsx"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Modelo Excel
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('excel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
            activeSubTab === 'excel'
              ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Enviar Planilha Excel
        </button>

        <button
          onClick={() => setActiveSubTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
            activeSubTab === 'questions'
              ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Banco de Questões ({questions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('attempts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
            activeSubTab === 'attempts'
              ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Histórico de Provas ({attempts.length})
        </button>
      </div>

      {/* SUBTAB 1: EXCEL UPLOAD */}
      {activeSubTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm">
            <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-slate-800">
              <Upload className="w-5 h-5 text-emerald-600" />
              Upload de Planilha Excel com Questões ServiceNow
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Envie arquivos nos formatos <strong>.xlsx, .xls ou .csv</strong>. O sistema identifica automaticamente colunas como Pergunta, Opção A, Opção B, Opção C, Opção D, Resposta Correta e Categoria.
            </p>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
              <p className="text-base font-bold text-slate-800">Clique para selecionar a planilha ou arraste aqui</p>
              <p className="text-xs text-slate-400 mt-1">Suporta arquivos .xlsx e .csv no formato SENAI</p>
            </div>

            {/* Download Template Shortcut */}
            <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Ainda não tem a planilha pronta?</p>
                  <p className="text-[11px] text-slate-500">Baixe nosso modelo preenchido com exemplo de questões ServiceNow</p>
                </div>
              </div>
              <button
                onClick={downloadSampleExcelTemplate}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Modelo (.xlsx)
              </button>
            </div>

            {/* Upload Messages */}
            {uploadSuccessMsg && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              </div>
            )}

            {uploadErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs space-y-1">
                <p className="font-bold text-red-700 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Avisos durante a leitura da planilha:
                </p>
                {uploadErrors.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
          </div>

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Pré-visualização das Questões ({parsedPreview.length})
                  </h4>
                  <p className="text-xs text-slate-500">Confira as questões antes de confirmar a gravação no banco de dados</p>
                </div>
                <button
                  onClick={handleConfirmImportExcel}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Importação de {parsedPreview.length} Questões
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Pergunta</th>
                      <th className="p-3">Opções (A, B, C, D)</th>
                      <th className="p-3">Correta</th>
                      <th className="p-3">Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedPreview.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-800 max-w-xs truncate">{q.text}</td>
                        <td className="p-3 text-[11px]">
                          <div className="grid grid-cols-2 gap-1">
                            <span className={q.correctAnswerIndex === 0 ? 'text-emerald-600 font-bold' : ''}>A: {q.options[0]}</span>
                            <span className={q.correctAnswerIndex === 1 ? 'text-emerald-600 font-bold' : ''}>B: {q.options[1]}</span>
                            <span className={q.correctAnswerIndex === 2 ? 'text-emerald-600 font-bold' : ''}>C: {q.options[2]}</span>
                            <span className={q.correctAnswerIndex === 3 ? 'text-emerald-600 font-bold' : ''}>D: {q.options[3]}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-emerald-600">
                          {['A', 'B', 'C', 'D'][q.correctAnswerIndex]}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-600">
                            {q.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: QUESTIONS LIST */}
      {activeSubTab === 'questions' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar palavra em pergunta..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">Categoria:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {onDeleteDefaultQuestions && questions.some((q) => q.id.startsWith('sn-csa-')) && (
                <button
                  onClick={onDeleteDefaultQuestions}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Apagar todas as questões simuladas pré-cadastradas no sistema"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                  Apagar Questões Padrão ({questions.filter((q) => q.id.startsWith('sn-csa-')).length})
                </button>
              )}

              {onClearAllQuestions && questions.length > 0 && (
                <button
                  onClick={onClearAllQuestions}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Limpar todo o banco de questões"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  Limpar Banco
                </button>
              )}

              <button
                onClick={() => setIsManualModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 ml-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Question Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="text-base font-bold text-slate-700">Nenhuma questão encontrada</p>
                <p className="text-xs mt-1 text-slate-500">Tente ajustar o filtro de busca ou envie novas questões via planilha Excel.</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all text-slate-900 relative shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        #{idx + 1}
                      </span>
                      <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                        {q.category}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Excluir Questão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mb-4 leading-relaxed">
                    {q.text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          q.correctAnswerIndex === oIdx
                            ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          q.correctAnswerIndex === oIdx ? 'bg-emerald-500 text-slate-900' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {['A', 'B', 'C', 'D'][oIdx]}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200">
                      <strong className="text-slate-800">Explicação:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ATTEMPTS HISTORY */}
      {activeSubTab === 'attempts' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm">
            <h3 className="text-base font-bold mb-4 text-slate-800">Registro de Provas Realizadas por Alunos</h3>
            
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum simulado foi concluído até o momento.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Aluno</th>
                      <th className="p-3">Turma</th>
                      <th className="p-3">Porcentagem</th>
                      <th className="p-3">Acertos</th>
                      <th className="p-3">Tempo</th>
                      <th className="p-3">Data</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="p-3 flex items-center gap-2">
                          <img
                            src={att.studentPicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(att.studentName)}`}
                            alt=""
                            className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{att.studentName}</p>
                            <p className="text-[10px] text-slate-400">{att.studentEmail}</p>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">{att.studentTurma || 'SENAI 103'}</td>
                        <td className="p-3">
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                            att.percentage >= 70
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {att.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{att.score} / {att.totalQuestions}</td>
                        <td className="p-3 font-mono text-slate-500">
                          {Math.floor(att.timeSeconds / 60)}m {att.timeSeconds % 60}s
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(att.completedAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedAttempt(att)}
                            className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL QUESTION MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Plus className="w-5 h-5 text-emerald-600" />
              Cadastrar Nova Questão ServiceNow
            </h3>

            <form onSubmit={handleCreateManualQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Enunciado da Pergunta
                </label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ex: Qual é a tabela pai para incidentes no ServiceNow?"
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opção A</label>
                  <input
                    type="text"
                    value={newOptA}
                    onChange={(e) => setNewOptA(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opção B</label>
                  <input
                    type="text"
                    value={newOptB}
                    onChange={(e) => setNewOptB(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opção C</label>
                  <input
                    type="text"
                    value={newOptC}
                    onChange={(e) => setNewOptC(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opção D</label>
                  <input
                    type="text"
                    value={newOptD}
                    onChange={(e) => setNewOptD(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resposta Correta</label>
                  <select
                    value={newCorrectIdx}
                    onChange={(e) => setNewCorrectIdx(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={0}>Opção A</option>
                    <option value={1}>Opção B</option>
                    <option value={2}>Opção C</option>
                    <option value={3}>Opção D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria / Módulo</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ex: CMDB, Update Sets, ACL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Explicação / Comentário (Opcional)</label>
                <textarea
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Por que esta resposta está correta..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-md text-xs"
                >
                  Salvar Questão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT ATTEMPT DETAIL MODAL */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAttempt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800">Detalhes da Prova do Aluno</h3>
              <p className="text-xs text-slate-500">
                {selectedAttempt.studentName} ({selectedAttempt.studentEmail}) — {new Date(selectedAttempt.completedAt).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Porcentagem</p>
                <p className="text-xl font-bold text-emerald-600">{selectedAttempt.percentage.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nota</p>
                <p className="text-xl font-bold text-slate-800">{selectedAttempt.score} / {selectedAttempt.totalQuestions}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tempo</p>
                <p className="text-xl font-bold text-slate-600">{Math.floor(selectedAttempt.timeSeconds / 60)}m {selectedAttempt.timeSeconds % 60}s</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedAttempt.answers?.map((ans, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs ${
                  ans.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className="font-semibold text-slate-800 mb-1">
                    {idx + 1}. {ans.questionText}
                  </p>
                  <p className="text-slate-600">
                    Resposta marcada: <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                      {ans.options?.[ans.userAnswerIndex] || 'Não respondida'}
                    </strong>
                  </p>
                  {!ans.isCorrect && (
                    <p className="text-emerald-700 mt-0.5">
                      Resposta correta: <strong>{ans.options?.[ans.correctAnswerIndex]}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
