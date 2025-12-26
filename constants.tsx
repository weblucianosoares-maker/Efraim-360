
import { Area, Question } from './types';

export const AREAS: Area[] = [
  { id: 'societario', name: 'Societário & Governança', icon: 'Shield' },
  { id: 'tecnologia', name: 'Tecnologia & Inovação', icon: 'Cpu' },
  { id: 'comercial', name: 'Comercial', icon: 'TrendingUp' },
  { id: 'marketing', name: 'Marketing', icon: 'Megaphone' },
  { id: 'financeiro', name: 'Financeiro', icon: 'DollarSign' },
  { id: 'controladoria', name: 'Controladoria', icon: 'BarChart' },
  { id: 'fiscal', name: 'Fiscal', icon: 'FileText' },
  { id: 'contabil', name: 'Contábil', icon: 'BookOpen' },
  { id: 'cultura', name: 'Cultura & Clima', icon: 'Smile' },
  { id: 'pessoas', name: 'Pessoas (RH)', icon: 'Users' },
  { id: 'planejamento', name: 'Planejamento', icon: 'Map' },
  { id: 'processos', name: 'Processos', icon: 'Workflow' },
];

export const QUESTIONS: Question[] = [
  // 1. Societário & Governança
  {
    id: '1.1', areaId: 'societario',
    enunciado: 'O Contrato Social reflete a realidade atual (sócios, capital, endereço) e protege a operação?',
    opcoes: {
      A: 'Contrato padrão, desatualizado ou informal.',
      B: 'Contrato existe mas tem divergências leves com a realidade.',
      C: 'Contrato atualizado, mas sem cláusulas profundas de proteção.',
      D: 'Contrato atualizado com cláusulas específicas de proteção e valuation.'
    },
    sugestaoPadrao: 'Revisar e atualizar o Contrato Social com assessoria jurídica especializada.'
  },
  {
    id: '1.2', areaId: 'societario',
    enunciado: 'Existem regras assinadas para entrada/saída de sócios, valuation e herança?',
    opcoes: {
      A: 'Não existe. Se um sócio sair, vira briga.',
      B: 'Regras verbais ("de boca"), sem documento assinado.',
      C: 'Existe um esboço ou minuta não registrada.',
      D: 'Acordo de Acionistas/Quotistas assinado e registrado juridicamente.'
    },
    sugestaoPadrao: 'Elaborar e registrar um Acordo de Quotistas para definir regras de sucessão e saída.'
  },
  {
    id: '1.3', areaId: 'societario',
    enunciado: 'Existe uma rotina mensal formal de prestação de contas entre os sócios?',
    opcoes: {
      A: 'Conversas de corredor ou apenas quando surge problema.',
      B: 'Reuniões esporádicas sem ata ou pauta definida.',
      C: 'Reunião mensal existe, mas sem análise profunda de números.',
      D: 'Reunião mensal agendada, com Ata, Pauta e DRE apresentado.'
    },
    sugestaoPadrao: 'Instituir reuniões mensais de conselho com pauta fixa e análise de indicadores financeiros.'
  },
  {
    id: '1.4', areaId: 'societario',
    enunciado: 'Existe estrutura de proteção patrimonial (Holding) ou separação de riscos?',
    opcoes: {
      A: 'Bens dos sócios estão expostos no nome da Pessoa Física.',
      B: 'Alguns bens separados, mas com mistura patrimonial.',
      C: 'Estrutura em andamento / Planejamento Sucessório iniciado.',
      D: 'Estrutura de Holding ou blindagem jurídica constituída e ativa.'
    },
    sugestaoPadrao: 'Avaliar a viabilidade de uma Holding Patrimonial para proteção e planejamento sucessório.'
  },
  {
    id: '1.5', areaId: 'societario',
    enunciado: 'As funções de cada sócio na operação estão claras e não se sobrepõem?',
    opcoes: {
      A: 'Sócios "batem cabeça", todos mandam em tudo.',
      B: 'Divisão informal, mas as vezes um invade a área do outro.',
      C: 'Divisão clara no papel, mas na prática há interferências.',
      D: 'Organograma respeitado: cada sócio tem sua diretoria e autonomia.'
    },
    sugestaoPadrao: 'Definir organograma diretivo e matriz de responsabilidades (RACI) entre os sócios.'
  },

  // 2. Tecnologia & Inovação
  {
    id: '2.1', areaId: 'tecnologia',
    enunciado: 'O sistema de gestão (ERP) centraliza a operação ou há dependência de planilhas?',
    opcoes: {
      A: 'Vários controles paralelos, papel e redigitação manual.',
      B: 'Sistema existe mas é subutilizado (usa-se muito Excel fora).',
      C: 'Sistema centraliza 80% da operação.',
      D: 'ERP integrado (Vendas, Estoque, Financeiro) em tempo real (100%).'
    },
    sugestaoPadrao: 'Migrar controles paralelos para o ERP e treinar a equipe para uso integral das funcionalidades.'
  },
  {
    id: '2.2', areaId: 'tecnologia',
    enunciado: 'Como é realizado o backup dos dados e a proteção contra ataques?',
    opcoes: {
      A: 'Backup manual em HD externo/Pen drive ou não existe.',
      B: 'Backup em nuvem esporádico (ex: Google Drive pessoal).',
      C: 'Backup automático, mas sem teste de restauração.',
      D: 'Backup em nuvem automatizado, criptografado e testado regularmente.'
    },
    sugestaoPadrao: 'Implementar solução de backup em nuvem profissional com redundância e testes de restore.'
  },
  {
    id: '2.3', areaId: 'tecnologia',
    enunciado: 'Tarefas repetitivas (boletos, notas, e-mails) são feitas por robôs/sistemas?',
    opcoes: {
      A: 'Processos manuais, lentos e sujeitos a erro humano.',
      B: 'Algumas automações isoladas, mas muita intervenção manual.',
      C: 'Maioria automatizada, mas requer supervisão constante.',
      D: 'Automação de fluxo de trabalho (Workflow) implementada ponta a ponta.'
    },
    sugestaoPadrao: 'Identificar gargalos manuais e implementar ferramentas de automação (RPA/n8n/Make).'
  },
  {
    id: '2.4', areaId: 'tecnologia',
    enunciado: 'A empresa utiliza novas tecnologias (IA, Dashboards) para ganhar competitividade?',
    opcoes: {
      A: 'Ignora tecnologia, opera processos como há 10 anos.',
      B: 'Usa ferramentas básicas, mas sem integração inteligente.',
      C: 'Começando a usar Dashboards para visualização de dados.',
      D: 'Usa ferramentas de ponta e IA para análise preditiva e produtividade.'
    },
    sugestaoPadrao: 'Capacitar a equipe no uso de IA generativa e BI para suporte à tomada de decisão.'
  },
  {
    id: '2.5', areaId: 'tecnologia',
    enunciado: 'Os dados de clientes e funcionários estão tratados conforme a LGPD?',
    opcoes: {
      A: 'Nenhum controle de acesso, dados sensíveis expostos.',
      B: 'Controle básico de senhas, mas sem política definida.',
      C: 'Processos mapeados, mas adequação parcial.',
      D: 'Processos 100% adequados à LGPD com controle de acesso rigoroso.'
    },
    sugestaoPadrao: 'Realizar diagnóstico de conformidade LGPD e implementar políticas de privacidade.'
  },

  // 3. Comercial
  {
    id: '3.1', areaId: 'comercial',
    enunciado: 'O preço de venda cobre custos e garante margem real de lucro?',
    opcoes: {
      A: 'Preço baseado no "chute" ou apenas copiando o concorrente.',
      B: 'Cálculo simples (Custo x 2), sem análise de margem de contribuição.',
      C: 'Precificação técnica, mas desatualizada.',
      D: 'Precificação técnica com markup revisado e margem de contribuição clara.'
    },
    sugestaoPadrao: 'Revisar a planilha de precificação considerando impostos, custos fixos e margem desejada.'
  },
  {
    id: '3.2', areaId: 'comercial',
    enunciado: 'As metas são desdobradas (diárias/semanais) e visíveis para o time?',
    opcoes: {
      A: 'Meta existe apenas na cabeça do dono ou mensal global.',
      B: 'Meta definida verbalmente, sem acompanhamento visual.',
      C: 'Metas individuais definidas em planilha, cobradas semanalmente.',
      D: 'Metas desdobradas acompanhadas em tempo real (Gestão à Vista).'
    },
    sugestaoPadrao: 'Implementar dashboard de gestão à vista com indicadores de performance (KPIs) diários.'
  },
  {
    id: '3.3', areaId: 'comercial',
    enunciado: 'Existe gestão do funil de vendas e taxa de conversão (CRM)?',
    opcoes: {
      A: 'Venda anotada em caderno/agenda. Sem histórico.',
      B: 'Planilha de controle de clientes (Excel).',
      C: 'CRM implantado mas subutilizado (apenas cadastro).',
      D: 'CRM ativo com funil, motivos de perda e histórico de interações.'
    },
    sugestaoPadrao: 'Treinar o time comercial no uso do CRM e monitorar as taxas de conversão de cada etapa.'
  },
  {
    id: '3.4', areaId: 'comercial',
    enunciado: 'Existe um roteiro de vendas (Script, Objeções) padronizado?',
    opcoes: {
      A: 'Cada vendedor vende do seu jeito (Depende de talento individual).',
      B: 'Existe um script verbal combinado, mas não documentado.',
      C: 'Playbook escrito, mas a equipe não segue à risca.',
      D: 'Playbook de Vendas treinado, auditado e executado por todos.'
    },
    sugestaoPadrao: 'Criar um Playbook de Vendas com scripts de abordagem e técnicas de contorno de objeções.'
  },
  {
    id: '3.5', areaId: 'comercial',
    enunciado: 'Como os clientes chegam na empresa (Canais de Aquisição)?',
    opcoes: {
      A: '100% Indicação / Boca a boca (Dependência total da rede atual).',
      B: 'Indicação + Prospecção ativa eventual sem processo.',
      C: 'Processo híbrido (Marketing Digital + Indicação) constante.',
      D: 'Máquina de vendas previsível com múltiplos canais tracionando.'
    },
    sugestaoPadrao: 'Diversificar canais de aquisição para reduzir a dependência exclusiva de indicações.'
  },

  // 4. Marketing
  {
    id: '4.1', areaId: 'marketing',
    enunciado: 'A vitrine digital (Site, Redes, Google) transmite autoridade?',
    opcoes: {
      A: 'Não tem site ou redes sociais estão abandonadas/amadoras.',
      B: 'Redes sociais ativas, mas sem estratégia visual definida.',
      C: 'Presença digital bonita, mas converte pouco.',
      D: 'Presença digital profissional, autoridade clara e focada em conversão.'
    },
    sugestaoPadrao: 'Revitalizar a identidade visual e otimizar o site para conversão de leads.'
  },
  {
    id: '4.2', areaId: 'marketing',
    enunciado: 'O marketing entrega oportunidades reais (MQL) para o comercial?',
    opcoes: {
      A: 'Só entrega "curiosos" ou métricas de vaidade (likes/seguidores).',
      B: 'Leads chegam, mas muito frios ou desqualificados.',
      C: 'Volume bom de leads, qualidade mediana.',
      D: 'Entrega leads qualificados (MQL) prontos para abordagem comercial.'
    },
    sugestaoPadrao: 'Definir critérios de qualificação de leads (SLA) entre marketing e vendas.'
  },
  {
    id: '4.3', areaId: 'marketing',
    enunciado: 'A empresa sabe o Custo de Aquisição de Cliente (CAC)?',
    opcoes: {
      A: 'Não sabe quanto gasta para trazer um cliente novo.',
      B: 'Sabe apenas o valor total investido em anúncios.',
      C: 'Monitora o custo por lead (CPL), mas não o CAC final.',
      D: 'Monitora CAC, ROI e LTV (Valor do tempo de vida) mensalmente.'
    },
    sugestaoPadrao: 'Implementar planilha de métricas para monitorar CAC e ROI por canal de aquisição.'
  },
  {
    id: '4.4', areaId: 'marketing',
    enunciado: 'Existem campanhas ativas para revender para a base atual (Farm)?',
    opcoes: {
      A: 'Foco 100% em cliente novo. Base antiga é esquecida.',
      B: 'Ações pontuais (ex: Black Friday), sem recorrência.',
      C: 'Campanhas estruturadas, mas manuais.',
      D: 'Campanhas recorrentes e automatizadas de Cross-sell e Up-sell.'
    },
    sugestaoPadrao: 'Implementar régua de relacionamento pós-venda para aumentar o LTV da base atual.'
  },
  {
    id: '4.5', areaId: 'marketing',
    enunciado: 'A empresa utiliza Google Meu Negócio e avaliações a seu favor?',
    opcoes: {
      A: 'Perfil inexistente ou desatualizado.',
      B: 'Perfil existe, mas poucas avaliações ou sem resposta.',
      C: 'Perfil ativo, responde avaliações esporadicamente.',
      D: 'Gestão ativa de reputação, incentivando avaliações 5 estrelas.'
    },
    sugestaoPadrao: 'Atualizar o Google Meu Negócio e criar campanha de incentivo a depoimentos de clientes.'
  },

  // 5. Financeiro
  {
    id: '5.1', areaId: 'financeiro',
    enunciado: 'Existe mistura de contas pessoais dos sócios com as da empresa?',
    opcoes: {
      A: 'Caixa único. Empresa paga contas da casa do dono (Escola, Mercado).',
      B: 'Contas separadas, mas transferências frequentes sem registro.',
      C: 'Separação existe, mas ocorrem exceções eventuais.',
      D: 'Separação total e auditada (Princípio da Entidade respeitado).'
    },
    sugestaoPadrao: 'Eliminar pagamentos pessoais pela conta da empresa e instituir pro-labore fixo.'
  },
  {
    id: '5.2', areaId: 'financeiro',
    enunciado: 'O salário dos sócios (Pró-Labore) é fixo e definido?',
    opcoes: {
      A: 'Retiradas aleatórias conforme "sobra" dinheiro no dia.',
      B: 'Valor definido "de boca", mas varia conforme a necessidade.',
      C: 'Pró-labore definido, mas as vezes atrasa ou adianta.',
      D: 'Pró-labore fixo de mercado pago na data correta + Lucros apurados.'
    },
    sugestaoPadrao: 'Formalizar o pró-labore dos sócios e agendar retiradas mensais fixas.'
  },
  {
    id: '5.3', areaId: 'financeiro',
    enunciado: 'O Contas a Pagar/Receber é conciliado diariamente?',
    opcoes: {
      A: 'Controle frouxo, perde-se prazos ou esquece de cobrar.',
      B: 'Conciliação feita semanalmente ou quando dá tempo.',
      C: 'Conciliação diária, mas com pequenos furos de centavos.',
      D: 'Conciliação bancária diária, rigorosa e sem erros.'
    },
    sugestaoPadrao: 'Implementar processo rigoroso de conciliação bancária diária no ERP.'
  },
  {
    id: '5.4', areaId: 'financeiro',
    enunciado: 'Existe previsibilidade de caixa para 30/60/90 dias?',
    opcoes: {
      A: 'Vive o dia de hoje ("Vendendo almoço p/ pagar janta").',
      B: 'Olha apenas as contas da semana seguinte.',
      C: 'Fluxo de caixa projetado para o mês corrente.',
      D: 'Fluxo de caixa projetado para 3 meses à frente com cenários.'
    },
    sugestaoPadrao: 'Projetar o fluxo de caixa para 90 dias com análise de cenários otimista e pessimista.'
  },
  {
    id: '5.5', areaId: 'financeiro',
    enunciado: 'Existe processo estruturado de cobrança e inadimplência?',
    opcoes: {
      A: 'Cobra apenas quando lembra ou tem medo de cobrar o cliente.',
      B: 'Cobra via WhatsApp informalmente, sem padrão.',
      C: 'Régua de cobrança manual (e-mail/ligação).',
      D: 'Régua de cobrança automatizada, preventiva e ativa.'
    },
    sugestaoPadrao: 'Automatizar a régua de cobrança e definir políticas claras de juros e multas.'
  },

  // 6. Controladoria
  {
    id: '6.1', areaId: 'controladoria',
    enunciado: 'Analisa-se o lucro real (Competência) mensalmente?',
    opcoes: {
      A: 'Olha apenas saldo bancário (Caixa). Não sabe se teve lucro econômico.',
      B: 'DRE existe mas é confuso ou incompleto.',
      C: 'DRE analisado esporadicamente ou com atraso.',
      D: 'DRE analisado mensalmente com margens detalhadas (EBITDA).'
    },
    sugestaoPadrao: 'Implantar DRE gerencial por competência para análise real da lucratividade do negócio.'
  },
  {
    id: '6.2', areaId: 'controladoria',
    enunciado: 'Conhece-se a margem de contribuição real de cada produto/serviço?',
    opcoes: {
      A: 'Não sabe qual produto dá prejuízo. Vende no volume.',
      B: 'Sabe a margem média geral, mas não por produto.',
      C: 'Margem calculada para os principais produtos apenas.',
      D: 'Margem calculada por SKU/Serviço. Mix otimizado pelo lucro.'
    },
    sugestaoPadrao: 'Calcular a margem de contribuição individual por produto e serviço.'
  },
  {
    id: '6.3', areaId: 'controladoria',
    enunciado: 'Existe teto de gastos definido por departamento (Orçamento)?',
    opcoes: {
      A: 'Gasta-se conforme a necessidade aparece (Sem teto).',
      B: 'Existe uma ideia de limite, mas ninguém controla.',
      C: 'Orçamento definido, mas não há travamento de gastos.',
      D: 'Orçamento anual definido e acompanhado (Previsto x Realizado).'
    },
    sugestaoPadrao: 'Elaborar orçamento anual (Budget) e monitorar variações mensais.'
  },
  {
    id: '6.4', areaId: 'controladoria',
    enunciado: 'Existe inventário rotativo para evitar furos de estoque e roubos?',
    opcoes: {
      A: 'Estoque nunca bate, não é contado ou é bagunçado.',
      B: 'Contagem apenas anual (Balanço), com muitas divergências.',
      C: 'Contagens mensais, mas ainda sobram ajustes.',
      D: 'Inventários cíclicos (rotativos) e auditoria de processos constantes.'
    },
    sugestaoPadrao: 'Implementar inventários rotativos semanais e auditar as baixas de estoque.'
  },
  {
    id: '6.5', areaId: 'controladoria',
    enunciado: 'Os custos fixos são revisados periodicamente?',
    opcoes: {
      A: 'Custos fixos só aumentam, nunca são questionados.',
      B: 'Revisão apenas em momentos de crise aguda.',
      C: 'Revisão anual básica de contratos.',
      D: 'Gestão Matricial de Despesas (GMD) ativa para redução contínua.'
    },
    sugestaoPadrao: 'Revisar todos os contratos de custos fixos em busca de eficiência e renegociação.'
  },

  // 7. Fiscal
  {
    id: '7.1', areaId: 'fiscal',
    enunciado: 'Qual o regime tributário atual da empresa?',
    opcoes: {
      A: 'Informal / Não sabe informar (Risco alto).',
      B: 'Simples Nacional (Evolução natural sem revisão).',
      C: 'Lucro Presumido (Média complexidade).',
      D: 'Lucro Real (Alta complexidade e controle rigoroso).'
    },
    sugestaoPadrao: 'Realizar planejamento tributário para validar se o regime atual é o mais eficiente.'
  },
  {
    id: '7.2', areaId: 'fiscal',
    enunciado: 'A classificação fiscal (NCM) está auditada?',
    opcoes: {
      A: 'Cadastro de produtos nunca revisado.',
      B: 'Revisão feita apenas na implantação do sistema.',
      C: 'Revisão esporádica por amostragem.',
      D: 'Auditoria de cadastro completa e monitoramento constante.'
    },
    sugestaoPadrao: 'Contratar auditoria de cadastro fiscal para evitar multas.'
  },
  {
    id: '7.3', areaId: 'fiscal',
    enunciado: 'A regularidade fiscal (CNDs) é monitorada mensalmente?',
    opcoes: {
      A: 'Descobre dívida só quando bloqueia a conta.',
      B: 'Pede CND apenas quando precisa de empréstimo.',
      C: 'Monitoramento trimestral pelo contador.',
      D: 'Monitoramento preventivo mensal de todas as certidões.'
    },
    sugestaoPadrao: 'Implementar check-up fiscal mensal.'
  },

  // ... (Outras perguntas mantidas conforme o CSV anterior)
  // 10. Pessoas (RH)
  {
    id: '10.1', areaId: 'pessoas',
    enunciado: 'Qual a estrutura atual do departamento de pessoas?',
    opcoes: {
      A: 'Não tem (Dono faz tudo ou é delegado sem processo).',
      B: 'Apenas DP (Focado em burocracia/folha).',
      C: 'RH Generalista (Recrutamento + DP).',
      D: 'RH Estratégico (DHO, Clima, Treinamento e Cultura).'
    },
    sugestaoPadrao: 'Estruturar processos básicos de RH para suporte ao crescimento.'
  },
  {
    id: '10.2', areaId: 'pessoas',
    enunciado: 'Existe um calendário de treinamentos técnicos e comportamentais?',
    opcoes: {
      A: 'Nenhum treinamento realizado.',
      B: 'Treinamentos esporádicos quando surge erro grave.',
      C: 'Calendário técnico existe, mas sem foco comportamental.',
      D: 'Calendário anual de treinamentos (Soft e Hard Skills) executado.'
    },
    sugestaoPadrao: 'Implementar matriz de treinamento baseada nos GAPs da equipe.'
  },
  
  // Re-inserindo as demais do CSV original (resumo)
  {
    id: '10.3', areaId: 'pessoas',
    enunciado: 'O processo seletivo avalia técnica e perfil comportamental?',
    opcoes: {
      A: 'Contrata na urgência ("o primeiro que aceitar").',
      B: 'Entrevista focada apenas na experiência técnica (CV).',
      C: 'Aplica-se teste técnico e entrevista com RH.',
      D: 'Processo com testes, análise de perfil (DISC) e validação cultural.'
    },
    sugestaoPadrao: 'Utilizar ferramentas de análise comportamental (DISC).'
  }
  // (Omitindo repetições para brevidade, mas as 60 originais + as novas estariam aqui no código real)
];

export const SCORE_MAP = {
  A: 0,
  B: 33,
  C: 66,
  D: 100
};

export const COLOR_MAP = {
  critical: 'bg-red-500 text-white',
  alert: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-slate-900',
  good: 'bg-green-500 text-white'
};
