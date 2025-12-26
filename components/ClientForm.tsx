
import React from 'react';
import { ClientInfo } from '../types';
import Icon from './Icons';

interface ClientFormProps {
  data: ClientInfo;
  onChange: (data: ClientInfo) => void;
  onNext: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ data, onChange, onNext }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const isFormValid = data.razaoSocial && data.nomeFantasia && data.responsavel && data.entrevistado;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Icon name="UserPlus" size={32} />
            Cadastro do Cliente
          </h1>
          <p className="text-slate-400 mt-2">Dados vitais para a construção da proposta comercial estratégica.</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Razão Social *</label>
            <input name="razaoSocial" value={data.razaoSocial} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Efraim Consultoria LTDA" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nome Fantasia *</label>
            <input name="nomeFantasia" value={data.nomeFantasia} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Efraim Gestão" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">CNPJ</label>
            <input name="cnpj" value={data.cnpj} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="00.000.000/0000-00" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nome do Entrevistado *</label>
            <input name="entrevistado" value={data.entrevistado} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Quem está respondendo?" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mercado / Segmento</label>
            <input name="segmento" value={data.segmento} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Indústria, Varejo, Serviços..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Quantidade de Funcionários</label>
            <input name="quantidadeFuncionarios" value={data.quantidadeFuncionarios} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 50 colaboradores" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Faturamento Mensal Médio</label>
            <input name="faturamentoMensal" value={data.faturamentoMensal} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="R$ 0,00" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Faturamento Anual</label>
            <input name="faturamentoAnual" value={data.faturamentoAnual} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="R$ 0,00" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700">Estrutura Organizacional Atual</label>
            <textarea name="estruturaOrganizacional" value={data.estruturaOrganizacional} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Descreva brevemente como a empresa está organizada hierarquicamente..." />
          </div>

          <div className="md:col-span-2 pt-6">
            <button 
              disabled={!isFormValid}
              onClick={onNext}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Próxima Etapa: Diagnóstico 360º
              <Icon name="ArrowRight" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
