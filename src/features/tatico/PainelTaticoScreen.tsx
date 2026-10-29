import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSempStore } from '../../store/useSempStore'
import { SempLogo } from '../../components/SempLogo'

export function PainelTaticoScreen() {
  const {
    alertaAtivo,
    ocorrencias,
    confirmarChegadaViatura,
    statusViatura,
    tempoAlertaSegundos,
    incrementarTempo,
  } = useSempStore()

  const [escutaTocando, setEscutaTocando] = useState(true)

  // Timer para simulação de escuta e tempo decorrido
  useEffect(() => {
    const timer = setInterval(() => {
      incrementarTempo()
    }, 1000)
    return () => clearInterval(timer)
  }, [incrementarTempo])

  const ocorrenciaAtual = ocorrencias.find((o) => o.status === 'ativa') || ocorrencias[0]

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60)
    const seg = segundos % 60
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col w-full min-h-dvh bg-slate-950 text-slate-100 font-sans pb-safe">
      {/* Header Tático Militar */}
      <header className="sticky top-0 z-40 pt-safe bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full gap-2">
          <div className="flex items-center gap-2.5">
            <SempLogo size={32} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">SEMP TÁTICO</span>
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[9px] font-extrabold uppercase tracking-wider text-white">
                  Maria da Penha
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    statusViatura === 'no_local'
                      ? 'bg-emerald-400'
                      : 'bg-red-500 animate-ping'
                  }`}
                ></span>
                <span>
                  Viatura 24M •{' '}
                  {statusViatura === 'no_local' ? 'No Local / Assistência' : 'Em Código 3'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-colors"
            >
              App Vítima
            </Link>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs text-white font-semibold transition-colors"
            >
              Disfarce
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Tático */}
      <main className="flex-1 flex flex-col gap-3.5 p-4 max-w-2xl mx-auto w-full pb-10">
        {/* Banner Crítico - Despacho Policial */}
        <div
          className={`rounded-2xl p-4 transition-colors ${
            alertaAtivo
              ? 'bg-gradient-to-r from-red-900/90 to-red-800/80 border border-red-500/50 shadow-lg'
              : 'bg-slate-900 border border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-red-300">
              <span
                className="material-symbols-outlined text-[22px] animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <span className="text-xs font-black tracking-wider uppercase">
                {alertaAtivo ? 'CÓDIGO 3 • PRIORIDADE MÁXIMA' : 'MONITORAMENTO TÁTICO'}
              </span>
            </div>
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              {statusViatura === 'no_local' ? 'Atendimento' : 'Despacho Ativo'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              OCORRÊNCIA {ocorrenciaAtual?.numero || '#082'}
            </span>
            <span className="text-xs text-red-100/90 font-medium">
              {ocorrenciaAtual?.tipo || 'SOS Silencioso disparado pela vítima'}
            </span>
          </div>

          <div className="mt-3 pt-2 grid grid-cols-2 gap-2 bg-black/30 rounded-xl p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-amber-400">timer</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Tempo de Resposta</span>
                <span className="font-bold font-mono text-white">
                  {statusViatura === 'no_local' ? '0 min (No Local)' : '2 min (800m)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-400">radar</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Precisão GPS</span>
                <span className="font-bold text-emerald-400 font-mono">± 3 metros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa com Trajeto e Radar Tático (SVG) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          <div className="p-3 bg-slate-900/90 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-red-500 text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Av. Paulista, 1200 • Bela Vista</span>
                <span className="text-[10px] text-slate-400">Próximo ao Vão Livre do MASP</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
              Perímetro 300m
            </span>
          </div>

          {/* Canvas SVG com radar e rota */}
          <div className="relative w-full h-52 bg-slate-950 overflow-hidden">
            {/* Grid de mapa sutil */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <svg className="w-full h-full" viewBox="0 0 400 220">
              <defs>
                <radialGradient id="alertaPerimetro" cx="65%" cy="40%" r="40%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#dc2626" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ruas simuladas de fundo */}
              <line x1="0" y1="110" x2="400" y2="110" stroke="#334155" strokeWidth="12" />
              <line x1="260" y1="0" x2="260" y2="220" stroke="#334155" strokeWidth="8" />
              <line x1="120" y1="0" x2="120" y2="220" stroke="#334155" strokeWidth="6" />

              {/* Zona de Proteção 300m */}
              <circle cx="260" cy="90" r="60" fill="url(#alertaPerimetro)" />
              <circle
                cx="260"
                cy="90"
                r="60"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="animate-pulse"
              />

              {/* Rota da Viatura até a Vítima */}
              <path
                d="M 60 180 Q 150 170 180 120 T 260 90"
                fill="none"
                stroke="#7e22ce"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 60 180 Q 150 170 180 120 T 260 90"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />

              {/* Marcador da Vítima */}
              <g transform="translate(260, 90)">
                <circle r="14" fill="#dc2626" className="animate-ping opacity-60" />
                <circle r="9" fill="#dc2626" />
                <circle r="4" fill="#ffffff" />
                <text x="14" y="4" fill="#fca5a5" fontSize="11" fontWeight="bold">
                  Vítima (Mariana)
                </text>
              </g>

              {/* Marcador da Viatura 24M */}
              <g transform="translate(60, 180)">
                <circle r="10" fill="#7e22ce" />
                <circle r="4" fill="#ffffff" />
                <text x="14" y="4" fill="#c084fc" fontSize="10" fontWeight="bold">
                  Viatura 24M
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Escuta Ambiente e Áudio */}
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEscutaTocando(!escutaTocando)}
              className="w-10 h-10 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center hover:bg-red-600/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {escutaTocando ? 'graphic_eq' : 'volume_off'}
              </span>
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Transmissão de Áudio Ambiente</span>
              <span className="text-[10px] text-slate-400">Canal Criptografado COPOM</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-red-400 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-900">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>{formatarTempo(tempoAlertaSegundos)}</span>
          </div>
        </div>

        {/* Envolvidos: Vítima e Agressor */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-purple-400 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px]">shield</span>
              <span>VÍTMA PROTEGIDA</span>
            </div>
            <span className="text-xs font-bold text-white">Mariana Silva, 29</span>
            <span className="text-[10px] text-slate-400 leading-snug">
              Medida Autos nº 0823412-44
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-red-400 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px]">person_off</span>
              <span>AGRESSOR / ALVO</span>
            </div>
            <span className="text-xs font-bold text-white">Carlos Eduardo, 34</span>
            <span className="text-[10px] text-red-400 leading-snug">Distância mín. 300m</span>
          </div>
        </div>

        {/* Ação Tática do Operador */}
        <div className="pt-1 flex flex-col gap-2">
          {statusViatura !== 'no_local' ? (
            <button
              type="button"
              onClick={confirmarChegadaViatura}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Confirmar Chegada da Viatura no Local</span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Viatura 24M no Local • Ocorrência em Atendimento</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
