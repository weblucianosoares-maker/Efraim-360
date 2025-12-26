
import React, { useState, useEffect } from 'react';
import { ClientInfo } from '../types';
import Icon from './Icons';

interface ClientFormProps {
  data: ClientInfo;
  onChange: (data: ClientInfo) => void;
  onNext: () => void;
  isRegistrationOnly?: boolean;
}

// Utilitário para formatar valores monetários em R$
const formatCurrency = (value: string) => {
  const cleanValue = value.replace(/\D/g, "");
  if (!cleanValue) return "";
  const numberValue = parseFloat(cleanValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

const SectionHeader = ({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) => (
  <div className="flex items-center gap-4 mb-8 pt-8 first:pt-0 border-t first:border-t-0 border-slate-100">
     <div className="bg-slate-50 p-2.5 rounded-xl text-blue-600"><Icon name={icon} size={20} /></div>
     <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{subtitle}</p>
     </div>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required = false, withButton = false, isSearching = false, onSearch }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input 
        type={type}
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        className={`w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800 text-sm ${withButton ? 'pr-32' : ''}`} 
        placeholder={placeholder} 
      />
      {withButton && (
        <button 
          type="button"
          onClick={onSearch}
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ...
            </>
          ) : 'Buscar'}
        </button>
      )}
    </div>
  </div>
);

const ClientForm: React.FC<ClientFormProps> = ({ data, onChange, onNext, isRegistrationOnly }) => {
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Aplica máscara de moeda se for um dos campos de faturamento
    if (name === 'faturamentoMensal' || name === 'faturamentoAnual') {
      onChange({ ...data, [name]: formatCurrency(value) });
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  const isFormValid = !!(data.razaoSocial && data.nomeFantasia && data.cnpj && data.responsavel);

  const handleCnpjLookup = async (cnpjValue?: string) => {
    const targetCnpj = cnpjValue || data.cnpj;
    const cleanCnpj = targetCnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) return;
    
    setIsSearchingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      
      if (!response.ok) {
        throw new Error("CNPJ não encontrado.");
      }

      const result = await response.json();
      
      onChange({
        ...data,
        cnpj: targetCnpj,
        razaoSocial: result.razao_social || "",
        nomeFantasia: result.nome_fantasia || result.razao_social || "",
        logradouro: result.logradouro || "",
        numero: result.numero || "",
        bairro: result.bairro || "",
        cidade: result.municipio || "",
        uf: result.uf || "",
        cep: result.cep || "",
        email: result.email || data.email,
        whatsapp: result.ddd_telefone_1 ? `(${result.ddd_telefone_1.substring(0,2)}) ${result.ddd_telefone_1.substring(2)}` : data.whatsapp,
        segmento: result.cnae_fiscal_descricao || "",
        dataFundacao: result.data_abertura || ""
      });

    } catch (error: any) {
      console.error("Erro na consulta de CNPJ:", error);
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  useEffect(() => {
    const cleanCnpj = data.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14 && !isSearchingCnpj && !data.razaoSocial) {
      handleCnpjLookup(cleanCnpj);
    }
  }, [data.cnpj]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white">
          <div className="flex items-center gap-4 mb-2">
             <div className="bg-blue-600 p-2.5 rounded-xl"><Icon name={isRegistrationOnly ? "UserPlus" : "ClipboardCheck"} size={24} /></div>
             <h1 className="text-3xl font-black tracking-tight">
               {isRegistrationOnly ? 'Cadastro Completo de Cliente' : 'Identificação do Diagnóstico'}
             </h1>
          </div>
          <p className="text-slate-400 font-medium">
            {isRegistrationOnly 
              ? 'Preencha todos os dados corporativos para a base de clientes Efraim.' 
              : 'Informe os dados básicos para iniciar o mapeamento de maturidade.'}
          </p>
        </div>
        
        <div className="p-10 space-y-10">
          <div>
            <SectionHeader icon="Shield" title="Informações Jurídicas" subtitle="Dados principais da empresa" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField 
                label="CNPJ (Chave Principal)" 
                name="cnpj" 
                value={data.cnpj} 
                onChange={handleChange} 
                placeholder="00.000.000/0000-00" 
                required 
                withButton 
                isSearching={isSearchingCnpj} 
                onSearch={() => handleCnpjLookup()} 
              />
              <div className="lg:col-span-2">
                <InputField label="Razão Social" name="razaoSocial" value={data.razaoSocial} onChange={handleChange} placeholder="Ex: Efraim Consultoria LTDA" required />
              </div>
              <InputField label="Nome Fantasia" name="nomeFantasia" value={data.nomeFantasia} onChange={handleChange} placeholder="Ex: Efraim Gestão" required />
              <InputField label="Inscrição Estadual" name="inscricaoEstadual" value={data.inscricaoEstadual} onChange={handleChange} placeholder="Isento ou Número" />
              <InputField label="Data de Fundação" name="dataFundacao" value={data.dataFundacao} onChange={handleChange} type="date" />
            </div>
          </div>

          <div>
            <SectionHeader icon="Users" title="Contato & Gestão" subtitle="Quem responde pela empresa" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Sócio / Responsável Principal" name="responsavel" value={data.responsavel} onChange={handleChange} placeholder="Nome completo" required />
              {!isRegistrationOnly && (
                <InputField label="Entrevistado (Acompanhando)" name="entrevistado" value={data.entrevistado} onChange={handleChange} placeholder="Nome de quem está respondendo agora" required />
              )}
              <InputField label="E-mail Corporativo" name="email" value={data.email} onChange={handleChange} type="email" placeholder="contato@empresa.com.br" />
              <InputField label="WhatsApp / Celular" name="whatsapp" value={data.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" />
              <InputField label="Telefone Fixo" name="telefoneFixo" value={data.telefoneFixo} onChange={handleChange} placeholder="(00) 0000-0000" />
            </div>
          </div>

          {(isRegistrationOnly || data.cnpj) && (
            <div className="animate-in fade-in duration-500">
              <SectionHeader icon="MapPin" title="Localização" subtitle="Sede da operação" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <InputField label="Logradouro" name="logradouro" value={data.logradouro} onChange={handleChange} placeholder="Rua, Avenida, etc." />
                </div>
                <InputField label="Número" name="numero" value={data.numero} onChange={handleChange} placeholder="123" />
                <InputField label="Bairro" name="bairro" value={data.bairro} onChange={handleChange} placeholder="Centro" />
                <InputField label="Cidade" name="cidade" value={data.cidade} onChange={handleChange} placeholder="São Paulo" />
                <InputField label="UF" name="uf" value={data.uf} onChange={handleChange} placeholder="SP" />
                <InputField label="CEP" name="cep" value={data.cep} onChange={handleChange} placeholder="00000-000" />
              </div>
            </div>
          )}

          <div>
            <SectionHeader icon="TrendingUp" title="Mercado & Estrutura" subtitle="Perfil da operação" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Segmento" name="segmento" value={data.segmento} onChange={handleChange} placeholder="Ex: Indústria, Varejo" />
              <InputField label="Nicho de Atuação" name="nicho" value={data.nicho} onChange={handleChange} placeholder="Ex: Alimentação Saudável" />
              <InputField label="Qtd. Funcionários" name="quantidadeFuncionarios" value={data.quantidadeFuncionarios} onChange={handleChange} placeholder="Ex: 50" />
              <InputField label="Faturamento Mensal (R$)" name="faturamentoMensal" value={data.faturamentoMensal} onChange={handleChange} placeholder="R$ 0,00" />
              <InputField label="Faturamento Anual (R$)" name="faturamentoAnual" value={data.faturamentoAnual} onChange={handleChange} placeholder="R$ 0,00" />
            </div>
          </div>

          <div>
            <SectionHeader icon="Globe" title="Canais Digitais" subtitle="Presença online" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Website" name="site" value={data.site} onChange={handleChange} placeholder="www.empresa.com.br" />
              <InputField label="Instagram" name="instagram" value={data.instagram} onChange={handleChange} placeholder="@usuario" />
              <InputField label="LinkedIn" name="linkedin" value={data.linkedin} onChange={handleChange} placeholder="linkedin.com/company/..." />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2 pt-8 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resumo da Estrutura / Observações</label>
            <textarea 
              name="estruturaOrganizacional" 
              value={data.estruturaOrganizacional || ''} 
              onChange={handleChange} 
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all h-32 resize-none font-medium text-sm" 
              placeholder="Descreva brevemente a situação atual da empresa..." 
            />
          </div>

          <div className="pt-10">
            <button 
              type="button"
              disabled={!isFormValid}
              onClick={onNext}
              className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isRegistrationOnly ? 'Salvar Cadastro de Cliente' : 'Iniciar Mapeamento 360º'}
              <Icon name={isRegistrationOnly ? "Save" : "ArrowRight"} size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
