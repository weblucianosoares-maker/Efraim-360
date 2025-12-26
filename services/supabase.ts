
import { createClient } from '@supabase/supabase-js';
import { DashboardStats, ClientDB, LeadDB } from '../types';

const SUPABASE_URL = 'https://rxxoefxeevywqzruczib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9Cr5afNf0_AU7no-J0ok8Q_ahr3MY77';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const upsertClient = async (clientInfo: any) => {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .upsert({
      cnpj: clientInfo.cnpj,
      nome_fantasia: clientInfo.nomeFantasia,
      razao_social: clientInfo.razaoSocial,
      email: clientInfo.email || '',
      whatsapp: clientInfo.whatsapp || '',
      responsavel: clientInfo.responsavel,
      logradouro: clientInfo.logradouro || null,
      numero: clientInfo.numero || null,
      bairro: clientInfo.bairro || null,
      cidade: clientInfo.cidade || null,
      uf: clientInfo.uf || null,
      cep: clientInfo.cep || null,
      telefone_fixo: clientInfo.telefoneFixo || null,
      site: clientInfo.site || null,
      instagram: clientInfo.instagram || null,
      linkedin: clientInfo.linkedin || null,
      data_fundacao: clientInfo.dataFundacao || null,
      inscricao_estadual: clientInfo.inscricaoEstadual || null,
      faturamento_mensal: clientInfo.faturamentoMensal || null,
      faturamento_anual: clientInfo.faturamentoAnual || null,
      quantidade_funcionarios: clientInfo.quantidadeFuncionarios || null,
      segmento: clientInfo.segmento || null,
      nicho: clientInfo.nicho || null,
      estrutura_organizacional: clientInfo.estruturaOrganizacional || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cnpj' })
    .select()
    .single();

  if (clientError) {
    console.error("Erro ao salvar cliente:", clientError);
    throw new Error(`Erro ao salvar cliente: ${clientError.message}`);
  }
  return client;
};

export const saveDiagnostic = async (diagnosticData: any) => {
  const client = await upsertClient(diagnosticData.clientInfo);
  const { data, error } = await supabase
    .from('diagnostics')
    .upsert({
      id: diagnosticData.id,
      client_id: client?.id || null,
      client_info: diagnosticData.clientInfo,
      responses: diagnosticData.responses,
      status: diagnosticData.status || 'Iniciado',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error("Erro ao salvar diagnóstico:", error);
    throw new Error(`[${error.code}] ${error.message}`);
  }
  return data;
};

export const updateLeadStatus = async (leadId: string, newStatus: string) => {
  const { data, error } = await supabase
    .from('leads')
    .update({ status: newStatus })
    .eq('id', leadId)
    .select();
  
  if (error) throw error;
  return data;
};

export const getDiagnostics = async (clientId?: string) => {
  let query = supabase
    .from('diagnostics')
    .select('*, clients(*)')
    .order('updated_at', { ascending: false });
  
  if (clientId) {
    query = query.eq('client_id', clientId);
  }
    
  const { data, error } = await query;
  return { data: data || [], error };
};

export const getClients = async (): Promise<{ data: ClientDB[], error: any }> => {
  const { data, error } = await supabase.from('clients').select('*').order('nome_fantasia');
  return { data: data || [], error };
};

export const getLeads = async (): Promise<{ data: LeadDB[], error: any }> => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  return { data: data || [], error };
};

export const getDashboardStats = async (): Promise<{ data: DashboardStats | null, error: any }> => {
  try {
    const { count: activeClients } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    const { data: contracts } = await supabase.from('contracts').select('valor').eq('status', 'Ativo');
    const totalContractsValue = contracts?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
    const { count: diagCount } = await supabase.from('diagnostics').select('*', { count: 'exact', head: true }).eq('status', 'Finalizado');
    const { data: leads } = await supabase.from('leads').select('status');
    
    const proposalsSent = leads?.length || 0;
    const wins = leads?.filter(l => l.status === 'Ganhos').length || 0;
    const conversionRate = proposalsSent > 0 ? (wins / proposalsSent) * 100 : 0;

    return {
      data: { activeClients: activeClients || 0, totalContractsValue, diagnosticsPerformed: diagCount || 0, proposalsSent, conversionRate },
      error: null
    };
  } catch (e) {
    return { data: null, error: e };
  }
};
