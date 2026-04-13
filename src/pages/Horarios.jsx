import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const FORM_INICIAL = {
  dia_semana: '1',
  hora_inicio: '09:00',
  hora_fin: '18:00',
}

export default function Horarios() {
  const [horarios, setHorarios] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHorarios()
  }, [])

  const limpiarAlertas = () => {
    setMensaje('')
    setError('')
  }

  const fetchHorarios = async () => {
    limpiarAlertas()

    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .order('dia_semana', { ascending: true })

    if (error) {
      console.error('Error cargando horarios:', error)
      setError('No se pudieron cargar los horarios.')
      return
    }

    setHorarios(data || [])
  }

  const validarFormulario = () => {
    const diaSemana = Number(form.dia_semana)
    const horaInicio = form.hora_inicio
    const horaFin = form.hora_fin

    if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
      return 'Selecciona un día válido.'
    }

    if (!horaInicio || !horaFin) {
      return 'Debes indicar la hora de inicio y la hora de fin.'
    }

    if (horaFin <= horaInicio) {
      return 'La hora de fin debe ser mayor que la hora de inicio.'
    }

    const yaExiste = horarios.some((h) => Number(h.dia_semana) === diaSemana)

    if (yaExiste) {
      return 'Ya existe un horario para ese día. Desactívalo o elimínalo antes de crear otro.'
    }

    return {
      dia_semana: diaSemana,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
    }
  }

  const handleGuardar = async () => {
    limpiarAlertas()

    const validacion = validarFormulario()

    if (typeof validacion === 'string') {
      setError(validacion)
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('horarios')
        .insert([
          {
            dia_semana: validacion.dia_semana,
            hora_inicio: validacion.hora_inicio,
            hora_fin: validacion.hora_fin,
            activo: true,
          },
        ])

      if (error) {
        throw error
      }

      setMensaje('Horario guardado correctamente.')
      setForm(FORM_INICIAL)
      await fetchHorarios()
    } catch (err) {
      console.error('Error guardando horario:', err)
      setError('No se pudo guardar el horario. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id, activo) => {
    const accion = activo ? 'desactivar' : 'activar'
    const confirmar = window.confirm(`¿Seguro que deseas ${accion} este horario?`)

    if (!confirmar) return

    limpiarAlertas()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('horarios')
        .update({ activo: !activo })
        .eq('id', id)

      if (error) {
        throw error
      }

      setMensaje(
        activo
          ? 'Horario desactivado correctamente.'
          : 'Horario activado correctamente.'
      )

      await fetchHorarios()
    } catch (err) {
      console.error('Error cambiando estado del horario:', err)
      setError('No se pudo actualizar el estado del horario.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar este horario? Esta acción no se puede deshacer.'
    )

    if (!confirmar) return

    limpiarAlertas()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('horarios')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setMensaje('Horario eliminado correctamente.')
      await fetchHorarios()
    } catch (err) {
      console.error('Error eliminando horario:', err)
      setError('No se pudo eliminar el horario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗓️ Horarios de Trabajo</h2>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Agregar Horario</h3>

        <div style={styles.grid}>
          <select
            style={styles.input}
            value={form.dia_semana}
            onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
          >
            {DIAS.map((dia, index) => (
              <option key={index} value={index}>
                {dia}
              </option>
            ))}
          </select>

          <div style={styles.timeGroup}>
            <input
              style={styles.input}
              type="time"
              value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
            />
            <input
              style={styles.input}
              type="time"
              value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
            />
          </div>
        </div>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={handleGuardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Horario'}
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Horarios Configurados</h3>

        {horarios.length === 0 ? (
          <p style={styles.empty}>No hay horarios aún.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Día', 'Hora Inicio', 'Hora Fin', 'Estado', 'Acciones'].map((heading) => (
                  <th key={heading} style={styles.th}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => (
                <tr key={horario.id}>
                  <td style={styles.td}>{DIAS[horario.dia_semana]}</td>
                  <td style={styles.td}>{horario.hora_inicio}</td>
                  <td style={styles.td}>{horario.hora_fin}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggle(horario.id, horario.activo)}
                      style={{
                        ...styles.badge,
                        background: horario.activo ? '#2d6a2d' : '#6a2d2d',
                      }}
                      disabled={loading}
                    >
                      {horario.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEliminar(horario.id)}
                      style={{ ...styles.badge, background: '#6a2d2d' }}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
    background: '#111',
    minHeight: '100vh',
  },
  title: {
    color: '#c9a84c',
    marginBottom: '1.5rem',
  },
  subtitle: {
    color: '#c9a84c',
    marginBottom: '1rem',
  },
  card: {
    background: '#1a1a1a',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  timeGroup: {
    display: 'flex',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    fontSize: '0.95rem',
    width: '100%',
  },
  button: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    background: '#c9a84c',
    color: '#111',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
  },
  mensaje: {
    color: '#4caf50',
    marginBottom: '0.5rem',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: '0.5rem',
  },
  empty: {
    color: '#888',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    color: '#c9a84c',
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '1px solid #333',
  },
  td: {
    color: '#fff',
    padding: '0.75rem',
    borderBottom: '1px solid #222',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
}