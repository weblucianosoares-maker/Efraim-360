import React, { useState, useEffect, useRef } from 'react';
import { AppStep, DiagnosticState, DashboardView, ClientDB, ClientInfo } from './types';
import ClientForm from './components/ClientForm';
import DiagnosticWizard from './components/DiagnosticWizard';
import ReportPreview from './components/ReportPreview';
import Dashboard from './components/Dashboard';
import Icon from './components/Icons';
import { saveDiagnostic, upsertClient } from './services/supabase';

const INITIAL_STATE: DiagnosticState = {
  id: Math.random().toString(36).substr(2, 9),
  clientInfo: {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    responsavel: '',
    entrevistado: '',
    email: '',
    whatsapp: '',
    data: new Date().toLocaleDateString('pt-BR'),
    faturamentoMensal: '',
    faturamentoAnual: '',
    mercado: '',
    nicho: '',
    segmento: '',
    quantidadeFuncionarios: '',
    estruturaOrganizacional: '',
    site: '',
    instagram: '',
    linkedin: '',
    cidade: '',
    uf: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cep: '',
    telefoneFixo: '',
    dataFundacao: '',
    inscricaoEstadual: ''
  },
  responses: {}
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.HOME);
  const [dashboardView, setDashboardView] = useState<DashboardView>('DASHBOARD_MAIN');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['DIAGNOSTICO', 'CLIENTES', 'CRM']);
  const [state, setState] = useState<DiagnosticState>(INITIAL_STATE);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnlyEditingClient, setIsOnlyEditingClient] = useState(false);

  // Ref para evitar loops infinitos ou salvamentos desnecessários
  const lastSavedStateRef = useRef<string>("");

  // Função utilitária para mapear dados do banco para o estado do formulário
  const mapDbToClientInfo = (db: ClientDB, entrevistadoDefault = ''): ClientInfo => ({
    id: db.id,
    razaoSocial: db.razao_social || '',
    nomeFantasia: db.nome_fantasia || '',
    cnpj: db.cnpj || '',
    responsavel: db.responsavel || '',
    email: db.email || '',
    whatsapp: db.whatsapp || '',
    logradouro: db.logradouro || '',
    numero: db.numero || '',
    bairro: db.bairro || '',
    cidade: db.cidade || '',
    uf: db.uf || '',
    cep: db.cep || '',
    telefoneFixo: db.telefone_fixo || '',
    site: db.site || '',
    instagram: db.instagram || '',
    linkedin: db.linkedin || '',
    dataFundacao: db.data_fundacao || '',
    // Fix: Corrected property name from inscricao_estadual to inscricaoEstadual to match ClientInfo interface
    inscricaoEstadual: db.inscricao_estadual || '',
    faturamentoMensal: db.faturamento_mensal || '',
    faturamentoAnual: db.faturamento_anual || '',
    quantidadeFuncionarios: db.quantidade_funcionarios || '',
    segmento: db.segmento || '',
    nicho: db.nicho || '',
    estruturaOrganizacional: db.estrutura_organizacional || '',
    entrevistado: entrevistadoDefault,
    data: new Date().toLocaleDateString('pt-BR'),
    mercado: ''
  });

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
  };

  const handleFinishDiagnostic = async () => {
    setIsSaving(true);
    try {
      await saveDiagnostic({
        ...state,
        status: 'Finalizado'
      });
      setStep(AppStep.REPORT);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      alert(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Função de Salvamento Automático (Draft)
  const triggerAutoSave = async () => {
    if (step !== AppStep.DIAGNOSTIC) return;
    
    const currentStateStr = JSON.stringify(state.responses);
    if (currentStateStr === lastSavedStateRef.current) return;

    try {
      await saveDiagnostic({
        ...state,
        status: 'Iniciado'
      });
      lastSavedStateRef.current = currentStateStr;
      console.log('Draft salvo automaticamente...');
    } catch (err) {
      console.warn('Falha no auto-save silencioso:', err);
    }
  };

  // Efeito de auto-save ao mudar respostas
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerAutoSave();
    }, 2000); // Debounce de 2 segundos para não sobrecarregar o banco

    return () => clearTimeout(timer);
  }, [state.responses]);

  const handleClientInfoSubmit = async () => {
    setIsSaving(true);
    try {
      const client = await upsertClient(state.clientInfo);
      const updatedClientInfo = mapDbToClientInfo(client, state.clientInfo.entrevistado);

      if (isOnlyEditingClient || step === AppStep.CLIENT_REGISTRATION) {
        setDashboardView('CLIENT_LIST');
        setStep(AppStep.HOME);
        setIsOnlyEditingClient(false);
      } else {
        setState(prev => ({ 
          ...prev, 
          client_id: client.id,
          clientInfo: updatedClientInfo
        }));
        setStep(AppStep.DIAGNOSTIC);
      }
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      alert(`Erro ao salvar cliente: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDiagnostic = (diagnostic: any) => {
    setState({
      id: diagnostic.id,
      client_id: diagnostic.client_id,
      clientInfo: diagnostic.client_info,
      responses: diagnostic.responses
    });
    // Se o diagnóstico já estiver finalizado, vai pro relatório, senão volta pro wizard
    if (diagnostic.status === 'Finalizado') {
      setStep(AppStep.REPORT);
    } else {
      setStep(AppStep.DIAGNOSTIC);
    }
  };

  const startNewDiagnostic = () => {
    setIsOnlyEditingClient(false);
    setState({
      ...INITIAL_STATE,
      id: Math.random().toString(36).substr(2, 9)
    });
    setStep(AppStep.CLIENT_INFO);
  };

  const startAddNewClient = () => {
    setIsOnlyEditingClient(false);
    setState({
      ...INITIAL_STATE,
      clientInfo: { ...INITIAL_STATE.clientInfo, entrevistado: '(Cadastro Direto)' },
      id: 'reg-' + Math.random().toString(36).substr(2, 5)
    });
    setStep(AppStep.CLIENT_REGISTRATION);
  };

  const startDiagnosticForClient = (client: ClientDB) => {
    setIsOnlyEditingClient(false);
    setState({
      id: Math.random().toString(36).substr(2, 9),
      client_id: client.id,
      clientInfo: mapDbToClientInfo(client, ''),
      responses: {}
    });
    setStep(AppStep.CLIENT_INFO);
  };

  const editClientProfile = (client: ClientDB) => {
    setIsOnlyEditingClient(true);
    setState({
      ...state,
      clientInfo: mapDbToClientInfo(client, '(Edição de Cadastro)')
    });
    setStep(AppStep.CLIENT_REGISTRATION);
  };

  const renderContent = () => {
    switch (step) {
      case AppStep.HOME:
        return (
          <Dashboard 
            activeView={dashboardView}
            setActiveView={setDashboardView}
            onViewDiagnostic={handleLoadDiagnostic}
            onNewDiagnosticForClient={startDiagnosticForClient}
            onEditClient={editClientProfile}
            onAddNewClient={startAddNewClient}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
          />
        );
      case AppStep.CLIENT_INFO:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientForm 
              data={state.clientInfo} 
              onChange={(info) => setState(s => ({ ...s, clientInfo: info }))}
              onNext={handleClientInfoSubmit}
            />
          </div>
        );
      case AppStep.CLIENT_REGISTRATION:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientForm 
              data={state.clientInfo} 
              isRegistrationOnly
              onChange={(info) => setState(s => ({ ...s, clientInfo: info }))}
              onNext={handleClientInfoSubmit}
            />
          </div>
        );
      case AppStep.DIAGNOSTIC:
        return (
          <div className="animate-in fade-in duration-500 h-full">
            <DiagnosticWizard 
              state={state}
              setState={setState}
              onFinish={handleFinishDiagnostic}
              onAutoSave={triggerAutoSave}
            />
          </div>
        );
      case AppStep.REPORT:
        return (
          <div className="animate-in zoom-in-95 duration-500">
            <ReportPreview 
              state={state}
              onEdit={() => setStep(AppStep.DIAGNOSTIC)}
              onHome={() => { setStep(AppStep.HOME); setDashboardView('DASHBOARD_MAIN'); }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR GLOBAL */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden lg:flex border-r border-slate-800 shadow-2xl shrink-0 z-40">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
            <Icon name="Target" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-white">EFRAIM <span className="text-blue-400">360º</span></span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 py-8 space-y-2">
          <button 
            onClick={() => { setStep(AppStep.HOME); setDashboardView('DASHBOARD_MAIN'); setSelectedClientId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${step === AppStep.HOME && dashboardView === 'DASHBOARD_MAIN' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Icon name="LayoutDashboard" size={18} /> Dashboard
          </button>

          {/* Diagnóstico */}
          <div>
            <button 
              onClick={() => toggleMenu('DIAGNOSTICO')}
              className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="ClipboardCheck" size={18} /> Diagnóstico
              </div>
              <Icon name={expandedMenus.includes('DIAGNOSTICO') ? 'ChevronDown' : 'ChevronRight'} size={14} />
            </button>
            {expandedMenus.includes('DIAGNOSTICO') && (
              <div className="ml-8 mt-1 space-y-1">
                <button 
                  onClick={startNewDiagnostic}
                  className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors uppercase tracking-tight flex items-center gap-2 ${step === AppStep.CLIENT_INFO || step === AppStep.DIAGNOSTIC ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${step === AppStep.CLIENT_INFO || step === AppStep.DIAGNOSTIC ? 'bg-blue-400' : 'bg-slate-700'}`}></div> Novo Diagnóstico
                </button>
                <button 
                  onClick={() => { setStep(AppStep.HOME); setDashboardView('DIAG_LIST'); setSelectedClientId(null); }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors uppercase tracking-tight flex items-center gap-2 ${dashboardView === 'DIAG_LIST' && step === AppStep.HOME ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${dashboardView === 'DIAG_LIST' && step === AppStep.HOME ? 'bg-blue-400' : 'bg-slate-700'}`}></div> Realizados
                </button>
              </div>
            )}
          </div>

          {/* Clientes */}
          <div>
            <button 
              onClick={() => toggleMenu('CLIENTES')}
              className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="Users" size={18} /> Clientes
              </div>
              <Icon name={expandedMenus.includes('CLIENTES') ? 'ChevronDown' : 'ChevronRight'} size={14} />
            </button>
            {expandedMenus.includes('CLIENTES') && (
              <div className="ml-8 mt-1 space-y-1">
                <button 
                  onClick={() => { setStep(AppStep.HOME); setDashboardView('CLIENT_LIST'); setSelectedClientId(null); }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors uppercase tracking-tight flex items-center gap-2 ${dashboardView === 'CLIENT_LIST' && step === AppStep.HOME ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> Cadastro / Lista
                </button>
                <button 
                  onClick={startAddNewClient}
                  className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors uppercase tracking-tight flex items-center gap-2 ${step === AppStep.CLIENT_REGISTRATION ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> + Novo Cliente
                </button>
              </div>
            )}
          </div>

          {/* CRM */}
          <div>
            <button 
              onClick={() => toggleMenu('CRM')}
              className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="Zap" size={18} /> CRM
              </div>
              <Icon name={expandedMenus.includes('CRM') ? 'ChevronDown' : 'ChevronRight'} size={14} />
            </button>
            {expandedMenus.includes('CRM') && (
              <div className="ml-8 mt-1 space-y-1">
                <button 
                  onClick={() => { setStep(AppStep.HOME); setDashboardView('CRM_PIPELINE'); }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors uppercase tracking-tight flex items-center gap-2 ${dashboardView === 'CRM_PIPELINE' && step === AppStep.HOME ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> Pipeline (Kanban)
                </button>
              </div>
            )}
          </div>

          <button onClick={() => { setStep(AppStep.HOME); setDashboardView('FINANCEIRO'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black text-slate-500 hover:bg-slate-800/50 hover:text-white transition-all uppercase tracking-widest">
            <Icon name="DollarSign" size={18} /> Financeiro
          </button>
          <button onClick={() => { setStep(AppStep.HOME); setDashboardView('KPIS'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black text-slate-500 hover:bg-slate-800/50 hover:text-white transition-all uppercase tracking-widest">
            <Icon name="BarChart" size={18} /> KPIs
          </button>

          <div className="pt-8 space-y-2">
            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Configurações</p>
            <button onClick={() => { setStep(AppStep.HOME); setDashboardView('USERS'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">
              <Icon name="UserCircle" size={16} /> Usuários
            </button>
            <button onClick={() => { setStep(AppStep.HOME); setDashboardView('HELP'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">
              <Icon name="HelpCircle" size={16} /> Ajuda
            </button>
          </div>
        </nav>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-10 py-6 flex justify-between items-center sticky top-0 z-30 shadow-sm shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Efraim Gestão Inteligente</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {step === AppStep.CLIENT_INFO ? 'Novo Cliente / Cadastro' : 
               step === AppStep.CLIENT_REGISTRATION ? 'Registro de Base de Dados' :
               step === AppStep.DIAGNOSTIC ? 'Aplicação de Diagnóstico' : 
               step === AppStep.REPORT ? 'Relatório Estratégico' : 'Painel de Controle'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {step === AppStep.HOME && (
              <button onClick={startNewDiagnostic} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 active:scale-95 transition-all">
                <Icon name="Plus" size={20} /> Novo Diagnóstico
              </button>
            )}
            {(step === AppStep.CLIENT_REGISTRATION || step === AppStep.CLIENT_INFO || step === AppStep.DIAGNOSTIC) && (
              <button 
                onClick={() => setStep(AppStep.HOME)}
                className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <Icon name="X" size={16} /> Cancelar Operação
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
          {isSaving && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center gap-4 animate-in zoom-in-90">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-800 tracking-tight">Sincronizando Dados...</p>
              </div>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;