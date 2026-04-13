import { useLocation, useNavigate } from 'react-router-dom'

export default function ReservaExito() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const nombre = state?.nombre
  const fecha = state?.fecha
  const hora = state?.hora
  const codigoReserva = state?.codigoReserva

  const handleVerMisCitas = () => {
    if (codigoReserva) {
      navigate('/mis-citas', { state: { codigoReserva } })
      return
    }

    navigate('/mis-citas')
  }

  if (!nombre || !fecha || !hora) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icono}>ℹ️</div>
          <h1 style={styles.title}>Reserva registrada</h1>
          <p style={styles.texto}>
            No pudimos recuperar los detalles de la confirmación desde esta pantalla.
          </p>
          <p style={styles.nota}>
            Si acabas de hacer tu reserva, usa tu código de reserva para revisar el estado de tu cita.
          </p>
          <button style={styles.button} onClick={() => navigate('/mis-citas')}>
            Ver mis citas
          </button>
          <button style={styles.buttonSecundario} onClick={() => navigate('/reserva')}>
            Hacer otra reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icono}>✅</div>
        <h1 style={styles.title}>¡Cita Confirmada!</h1>

        <p style={styles.texto}>
          Gracias <strong style={{ color: '#c9a84c' }}>{nombre}</strong>, tu cita ha sido agendada.
        </p>

        <div style={styles.detalle}>
          <p>
            📅 Fecha: <strong>{fecha}</strong>
          </p>
          <p>
            🕐 Hora: <strong>{String(hora).slice(0, 5)}</strong>
          </p>
        </div>

        {codigoReserva && (
          <div style={styles.codigoBox}>
            <p style={styles.codigoLabel}>Código de reserva</p>
            <p style={styles.codigoValor}>{codigoReserva}</p>
            <p style={styles.codigoNota}>
              Guárdalo. Lo necesitarás para consultar tu cita en “Mis citas”.
            </p>
          </div>
        )}

        <p style={styles.nota}>
          Te esperamos. Si necesitas cancelar o cambiar tu cita, contáctanos directamente.
        </p>

        <button style={styles.button} onClick={() => navigate('/reserva')}>
          Hacer otra reserva
        </button>

        <button style={styles.buttonSecundario} onClick={handleVerMisCitas}>
          Ver mis citas
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: '#1a1a1a',
    padding: '2rem',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
    border: '1px solid #333',
  },
  icono: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    color: '#c9a84c',
    marginBottom: '1rem',
  },
  texto: {
    color: '#fff',
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
  },
  detalle: {
    background: '#222',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#aaa',
  },
  codigoBox: {
    background: '#161616',
    border: '1px solid #3a3a3a',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  codigoLabel: {
    color: '#888',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  codigoValor: {
    color: '#c9a84c',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    wordBreak: 'break-word',
    marginBottom: '0.75rem',
  },
  codigoNota: {
    color: '#aaa',
    fontSize: '0.9rem',
    margin: 0,
  },
  nota: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  button: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    background: '#c9a84c',
    color: '#111',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    fontSize: '1rem',
    width: '100%',
  },
  buttonSecundario: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    background: 'transparent',
    color: '#c9a84c',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '1px solid #c9a84c',
    fontSize: '1rem',
    width: '100%',
    marginTop: '0.75rem',
  },
}