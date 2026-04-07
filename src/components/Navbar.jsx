import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LogoSmall = () => (
  <svg width="36" height="36" viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
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
  brandName: { color:'#C0C0C0', fontWeight:'bold', fontSize:'1rem', lineHeight:1.2, textTransform:'uppercase' },
  brandSub: { color:'#1B3A6B', fontSize:'0.75rem', letterSpacing:'2px', textTransform:'uppercase', fontWeight:'bold' },
  links: { display:'flex', gap:'1.5rem', alignItems:'center' },
  link: { color:'#fff', textDecoration:'none', fontSize:'0.95rem' },
  logout: { background:'transparent', border:'1px solid #C0C0C0', color:'#C0C0C0', padding:'0.4rem 1rem', borderRadius:'6px', cursor:'pointer' }
}