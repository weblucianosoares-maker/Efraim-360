
import React, { useState, useMemo, useEffect } from 'react';
import Icon from './Icons';
import { getDiagnostics, getDashboardStats, getClients, getLeads, updateLeadStatus } from '../services/supabase';
import { DashboardStats, ClientDB, LeadDB, DashboardView } from '../types';

interface DashboardProps {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  onViewDiagnostic?: (diagnostic: any) => void;
  onNewDiagnosticForClient?: (client: ClientDB) => void;
  onEditClient?: (client: ClientDB) => void;
  onAddNewClient?: () => void;
  selectedClientId?: string | null;
  setSelectedClientId: (id: string | null) => void;
}

// Etapas do Funil PipeRun-Style
const CRM_STAGES = [
  { id: 'Prospecção', name: 'Prospecção', color: 'border-slate-300 bg-slate-50', text: 'text-slate-600' },
  { id: 'Qualificação', name: 'Qualificação', color: 'border-blue-300 bg-blue-50', text: 'text-blue-600' },
  { id: 'Diagnóstico 360º', name: 'Diagnóstico 360º', color: 'border-indigo-300 bg-indigo-50', text: 'text-indigo-600' },
  { id: 'Proposta Enviada', name: 'Proposta', color: 'border-amber-300 bg-amber-50', text: 'text-amber-600' },
  { id: 'Negociação', name: 'Negociação', color: 'border-purple-300 bg-purple-50', text: 'text-purple-600' },
  { id: 'Ganhos', name: 'Ganhos', color: 'border-emerald-300 bg-emerald-50', text: 'text-emerald-600' },
  { id: 'Perdido', name: 'Perdido', color: 'border-red-300 bg-red-50', text: 'text-red-600' }
];

const Dashboard: React.FC<DashboardProps> = ({ 
  activeView, 
  setActiveView, 
  onViewDiagnostic, 
  onNewDiagnosticForClient,
  onEditClient,
  onAddNewClient,
  selectedClientId,
  setSelectedClientId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [crmViewMode, setCrmViewMode] = useState<'kanban' | 'list'>('kanban');
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [clients, setClients] = useState<ClientDB[]>([]);
  const [leads, setLeads] = useState<LeadDB[]>([]);
  const [realStats, setRealStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const selectedClientData = useMemo(() => 
    clients.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [diagRes, statRes, clientRes, leadRes] = await Promise.all([
        getDiagnostics(selectedClientId || undefined),
        getDashboardStats(),
        getClients(),
        getLeads()
      ]);
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
  }, [activeView, selectedClientId]);

  const stats = useMemo(() => [
    { label: 'Clientes Ativos', value: realStats?.activeClients || 0, icon: 'Users', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Faturamento Contratos', value: `R$ ${(realStats?.totalContractsValue || 0).toLocaleString('pt-BR')}`, icon: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Diagnósticos', value: realStats?.diagnosticsPerformed || 0, icon: 'ClipboardCheck', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Propostas (CRM)', value: realStats?.proposalsSent || 0, icon: 'Zap', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Taxa Conversão', value: `${Math.round(realStats?.conversionRate || 0)}%`, icon: 'TrendingUp', color: 'text-rose-600', bg: 'bg-rose-50' },
  ], [realStats]);

  const ActionButton = ({ icon, label, onClick, colorClass = "text-slate-400 hover:text-blue-600" }: { icon: string, label: string, onClick: () => void, colorClass?: string }) => (
    <div className="relative group/btn inline-block">
      <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`p-2 rounded-xl hover:bg-white transition-all ${colorClass}`}
      >
        <Icon name={icon} size={16} />
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    const updatedLeads = leads.map(l => l.id === draggedLeadId ? { ...l, status: newStatus } : l);
    setLeads(updatedLeads);
    try {
      await updateLeadStatus(draggedLeadId, newStatus);
    } catch (err) {
      console.error("Erro ao mover lead:", err);
      fetchData();
    } finally {
      setDraggedLeadId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processando Inteligência Efraim...</p>
      </div>
    );

    switch (activeView) {
      case 'CRM_PIPELINE':
        return (
          <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header do CRM com Toggle de View */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Pipeline Comercial</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluxo de Oportunidades Efraim</p>
                   </div>
                   
                   <div className="bg-slate-50 p-1 rounded-xl flex gap-1 border border-slate-100">
                      <button 
                        onClick={() => setCrmViewMode('kanban')}
                        className={`p-2.5 rounded-lg transition-all ${crmViewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Icon name="LayoutGrid" size={18} />
                      </button>
                      <button 
                        onClick={() => setCrmViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all ${crmViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Icon name="List" size={18} />
                      </button>
                   </div>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95">
                   <Icon name="Plus" size={20} /> Novo Negócio
                </button>
            </div>

            {crmViewMode === 'kanban' ? (
              /* KANBAN VIEW */
              <div className="flex gap-4 overflow-x-auto pb-8 min-h-[70vh] scrollbar-hide">
                {CRM_STAGES.map(stage => {
                  const stageLeads = leads.filter(l => l.status === stage.id);
                  const totalValue = stageLeads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);
                  return (
                    <div 
                      key={stage.id} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, stage.id)}
                      className={`flex-shrink-0 w-80 rounded-[2rem] border-2 ${stage.color} flex flex-col p-4 transition-all duration-300`}
                    >
                      <div className="mb-6 px-2">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-[11px] uppercase tracking-widest text-slate-900">{stage.name}</h4>
                            <span className="bg-white/80 px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-500 shadow-sm">{stageLeads.length}</span>
                         </div>
                         <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">Total na Etapa</p>
                            <p className="text-sm font-black text-slate-900">R$ {totalValue.toLocaleString('pt-BR')}</p>
                         </div>
                      </div>

                      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
                        {stageLeads.map(lead => (
                          <div 
                            key={lead.id} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-xl hover:scale-[1.02] cursor-move transition-all active:rotate-2 relative overflow-hidden"
                          >
                            <div className={`absolute top-0 left-0 w-1 h-full ${Number(lead.valor_estimado) > 50000 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                            <p className="font-black text-slate-800 text-sm mb-1 leading-tight group-hover:text-blue-600 transition-colors">{lead.nome_cliente}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-4">Negócio #{lead.id.split('-')[0]}</p>
                            <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-3">
                               <div>
                                  <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Valor Estimado</p>
                                  <p className="text-sm font-black text-slate-900">R$ {Number(lead.valor_estimado).toLocaleString('pt-BR')}</p>
                               </div>
                               <Icon name="User" size={14} className="text-slate-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-6">
                {CRM_STAGES.map(stage => {
                  const stageLeads = leads.filter(l => l.status === stage.id);
                  if (stageLeads.length === 0) return null;
                  const totalValue = stageLeads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);
                  
                  return (
                    <div key={stage.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                      <div className={`p-6 border-b border-slate-50 flex justify-between items-center ${stage.color.replace('border-', 'bg-opacity-10 bg-')}`}>
                        <div className="flex items-center gap-4">
                           <h4 className={`font-black text-sm uppercase tracking-widest ${stage.text}`}>{stage.name}</h4>
                           <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 shadow-sm border border-slate-100">{stageLeads.length} leads</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total da Etapa</p>
                           <p className="text-base font-black text-slate-900">R$ {totalValue.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-50">
                            {stageLeads.map(lead => (
                              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                   <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{lead.nome_cliente}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Lead ID: #{lead.id.split('-')[0]}</p>
                                </td>
                                <td className="px-8 py-5">
                                   <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Criado em</p>
                                   <p className="text-xs font-bold text-slate-600">{new Date(lead.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Valor do Contrato</p>
                                   <p className="text-sm font-black text-slate-900">R$ {Number(lead.valor_estimado).toLocaleString('pt-BR')}</p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <ActionButton icon="Settings" label="Gerenciar" onClick={() => {}} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'DASHBOARD_MAIN':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon name={stat.icon} size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Diagnósticos Recentes</h3>
                <button onClick={() => { setSelectedClientId(null); setActiveView('DIAG_LIST'); }} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Ver Todos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/20 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <tr>
                      <th className="px-8 py-5">Empresa</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Data</th>
                      <th className="px-8 py-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50">
                    {diagnostics.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-800">{row.client_info?.nomeFantasia}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{row.client_info?.cnpj}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-bold">{new Date(row.updated_at).toLocaleDateString()}</td>
                        <td className="px-8 py-5 text-right">
                          <ActionButton icon="ExternalLink" label="Ver Relatório" onClick={() => onViewDiagnostic?.(row)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'DIAG_LIST':
        return (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex flex-col">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Histórico de Diagnósticos</h3>
                   {selectedClientId && selectedClientData && (
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                       <Icon name="Filter" size={10} /> Filtrando por: {selectedClientData.nome_fantasia}
                       <button onClick={() => setSelectedClientId(null)} className="ml-2 text-slate-400 hover:text-red-500">(Limpar Filtro)</button>
                     </p>
                   )}
                </div>
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                  />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/20 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <tr>
                      <th className="px-8 py-5">Empresa</th>
                      <th className="px-8 py-5">CNPJ</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Última Atualização</th>
                      <th className="px-8 py-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50">
                    {diagnostics.filter(d => (d.client_info?.nomeFantasia || '').toLowerCase().includes(searchTerm.toLowerCase())).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 font-black text-slate-800">{row.client_info?.nomeFantasia}</td>
                        <td className="px-8 py-5 font-mono text-slate-400 font-bold">{row.client_info?.cnpj}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-bold">{new Date(row.updated_at).toLocaleString()}</td>
                        <td className="px-8 py-5 text-right">
                           <ActionButton icon="FileText" label="Ver Relatório" onClick={() => onViewDiagnostic?.(row)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        );

      case 'CLIENT_LIST':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg overflow-hidden mb-10">
                <div className="p-10 flex flex-col lg:flex-row gap-8 justify-between items-center bg-gradient-to-br from-slate-50 to-white">
                   <div className="text-center lg:text-left">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Base de Clientes</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Gestão Inteligente de Portfólio Efraim</p>
                   </div>
                   <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      <div className="relative w-full sm:w-80">
                        <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Pesquisar por nome ou CNPJ..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/10 w-full transition-all shadow-sm"
                        />
                      </div>
                      <button 
                        onClick={onAddNewClient}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all active:scale-95 group"
                      >
                        <Icon name="UserPlus" size={20} className="group-hover:scale-110 transition-transform" />
                        NOVO CLIENTE
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                       <tr>
                         <th className="px-8 py-6">Nome Fantasia</th>
                         <th className="px-8 py-6">CNPJ</th>
                         <th className="px-8 py-6">Responsável</th>
                         <th className="px-8 py-6 text-right">Ações</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm divide-y divide-slate-50">
                       {clients.filter(c => 
                         c.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.cnpj.includes(searchTerm)
                       ).map((client, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-8 py-6">
                              <p className="font-black text-slate-800">{client.nome_fantasia}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{client.razao_social}</p>
                           </td>
                           <td className="px-8 py-6 font-mono text-slate-400 font-bold">{client.cnpj}</td>
                           <td className="px-8 py-6 font-bold text-slate-600">{client.responsavel}</td>
                           <td className="px-8 py-6 text-right space-x-1">
                             <ActionButton icon="UserCog" label="Editar Cadastro" onClick={() => onEditClient?.(client)} />
                             <ActionButton icon="History" label="Diagnósticos" onClick={() => { setSelectedClientId(client.id); setActiveView('DIAG_LIST'); }} />
                             <ActionButton icon="PlusCircle" label="Novo Diagnóstico" colorClass="text-emerald-500 hover:text-emerald-700" onClick={() => onNewDiagnosticForClient?.(client)} />
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className="p-20 text-center bg-white border border-slate-100 rounded-[2rem]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Icon name="Settings" size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Seção em Construção</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-widest text-[10px]">ROADMAP EFRAIM 2024</p>
          </div>
        );
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto h-full flex flex-col">
      {renderContent()}
    </div>
  );
};

export default Dashboard;
