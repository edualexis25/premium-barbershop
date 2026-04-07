import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

 const LogoSmall = () => (
  <svg width="36" height="36" viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
     {/* <polygon points="340,55 595,340 340,625 85,340" fill="none" stroke="#C0C0C0" strokeWidth="2.5"/>
    <polygon points="340,92 558,340 340,588 122,340" fill="none" stroke="#C0C0C0" strokeWidth="1"/>
    <circle cx="340" cy="92" r="4" fill="#C0C0C0"/>
    <circle cx="340" cy="588" r="4" fill="#C0C0C0"/>
    <circle cx="122" cy="340" r="4" fill="#C0C0C0"/>
    <circle cx="558" cy="340" r="4" fill="#C0C0C0"/>
    <g transform="translate(340, 210)">
      <path d="M-120,-10 Q-145,-10 -148,0 Q-145,10 -120,10 L-60,8 L-60,-8 Z" fill="#A8A8A8"/>
      <circle cx="-125" cy="0" r="7" fill="#888888"/>
      <circle cx="-125" cy="0" r="3" fill="#C0C0C0"/>
      <rect x="-62" y="-10" width="20" height="20" rx="2" fill="#888888"/>
      <path d="M-44,-9 L110,-4 Q130,0 110,4 L-44,9 Z" fill="#C0C0C0"/>
      <path d="M108,-4 Q132,0 108,4 Z" fill="#E0E0E0" opacity="0.8"/>
    </g>
    <text x="340" y="350" textAnchor="middle" fontFamily="Georgia, serif" fontSize="48" fontWeight="700" fill="#C0C0C0">P</text> */}
  </svg>
)

export default function Navbar() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <LogoSmall />
        <div>
          <div style={styles.brandName}>Premium</div>
          <div style={styles.brandSub}>Barbershop</div>
        </div>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/servicios" style={styles.link}>Servicios</Link>
        <Link to="/horarios" style={styles.link}>Horarios</Link>
        <Link to="/citas" style={styles.link}>Citas</Link>
        <Link to="/ingresos" style={styles.link}>Ingresos</Link>
        <button onClick={handleLogout} style={styles.logout}>Salir</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: { background:'#1a1a1a', padding:'0.75rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #333' },
  brand: { display:'flex', alignItems:'center', gap:'0.75rem' },
  brandName: { color:'#C0C0C0', fontWeight:'bold', fontSize:'1rem', lineHeight:1.2 , textTransform:'uppercase' },
  brandSub: { color:'#1B3A6B', fontSize:'0.75rem', letterSpacing:'2px', textTransform:'uppercase', fontWeight:'bold' },
  links: { display:'flex', gap:'1.5rem', alignItems:'center' },
  link: { color:'#fff', textDecoration:'none', fontSize:'0.95rem' },
  logout: { background:'transparent', border:'1px solid #C0C0C0', color:'#C0C0C0', padding:'0.4rem 1rem', borderRadius:'6px', cursor:'pointer' }
}