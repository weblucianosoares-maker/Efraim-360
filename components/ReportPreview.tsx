
import React, { useMemo, useEffect, useState } from 'react';
import { DiagnosticState, PriorityAnalysis, Response, StrategicReport } from '../types';
import { AREAS, QUESTIONS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import Icon from './Icons';
import { getIntelligentInsights } from '../services/geminiService';

interface ReportPreviewProps {
  state: DiagnosticState;
  onEdit: () => void;
  onHome: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ state, onEdit, onHome }) => {
  const [report, setReport] = useState<StrategicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ANALISE' | 'SWOT' | 'ISHIKAWA' | 'PLANO'>('ANALISE');

  const areaResults = useMemo(() => {
    return AREAS.map(area => {
      const areaQs = QUESTIONS.filter(q => q.areaId === area.id);
      const scores = areaQs.map(q => (state.responses[q.id] as Response)?.score || 0);
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      const gaps = areaQs
        .filter(q => ((state.responses[q.id] as Response)?.score || 0) < 60)
        .map(q => ({
          enunciado: q.enunciado,
          score: (state.responses[q.id] as Response)?.score || 0,
          recomendacao: (state.responses[q.id] as Response)?.actionPlan || q.sugestaoPadrao
        }));

      return {
        id: area.id,
        name: area.name,
        icon: area.icon,
        score: Math.round(average),
        gaps,
        questions: areaQs.map(q => ({
          name: q.enunciado.split('?')[0].split('(')[0].trim(),
          value: (state.responses[q.id] as Response)?.score || 0
        }))
      };
    });
  }, [state.responses]);

  const priority = useMemo((): PriorityAnalysis => {
    const findScore = (id: string) => areaResults.find(a => a.id === id)?.score || 0;
    const fin = findScore('financeiro');
    const fis = findScore('fiscal');
    const soc = findScore('societario');
    if (fin < 40 || fis < 40 || soc < 40) return { areaId: 'risco', areaName: 'Segurança Vital', message: "Risco de Continuidade", type: 'RISCO' };
    return { areaId: 'crescimento', areaName: 'Escala e Eficiência', message: "Otimização de Resultados", type: 'TRACAO' };
  }, [areaResults]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const data = await getIntelligentInsights(state, priority);
      if (data) setReport(data);
      setLoading(false);
    };
    fetchInsights();
  }, [state, priority]);

  const chartDataGeral = areaResults.map(a => ({ subject: a.name.split(' ')[0], A: a.score }));

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-black tracking-tighter text-center">A Inteligência Efraim está consolidando sua Proposta Comercial...</h2>
        <p className="text-slate-400 mt-4 font-medium">Mapeando SWOT, Ishikawa e Plano de Ação Personalizado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-32 overflow-x-hidden print:bg-white">
      {/* Action Bar */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center no-print shadow-2xl">
        <div className="flex gap-4">
          <button onClick={onHome} className="p-2 hover:bg-slate-800 rounded-xl transition-all"><Icon name="Home" /></button>
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest"><Icon name="ArrowLeft" size={16} /> Editar</button>
        </div>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-2xl">
          {(['ANALISE', 'SWOT', 'ISHIKAWA', 'PLANO'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button onClick={() => window.print()} className="bg-white text-slate-900 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 flex items-center gap-2">
          <Icon name="Printer" size={16} /> Imprimir PDF
        </button>
      </div>

      {/* CAPA - PROPOSTA COMERCIAL */}
      <div className="h-screen flex flex-col items-center justify-center p-20 border-b relative bg-slate-900 text-white">
        <div className="absolute top-10 left-10">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg"><Icon name="Target" size={24} /></div>
              <span className="text-xl font-black tracking-tighter">EFRAIM <span className="text-blue-500">GESTÃO</span></span>
           </div>
        </div>
        <div className="max-w-4xl w-full text-center space-y-8">
           <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-sm">Proposta Estratégica de Maturidade</p>
           <h1 className="text-7xl font-black tracking-tighter leading-none uppercase">Diagnóstico <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">360º de Gestão</span> Inteligente</h1>
           <div className="h-1 w-32 bg-blue-600 mx-auto"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa Avaliada</p>
                 <p className="text-2xl font-bold">{state.clientInfo.nomeFantasia}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável / Entrevistado</p>
                 <p className="text-2xl font-bold">{state.clientInfo.entrevistado}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data do Diagnóstico</p>
                 <p className="text-2xl font-bold">{state.clientInfo.data}</p>
              </div>
           </div>
        </div>
        <div className="absolute bottom-10 text-slate-500 text-xs font-medium">© 2024 Efraim Consultoria de Gestão Inteligente - Todos os direitos reservados.</div>
      </div>

      {/* CONTEÚDO DINÂMICO BASEADO NA TAB SELECIONADA */}
      <div className="p-8 lg:p-20 max-w-7xl mx-auto space-y-24">
        
        {/* SEÇÃO ANALISE: RADAR GERAL + ÁREAS ESPECÍFICAS */}
        {(activeTab === 'ANALISE' || window.matchMedia('print').matches) && (
          <div className="space-y-32">
            <section>
              <h2 className="text-4xl font-black tracking-tighter mb-4">Maturidade Geral</h2>
              <p className="text-slate-500 text-lg mb-12 max-w-2xl">Visão panorâmica da empresa em todas as 12 dimensões críticas de gestão.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="h-[500px] bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartDataGeral}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                      <Radar dataKey="A" stroke="#2563eb" strokeWidth={3} fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                   <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-500/20">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Parecer Técnico Efraim</h3>
                      <p className="text-xl font-bold italic leading-relaxed">"{report?.sumarioExecutivo}"</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900 text-white p-6 rounded-2xl">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Índice Geral</p>
                         <p className="text-4xl font-black text-blue-400">{Math.round(areaResults.reduce((a, b) => a + b.score, 0) / 12)}%</p>
                      </div>
                      <div className="bg-slate-100 p-6 rounded-2xl">
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status Atual</p>
                         <p className="text-xl font-black text-slate-900">Em Evolução</p>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* DETALHAMENTO POR ÁREA - RADAR ESPECÍFICO */}
            <section className="space-y-24">
               <h2 className="text-4xl font-black tracking-tighter text-center">Detalhamento das Perspectivas</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {areaResults.map(area => (
                    <div key={area.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all page-break-inside-avoid">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Icon name={area.icon} /></div>
                         <div>
                            <h3 className="text-xl font-black tracking-tight">{area.name}</h3>
                            <div className="flex items-center gap-2">
                               <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${area.score < 40 ? 'bg-red-500' : area.score < 70 ? 'bg-orange-500' : 'bg-green-500'}`} style={{width: `${area.score}%`}} />
                               </div>
                               <span className="text-xs font-black text-slate-900">{area.score}%</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="h-64 mb-8 bg-slate-50/50 rounded-2xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={area.questions.map(q => ({subject: q.name, A: q.value}))}>
                            <PolarGrid stroke="#cbd5e1" />
                            <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 7, fontWeight: 700}} />
                            <Radar dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Pontos de Atenção & Gaps</p>
                        {area.gaps.length > 0 ? area.gaps.slice(0, 3).map((gap, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-xl border-l-4 border-orange-500">
                             <p className="text-xs font-bold text-slate-800 mb-1">{gap.enunciado}</p>
                             <p className="text-[11px] text-slate-500 italic">Recomendação: {gap.recomendacao}</p>
                          </div>
                        )) : <p className="text-xs text-green-600 font-bold">Nenhum gap crítico identificado nesta área.</p>}
                      </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {/* SEÇÃO SWOT */}
        {(activeTab === 'SWOT' || window.matchMedia('print').matches) && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tighter mb-4">Matriz SWOT Operacional</h2>
              <p className="text-slate-500 max-w-xl mx-auto font-medium">Análise prática de forças e fraquezas focada em resultados reais do dia a dia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-10 rounded-[40px] border border-emerald-100 space-y-6">
                 <div className="flex items-center gap-3 text-emerald-700">
                    <Icon name="Zap" size={24} />
                    <h3 className="text-xl font-black uppercase tracking-widest">Forças</h3>
                 </div>
                 <ul className="space-y-4">
                    {report?.swot.forcas.map((f, i) => <li key={i} className="text-sm font-bold text-emerald-900/70 flex gap-3"><span className="text-emerald-500">✔</span> {f}</li>)}
                 </ul>
              </div>
              <div className="bg-blue-50 p-10 rounded-[40px] border border-blue-100 space-y-6">
                 <div className="flex items-center gap-3 text-blue-700">
                    <Icon name="TrendingUp" size={24} />
                    <h3 className="text-xl font-black uppercase tracking-widest">Oportunidades</h3>
                 </div>
                 <ul className="space-y-4">
                    {report?.swot.oportunidades.map((o, i) => <li key={i} className="text-sm font-bold text-blue-900/70 flex gap-3"><span className="text-blue-500">↗</span> {o}</li>)}
                 </ul>
              </div>
              <div className="bg-orange-50 p-10 rounded-[40px] border border-orange-100 space-y-6">
                 <div className="flex items-center gap-3 text-orange-700">
                    <Icon name="AlertCircle" size={24} />
                    <h3 className="text-xl font-black uppercase tracking-widest">Fraquezas</h3>
                 </div>
                 <ul className="space-y-4">
                    {report?.swot.fraquezas.map((f, i) => <li key={i} className="text-sm font-bold text-orange-900/70 flex gap-3"><span className="text-orange-500">!</span> {f}</li>)}
                 </ul>
              </div>
              <div className="bg-rose-50 p-10 rounded-[40px] border border-rose-100 space-y-6">
                 <div className="flex items-center gap-3 text-rose-700">
                    <Icon name="ShieldAlert" size={24} />
                    <h3 className="text-xl font-black uppercase tracking-widest">Ameaças</h3>
                 </div>
                 <ul className="space-y-4">
                    {report?.swot.ameacas.map((a, i) => <li key={i} className="text-sm font-bold text-rose-900/70 flex gap-3"><span className="text-rose-500">✖</span> {a}</li>)}
                 </ul>
              </div>
            </div>
          </section>
        )}

        {/* SEÇÃO ISHIKAWA */}
        {(activeTab === 'ISHIKAWA' || window.matchMedia('print').matches) && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tighter mb-4">Análise de Causa Raiz</h2>
              <p className="text-slate-500 max-w-xl mx-auto font-medium">Metodologia Espinha de Peixe aplicada à dor principal identificada no diagnóstico.</p>
            </div>
            <div className="relative p-12 bg-slate-900 rounded-[60px] text-white overflow-hidden min-h-[500px] flex flex-col justify-center">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8 relative z-10">
                  {report?.ishikawa.map((item, i) => (
                    <div key={i} className="relative group">
                       <div className="h-0.5 w-full bg-blue-500 mb-4 scale-x-100 group-hover:bg-blue-300 transition-colors"></div>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{item.categoria}</p>
                       <p className="text-sm font-medium leading-tight">{item.causa}</p>
                    </div>
                  ))}
               </div>
               <div className="mt-20 border-t-4 border-white pt-6 flex justify-end">
                  <div className="text-right">
                     <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Efeito / Problema</p>
                     <p className="text-3xl font-black text-blue-500 uppercase tracking-tighter">{priority.message}</p>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* SEÇÃO PLANO DE AÇÃO (PROPOSTA COMERCIAL) */}
        {(activeTab === 'PLANO' || window.matchMedia('print').matches) && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
            <div className="bg-slate-50 p-12 rounded-[50px] border border-slate-200">
               <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0"><Icon name="Lock" size={40} /></div>
                  <div className="space-y-4">
                     <h2 className="text-3xl font-black tracking-tight">Caminho para a Transformação</h2>
                     <p className="text-lg text-slate-600 leading-relaxed font-medium">O Plano de Ação Estratégico detalhado (5W2H) é o entregável central da nossa implementação. Este cronograma de execução será liberado após a validação e formalização da nossa parceria comercial.</p>
                     <p className="text-sm text-slate-400">Abaixo, apresentamos a estrutura de como trabalharemos para corrigir os GAPs identificados.</p>
                  </div>
               </div>
            </div>
            
            <div className="overflow-x-auto rounded-[32px] border border-slate-200 shadow-2xl">
               <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                     <tr>
                        <th className="p-6">O Que (What)</th>
                        <th className="p-6">Por Que (Why)</th>
                        <th className="p-6">Quem (Who)</th>
                        <th className="p-6">Quando (When)</th>
                        <th className="p-6">Como (How)</th>
                     </tr>
                  </thead>
                  <tbody className="text-xs">
                     {report?.plano5W2H.map((item, i) => (
                       <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-6 font-black text-slate-900 blur-[2px] opacity-30 select-none">{item.oQue}</td>
                          <td className="p-6 text-slate-500 blur-[2px] opacity-30 select-none">{item.porQue}</td>
                          <td className="p-6 font-bold text-blue-600 blur-[2px] opacity-30 select-none">{item.quem}</td>
                          <td className="p-6 text-slate-500 blur-[2px] opacity-30 select-none">{item.quando}</td>
                          <td className="p-6 text-slate-400 italic blur-[2px] opacity-30 select-none">{item.como}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>
        )}
      </div>

      <div className="mt-32 p-20 text-center border-t border-slate-100 no-print">
         <h3 className="text-3xl font-black tracking-tighter mb-8">Pronto para transformar sua gestão?</h3>
         <button onClick={() => window.print()} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
            Gerar Proposta Comercial PDF
            <Icon name="ArrowRight" size={18} />
         </button>
      </div>
    </div>
  );
};

export default ReportPreview;
