import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSempStore } from '../../store/useSempStore'

export function RedeApoioScreen() {
  const navigate = useNavigate()
  const { contatos, pinAcesso, pinPanico } = useSempStore()

  const [mostrarPinNormal, setMostrarPinNormal] = useState(false)
  const [mostrarPinPanico, setMostrarPinPanico] = useState(false)
  const [envioLocalizacao, setEnvioLocalizacao] = useState(true)
  const [audioAmbiente, setAudioAmbiente] = useState(true)

  return (
    <div className="flex flex-col flex-1 w-full py-5 px-4 bg-surface space-y-5">
      <div className="max-w-xl mx-auto w-full space-y-5">
        <div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Gatilhos discretos e contatos de confiança. Ao acionar o código de socorro, o alerta é
            enviado em silêncio.
          </p>
        </div>

        {/* SEÇÃO 1: CÓDIGOS DA CALCULADORA */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-on-surface font-bold tracking-tight">
              Códigos da Calculadora
            </h2>
            <span className="flex items-center gap-1 text-[11px] text-tertiary font-semibold">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Protegido
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* PIN Normal */}
            <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high shadow-sm flex flex-col justify-between space-y-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span className="text-xs font-bold text-on-surface">Entrada Normal</span>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-tight">
                  Abre o app SEMP
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                <span className="font-mono text-base tracking-widest text-on-surface font-semibold">
                  {mostrarPinNormal ? pinAcesso : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarPinNormal(!mostrarPinNormal)}
                  className="text-on-surface-variant hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {mostrarPinNormal ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* PIN Pânico */}
            <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-secondary/20 shadow-sm flex flex-col justify-between space-y-2 relative overflow-hidden">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    emergency
                  </span>
                  <span className="text-xs font-bold text-secondary">Pânico Silencioso</span>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-tight">
                  Simula erro e pede socorro
                </p>
              </div>

              <div className="bg-secondary-fixed/30 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                <span className="font-mono text-base tracking-widest text-secondary font-bold">
                  {mostrarPinPanico ? pinPanico : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarPinPanico(!mostrarPinPanico)}
                  className="text-secondary hover:text-secondary-container p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {mostrarPinPanico ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: CONTATOS DE EMERGÊNCIA */}
        <section className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-sm text-on-surface font-bold tracking-tight">
                Contatos de Emergência
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">({contatos.length})</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app/contatos/novo')}
              className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {contatos.map((contato) => (
              <div
                key={contato.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${contato.corIniciais}`}
                  >
                    {contato.iniciais}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface">{contato.nome}</span>
                    <span className="text-xs text-on-surface-variant">
                      {contato.parentesco} • {contato.telefone}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${contato.telefone.replace(/\D/g, '')}`}
                  className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  title="Ligar discretamente"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </a>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/contatos/novo')}
            className="w-full py-3 border-2 border-dashed border-outline-variant/50 rounded-xl text-primary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-lowest transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Cadastrar Novo Contato de Confiança
          </button>
        </section>

        {/* SEÇÃO 3: PARÂMETROS DE TRANSMISSÃO */}
        <section className="space-y-2 pt-1">
          <h2 className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">
            Protocolo Automático de Disparo
          </h2>

          <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">
                  Rastreamento GPS em Tempo Real
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  Envia link criptografado aos contatos
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnvioLocalizacao(!envioLocalizacao)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  envioLocalizacao ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    envioLocalizacao ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">
                  Gravação de Áudio Ambiente
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  Registra primeiros 60s do alerta
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAudioAmbiente(!audioAmbiente)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  audioAmbiente ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    audioAmbiente ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
