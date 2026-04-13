import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ESTADO_COLORES = {
  pendiente: '#b8860b',
  confirmada: '#2d6a2d',
  completada: '#1a4a7a',
  cancelada: '#6a2d2d',
}

export default function MisCitas() {
  const { state } = useLocation()
  const [codigo, setCodigo] = useState(state?.codigoReserva || '')
  const [cita, setCita] = useState(null)
  const [buscado, setBuscado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (state?.codigoReserva) {
      handleBuscar(state.codigoReserva)
    }
  }, [state])

  const handleBuscar = async (codigoManual) => {
    const codigoFinal = (codigoManual || codigo).trim().toUpperCase()

    if (!codigoFinal) {
      setError('Ingresa tu código de reserva.')
      setBuscado(false)
      setCita(null)
      return
    }

    setLoading(true)
    setError('')
    setBuscado(false)
    setCita(null)

    try {
      const { data, error } = await supabase.rpc('obtener_cita_por_codigo_reserva', {
        codigo: codigoFinal,
      })

      if (error) {
        throw error
      }

      const resultado = Array.isArray(data) ? data[0] : null

      if (!resultado) {
        setCita(null)
      } else {
        setCita(resultado)
      }

      setBuscado(true)
    } catch (err) {
      console.error('Error consultando cita:', err)
      setError('No pudimos consultar tu cita. Verifica el código e inténtalo de nuevo.')
      setBuscado(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>✂️ Mis Citas</h1>
        <p style={styles.subtitulo}>
          Ingresa tu código de reserva para ver el estado de tu cita.
        </p>

        <div style={styles.buscador}>
          <input
            style={styles.input}
            type="text"
            placeholder="Tu código de reserva *"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          />
          <button style={styles.button} onClick={() => handleBuscar()} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {buscado && !loading && !cita && !error && (
          <div style={styles.vacio}>
            <p>😕 No encontramos una cita asociada a ese código.</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Verifica el código de reserva e inténtalo nuevamente.
            </p>
          </div>
        )}

        {cita && (
          <div>
            <h3 style={{ ...styles.subtitulo, marginBottom: '1rem' }}>Detalle de tu reserva</h3>

            <div style={styles.citaCard}>
              <div style={styles.citaHeader}>
                <strong style={{ color: '#fff', fontSize: '1.05rem' }}>
                  {cita.servicio_nombre}
                </strong>
                <span
                  style={{
                    ...styles.estadoBadge,
                    background: ESTADO_COLORES[cita.estado] || '#444',
                  }}
                >
                  {cita.estado}
                </span>
              </div>

              <div style={styles.citaInfo}>
                {cita.cliente_nombre && <span>👤 {cita.cliente_nombre}</span>}
                <span>📅 {cita.fecha}</span>
                <span>🕐 {String(cita.hora).slice(0, 5)}</span>
                {cita.servicio_duracion && <span>⏱ {cita.servicio_duracion} min</span>}
                <span>💳 {cita.metodo_pago}</span>
                {cita.monto_pagado && (
                  <span style={{ color: '#c9a84c' }}>💰 ${cita.monto_pagado}</span>
                )}
              </div>

              <div style={styles.codigoBox}>
                <p style={styles.codigoLabel}>Código de reserva</p>
                <p style={styles.codigoValor}>{cita.codigo_reserva}</p>
              </div>
            </div>
          </div>
        )}

        <div style={styles.reservaLink}>
          <a href="/reserva" style={styles.link}>
            + Hacer una nueva reserva
          </a>
        </div>
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
    maxWidth: '580px',
    border: '1px solid #333',
  },
  title: {
    color: '#c9a84c',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitulo: {
    color: '#888',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  buscador: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    fontSize: '0.95rem',
    textTransform: 'uppercase',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    background: '#c9a84c',
    color: '#111',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
  },
  error: {
    textAlign: 'center',
    color: '#ff4444',
    marginBottom: '1rem',
  },
  vacio: {
    textAlign: 'center',
    color: '#aaa',
    padding: '2rem 0',
  },
  citaCard: {
    background: '#222',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1rem',
    border: '1px solid #2a2a2a',
  },
  citaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  estadoBadge: {
    padding: '0.2rem 0.75rem',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.8rem',
  },
  citaInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    color: '#aaa',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  codigoBox: {
    background: '#1a1a1a',
    border: '1px solid #3a3a3a',
    borderRadius: '10px',
    padding: '0.85rem',
  },
  codigoLabel: {
    color: '#888',
    fontSize: '0.85rem',
    marginBottom: '0.4rem',
  },
  codigoValor: {
    color: '#c9a84c',
    fontWeight: 'bold',
    margin: 0,
  },
  reservaLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
  },
  link: {
    color: '#c9a84c',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
}