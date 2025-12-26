
import React, { useState, useMemo, useEffect } from 'react';
import Icon from './Icons';
import { getDiagnostics, getDashboardStats, getClients, getLeads } from '../services/supabase';
import { DashboardStats, ClientDB, LeadDB } from '../types';

interface DashboardProps {
  onStartNew: () => void;
  onViewDiagnostic?: (diagnostic: any) => void;
}

type Tab = 'DIAGNOSTICOS' | 'CLIENTES' | 'CRM';

const Dashboard: React.FC<DashboardProps> = ({ onStartNew, onViewDiagnostic }) => {
  const [activeTab, setActiveTab] = useState<Tab>('DIAGNOSTICOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [clients, setClients] = useState<ClientDB[]>([]);
  const [leads, setLeads] = useState<LeadDB[]>([]);
  const [realStats, setRealStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<{ code: string; message: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [diagRes, statRes, clientRes, leadRes] = await Promise.all([
        getDiagnostics(),
        getDashboardStats(),
        getClients(),
        getLeads()
      ]);

      if (diagRes.error) setErrorState({ code: diagRes.error.code, message: diagRes.error.message });
      
      setDiagnostics(diagRes.data || []);
      setRealStats(statRes.data);
      setClients(clientRes.data || []);
      setLeads(leadRes.data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayStats = useMemo(() => {
    const defaultStats = [
      { label: 'Clientes Ativos', value: '0', icon: 'Users', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Contratos Ativos', value: 'R$ 0,00', icon: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Diagnósticos Realizados', value: '0', icon: 'ClipboardCheck', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Propostas Enviadas', value: '0', icon: 'Send', color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Taxa de Conversão', value: '0%', icon: 'Zap', color: 'text-rose-600', bg: 'bg-rose-50' },
    ];
    if (!realStats) return defaultStats;
    return [
      { label: 'Clientes Ativos', value: realStats.activeClients.toString(), icon: 'Users', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Contratos Ativos', value: `R$ ${realStats.totalContractsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Diagnósticos Realizados', value: realStats.diagnosticsPerformed.toString(), icon: 'ClipboardCheck', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Propostas Enviadas', value: realStats.proposalsSent.toString(), icon: 'Send', color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Taxa de Conversão', value: `${Math.round(realStats.conversionRate)}%`, icon: 'Zap', color: 'text-rose-600', bg: 'bg-rose-50' },
    ];
  }, [realStats]);

  const filteredData = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (activeTab === 'DIAGNOSTICOS') return diagnostics.filter(d => (d.client_info?.nomeFantasia || '').toLowerCase().includes(s));
    if (activeTab === 'CLIENTES') return clients.filter(c => (c.nome_fantasia || '').toLowerCase().includes(s) || (c.cnpj || '').includes(s));
    if (activeTab === 'CRM') return leads.filter(l => (l.nome_cliente || '').toLowerCase().includes(s));
    return [];
  }, [searchTerm, activeTab, diagnostics, clients, leads]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden lg:flex border-r border-slate-800 shadow-2xl shrink-0">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
            <Icon name="Target" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight">EFRAIM <span className="text-blue-400">360º</span></span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Menu de Gestão</p>
          <button 
            onClick={() => setActiveTab('DIAGNOSTICOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${activeTab === 'DIAGNOSTICOS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Icon name="ClipboardCheck" size={18} /> Diagnósticos
          </button>
          <button 
            onClick={() => setActiveTab('CLIENTES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${activeTab === 'CLIENTES' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Icon name="Users" size={18} /> Clientes
          </button>
          <button 
            onClick={() => setActiveTab('CRM')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${activeTab === 'CRM' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Icon name="Zap" size={18} /> Funil CRM
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Efraim Gestão Inteligente</h1>
            <p className="text-sm text-slate-500 font-medium">{activeTab === 'DIAGNOSTICOS' ? 'Histórico de Consultoria' : activeTab === 'CLIENTES' ? 'Base de Clientes Ativos' : 'Gestão Comercial'}</p>
          </div>
          <button onClick={onStartNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
            <Icon name="Plus" size={20} /> Novo Diagnóstico
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
            {displayStats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon name={stat.icon} size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* LIST SECTION */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-10">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:justify-between md:items-center bg-slate-50/50 gap-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                {activeTab === 'DIAGNOSTICOS' ? 'Relatórios de Maturidade' : activeTab === 'CLIENTES' ? 'Lista de Clientes' : 'Pipeline Comercial'}
              </h3>
              <div className="relative flex-1 max-w-md">
                <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Buscar em ${activeTab.toLowerCase()}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest tracking-tighter">Sincronizando Banco de Dados...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/30 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {activeTab === 'DIAGNOSTICOS' && (
                      <tr>
                        <th className="px-8 py-5">Empresa / CNPJ</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Atualização</th>
                        <th className="px-8 py-5 text-center">Ação</th>
                      </tr>
                    )}
                    {activeTab === 'CLIENTES' && (
                      <tr>
                        <th className="px-8 py-5">Nome Fantasia</th>
                        <th className="px-8 py-5">Razão Social</th>
                        <th className="px-8 py-5">CNPJ</th>
                        <th className="px-8 py-5">Responsável</th>
                      </tr>
                    )}
                    {activeTab === 'CRM' && (
                      <tr>
                        <th className="px-8 py-5">Lead / Cliente</th>
                        <th className="px-8 py-5">Status Comercial</th>
                        <th className="px-8 py-5">Valor Estimado</th>
                        <th className="px-8 py-5">Data</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50">
                    {activeTab === 'DIAGNOSTICOS' && filteredData.map((row: any, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-800">{row.client_info?.nomeFantasia || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400">{row.client_info?.cnpj || 'S/ CNPJ'}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-bold text-[11px]">{new Date(row.updated_at).toLocaleDateString()}</td>
                        <td className="px-8 py-5 text-center">
                          <button onClick={() => onViewDiagnostic?.(row)} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Ver Detalhes</button>
                        </td>
                      </tr>
                    ))}
                    {activeTab === 'CLIENTES' && filteredData.map((client: any, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-8 py-5 font-black text-slate-800">{client.nome_fantasia}</td>
                        <td className="px-8 py-5 text-slate-500">{client.razao_social}</td>
                        <td className="px-8 py-5 font-mono text-[11px] text-slate-400">{client.cnpj}</td>
                        <td className="px-8 py-5 font-bold text-slate-600">{client.responsavel}</td>
                      </tr>
                    ))}
                    {activeTab === 'CRM' && filteredData.map((lead: any, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-8 py-5 font-black text-slate-800">{lead.nome_cliente}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            lead.status === 'Ganhos' ? 'bg-emerald-100 text-emerald-700' : 
                            lead.status === 'Perdido' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-black text-slate-700">R$ {Number(lead.valor_estimado).toLocaleString('pt-BR')}</td>
                        <td className="px-8 py-5 text-slate-400 text-[11px]">{new Date(lead.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">Nenhum registro encontrado nesta aba.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
