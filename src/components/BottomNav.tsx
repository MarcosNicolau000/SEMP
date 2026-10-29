import { NavLink } from 'react-router-dom'

export function BottomNav() {
  const tabs = [
    { to: '/app', label: 'Alerta SOS', icon: 'fmd_bad', end: true },
    { to: '/app/medida', label: 'Medida', icon: 'verified_user', end: false },
    { to: '/app/contatos', label: 'Contatos', icon: 'contacts', end: false },
    { to: '/app/historico', label: 'Ocorrências', icon: 'shield_with_heart', end: false },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20">
      <div className="h-16 max-w-xl mx-auto px-2 flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-normal'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">{tab.icon}</span>
            <span className="text-[11px] leading-tight mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
