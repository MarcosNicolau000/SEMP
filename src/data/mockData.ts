export interface ContatoEmergencia {
  id: string
  nome: string
  parentesco: string
  telefone: string
  iniciais: string
  corIniciais: string
  notificaSms: boolean
  notificaWhatsapp: boolean
}

export interface Ocorrencia {
  id: string
  numero: string
  dataHora: string
  tipo: string
  status: 'ativa' | 'concluida' | 'cancelada'
  detalhes: string
  viatura?: string
}

export interface MedidaProtetivaInfo {
  numeroAutos: string
  validade: string
  mesesRestantes: string
  vara: string
  status: string
  agressor: {
    nome: string
    idade: number
    relacao: string
    fotoUrl?: string
  }
  regras: Array<{
    titulo: string
    descricao: string
    icone: string
  }>
}

export const DADOS_INICIAIS_MEDIDA: MedidaProtetivaInfo = {
  numeroAutos: '0823412-44.2024.8.26.0100',
  validade: '15/12/2025',
  mesesRestantes: 'mais 10 meses',
  vara: '2ª Vara de Violência Doméstica da Capital',
  status: 'Medida Vigente • TJSP',
  agressor: {
    nome: 'Carlos Eduardo Mendes',
    idade: 34,
    relacao: 'Ex-companheiro (Notificado judicialmente)',
  },
  regras: [
    {
      titulo: '300 metros',
      descricao: 'Distanciamento compulsório obrigatório em qualquer espaço público ou privado.',
      icone: 'radar',
    },
    {
      titulo: 'Proibição Total de Contato',
      descricao: 'Vedado por chamadas, WhatsApp, redes sociais, recados por terceiros ou aproximação.',
      icone: 'phonelink_erase',
    },
    {
      titulo: 'Restrição de Frequência',
      descricao: 'Proibido comparecer ao local de trabalho, residência ou locais habituais da vítima.',
      icone: 'gavel',
    },
  ],
}

export const CONTATOS_INICIAIS: ContatoEmergencia[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    parentesco: 'Mãe',
    telefone: '(11) 99876-5432',
    iniciais: 'M',
    corIniciais: 'bg-primary-fixed text-primary',
    notificaSms: true,
    notificaWhatsapp: true,
  },
  {
    id: '2',
    nome: 'Ana Clara',
    parentesco: 'Irmã de Confiança',
    telefone: '(11) 98123-4567',
    iniciais: 'A',
    corIniciais: 'bg-surface-container-highest text-on-surface',
    notificaSms: true,
    notificaWhatsapp: true,
  },
  {
    id: '3',
    nome: 'Polícia Militar (COPOM)',
    parentesco: 'Central 190 / Patrulha Maria da Penha',
    telefone: '190',
    iniciais: '190',
    corIniciais: 'bg-secondary-fixed text-secondary',
    notificaSms: true,
    notificaWhatsapp: false,
  },
]

export const OCORRENCIAS_INICIAIS: Ocorrencia[] = [
  {
    id: '1',
    numero: '#082',
    dataHora: 'Hoje às 21:40',
    tipo: 'Acionamento de SOS Silencioso',
    status: 'concluida',
    detalhes: 'Sinal de pânico acionado via disfarce. Viatura 24M despachada para Av. Paulista.',
    viatura: 'Viatura 24M (Patrulha Maria da Penha)',
  },
  {
    id: '2',
    numero: '#078',
    dataHora: '28 Set 2026, 18:15',
    tipo: 'Aproximação Suspeita em Perímetro',
    status: 'concluida',
    detalhes: 'Tentativa de aproximação nas imediações do metrô. Acionamento preventivo.',
    viatura: 'Viatura 12B',
  },
  {
    id: '3',
    numero: '#065',
    dataHora: '12 Ago 2026, 09:30',
    tipo: 'Registro de Contato Telefônico Indevido',
    status: 'concluida',
    detalhes: 'Descumprimento da cláusula de comunicação eletrônica. Provas anexadas aos autos.',
  },
]
