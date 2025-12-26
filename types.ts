
export enum AppStep {
  HOME = 'HOME',
  CLIENT_INFO = 'CLIENT_INFO',
  DIAGNOSTIC = 'DIAGNOSTIC',
  REVIEW = 'REVIEW',
  REPORT = 'REPORT'
}

export interface Question {
  id: string;
  areaId: string;
  enunciado: string;
  opcoes: {
    A: string; // 0
    B: string; // 33
    C: string; // 66
    D: string; // 100
  };
  sugestaoPadrao: string;
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
