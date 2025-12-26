
import React, { useState, useMemo, useEffect } from 'react';
import { Area, DiagnosticState, Response } from '../types';
import { AREAS, QUESTIONS, SCORE_MAP } from '../constants';
import Icon from './Icons';

interface DiagnosticWizardProps {
  state: DiagnosticState;
  setState: React.Dispatch<React.SetStateAction<DiagnosticState>>;
  onFinish: () => void;
}

const DiagnosticWizard: React.FC<DiagnosticWizardProps> = ({ state, setState, onFinish }) => {
  const [activeAreaId, setActiveAreaId] = useState(AREAS[0].id);

  // Scroll to top when area changes
  useEffect(() => {
    const mainContent = document.getElementById('diagnostic-main-content');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeAreaId]);

  const activeArea = AREAS.find(a => a.id === activeAreaId)!;
  const questionsInArea = QUESTIONS.filter(q => q.areaId === activeAreaId);

  const handleResponse = (questionId: string, option: 'A' | 'B' | 'C' | 'D', suggestion: string) => {
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: {
          ...prev.responses[questionId],
          selectedOption: option,
          score: SCORE_MAP[option],
          actionPlan: prev.responses[questionId]?.actionPlan || suggestion
        }
      }
    }));
  };

  const handleTextChange = (questionId: string, field: 'observation' | 'actionPlan', value: string) => {
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: {
          ...prev.responses[questionId],
          [field]: value
        }
      }
    }));
  };

  const calculateAreaProgress = (areaId: string) => {
    const areaQuestions = QUESTIONS.filter(q => q.areaId === areaId);
    const answeredCount = areaQuestions.filter(q => (state.responses[q.id] as Response | undefined)?.selectedOption).length;
    return (answeredCount / areaQuestions.length) * 100;
  };

  const totalProgress = useMemo(() => {
    const totalQuestions = QUESTIONS.length;
    const answeredCount = (Object.values(state.responses) as Response[]).filter(r => r.selectedOption).length;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [state.responses]);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50">
      <div className="w-full lg:w-80 bg-slate-900 text-white flex flex-col no-print shrink-0 shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-xl font-black tracking-tighter text-white">EFRAIM <span className="text-blue-500">360º</span></h2>
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">
              <span>Progresso Total</span>
              <span>{totalProgress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {AREAS.map(area => {
            const progress = calculateAreaProgress(area.id);
            const isActive = activeAreaId === area.id;
            return (
              <button
                key={area.id}
                onClick={() => setActiveAreaId(area.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={area.icon} size={16} />
                  <span className="text-xs font-bold uppercase tracking-tight">{area.name}</span>
                </div>
                {progress === 100 && <Icon name="CheckCircle" size={14} className="text-green-400" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onFinish} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
            Revisar Relatório
            <Icon name="FileBarChart" size={16} />
          </button>
        </div>
      </div>

      <div id="diagnostic-main-content" className="flex-1 overflow-y-auto p-6 lg:p-12 pb-32 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 flex items-center gap-6">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
              <Icon name={activeArea.icon} size={40} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Módulo de Diagnóstico</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeArea.name}</h1>
            </div>
          </header>

          <div className="space-y-8">
            {questionsInArea.map((q, idx) => {
              const response = state.responses[q.id];
              return (
                <div key={q.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-5 mb-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center font-black text-lg border border-slate-100">
                      {idx + 1}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight pt-1">
                      {q.enunciado}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleResponse(q.id, opt, q.sugestaoPadrao)}
                        className={`flex items-start p-5 rounded-2xl border-2 text-left transition-all group ${
                          response?.selectedOption === opt 
                            ? opt === 'A' ? 'border-red-500 bg-red-50/50' :
                              opt === 'B' ? 'border-orange-500 bg-orange-50/50' :
                              opt === 'C' ? 'border-yellow-500 bg-yellow-50/50' :
                              'border-green-500 bg-green-50/50'
                            : 'border-slate-50 hover:border-blue-200 bg-slate-50/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-4 mt-1 flex items-center justify-center transition-all ${
                          response?.selectedOption === opt 
                            ? 'border-transparent bg-slate-900 scale-110' : 'border-slate-300 group-hover:border-blue-400'
                        }`}>
                          {response?.selectedOption === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm font-medium ${response?.selectedOption === opt ? 'text-slate-900' : 'text-slate-600'}`}>{q.opcoes[opt]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Notas do Consultor</label>
                      <textarea 
                        value={response?.observation || ''}
                        onChange={(e) => handleTextChange(q.id, 'observation', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-100 text-sm h-28 outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 transition-all resize-none"
                        placeholder="Insights observados..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Recomendação Inicial</label>
                      <textarea 
                        value={response?.actionPlan || ''}
                        onChange={(e) => handleTextChange(q.id, 'actionPlan', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-100 text-sm h-28 outline-none focus:ring-2 focus:ring-blue-500/20 bg-blue-50/30 transition-all resize-none font-medium"
                        placeholder="Qual a solução recomendada?"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
             <button 
              onClick={() => {
                const currentIndex = AREAS.findIndex(a => a.id === activeAreaId);
                if (currentIndex > 0) setActiveAreaId(AREAS[currentIndex - 1].id);
              }}
              className="px-8 py-3 rounded-xl text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Anterior
            </button>
            <button 
              onClick={() => {
                const currentIndex = AREAS.findIndex(a => a.id === activeAreaId);
                if (currentIndex < AREAS.length - 1) setActiveAreaId(AREAS[currentIndex + 1].id);
                else onFinish();
              }}
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-3 active:scale-95"
            >
              {activeAreaId === AREAS[AREAS.length - 1].id ? 'Finalizar Diagnóstico' : 'Próxima Área'}
              <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWizard;
