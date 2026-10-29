import { Link, useNavigate } from 'react-router-dom'
import { SempLogo } from './SempLogo'
import { useSempStore } from '../store/useSempStore'

interface HeaderProps {
  titulo?: string
  subtitulo?: string
  mostrarDisfarce?: boolean
}

export function Header({
  titulo = 'Painel de Segurança',
  subtitulo = 'SEMP',
  mostrarDisfarce = true,
}: HeaderProps) {
  const navigate = useNavigate()
  const alertaAtivo = useSempStore((state) => state.alertaAtivo)

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full pt-safe bg-surface/95 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="h-16 px-4 flex items-center justify-between max-w-xl mx-auto w-full gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <SempLogo size={32} className="shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] leading-tight text-primary uppercase tracking-wider font-bold">
              {subtitulo}
            </span>
            <h1 className="text-[17px] leading-tight font-semibold text-on-surface truncate">
              {titulo}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/tatico"
            className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              alertaAtivo
                ? 'bg-secondary text-on-secondary animate-pulse shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            title="Abrir Painel Tático da Patrulha"
          >
            <span className="material-symbols-outlined text-[17px]">local_police</span>
            <span className="hidden sm:inline">Painel Tático</span>
          </Link>

          {mostrarDisfarce && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-9 px-3.5 rounded-full bg-inverse-surface text-inverse-on-surface flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              title="Disfarçar imediatamente"
            >
              <span className="material-symbols-outlined text-[18px]">calculate</span>
              <span>Disfarçar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
