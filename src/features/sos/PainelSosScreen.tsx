import { useState, useRef, useEffect } from 'react'
import { useSempStore } from '../../store/useSempStore'

export function PainelSosScreen() {
  const { alertaAtivo, dispararSos, cancelarSos, contatos } = useSempStore()
  const [progresso, setProgresso] = useState(0)
  const timerRef = useRef<number | null>(null)

  const circumference = 276 // 2 * pi * 44 approx

  const iniciarPressionamento = () => {
    if (alertaAtivo) return
    setProgresso(0)
    const interval = window.setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          dispararSos(false)
          if (navigator.vibrate) {
            navigator.vibrate([150, 80, 150])
          }
          return 100
        }
        return prev + 5
      })
    }, 50)
    timerRef.current = interval
  }

  const cancelarPressionamento = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (!alertaAtivo) {
      setProgresso(0)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const strokeDashoffset = circumference - (progresso / 100) * circumference

  return (
    <div className="flex flex-col flex-1 w-full py-5 px-4 bg-surface justify-between">
      <div className="flex flex-col items-center w-full max-w-md mx-auto my-auto py-2 gap-6">
        {/* Status de Proteção Ativa */}
        <div className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-lowest rounded-full shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  alertaAtivo ? 'bg-secondary' : 'bg-tertiary-container'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  alertaAtivo ? 'bg-secondary' : 'bg-tertiary'
                }`}
              ></span>
            </span>
            <span className="text-[13px] font-medium text-on-surface truncate">
              {alertaAtivo ? 'Alerta Transmitindo • Central 190' : 'Proteção Ativa • Polícia & Contatos'}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              alertaAtivo
                ? 'bg-secondary text-on-secondary animate-pulse'
                : 'text-tertiary bg-tertiary-fixed/40'
            }`}
          >
            {alertaAtivo ? 'DISPARADO' : 'Conectado'}
          </span>
        </div>

        {/* Botão SOS Central */}
        <div className="flex flex-col items-center justify-center text-center my-2 w-full">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Anéis de pulso */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                alertaAtivo ? 'bg-secondary/25 animate-ping' : 'bg-secondary/10 animate-ping'
              }`}
              style={{ animationDuration: alertaAtivo ? '1.5s' : '2.8s' }}
            ></div>
            <div
              className={`absolute inset-4 rounded-full transition-all duration-300 ${
                alertaAtivo ? 'bg-secondary/30 animate-pulse' : 'bg-secondary/15 animate-pulse'
              }`}
              style={{ animationDuration: alertaAtivo ? '1s' : '2s' }}
            ></div>
            <div className="absolute inset-7 rounded-full bg-secondary-fixed/50"></div>

            {/* SVG Progress Ring */}
            <svg
              className="absolute inset-6 w-52 h-52 transform -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-secondary-fixed-dim/40"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <circle
                className="text-secondary"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={alertaAtivo ? 0 : strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              ></circle>
            </svg>

            {/* Botão Central Interativo */}
            <button
              onMouseDown={iniciarPressionamento}
              onMouseUp={cancelarPressionamento}
              onMouseLeave={cancelarPressionamento}
              onTouchStart={iniciarPressionamento}
              onTouchEnd={cancelarPressionamento}
              type="button"
              className={`relative z-10 w-40 h-40 rounded-full text-on-secondary shadow-2xl flex flex-col items-center justify-center select-none active:scale-95 transition-all focus:outline-none cursor-pointer ${
                alertaAtivo
                  ? 'bg-secondary-container hover:bg-secondary'
                  : 'bg-secondary hover:bg-secondary/95'
              }`}
            >
              <span
                className="material-symbols-outlined text-[44px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {alertaAtivo ? 'broadcast_on_home' : 'emergency'}
              </span>
              <span className="text-3xl font-bold tracking-tight mt-0.5">
                {alertaAtivo ? 'SOCORRO' : 'SOS'}
              </span>
            </button>
          </div>

          {/* Feedback & Instruções */}
          <div className="flex flex-col items-center mt-4 text-center max-w-xs">
            <span
              className={`text-lg font-bold ${
                alertaAtivo ? 'text-secondary animate-pulse' : 'text-on-surface'
              }`}
            >
              {alertaAtivo ? 'ALERTA POLICIAL DISPARADO' : 'Pressione 1.5s para acionar'}
            </span>
            <p className="text-sm text-on-surface-variant mt-1">
              {alertaAtivo
                ? 'Localização e escuta ambiente enviadas à viatura em código 3.'
                : 'Envia localização precisa e alerta imediato à Central 190 e familiares.'}
            </p>

            {alertaAtivo && (
              <button
                type="button"
                onClick={cancelarSos}
                className="mt-3 px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                Cancelar Alerta (Falso Alarme)
              </button>
            )}
          </div>
        </div>

        {/* Resumo dos Contatos Cadastrados */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Aviso Rápido Configurado
            </span>
            <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> Pronto
            </span>
          </div>

          <div className="flex items-center justify-around pt-1">
            {contatos.slice(0, 3).map((contato, idx) => (
              <div key={contato.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${contato.corIniciais}`}
                >
                  {contato.iniciais}
                </div>
                <span className="text-xs font-medium text-on-surface">{contato.parentesco}</span>
                {idx < 2 && <div className="w-px h-5 bg-outline-variant/40 ml-2"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
