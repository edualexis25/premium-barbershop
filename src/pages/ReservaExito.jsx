import { useLocation, useNavigate } from 'react-router-dom'

export default function ReservaExito() {
  const { state } = useLocation()
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icono}>✅</div>
        <h1 style={styles.title}>¡Cita Confirmada!</h1>
        <p style={styles.texto}>Gracias <strong style={{color:'#c9a84c'}}>{state?.nombre}</strong>, tu cita ha sido agendada.</p>
        <div style={styles.detalle}>
          <p>📅 Fecha: <strong>{state?.fecha}</strong></p>
          <p>🕐 Hora: <strong>{state?.hora}</strong></p>
        </div>
        <p style={styles.nota}>Te esperamos. Si necesitas cancelar o cambiar tu cita, contáctanos directamente.</p>
        <button style={styles.button} onClick={() => navigate('/reserva')}>
          Hacer otra reserva
        </button>
        <button style={{...styles.button, background:'transparent', color:'#c9a84c', border:'1px solid #c9a84c', marginTop:'0.75rem'}}
          onClick={() => navigate('/mis-citas')}>
          Ver mis citas
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' },
  card: { background:'#1a1a1a', padding:'2rem', borderRadius:'16px', width:'100%', maxWidth:'450px', textAlign:'center', border:'1px solid #333' },
  icono: { fontSize:'4rem', marginBottom:'1rem' },
  title: { color:'#c9a84c', marginBottom:'1rem' },
  texto: { color:'#fff', fontSize:'1.1rem', marginBottom:'1.5rem' },
  detalle: { background:'#222', borderRadius:'10px', padding:'1rem', marginBottom:'1.5rem', color:'#aaa' },
  nota: { color:'#666', fontSize:'0.9rem', marginBottom:'1.5rem' },
  button: { padding:'0.75rem 2rem', borderRadius:'8px', background:'#c9a84c', color:'#111', fontWeight:'bold', cursor:'pointer', border:'none', fontSize:'1rem' }
}