import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Servicios from './pages/Servicios'
import Horarios from './pages/Horarios'
import Navbar from './components/Navbar'
import MisCitas from './pages/MisCitas'

function App() {
  const [session, setSession] = useState(null)
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

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <BrowserRouter>
      {session && <Navbar />}
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/servicios" element={session ? <Servicios /> : <Navigate to="/login" />} />
        <Route path="/horarios" element={session ? <Horarios /> : <Navigate to="/login" />} />
        <Route path="/mis-citas" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App