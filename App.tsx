
import React, { useState, useEffect } from 'react';
import { AppStep, DiagnosticState } from './types';
import ClientForm from './components/ClientForm';
import DiagnosticWizard from './components/DiagnosticWizard';
import ReportPreview from './components/ReportPreview';
import Dashboard from './components/Dashboard';
import { saveDiagnostic } from './services/supabase';

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
    estruturaOrganizacional: ''
  },
  responses: {}
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.HOME);
  const [state, setState] = useState<DiagnosticState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinishDiagnostic = async () => {
    setIsSaving(true);
    try {
      await saveDiagnostic({
        ...state,
        status: 'Finalizado'
      });
      setStep(AppStep.REPORT);
    } catch (err: any) {
      console.error('Erro completo capturado no App:', err);
      alert(`Houve um erro ao salvar o diagnóstico: ${err.message || 'Erro desconhecido'}. Verifique se a tabela 'diagnostics' existe no seu Supabase.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDiagnostic = (diagnostic: any) => {
    setState({
      id: diagnostic.id,
      clientInfo: diagnostic.client_info,
      responses: diagnostic.responses
    });
    setStep(AppStep.REPORT);
  };

  const renderStep = () => {
    switch (step) {
      case AppStep.HOME:
        return (
          <Dashboard 
            onStartNew={() => { setState(INITIAL_STATE); setStep(AppStep.CLIENT_INFO); }} 
            onViewDiagnostic={handleLoadDiagnostic}
          />
        );
      
      case AppStep.CLIENT_INFO:
        return (
          <ClientForm 
            data={state.clientInfo} 
            onChange={(info) => setState(s => ({ ...s, clientInfo: info }))}
            onNext={() => setStep(AppStep.DIAGNOSTIC)}
          />
        );
      case AppStep.DIAGNOSTIC:
        return (
          <DiagnosticWizard 
            state={state}
            setState={setState}
            onFinish={handleFinishDiagnostic}
          />
        );
      case AppStep.REPORT:
        return (
          <ReportPreview 
            state={state}
            onEdit={() => setStep(AppStep.DIAGNOSTIC)}
            onHome={() => setStep(AppStep.HOME)}
          />
        );
      default:
        return <Dashboard onStartNew={() => setStep(AppStep.CLIENT_INFO)} />;
    }
  };

  return (
    <div className="min-h-screen">
      {isSaving && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-800 tracking-tight">Salvando seu progresso...</p>
          </div>
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default App;
