import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSempStore } from '../../store/useSempStore'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function CalculadoraScreen() {
  const navigate = useNavigate()
  const { pinAcesso, pinPanico, dispararSos, alertaAtivo } = useSempStore()

  const [display, setDisplay] = useState('0')
  const [history, setHistory] = useState('')
  const [alertaSilenciosoAtivo, setAlertaSilenciosoAtivo] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstalarPwa = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
    setMenuAberto(false)
  }

  const handleKey = useCallback(
    (key: string) => {
      if (key === 'C') {
        setDisplay('0')
        setHistory('')
        return
      }

      if (key === '+/-') {
        setDisplay((prev) => {
          if (prev !== '0' && prev !== 'Error') {
            return prev.startsWith('-') ? prev.slice(1) : '-' + prev
          }
          return prev
        })
        return
      }

      if (key === '%') {
        try {
          const val = parseFloat(display)
          if (!isNaN(val)) {
            setDisplay((val / 100).toString())
          }
        } catch {
          setDisplay('Error')
        }
        return
      }

      if (key === '=') {
        const trimmed = display.replace(/\s+/g, '')

        // Checa PIN normal de desbloqueio
        if (trimmed === pinAcesso) {
          navigate('/app')
          return
        }

        // Checa PIN de pânico silencioso
        if (trimmed === pinPanico) {
          dispararSos(true)
          setAlertaSilenciosoAtivo(true)
          setDisplay('0')
          setHistory('Memória OK')
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }
          return
        }

        // Cálculo matemático real
        try {
          const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/')
          if (/^[\d+\-*/. ]+$/.test(sanitized)) {
            const result = Function(`'use strict'; return (${sanitized})`)()
            setHistory(display + ' =')
            setDisplay(String(Number(Number(result).toFixed(6))))
          }
        } catch {
          setDisplay('Error')
        }
        return
      }

      // Tecla de operador
      if (['+', '-', '×', '÷'].includes(key)) {
        if (display === 'Error') {
          setDisplay('0')
          return
        }
        setDisplay((prev) => prev + ' ' + key + ' ')
        return
      }

      // Dígitos e ponto
      setDisplay((prev) => (prev === '0' || prev === 'Error' ? key : prev + key))
    },
    [display, navigate, pinAcesso, pinPanico, dispararSos]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (menuAberto) return
      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key)
      } else if (e.key === '.' || e.key === ',') {
        handleKey('.')
      } else if (e.key === '+') {
        handleKey('+')
      } else if (e.key === '-') {
        handleKey('-')
      } else if (e.key === '*') {
        handleKey('×')
      } else if (e.key === '/') {
        e.preventDefault()
        handleKey('÷')
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleKey('=')
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleKey('C')
      } else if (e.key === 'Backspace') {
        setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1).trimEnd() || '0' : '0'))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, menuAberto])

  return (
    <main className="flex flex-col w-full min-h-dvh bg-surface pt-safe pb-safe px-4 py-6 select-none">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between gap-4">
        {/* Stealth Header */}
        <div>
          <div className="flex items-center justify-between py-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[18px]">calculate</span>
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                Calculadora
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {installPrompt && (
                <button
                  type="button"
                  onClick={handleInstalarPwa}
                  className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-[11px] font-semibold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>Instalar App</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container transition-colors duration-300">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    alertaSilenciosoAtivo || alertaAtivo
                      ? 'bg-secondary animate-pulse'
                      : 'bg-tertiary'
                  }`}
                ></span>
                <span className="text-[10px] text-on-surface-variant font-medium">RAD</span>
              </div>

              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                aria-label="Opções da ferramenta"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* Calculator Display */}
          <div className="flex flex-col justify-end items-end h-36 sm:h-40 px-5 py-4 rounded-2xl bg-surface-container-low shadow-sm">
            <div className="text-xs text-outline truncate max-w-full text-right h-5 font-mono">
              {history}
            </div>
            <div
              data-testid="calc-display"
              className="text-4xl font-semibold tracking-tight text-on-surface text-right w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono"
            >
              {display}
            </div>
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-3 w-full my-auto">
          {/* Row 1 */}
          <button
            onClick={() => handleKey('C')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-high text-on-surface text-lg font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-highest transition-all cursor-pointer"
          >
            C
          </button>
          <button
            onClick={() => handleKey('+/-')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-high text-on-surface text-lg font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-highest transition-all cursor-pointer"
          >
            +/-
          </button>
          <button
            onClick={() => handleKey('%')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-high text-on-surface text-lg font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-highest transition-all cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleKey('÷')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-primary-container text-on-primary text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-primary transition-all cursor-pointer"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleKey('7')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleKey('8')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleKey('9')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleKey('×')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-primary-container text-on-primary text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-primary transition-all cursor-pointer"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleKey('4')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleKey('5')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleKey('6')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleKey('-')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-primary-container text-on-primary text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-primary transition-all cursor-pointer"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleKey('1')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleKey('2')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleKey('3')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleKey('+')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-primary-container text-on-primary text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-primary transition-all cursor-pointer"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleKey('0')}
            type="button"
            className="col-span-2 h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-start pl-7 shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => handleKey('.')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-surface-container-lowest text-on-surface text-xl font-semibold flex items-center justify-center shadow-sm active:scale-95 hover:bg-surface-container-high transition-all cursor-pointer"
          >
            .
          </button>
          <button
            onClick={() => handleKey('=')}
            type="button"
            className="h-16 sm:h-18 rounded-2xl bg-primary text-on-primary text-2xl font-bold flex items-center justify-center shadow-md active:scale-95 hover:bg-purple-800 transition-all cursor-pointer"
          >
            =
          </button>
        </div>

        {/* Discreet subtle calibration card from Stitch design */}
        <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-outline">
              verified_user
            </span>
            <span className="text-xs text-outline">Memória protegida • v2.4.1</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-outline/80">
            STD {pinAcesso}= • SOS {pinPanico}=
          </span>
        </div>
      </div>

      {/* Discreet options sheet (from Stitch design) */}
      {menuAberto && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl bg-surface-container-lowest p-5 shadow-2xl border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-on-surface">Configurações Rápidas</span>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuAberto(false)
                  navigate('/app')
                }}
                className="w-full py-2.5 px-3 rounded-xl text-left bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center justify-between cursor-pointer"
              >
                <span>Abrir Painel SEMP ({pinAcesso}=)</span>
                <span className="material-symbols-outlined text-[18px] text-primary">
                  lock_open
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuAberto(false)
                  navigate('/tatico')
                }}
                className="w-full py-2.5 px-3 rounded-xl text-left bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center justify-between cursor-pointer"
              >
                <span>Abrir Painel Tático 190</span>
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  local_police
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDisplay('0')
                  setHistory('')
                  setMenuAberto(false)
                }}
                className="w-full py-2.5 px-3 rounded-xl text-left bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center justify-between cursor-pointer"
              >
                <span>Limpar Memória</span>
                <span className="material-symbols-outlined text-[18px] text-outline">
                  delete_sweep
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="w-full py-2.5 mt-1 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface text-center cursor-pointer"
            >
              Voltar à Calculadora
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
