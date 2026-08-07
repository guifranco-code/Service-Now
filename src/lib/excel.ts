import * as XLSX from 'xlsx';
import { Question, ExcelQuestionRow } from '../types';

export function parseExcelQuestions(file: File): Promise<{ questions: Question[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = XLSX.utils.sheet_to_json<ExcelQuestionRow>(worksheet, { defval: '' });

        const parsedQuestions: Question[] = [];
        const errors: string[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2; // Row 1 is header

          const text = (
            row['Pergunta'] ||
            row['Pergunta / Enunciado'] ||
            row['Question'] ||
            row['Enunciado'] ||
            ''
          ).toString().trim();

          const optA = (row['Opção A'] || row['Opcao A'] || row['Option A'] || row['A'] || '').toString().trim();
          const optB = (row['Opção B'] || row['Opcao B'] || row['Option B'] || row['B'] || '').toString().trim();
          const optC = (row['Opção C'] || row['Opcao C'] || row['Option C'] || row['C'] || '').toString().trim();
          const optD = (row['Opção D'] || row['Opcao D'] || row['Option D'] || row['D'] || '').toString().trim();

          const rawAnswer = (
            row['Resposta Correta'] ||
            row['Resposta'] ||
            row['Correct Answer'] ||
            ''
          ).toString().trim();

          const category = (
            row['Categoria'] ||
            row['Módulo'] ||
            row['Modulo'] ||
            row['Category'] ||
            'Geral'
          ).toString().trim();

          const explanation = (
            row['Explicação'] ||
            row['Explicacao'] ||
            row['Explanation'] ||
            ''
          ).toString().trim();

          if (!text) {
            errors.push(`Linha ${rowNum}: Pergunta em branco, ignorada.`);
            return;
          }

          if (!optA || !optB || !optC || !optD) {
            errors.push(`Linha ${rowNum}: A pergunta "${text.substring(0, 30)}..." deve ter as 4 opções (A, B, C, D).`);
            return;
          }

          // Parse correct answer index
          let correctIndex = -1;
          const upperAns = rawAnswer.toUpperCase();

          if (upperAns === 'A' || upperAns === '0' || upperAns === '1' || upperAns === optA.toUpperCase()) {
            correctIndex = 0;
          } else if (upperAns === 'B' || upperAns === '1' || upperAns === '2' || upperAns === optB.toUpperCase()) {
            correctIndex = 1;
          } else if (upperAns === 'C' || upperAns === '2' || upperAns === '3' || upperAns === optC.toUpperCase()) {
            correctIndex = 2;
          } else if (upperAns === 'D' || upperAns === '3' || upperAns === '4' || upperAns === optD.toUpperCase()) {
            correctIndex = 3;
          }

          if (correctIndex === -1) {
            errors.push(`Linha ${rowNum}: Resposta correta inválida ("${rawAnswer}"). Use A, B, C ou D.`);
            return;
          }

          parsedQuestions.push({
            id: `excel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            text,
            options: [optA, optB, optC, optD],
            correctAnswerIndex: correctIndex,
            category: category || 'CSA - Geral',
            explanation,
            createdAt: new Date().toISOString(),
          });
        });

        resolve({ questions: parsedQuestions, errors });
      } catch (err: any) {
        reject(new Error(`Erro ao ler arquivo Excel: ${err.message || err}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo local.'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      'Pergunta': 'Qual tabela do ServiceNow armazena as contas de todos os usuários do sistema?',
      'Opção A': 'sys_user_group',
      'Opção B': 'sys_user',
      'Opção C': 'cmdb_ci',
      'Opção D': 'task',
      'Resposta Correta': 'B',
      'Categoria': 'Usuários e Permissões',
      'Explicação': 'A tabela sys_user armazena o cadastro principal de usuários do ServiceNow.'
    },
    {
      'Pergunta': 'Qual é a tabela pai (parent table) para Incidentes, Mudanças e Problemas?',
      'Opção A': 'cmdb_ci',
      'Opção B': 'sys_db_object',
      'Opção C': 'task',
      'Opção D': 'sys_dictionary',
      'Resposta Correta': 'C',
      'Categoria': 'Estrutura de Tabelas',
      'Explicação': 'A tabela task é a tabela base estendida por Incident, Change, Problem e Request.'
    },
    {
      'Pergunta': 'Qual ferramenta é utilizada para capturar e migrar customizações entre instâncias ServiceNow?',
      'Opção A': 'Import Sets',
      'Opção B': 'Update Sets',
      'Opção C': 'Transform Maps',
      'Opção D': 'Flow Designer',
      'Resposta Correta': 'B',
      'Categoria': 'Update Sets',
      'Explicação': 'Update Sets empacotam alterações de configuração para transferência entre ambientes.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 55 }, // Pergunta
    { wch: 25 }, // Opção A
    { wch: 25 }, // Opção B
    { wch: 25 }, // Opção C
    { wch: 25 }, // Opção D
    { wch: 18 }, // Resposta Correta
    { wch: 22 }, // Categoria
    { wch: 50 }, // Explicação
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo de Questoes');

  XLSX.writeFile(workbook, 'Modelo_Questoes_ServiceNow_SENAI.xlsx');
}
