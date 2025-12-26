
import React, { useState, useMemo, useEffect } from 'react';
import { Area, DiagnosticState, Response } from '../types';
import { AREAS, QUESTIONS, SCORE_MAP } from '../constants';
import Icon from './Icons';

interface DiagnosticWizardProps {
  state: DiagnosticState;
  setState: React.Dispatch<React.SetStateAction<DiagnosticState>>;
  onFinish: () => void;
  onAutoSave: () => void;
}

const DiagnosticWizard: React.FC<DiagnosticWizardProps> = ({ state, setState, onFinish, onAutoSave }) => {
  const [activeAreaId, setActiveAreaId] = useState(AREAS[0].id);

  useEffect(() => {
    const scrollContainer = document.querySelector('.wizard-scroll-area');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
          actionPlan: suggestion 
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

  const isLastArea = activeAreaId === AREAS[AREAS.length - 1].id;
  const isDiagnosticComplete = totalProgress === 100;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-10 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm no-print">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide flex-1 mr-8 py-1">
          {AREAS.map(area => {
            const progress = calculateAreaProgress(area.id);
            const isActive = activeAreaId === area.id;
            return (
              <button
                key={area.id}
                onClick={() => setActiveAreaId(area.id)}
                className={`flex flex-col items-center gap-1 min-w-[100px] group transition-all ${
                  isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500'
                }`}>
                  {progress === 100 ? <Icon name="Check" size={14} /> : <Icon name={area.icon} size={14} />}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tight whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {area.name.split(' ')[0]}
                </span>
                {isActive && <div className="w-8 h-0.5 bg-blue-600 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-6 shrink-0 border-l border-slate-100 pl-8">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Progresso Total</p>
            <p className="text-sm font-black text-slate-900 leading-none">{totalProgress}%</p>
          </div>
          {isDiagnosticComplete && (
            <button 
              onClick={onFinish} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 active:scale-95 animate-in zoom-in-95"
            >
              Finalizar <Icon name="CheckCircle" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 scroll-smooth wizard-scroll-area">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
            <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-500/20">
              <Icon name={activeArea.icon} size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Módulo Atual</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeArea.name}</h1>
            </div>
          </header>

          <div className="space-y-8">
            {questionsInArea.map((q, idx) => {
              const response = state.responses[q.id];
              return (
                <div key={q.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <span className="w-10 h-10 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center font-black text-lg border border-slate-100">
                          {idx + 1}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-tighter">{q.label}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight pt-1">
                      {q.enunciado}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleResponse(q.id, opt, q.sugestoes[opt])}
                        className={`flex items-start p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                          response?.selectedOption === opt 
                            ? opt === 'A' ? 'border-red-500 bg-red-50/30' :
                              opt === 'B' ? 'border-orange-500 bg-orange-50/30' :
                              opt === 'C' ? 'border-yellow-500 bg-yellow-50/30' :
                              'border-green-500 bg-green-50/30'
                            : 'border-slate-50 hover:border-blue-100 bg-slate-50/50 hover:bg-white'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-4 mt-1 flex items-center justify-center transition-all ${
                          response?.selectedOption === opt 
                            ? 'border-transparent bg-slate-900 scale-110' : 'border-slate-300 group-hover:border-blue-400'
                        }`}>
                          {response?.selectedOption === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm font-bold ${response?.selectedOption === opt ? 'text-slate-900' : 'text-slate-500'}`}>{q.opcoes[opt]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Observações do Consultor</label>
                      <textarea 
                        value={response?.observation || ''}
                        onChange={(e) => handleTextChange(q.id, 'observation', e.target.value)}
                        onBlur={onAutoSave}
                        className="w-full p-4 rounded-2xl border border-slate-100 text-sm h-28 outline-none focus:ring-4 focus:ring-blue-500/5 bg-slate-50/50 focus:bg-white transition-all resize-none font-medium"
                        placeholder="Notas da entrevista..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-2 px-1">Melhorias Sugeridas</label>
                      <textarea 
                        value={response?.actionPlan || ''}
                        onChange={(e) => handleTextChange(q.id, 'actionPlan', e.target.value)}
                        onBlur={onAutoSave}
                        className="w-full p-4 rounded-2xl border border-blue-100 text-sm h-28 outline-none focus:ring-4 focus:ring-blue-500/5 bg-blue-50/10 focus:bg-white transition-all resize-none font-bold text-slate-700"
                        placeholder="O que deve ser feito..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 mb-20 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 no-print">
             <button 
              disabled={activeAreaId === AREAS[0].id}
              onClick={() => {
                const currentIndex = AREAS.findIndex(a => a.id === activeAreaId);
                if (currentIndex > 0) setActiveAreaId(AREAS[currentIndex - 1].id);
              }}
              className="px-8 py-4 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2 disabled:opacity-20"
            >
              <Icon name="ArrowLeft" size={16} /> Módulo Anterior
            </button>
            <button 
              onClick={() => {
                const currentIndex = AREAS.findIndex(a => a.id === activeAreaId);
                if (currentIndex < AREAS.length - 1) setActiveAreaId(AREAS[currentIndex + 1].id);
                else if (isDiagnosticComplete) onFinish();
              }}
              className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 active:scale-95 ${
                isLastArea && !isDiagnosticComplete 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
              }`}
            >
              {isLastArea 
                ? isDiagnosticComplete ? 'Ver Relatório Final' : 'Aguardando Respostas...' 
                : 'Próxima Área'}
              <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWizard;
