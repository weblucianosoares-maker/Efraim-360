
import React, { useMemo, useEffect, useState } from 'react';
import { DiagnosticState, PriorityAnalysis, Response, StrategicReport } from '../types';
import { AREAS, QUESTIONS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
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

  const areaResults = useMemo(() => {
    return AREAS.map(area => {
      const areaQs = QUESTIONS.filter(q => q.areaId === area.id);
      const scores = areaQs.map(q => (state.responses[q.id] as Response)?.score || 0);
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      const detailedData = areaQs.map(q => ({
        subject: q.label,
        value: (state.responses[q.id] as Response)?.score || 0,
        fullMark: 100
      }));

      const gaps = areaQs
        .filter(q => ((state.responses[q.id] as Response)?.score || 0) < 60)
        .map(q => ({
          enunciado: q.enunciado,
          score: (state.responses[q.id] as Response)?.score || 0,
          recomendacao: (state.responses[q.id] as Response)?.actionPlan || 'Implementar melhorias.'
        }));

      return {
        id: area.id,
        name: area.name,
        icon: area.icon,
        score: Math.round(average),
        detailedData,
        gaps
      };
    });
  }, [state.responses]);

  const masterRadarData = areaResults.map(a => ({
    subject: a.name.split(' ')[0],
    A: a.score,
    fullMark: 100
  }));

  const priority = useMemo((): PriorityAnalysis => {
    const scores = areaResults.map(a => ({ id: a.id, score: a.score, name: a.name }));
    const criticalAreas = scores.filter(s => s.score < 40);
    if (criticalAreas.length > 0) {
      const worst = criticalAreas.sort((a, b) => a.score - b.score)[0];
      return { areaId: worst.id, areaName: worst.name, message: "Prioridade Crítica detectada!", type: 'RISCO' };
    }
    return { areaId: 'estrategia', areaName: 'Estratégia & Processos', message: "Otimização para Escala", type: 'EFICIENCIA' };
  }, [areaResults]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const data = await getIntelligentInsights(state, priority);
        if (data) setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [JSON.stringify(state.responses)]);

  return (
    <div className="min-h-full bg-white text-slate-900 pb-20 print:p-0">
      {/* Barra de Ações - No Print */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-2 rounded-lg"><Icon name="Target" size={20} className="text-white" /></div>
           <span className="text-white font-black text-sm uppercase tracking-widest">Efraim 360º <span className="text-blue-400">Intelligence</span></span>
        </div>
        <div className="flex gap-3">
          <button onClick={onEdit} className="px-4 py-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
            <Icon name="Edit" size={16} /> Ajustar Diagnóstico
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Icon name="Printer" size={16} /> Gerar PDF Profissional
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-12 space-y-12">
        
        {/* PÁGINA 1: RESUMO EXECUTIVO E RADAR MESTRE */}
        <section className="space-y-12 border-b-4 border-slate-900 pb-20">
           <header className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Diagnóstico Empresarial Profissional em Teia</h1>
                <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em]">{state.clientInfo.nomeFantasia} | {state.clientInfo.data}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultoria Responsável</p>
                 <p className="text-sm font-black text-slate-900">EFRAIM GESTÃO INTELIGENTE</p>
              </div>
           </header>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                 <table className="w-full text-left text-xs">
                    <thead className="border-b-2 border-slate-900 text-slate-400 font-black uppercase tracking-widest">
                       <tr>
                          <th className="py-2">Ref</th>
                          <th className="py-2">Área / Perspectiva</th>
                          <th className="py-2 text-right">Maturidade</th>
                       </tr>
                    </thead>
                    <tbody className="font-bold">
                       {areaResults.map((area, idx) => (
                         <tr key={area.id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                            <td className="py-2 text-slate-800 uppercase tracking-tight">{area.name}</td>
                            <td className={`py-2 text-right font-black ${area.score < 40 ? 'text-red-600' : area.score < 70 ? 'text-orange-500' : 'text-emerald-600'}`}>{area.score}%</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="h-[400px] relative bg-slate-50 rounded-[3rem] p-6 border border-slate-100">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={masterRadarData}>
                       <PolarGrid stroke="#cbd5e1" />
                       <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar 
                          dataKey="A" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          fill="#3b82f6" 
                          fillOpacity={0.3} 
                       />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </section>

        {/* PÁGINA 2: RESULTADOS POR PERSPECTIVA (GRID DE TEIAS) */}
        <section className="space-y-8">
           <div className="bg-slate-900 text-white p-4 text-center rounded-xl">
              <h2 className="text-lg font-black uppercase tracking-[0.5em]">Resultados por Perspectiva</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {areaResults.map((area, idx) => (
                <div key={area.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-1 w-full text-center">
                      {idx + 1}. {area.name}
                   </h3>
                   <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={area.detailedData}>
                           <PolarGrid stroke="#e2e8f0" />
                           <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 8, fontWeight: 700}} />
                           <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar 
                              dataKey="value" 
                              stroke="#0f172a" 
                              strokeWidth={2} 
                              fill="#3b82f6" 
                              fillOpacity={0.4} 
                           />
                        </RadarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="mt-4 flex items-center justify-between w-full px-4">
                      <div className="flex items-center gap-1">
                         <Icon name={area.icon} size={14} className="text-blue-600" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">EFRAIM TOOL</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{area.score}%</span>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* PÁGINA 3: PLANO DE AÇÃO E PONTOS CRÍTICOS */}
        <section className="space-y-12 pt-12 page-break-before">
           <div className="bg-red-600 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Icon name="AlertTriangle" size={120} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-red-100">Algoritmo de Prioridade</p>
              <h2 className="text-3xl font-black mb-4 tracking-tight">Ponto Crítico de Atenção: {priority.areaName}</h2>
              <p className="text-xl font-bold italic text-red-50 opacity-90 leading-relaxed">"{priority.message} - Este setor exige reestruturação imediata para garantir a viabilidade operacional e financeira do negócio."</p>
           </div>

           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="h-0.5 flex-1 bg-slate-200"></div>
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Mapeamento de Pontos de Atenção</h3>
                 <div className="h-0.5 flex-1 bg-slate-200"></div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                       <tr>
                          <th className="p-6">Área / Problema Detectado</th>
                          <th className="p-6">Nota</th>
                          <th className="p-6">Impacto</th>
                          <th className="p-6">Plano de Ação Recomendado</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-50">
                       {areaResults.filter(a => a.gaps.length > 0).map(area => (
                         area.gaps.map((gap, gIdx) => (
                           <tr key={`${area.id}-${gIdx}`} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-6">
                                 <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{area.name}</p>
                                 <p className="font-bold text-slate-800">{gap.enunciado}</p>
                              </td>
                              <td className="p-6">
                                 <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${gap.score < 40 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {gap.score}%
                                 </span>
                              </td>
                              <td className="p-6 font-bold text-slate-400 uppercase text-[10px]">
                                 {gap.score < 40 ? 'Crítico' : 'Alto'}
                              </td>
                              <td className="p-6 text-slate-600 font-medium">
                                 {gap.recomendacao}
                              </td>
                           </tr>
                         ))
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Assinatura Final */}
           <div className="pt-20 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="max-w-md">
                 <p className="text-sm font-bold text-slate-900 mb-4">"Este diagnóstico é o passo inicial para a transformação da {state.clientInfo.nomeFantasia}. O sucesso da implantação depende do compromisso da liderança com as mudanças sugeridas."</p>
                 <div className="flex gap-4">
                    <div className="bg-blue-600 text-white p-3 rounded-xl"><Icon name="TrendingUp" /></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Passo</p>
                       <p className="text-xs font-black text-slate-900">REUNIÃO DE ALINHAMENTO E CRONOGRAMA</p>
                    </div>
                 </div>
              </div>
              <div className="text-center min-w-[300px]">
                 <div className="h-0.5 w-full bg-slate-900 mb-4"></div>
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">De acordo e ciência do diagnóstico</p>
                 <p className="text-sm font-black text-slate-900">{state.clientInfo.nomeFantasia}</p>
              </div>
           </div>
        </section>

      </div>
      
      <div className="p-10 text-center no-print">
         <button onClick={onHome} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 mx-auto transition-all">
            <Icon name="ArrowLeft" size={16} /> Voltar ao Dashboard Geral
         </button>
      </div>
    </div>
  );
};

export default ReportPreview;
