import { useState } from 'react'
import { useSempStore } from '../../store/useSempStore'
import { Ocorrencia } from '../../data/mockData'

export function HistoricoScreen() {
  const ocorrencias = useSempStore((state) => state.ocorrencias)
  const [detalheSelecionado, setDetalheSelecionado] = useState<Ocorrencia | null>(null)
  const [mensagemExportacao, setMensagemExportacao] = useState(false)
  const [reproduzindoAudio, setReproduzindoAudio] = useState<string | null>(null)

  const handleExportarPdf = () => {
    setMensagemExportacao(true)
    setTimeout(() => setMensagemExportacao(false), 4000)
  }

  const handleOuvirAudio = (id: string) => {
    setReproduzindoAudio(id)
    setTimeout(() => setReproduzindoAudio(null), 3000)
  }

  return (
    <div className="flex flex-col flex-1 w-full py-5 px-4 bg-surface space-y-4">
      <div className="max-w-xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-lg font-bold text-on-surface">Histórico de Ocorrências</h2>
          <span className="text-xs text-on-surface-variant font-medium">Válido judicialmente</span>
        </div>

        {mensagemExportacao && (
          <div className="p-3 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>
              Relatório oficial com carimbo de tempo ICP-Brasil gerado para anexação à DDM e TJSP.
            </span>
          </div>
        )}

        {/* Lista de Ocorrências */}
        <div className="flex flex-col gap-3">
          {ocorrencias.map((item) => {
            const isAtiva = item.status === 'ativa'
            const isCancelada = item.status === 'cancelada'

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-surface-container-lowest p-4 shadow-sm border transition-all ${
                  isAtiva
                    ? 'border-secondary/50 ring-1 ring-secondary/20'
                    : 'border-outline-variant/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-primary">{item.numero}</span>
                    <span className="text-[11px] text-on-surface-variant">{item.dataHora}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                      isAtiva
                        ? 'bg-red-100 text-red-700 animate-pulse'
                        : isCancelada
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAtiva ? 'bg-red-600' : isCancelada ? 'bg-slate-500' : 'bg-emerald-600'
                      }`}
                    ></span>
                    {isAtiva ? 'Em Andamento' : isCancelada ? 'Cancelado' : 'Atendido'}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-sm font-semibold text-on-surface">{item.tipo}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.detalhes}</p>
                  {item.viatura && (
                    <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[15px]">local_police</span>
                      {item.viatura}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOuvirAudio(item.id)}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-semibold flex items-center justify-center gap-1 hover:bg-purple-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {reproduzindoAudio === item.id ? 'graphic_eq' : 'volume_up'}
                    </span>
                    <span>{reproduzindoAudio === item.id ? 'Reproduzindo...' : 'Ouvir Áudio'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetalheSelecionado(item)}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Ver Detalhes</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botão de Exportação Legal */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleExportarPdf}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform hover:bg-purple-800"
          >
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            <span>Exportar Provas em PDF</span>
          </button>
          <p className="text-center text-[11px] text-on-surface-variant">
            Relatório oficial aceito pela Delegacia da Mulher (DDM) e Ministério Público.
          </p>
        </div>

        {/* Modal de Detalhes da Ocorrência */}
        {detalheSelecionado && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary font-mono">
                  {detalheSelecionado.numero}
                </span>
                <button
                  type="button"
                  onClick={() => setDetalheSelecionado(null)}
                  className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-on-surface">{detalheSelecionado.tipo}</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Registrado em: {detalheSelecionado.dataHora}
                </p>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-on-surface">Relato Técnico:</p>
                <p className="text-on-surface-variant leading-relaxed">
                  {detalheSelecionado.detalhes}
                </p>
                {detalheSelecionado.viatura && (
                  <p className="text-primary font-medium pt-1">
                    Atendimento: {detalheSelecionado.viatura}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDetalheSelecionado(null)}
                className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
