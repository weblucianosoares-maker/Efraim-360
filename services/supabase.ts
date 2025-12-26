
import { createClient } from '@supabase/supabase-js';
import { DashboardStats, ClientDB, LeadDB } from '../types';

const SUPABASE_URL = 'https://rxxoefxeevywqzruczib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9Cr5afNf0_AU7no-J0ok8Q_ahr3MY77';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveDiagnostic = async (diagnosticData: any) => {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .upsert({
      cnpj: diagnosticData.clientInfo.cnpj,
      nome_fantasia: diagnosticData.clientInfo.nomeFantasia,
      razao_social: diagnosticData.clientInfo.razaoSocial,
      email: diagnosticData.clientInfo.email,
      whatsapp: diagnosticData.clientInfo.whatsapp,
      responsavel: diagnosticData.clientInfo.responsavel,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cnpj' })
    .select()
    .single();

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

  if (error) throw new Error(`[${error.code}] ${error.message}`);
  return data;
};

export const getDiagnostics = async () => {
  const { data, error } = await supabase
    .from('diagnostics')
    .select('*, clients(*)')
    .order('updated_at', { ascending: false });
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
