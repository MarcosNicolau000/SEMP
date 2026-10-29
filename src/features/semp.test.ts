import { describe, expect, it, beforeEach } from 'vitest'
import { useSempStore } from '../store/useSempStore'
import deviceFrameRaw from '../components/DeviceFrame.tsx?raw'
import manifestRaw from '../../public/manifest.webmanifest?raw'

describe('SEMP Store and Flow', () => {
  beforeEach(() => {
    // Reset store state
    useSempStore.setState({
      alertaAtivo: false,
      alertaSilencioso: false,
      tempoAlertaSegundos: 0,
      statusViatura: 'despachada',
    })
  })

  it('initializes with default mock contacts and protective order', () => {
    const state = useSempStore.getState()
    expect(state.contatos.length).toBeGreaterThanOrEqual(3)
    expect(state.medida.numeroAutos).toContain('0823412')
    expect(state.pinAcesso).toBe('9482')
    expect(state.pinPanico).toBe('1900')
  })

  it('triggers emergency SOS and adds an active occurrence', () => {
    const store = useSempStore.getState()
    store.dispararSos(false)

    const updated = useSempStore.getState()
    expect(updated.alertaAtivo).toBe(true)
    expect(updated.alertaSilencioso).toBe(false)
    expect(updated.statusViatura).toBe('a_caminho')
    expect(updated.ocorrencias[0].status).toBe('ativa')
  })

  it('can cancel an active SOS', () => {
    const store = useSempStore.getState()
    store.dispararSos(false)
    store.cancelarSos()

    const updated = useSempStore.getState()
    expect(updated.alertaAtivo).toBe(false)
    expect(updated.ocorrencias[0].status).toBe('cancelada')
  })

  it('allows adding a new emergency contact', () => {
    const store = useSempStore.getState()
    const initialCount = store.contatos.length

    store.adicionarContato({
      nome: 'Carla Teste',
      parentesco: 'Amiga',
      telefone: '(11) 99999-8888',
      notificaSms: true,
      notificaWhatsapp: true,
    })

    const updated = useSempStore.getState()
    expect(updated.contatos.length).toBe(initialCount + 1)
    expect(updated.contatos[updated.contatos.length - 1].nome).toBe('Carla Teste')
  })

  it('renders as a native full-viewport PWA without phone mockup bezel', () => {
    expect(deviceFrameRaw).not.toContain('rounded-[44px]')
    expect(deviceFrameRaw).not.toContain('border-[10px]')
    expect(deviceFrameRaw).not.toContain('h-[844px]')
    expect(deviceFrameRaw).toContain('min-h-dvh')
  })

  it('provides a valid disguised standalone PWA manifest', () => {
    const manifest = JSON.parse(manifestRaw)
    expect(manifest.display).toBe('standalone')
    expect(manifest.short_name).toBe('Calculadora')
    expect(manifest.start_url).toBe('/')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })
})
