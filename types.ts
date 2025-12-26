
export enum AppStep {
  HOME = 'HOME',
  CLIENT_INFO = 'CLIENT_INFO',
  CLIENT_REGISTRATION = 'CLIENT_REGISTRATION',
  DIAGNOSTIC = 'DIAGNOSTIC',
  REVIEW = 'REVIEW',
  REPORT = 'REPORT'
}

export type DashboardView = 
  | 'DASHBOARD_MAIN'
  | 'DIAG_LIST'
  | 'CLIENT_LIST'
  | 'CLIENT_PROJECTS'
  | 'CRM_PIPELINE'
  | 'CRM_PROPOSALS'
  | 'FINANCEIRO'
  | 'KPIS'
  | 'USERS'
  | 'HELP'
  | 'MANUALS';

export interface Question {
  id: string;
  areaId: string;
  enunciado: string;
  label: string; // Novo campo para o eixo do gráfico radar
  opcoes: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  sugestoes: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface Area {
  id: string;
  name: string;
  icon: string;
}

export interface Response {
  score: number;
  observation: string;
  actionPlan: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}

export interface ClientInfo {
  id?: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  responsavel: string;
  entrevistado: string;
  email: string;
  whatsapp: string;
  data: string;
  faturamentoMensal: string;
  faturamentoAnual: string;
  mercado: string;
  nicho: string;
  segmento: string;
  quantidadeFuncionarios: string;
  estruturaOrganizacional: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefoneFixo?: string;
  site?: string;
  instagram?: string;
  linkedin?: string;
  dataFundacao?: string;
  inscricaoEstadual?: string;
}

export interface ClientDB {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  email: string;
  whatsapp: string;
  responsavel: string;
  created_at: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone_fixo?: string;
  site?: string;
  instagram?: string;
  linkedin?: string;
  data_fundacao?: string;
  inscricao_estadual?: string;
  faturamento_mensal?: string;
  faturamento_anual?: string;
  quantidade_funcionarios?: string;
  segmento?: string;
  nicho?: string;
  estrutura_organizacional?: string;
}

export interface LeadDB {
  id: string;
  nome_cliente: string;
  status: string;
  valor_estimado: number;
  created_at: string;
}

export interface DiagnosticState {
  id: string;
  client_id?: string;
  clientInfo: ClientInfo;
  responses: Record<string, Response>;
  status?: 'Iniciado' | 'Finalizado';
}

export interface PriorityAnalysis {
  areaId: string;
  areaName: string;
  message: string;
  type: 'RISCO' | 'TRACAO' | 'EFICIENCIA';
}

export interface StrategicReport {
  sumarioExecutivo: string;
  swot: {
    forcas: string[];
    fraquezas: string[];
    oportunidades: string[];
    ameacas: string[];
  };
  ishikawa: {
    categoria: string;
    causa: string;
  }[];
  plano5W2H: {
    oQue: string;
    porQue: string;
    quem: string;
    onde: string;
    quando: string;
    como: string;
    quanto: string;
  }[];
  pdca: {
    fase: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
    descricao: string;
  }[];
}

export interface DashboardStats {
  activeClients: number;
  totalContractsValue: number;
  diagnosticsPerformed: number;
  proposalsSent: number;
  conversionRate: number;
}
