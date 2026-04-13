import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Servicios from './pages/Servicios'
import Horarios from './pages/Horarios'
import Citas from './pages/Citas'
import Reserva from './pages/Reserva'
import ReservaExito from './pages/ReservaExito'
import Navbar from './components/Navbar'
import Ingresos from './pages/Ingresos'
import MisCitas from './pages/MisCitas'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div>Cargando...</div>

  return (
    <BrowserRouter>
      {session && <Navbar />}
      <Routes>
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/reserva/exito" element={<ReservaExito />} />
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={session ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/servicios"
          element={session ? <Servicios /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/horarios"
          element={session ? <Horarios /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/citas"
          element={session ? <Citas /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/ingresos"
          element={session ? <Ingresos /> : <Navigate to="/login" replace />}
        />
        <Route path="/mis-citas" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App