import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSempStore } from '../../store/useSempStore'

export function NovoContatoScreen() {
  const navigate = useNavigate()
  const adicionarContato = useSempStore((state) => state.adicionarContato)

  const [nome, setNome] = useState('')
  const [parentesco, setParentesco] = useState('Amiga(o)')
  const [telefone, setTelefone] = useState('')
  const [notificaSms, setNotificaSms] = useState(true)
  const [notificaWhatsapp, setNotificaWhatsapp] = useState(true)
  const [erro, setErro] = useState('')

  const chips = ['Mãe', 'Irmã/Irmão', 'Filha/Filho', 'Amiga(o)', 'Vizinha(o)', 'Outro']

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      setErro('Informe o nome do contato de confiança.')
      return
    }

    if (!telefone.trim() || telefone.length < 8) {
      setErro('Informe um número de telefone válido com DDD.')
      return
    }

    adicionarContato({
      nome: nome.trim(),
      parentesco,
      telefone: telefone.trim(),
      notificaSms,
      notificaWhatsapp,
    })

    navigate('/app/contatos')
  }

  return (
    <div className="flex flex-col flex-1 w-full py-5 px-4 bg-surface">
      <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => navigate('/app/contatos')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors py-1.5 pr-2"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-xs font-semibold">Voltar</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
            <span
              className="material-symbols-outlined text-[15px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold">Criptografia Local</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-on-surface">Novo Contato de Emergência</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pessoa de confiança que receberá alertas silenciosos e sua localização em tempo real.
          </p>
        </div>

        {erro && (
          <div className="p-2.5 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm border border-outline-variant/20">
            {/* Nome */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface flex justify-between" htmlFor="nome">
                <span>Nome Completo</span>
                <span className="text-[10px] text-outline font-normal">Obrigatório</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  person
                </span>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    setErro('')
                  }}
                  placeholder="Ex: Beatriz Lima"
                  className="w-full bg-transparent text-sm text-on-surface outline-none"
                  required
                />
              </div>
            </div>

            {/* Parentesco Chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface flex justify-between">
                <span>Relação / Confiança</span>
                <span className="text-[11px] text-primary font-bold">{parentesco}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setParentesco(chip)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      parentesco === chip
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Telefone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface flex justify-between" htmlFor="telefone">
                <span>Telefone / WhatsApp</span>
                <span className="text-[10px] text-outline font-normal">Com DDD</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-tertiary text-[18px]">call</span>
                <input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value)
                    setErro('')
                  }}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-transparent text-sm text-on-surface outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Protocolos de Transmissão */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col gap-3 shadow-sm border border-outline-variant/20">
            <h3 className="text-xs font-bold text-on-surface">Transmissões no Disparo SOS</h3>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-on-surface">Alerta via WhatsApp</span>
                <span className="text-[10px] text-on-surface-variant">Mensagem automática com link</span>
              </div>
              <input
                type="checkbox"
                checked={notificaWhatsapp}
                onChange={(e) => setNotificaWhatsapp(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-on-surface">SMS de Emergência</span>
                <span className="text-[10px] text-on-surface-variant">Funciona mesmo sem internet</span>
              </div>
              <input
                type="checkbox"
                checked={notificaSms}
                onChange={(e) => setNotificaSms(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/app/contatos')}
              className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-purple-800 transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Salvar Contato
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
