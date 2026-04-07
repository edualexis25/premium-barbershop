import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bienvenido al Panel</h2>
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/servicios')}>
          <h3>✂️ Servicios</h3>
          <p>Gestiona los servicios y precios de tu barbería</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/horarios')}>
          <h3>🗓️ Horarios</h3>
          <p>Define los días y horas de atención</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/citas')}>
          <h3>📅 Citas</h3>
          <p>Gestiona las reservas de tus clientes</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/ingresos')}>
          <h3>💰 Ingresos</h3>
          <p>Control de pagos y estadísticas</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding:'2rem', background:'#111', minHeight:'100vh' },
  title: { color:'#c9a84c', marginBottom:'2rem' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5rem' },
  card: { background:'#1a1a1a', padding:'1.5rem', borderRadius:'12px', color:'#fff', border:'1px solid #333', cursor:'pointer', transition:'border-color 0.2s' }
}