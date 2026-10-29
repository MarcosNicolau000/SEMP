import { useState } from 'react'
import { useSempStore } from '../../store/useSempStore'

export function MedidaProtetivaScreen() {
  const medida = useSempStore((state) => state.medida)
  const [copiado, setCopiado] = useState(false)

  const copiarProcesso = () => {
    navigator.clipboard.writeText(medida.numeroAutos)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1 w-full py-5 px-4 bg-surface">
      <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
        {/* Card Principal da Medida */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold">
                {medida.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
              <span>Segredo de Justiça</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 my-2">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Número dos Autos
            </span>
            <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="font-mono text-sm font-semibold text-on-surface select-all">
                {medida.numeroAutos}
              </span>
              <button
                type="button"
                onClick={copiarProcesso}
                title="Copiar número do processo"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary hover:bg-primary-fixed active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiado ? 'done' : 'content_copy'}
                </span>
              </button>
            </div>
            {copiado && (
              <span className="text-[10px] text-primary font-semibold self-end">
                Copiado para a área de transferência!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 pt-1 text-on-surface-variant">
            <div className="w-2 h-2 rounded-full bg-tertiary shrink-0 animate-pulse"></div>
            <span className="text-xs">
              Válida até <strong className="text-on-surface font-semibold">{medida.validade}</strong>{' '}
              <span className="text-on-surface-variant">({medida.mesesRestantes})</span>
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-on-surface-variant bg-surface-container-low/70 px-3 py-1.5 rounded-lg text-xs">
            <span className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[16px] text-primary">balance</span>
              {medida.vara}
            </span>
            <span className="text-[11px] text-primary font-bold shrink-0">Concedida</span>
          </div>
        </div>

        {/* Regras de Proteção Imediata */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs text-on-surface-variant uppercase tracking-wider font-bold px-1">
            Regras de Proteção Imediata
          </h2>

          <div className="grid grid-cols-1 gap-2.5 w-full">
            {medida.regras.map((regra) => (
              <div
                key={regra.titulo}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{regra.icone}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-on-surface">{regra.titulo}</span>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                    {regra.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indivíduo Notificado / Agressor */}
        <div className="flex flex-col gap-2 mt-1">
          <h2 className="text-xs text-on-surface-variant uppercase tracking-wider font-bold px-1">
            Indivíduo Notificado (Agressor)
          </h2>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">person_off</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface">
                  {medida.agressor.nome}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {medida.agressor.idade} anos • {medida.agressor.relacao}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
              Bloqueado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
