import { useState } from 'react'
import { supabase } from '../lib/supabase'

const Logo = () => (
  <svg width="250" height="150" viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
   {/*  <polygon points="340,55 595,340 340,625 85,340" fill="none" stroke="#C0C0C0" strokeWidth="2.5"/>
    <polygon points="340,92 558,340 340,588 122,340" fill="none" stroke="#C0C0C0" strokeWidth="1"/>
   {/* <circle cx="340" cy="92" r="4" fill="#C0C0C0"/>
    <circle cx="340" cy="588" r="4" fill="#C0C0C0"/>
    <circle cx="122" cy="340" r="4" fill="#C0C0C0"/>
    <circle cx="558" cy="340" r="4" fill="#C0C0C0"/>
   {/* <line x1="326" y1="72" x2="318" y2="55" stroke="#C0C0C0" strokeWidth="1.5"/> 
    <line x1="354" y1="72" x2="362" y2="55" stroke="#C0C0C0" strokeWidth="1.5"/>
    <line x1="326" y1="608" x2="318" y2="625" stroke="#C0C0C0" strokeWidth="1.5"/>
    <line x1="354" y1="608" x2="362" y2="625" stroke="#C0C0C0" strokeWidth="1.5"/> 
    <line x1="102" y1="326" x2="85" y2="318" stroke="#C0C0C0" strokeWidth="1.5"/>
    <line x1="102" y1="354" x2="85" y2="362" stroke="#C0C0C0" strokeWidth="1.5"/>
    <line x1="578" y1="326" x2="595" y2="318" stroke="#C0C0C0" strokeWidth="1.5"/>
    <line x1="578" y1="354" x2="595" y2="362" stroke="#C0C0C0" strokeWidth="1.5"/> */}
   {/* <g transform="translate(340, 210)">
      <path d="M-120,-10 Q-145,-10 -148,0 Q-145,10 -120,10 L-60,8 L-60,-8 Z" fill="#A8A8A8"/>
      <circle cx="-125" cy="0" r="7" fill="#888888"/>
      <circle cx="-125" cy="0" r="3" fill="#C0C0C0"/>
      <line x1="-115" y1="-5" x2="-70" y2="-5" stroke="#888888" strokeWidth="1.5"/>
      <line x1="-115" y1="5" x2="-70" y2="5" stroke="#888888" strokeWidth="1.5"/>
      <rect x="-62" y="-10" width="20" height="20" rx="2" fill="#888888"/>
      <path d="M-44,-9 L110,-4 Q130,0 110,4 L-44,9 Z" fill="#C0C0C0"/>
      <path d="M-44,5 L110,2 Q128,0 110,4 L-44,9 Z" fill="#E8E8E8" opacity="0.5"/>
      <line x1="-44" y1="-9" x2="110" y2="-4" stroke="#888888" strokeWidth="1"/>
      <path d="M108,-4 Q132,0 108,4 Z" fill="#E0E0E0" opacity="0.8"/>
    </g>  */}
   {/* <line x1="190" y1="278" x2="308" y2="278" stroke="#C0C0C0" strokeWidth="1"/>
    <line x1="372" y1="278" x2="490" y2="278" stroke="#C0C0C0" strokeWidth="1"/>
    <polygon points="340,272 348,278 340,284 332,278" fill="#C0C0C0"/> */}
    <text x="340" y="500" textAnchor="middle" fontFamily="Georgia, serif" fontSize="175" fontWeight="700" fill="#C0C0C0" letterSpacing="8">PREMIUM</text>
    <line x1="0" y1="545" x2="700" y2="545" stroke="#C0C0C0" strokeWidth="1.5"/>
    <text x="340" y="650" textAnchor="middle" fontFamily="Georgia, serif" fontSize="100" fontWeight="600" fill="#1B3A6B" letterSpacing="8">BARBERSHOP</text>
     {/*<line x1="190" y1="422" x2="308" y2="422" stroke="#C0C0C0" strokeWidth="1"/>
    <line x1="372" y1="422" x2="490" y2="422" stroke="#C0C0C0" strokeWidth="1"/>
    <polygon points="340,416 348,422 340,428 332,422" fill="#C0C0C0"/>*/}
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