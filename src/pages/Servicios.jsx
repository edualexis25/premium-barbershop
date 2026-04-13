import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  duracion: '',
  precio: '',
}

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchServicios()
  }, [])

  const limpiarAlertas = () => {
    setMensaje('')
    setError('')
  }

  const resetForm = () => {
    setForm(FORM_INICIAL)
    setEditandoId(null)
  }

  const fetchServicios = async () => {
    limpiarAlertas()

    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando servicios:', error)
      setError('No se pudieron cargar los servicios.')
      return
    }

    setServicios(data || [])
  }

  const validarFormulario = () => {
    const nombre = form.nombre.trim()
    const descripcion = form.descripcion.trim()
    const duracion = Number(form.duracion)
    const precio = Number(form.precio)

    if (!nombre) {
      return 'El nombre es obligatorio.'
    }

    if (!Number.isFinite(duracion) || duracion <= 0) {
      return 'La duración debe ser un número mayor que 0.'
    }

    if (!Number.isFinite(precio) || precio < 0) {
      return 'El precio debe ser un número igual o mayor que 0.'
    }

    return {
      nombre,
      descripcion,
      duracion,
      precio,
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
      if (editandoId) {
        const { error } = await supabase
          .from('servicios')
          .update({
            nombre: validacion.nombre,
            descripcion: validacion.descripcion,
            duracion: validacion.duracion,
            precio: validacion.precio,
          })
          .eq('id', editandoId)

        if (error) {
          throw error
        }

        setMensaje('Servicio actualizado correctamente.')
      } else {
        const { error } = await supabase
          .from('servicios')
          .insert([
            {
              nombre: validacion.nombre,
              descripcion: validacion.descripcion,
              duracion: validacion.duracion,
              precio: validacion.precio,
              activo: true,
            },
          ])

        if (error) {
          throw error
        }

        setMensaje('Servicio creado correctamente.')
      }

      resetForm()
      await fetchServicios()
    } catch (err) {
      console.error('Error guardando servicio:', err)
      setError('No se pudo guardar el servicio. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (servicio) => {
    limpiarAlertas()
    setEditandoId(servicio.id)
    setForm({
      nombre: servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      duracion: servicio.duracion?.toString() || '',
      precio: servicio.precio?.toString() || '',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelarEdicion = () => {
    limpiarAlertas()
    resetForm()
  }

  const handleToggleActivo = async (id, activoActual) => {
    limpiarAlertas()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('servicios')
        .update({ activo: !activoActual })
        .eq('id', id)

      if (error) {
        throw error
      }

      setMensaje(
        !activoActual
          ? 'Servicio activado correctamente.'
          : 'Servicio desactivado correctamente.'
      )

      await fetchServicios()
    } catch (err) {
      console.error('Error cambiando estado del servicio:', err)
      setError('No se pudo actualizar el estado del servicio.')
    } finally {
      setLoading(false)
    }
  }

  const handleDesactivar = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas desactivar este servicio? Ya no estará disponible para nuevas reservas.'
    )

    if (!confirmar) return

    await handleToggleActivo(id, true)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✂️ Servicios</h2>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>
          {editandoId ? '✏️ Editar Servicio' : 'Agregar Servicio'}
        </h3>

        <div style={styles.grid}>
          <input
            style={styles.input}
            placeholder="Nombre *"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Duración (minutos) *"
            type="number"
            min="1"
            value={form.duracion}
            onChange={(e) => setForm({ ...form, duracion: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Precio *"
            type="number"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </div>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.accionesFormulario}>
          <button style={styles.button} onClick={handleGuardar} disabled={loading}>
            {loading
              ? 'Guardando...'
              : editandoId
                ? 'Actualizar Servicio'
                : 'Guardar Servicio'}
          </button>

          {editandoId && (
            <button
              style={styles.buttonCancelar}
              onClick={handleCancelarEdicion}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Servicios Registrados</h3>

        {servicios.length === 0 ? (
          <p style={styles.empty}>No hay servicios aún.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Nombre', 'Descripción', 'Duración', 'Precio', 'Estado', 'Acciones'].map(
                  (heading) => (
                    <th key={heading} style={styles.th}>
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio) => (
                <tr
                  key={servicio.id}
                  style={editandoId === servicio.id ? styles.rowEditando : undefined}
                >
                  <td style={styles.td}>{servicio.nombre}</td>
                  <td style={styles.td}>{servicio.descripcion || '—'}</td>
                  <td style={styles.td}>{servicio.duracion} min</td>
                  <td style={styles.td}>${Number(servicio.precio).toFixed(2)}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggleActivo(servicio.id, servicio.activo)}
                      style={{
                        ...styles.badge,
                        background: servicio.activo ? '#2d6a2d' : '#6a2d2d',
                      }}
                      disabled={loading}
                    >
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.accionesTabla}>
                      <button
                        onClick={() => handleEditar(servicio)}
                        style={{ ...styles.badge, background: '#1a3a5c' }}
                        disabled={loading}
                      >
                        ✏️ Editar
                      </button>

                      {servicio.activo ? (
                        <button
                          onClick={() => handleDesactivar(servicio.id)}
                          style={{ ...styles.badge, background: '#6a2d2d' }}
                          disabled={loading}
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleActivo(servicio.id, false)}
                          style={{ ...styles.badge, background: '#2d6a2d' }}
                          disabled={loading}
                        >
                          Activar
                        </button>
                      )}
                    </div>
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
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    fontSize: '0.95rem',
  },
  accionesFormulario: {
    display: 'flex',
    gap: '0.75rem',
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
  buttonCancelar: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    background: 'transparent',
    color: '#c9a84c',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '1px solid #c9a84c',
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
  accionesTabla: {
    display: 'flex',
    gap: '0.5rem',
  },
  rowEditando: {
    background: '#1f1f2e',
  },
}