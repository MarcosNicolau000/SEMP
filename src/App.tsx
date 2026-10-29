import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom'
import { DeviceFrame } from './components/DeviceFrame'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { CalculadoraScreen } from './features/calculadora/CalculadoraScreen'
import { PainelSosScreen } from './features/sos/PainelSosScreen'
import { MedidaProtetivaScreen } from './features/medida/MedidaProtetivaScreen'
import { RedeApoioScreen } from './features/rede-apoio/RedeApoioScreen'
import { NovoContatoScreen } from './features/rede-apoio/NovoContatoScreen'
import { HistoricoScreen } from './features/historico/HistoricoScreen'
import { PainelTaticoScreen } from './features/tatico/PainelTaticoScreen'

function ProtectedAppLayout() {
  const location = useLocation()
  const isNovoContato = location.pathname.includes('/contatos/novo')

  const titulos: Record<string, string> = {
    '/app': 'Painel de Segurança',
    '/app/medida': 'Medida Protetiva',
    '/app/contatos': 'Rede de Apoio',
    '/app/contatos/novo': 'Novo Contato',
    '/app/historico': 'Histórico e Provas',
  }

  const tituloAtual = titulos[location.pathname] || 'Painel de Segurança'

  return (
    <div className="relative w-full min-h-dvh bg-surface flex flex-col">
      <Header titulo={tituloAtual} />
      <main className="flex-1 w-full flex flex-col pb-24">
        <Outlet />
      </main>
      {!isNovoContato && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DeviceFrame>
        <Routes>
          {/* Camouflage entry point */}
          <Route path="/" element={<CalculadoraScreen />} />

          {/* Victim protected app area */}
          <Route path="/app" element={<ProtectedAppLayout />}>
            <Route index element={<PainelSosScreen />} />
            <Route path="medida" element={<MedidaProtetivaScreen />} />
            <Route path="contatos" element={<RedeApoioScreen />} />
            <Route path="contatos/novo" element={<NovoContatoScreen />} />
            <Route path="historico" element={<HistoricoScreen />} />
          </Route>

          {/* Tactical patrol area */}
          <Route path="/tatico" element={<PainelTaticoScreen />} />

          {/* Fallback to calculator */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DeviceFrame>
    </BrowserRouter>
  )
}
