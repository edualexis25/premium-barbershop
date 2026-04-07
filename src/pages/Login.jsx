import { useState } from 'react'
import { supabase } from '../lib/supabase'

const Logo = () => (
  <svg width="250" height="150" viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
    <text x="340" y="500" textAnchor="middle" fontFamily="Georgia, serif" fontSize="175" fontWeight="700" fill="#C0C0C0" letterSpacing="8">PREMIUM</text>
    <line x1="0" y1="545" x2="700" y2="545" stroke="#C0C0C0" strokeWidth="1.5"/>
    <text x="340" y="650" textAnchor="middle" fontFamily="Georgia, serif" fontSize="100" fontWeight="600" fill="#1B3A6B" letterSpacing="8">BARBERSHOP</text>
  </svg>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Credenciales incorrectas')
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <Logo />
        </div>
        <p style={styles.subtitle}>Panel de Administración</p>
        <input
          style={styles.input}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : 'Iniciar Sesión'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#111' },
  card: { background:'#1a1a1a', padding:'2rem', borderRadius:'12px', width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' },
  logoWrapper: { marginBottom:'0.5rem' },
  subtitle: { color:'#888', margin:0, fontSize:'0.95rem' },
  input: { width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #333', background:'#222', color:'#fff', fontSize:'1rem', boxSizing:'border-box' },
  button: { width:'100%', padding:'0.75rem', borderRadius:'8px', background:'#C0C0C0', color:'#111', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', border:'none' },
  error: { color:'#ff4444', textAlign:'center', margin:0 }
} 