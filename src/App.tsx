import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return <div>Cargando...</div>

  return (
    <BrowserRouter>
      {session && <Navbar />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/reserva/exito" element={<ReservaExito />} />
        {/* Rutas admin */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/servicios" element={session ? <Servicios /> : <Navigate to="/login" />} />
        <Route path="/horarios" element={session ? <Horarios /> : <Navigate to="/login" />} />
        <Route path="/citas" element={session ? <Citas /> : <Navigate to="/login" />} />
        <Route path="/ingresos" element={session ? <Ingresos /> : <Navigate to="/login" />} />
        <Route path="/mis-citas" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App