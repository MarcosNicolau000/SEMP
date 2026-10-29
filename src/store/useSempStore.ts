import { create } from 'zustand'
import {
  CONTATOS_INICIAIS,
  DADOS_INICIAIS_MEDIDA,
  OCORRENCIAS_INICIAIS,
  ContatoEmergencia,
  MedidaProtetivaInfo,
  Ocorrencia,
} from '../data/mockData'

interface SempState {
  pinAcesso: string
  pinPanico: string
  contatos: ContatoEmergencia[]
  medida: MedidaProtetivaInfo
  ocorrencias: Ocorrencia[]
  alertaAtivo: boolean
  alertaSilencioso: boolean
  tempoAlertaSegundos: number
  statusViatura: 'despachada' | 'a_caminho' | 'no_local'
  
  adicionarContato: (contato: Omit<ContatoEmergencia, 'id' | 'iniciais' | 'corIniciais'>) => void
  dispararSos: (silencioso?: boolean) => void
  cancelarSos: () => void
  confirmarChegadaViatura: () => void
  incrementarTempo: () => void
}

export const useSempStore = create<SempState>((set) => ({
  pinAcesso: '9482',
  pinPanico: '1900',
  contatos: CONTATOS_INICIAIS,
  medida: DADOS_INICIAIS_MEDIDA,
  ocorrencias: OCORRENCIAS_INICIAIS,
  alertaAtivo: false,
  alertaSilencioso: false,
  tempoAlertaSegundos: 0,
  statusViatura: 'despachada',

  adicionarContato: (novo) =>
    set((state) => {
      const iniciais = novo.nome.trim().charAt(0).toUpperCase() || 'C'
      const cores = [
        'bg-primary-fixed text-primary',
        'bg-tertiary-fixed text-tertiary',
        'bg-surface-container-highest text-on-surface',
      ]
      const corIniciais = cores[state.contatos.length % cores.length]

      const novoContato: ContatoEmergencia = {
        ...novo,
        id: Date.now().toString(),
        iniciais,
        corIniciais,
      }

      const next = {
        contatos: [...state.contatos, novoContato],
      }
      broadcastState(next)
      return next
    }),

  dispararSos: (silencioso = false) =>
    set((state) => {
      const novaOcorrencia: Ocorrencia = {
        id: Date.now().toString(),
        numero: `#${Math.floor(100 + Math.random() * 900)}`,
        dataHora: 'Agora mesmo',
        tipo: silencioso ? 'SOS Silencioso (Via Disfarce)' : 'SOS de Emergência Acionado',
        status: 'ativa',
        detalhes: 'Alerta prioritário com envio de coordenadas ao COPOM e viatura Maria da Penha.',
        viatura: 'Viatura 24M (Despachada)',
      }

      const next: Partial<SempState> = {
        alertaAtivo: true,
        alertaSilencioso: silencioso,
        tempoAlertaSegundos: 0,
        statusViatura: 'a_caminho',
        ocorrencias: [novaOcorrencia, ...state.ocorrencias],
      }
      broadcastState(next)
      return next
    }),

  cancelarSos: () =>
    set((state) => {
      const next: Partial<SempState> = {
        alertaAtivo: false,
        alertaSilencioso: false,
        tempoAlertaSegundos: 0,
        ocorrencias: state.ocorrencias.map((o, idx) =>
          idx === 0 && o.status === 'ativa'
            ? {
                ...o,
                status: 'cancelada',
                detalhes: 'Alerta cancelado pela usuária com senha de segurança.',
              }
            : o
        ),
      }
      broadcastState(next)
      return next
    }),

  confirmarChegadaViatura: () =>
    set((state) => {
      const next: Partial<SempState> = {
        statusViatura: 'no_local',
        ocorrencias: state.ocorrencias.map((o, idx) =>
          idx === 0 && o.status === 'ativa'
            ? {
                ...o,
                status: 'concluida',
                detalhes: 'Viatura 24M no local. Vítima em segurança assistida.',
              }
            : o
        ),
      }
      broadcastState(next)
      return next
    }),

  incrementarTempo: () =>
    set((state) => ({
      tempoAlertaSegundos: state.tempoAlertaSegundos + 1,
    })),
}))

const channel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('semp_pwa_sync')
    : null

function broadcastState(partial: Partial<SempState>) {
  if (channel) {
    channel.postMessage(partial)
  }
}

if (channel) {
  channel.onmessage = (event: MessageEvent<Partial<SempState>>) => {
    if (event.data && typeof event.data === 'object') {
      useSempStore.setState(event.data)
    }
  }
}
