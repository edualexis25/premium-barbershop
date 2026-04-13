import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ESTADOS = ['pendiente', 'confirmada', 'completada', 'cancelada']

const ESTADO_COLORES = {
  pendiente: '#b8860b',
  confirmada: '#2d6a2d',
  completada: '#1a4a7a',
  cancelada: '#6a2d2d',
}

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [monto, setMonto] = useState('')
  const [estado, setEstado] = useState('')
  const [extras, setExtras] = useState([])
  const [nuevoExtra, setNuevoExtra] = useState({ descripcion: '', precio: '' })
  const [extrasMap, setExtrasMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCitas()
  }, [])

  const limpiarAlertas = () => {
    setMensaje('')
    setError('')
  }

  const fetchCitas = async () => {
    limpiarAlertas()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('citas')
        .select('*, clientes(nombre, telefono, email), servicios(nombre, precio)')
        .order('fecha', { ascending: true })

      if (error) throw error

      const citasData = data || []
      setCitas(citasData)
      await fetchTodosExtras(citasData.map((c) => c.id))
    } catch (err) {
      console.error('Error cargando citas:', err)
      setError('No se pudieron cargar las citas.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodosExtras = async (citaIds) => {
    if (!citaIds.length) {
      setExtrasMap({})
      return
    }

    try {
      const { data, error } = await supabase
        .from('cita_extras')
        .select('*')
        .in('cita_id', citaIds)

      if (error) throw error

      const map = {}
      ;(data || []).forEach((extra) => {
        if (!map[extra.cita_id]) map[extra.cita_id] = []
        map[extra.cita_id].push(extra)
      })

      setExtrasMap(map)
    } catch (err) {
      console.error('Error cargando extras:', err)
      setError('No se pudieron cargar los extras de las citas.')
    }
  }

  const fetchExtras = async (citaId) => {
    try {
      const { data, error } = await supabase
        .from('cita_extras')
        .select('*')
        .eq('cita_id', citaId)

      if (error) throw error

      setExtras(data || [])
    } catch (err) {
      console.error('Error cargando extras de la cita:', err)
      setError('No se pudieron cargar los extras de la cita.')
    }
  }

  const handleAbrirEdicion = async (cita) => {
    limpiarAlertas()
    setEditando(cita.id)
    setEstado(cita.estado)
    setMonto(cita.monto_pagado?.toString() || '')
    setNuevoExtra({ descripcion: '', precio: '' })
    await fetchExtras(cita.id)
  }

  const handleCancelarEdicion = () => {
    limpiarAlertas()
    setEditando(null)
    setMonto('')
    setEstado('')
    setExtras([])
    setNuevoExtra({ descripcion: '', precio: '' })
  }

  const handleActualizar = async (id) => {
    limpiarAlertas()

    const montoNormalizado = monto === '' ? null : Number(monto)

    if (monto !== '' && (!Number.isFinite(montoNormalizado) || montoNormalizado < 0)) {
      setError('El monto pagado debe ser un número igual o mayor que 0.')
      return
    }

    if (!ESTADOS.includes(estado)) {
      setError('Selecciona un estado válido.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('citas')
        .update({
          estado,
          monto_pagado: montoNormalizado,
        })
        .eq('id', id)

      if (error) throw error

      setMensaje('Cita actualizada correctamente.')
      handleCancelarEdicion()
      await fetchCitas()
    } catch (err) {
      console.error('Error actualizando cita:', err)
      setError('No se pudo actualizar la cita.')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarExtra = async (citaId) => {
    limpiarAlertas()

    const descripcion = nuevoExtra.descripcion.trim()
    const precio = Number(nuevoExtra.precio)

    if (!descripcion) {
      setError('La descripción del extra es obligatoria.')
      return
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      setError('El precio del extra debe ser mayor que 0.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('cita_extras')
        .insert([{ cita_id: citaId, descripcion, precio }])

      if (error) throw error

      setNuevoExtra({ descripcion: '', precio: '' })
      setMensaje('Extra agregado correctamente.')
      await fetchExtras(citaId)
      await fetchCitas()
    } catch (err) {
      console.error('Error agregando extra:', err)
      setError('No se pudo agregar el extra.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarExtra = async (extraId, citaId) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este extra?')
    if (!confirmar) return

    limpiarAlertas()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('cita_extras')
        .delete()
        .eq('id', extraId)

      if (error) throw error

      setMensaje('Extra eliminado correctamente.')
      await fetchExtras(citaId)
      await fetchCitas()
    } catch (err) {
      console.error('Error eliminando extra:', err)
      setError('No se pudo eliminar el extra.')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = (cita) => {
    const base = Number(cita.servicios?.precio || 0)
    const sumaExtras = (extrasMap[cita.id] || []).reduce(
      (suma, extra) => suma + Number(extra.precio || 0),
      0
    )

    return (base + sumaExtras).toFixed(2)
  }

  const busquedaNormalizada = busqueda.trim().toLowerCase()

  const citasFiltradas = citas
    .filter((cita) => (filtro === 'todas' ? true : cita.estado === filtro))
    .filter((cita) => {
      if (!busquedaNormalizada) return true

      const nombre = cita.clientes?.nombre?.toLowerCase() || ''
      const telefono = cita.clientes?.telefono?.toLowerCase() || ''
      const email = cita.clientes?.email?.toLowerCase() || ''
      const codigoReserva = cita.codigo_reserva?.toLowerCase() || ''
      const servicio = cita.servicios?.nombre?.toLowerCase() || ''

      return (
        nombre.includes(busquedaNormalizada) ||
        telefono.includes(busquedaNormalizada) ||
        email.includes(busquedaNormalizada) ||
        codigoReserva.includes(busquedaNormalizada) ||
        servicio.includes(busquedaNormalizada)
      )
    })

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Citas</h2>

      <div style={styles.topBar}>
        <div style={styles.filtros}>
          {['todas', ...ESTADOS].map((item) => (
            <button
              key={item}
              onClick={() => setFiltro(item)}
              style={{
                ...styles.filtroBtn,
                ...(filtro === item ? styles.filtroActivo : {}),
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <input
          style={styles.searchInput}
          type="text"
          placeholder="Buscar por cliente, teléfono, email, servicio o código"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
      {error && <p style={styles.error}>{error}</p>}

      {loading && citas.length === 0 ? (
        <p style={styles.empty}>Cargando citas...</p>
      ) : citasFiltradas.length === 0 ? (
        <p style={styles.empty}>
          No hay citas {filtro !== 'todas' ? `con estado "${filtro}"` : ''} para la búsqueda actual.
        </p>
      ) : (
        citasFiltradas.map((cita) => {
          const citaExtras = extrasMap[cita.id] || []

          return (
            <div key={cita.id} style={styles.citaCard}>
              <div style={styles.citaHeader}>
                <div style={styles.headerInfo}>
                  <strong style={{ color: '#fff' }}>{cita.clientes?.nombre}</strong>
                  <span style={styles.infoChip}>📞 {cita.clientes?.telefono}</span>
                  <span style={styles.infoChip}>✉️ {cita.clientes?.email}</span>
                  {cita.codigo_reserva && (
                    <span style={styles.codigoChip}>🔑 {cita.codigo_reserva}</span>
                  )}
                </div>

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
                <span>✂️ {cita.servicios?.nombre}</span>
                <span>📅 {cita.fecha}</span>
                <span>🕐 {cita.hora?.slice(0, 5)}</span>
                <span>💳 {cita.metodo_pago}</span>
                <span style={{ color: '#c9a84c' }}>
                  💰 {cita.monto_pagado ? `$${cita.monto_pagado}` : 'Pendiente'}
                </span>
              </div>

              {citaExtras.length > 0 && (
                <div style={styles.extrasLista}>
                  <p style={styles.extrasTitle}>Servicios / Productos adicionales:</p>

                  {citaExtras.map((extra) => (
                    <div key={extra.id} style={styles.extraItem}>
                      <span>{extra.descripcion}</span>
                      <span style={{ color: '#c9a84c' }}>
                        ${Number(extra.precio).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div style={styles.totalRow}>
                    <span style={{ color: '#aaa' }}>Total estimado:</span>
                    <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>
                      ${calcularTotal(cita)}
                    </span>
                  </div>
                </div>
              )}

              {editando === cita.id ? (
                <div style={styles.editForm}>
                  <div style={styles.editFila}>
                    <select
                      style={styles.select}
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    >
                      {ESTADOS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monto pagado"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                    />
                  </div>

                  <div style={styles.extrasSeccion}>
                    <p style={styles.extrasTitle}>➕ Agregar servicio / producto adicional:</p>

                    <div style={styles.editFila}>
                      <input
                        style={{ ...styles.input, flex: 2 }}
                        placeholder="Descripción"
                        value={nuevoExtra.descripcion}
                        onChange={(e) =>
                          setNuevoExtra({ ...nuevoExtra, descripcion: e.target.value })
                        }
                      />

                      <input
                        style={{ ...styles.input, flex: 1 }}
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Precio"
                        value={nuevoExtra.precio}
                        onChange={(e) =>
                          setNuevoExtra({ ...nuevoExtra, precio: e.target.value })
                        }
                      />

                      <button
                        style={styles.buttonSmall}
                        onClick={() => handleAgregarExtra(cita.id)}
                        disabled={loading}
                      >
                        Agregar
                      </button>
                    </div>

                    {extras.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {extras.map((extra) => (
                          <div key={extra.id} style={styles.extraItemEdit}>
                            <span style={{ color: '#aaa' }}>{extra.descripcion}</span>
                            <span style={{ color: '#c9a84c' }}>
                              ${Number(extra.precio).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleEliminarExtra(extra.id, cita.id)}
                              style={styles.eliminarBtn}
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.accionesEdicion}>
                    <button
                      style={styles.button}
                      onClick={() => handleActualizar(cita.id)}
                      disabled={loading}
                    >
                      Guardar
                    </button>

                    <button
                      style={styles.buttonCancelar}
                      onClick={handleCancelarEdicion}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button style={styles.editBtn} onClick={() => handleAbrirEdicion(cita)}>
                  ✏️ Actualizar estado / pago / extras
                </button>
              )}
            </div>
          )
        })
      )}
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
  topBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  filtros: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filtroBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    border: '1px solid #333',
    background: '#222',
    color: '#aaa',
    cursor: 'pointer',
  },
  filtroActivo: {
    background: '#c9a84c',
    color: '#111',
    fontWeight: 'bold',
    border: '1px solid #c9a84c',
  },
  searchInput: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    fontSize: '0.95rem',
  },
  mensaje: {
    color: '#4caf50',
    marginBottom: '0.75rem',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: '0.75rem',
  },
  empty: {
    color: '#888',
  },
  citaCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  citaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  headerInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
  },
  estadoBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  infoChip: {
    color: '#888',
    fontSize: '0.85rem',
  },
  codigoChip: {
    color: '#c9a84c',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  citaInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    color: '#aaa',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
  },
  extrasLista: {
    background: '#222',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '0.75rem',
  },
  extrasTitle: {
    color: '#888',
    fontSize: '0.85rem',
    margin: '0 0 0.5rem',
  },
  extraItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#ccc',
    fontSize: '0.9rem',
    padding: '0.25rem 0',
    borderBottom: '1px solid #2a2a2a',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
    fontSize: '0.95rem',
  },
  editForm: {
    marginTop: '0.75rem',
    borderTop: '1px solid #2a2a2a',
    paddingTop: '0.75rem',
  },
  editFila: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.5rem',
    alignItems: 'center',
  },
  extrasSeccion: {
    background: '#222',
    borderRadius: '8px',
    padding: '0.75rem',
    marginTop: '0.5rem',
  },
  extraItemEdit: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.3rem 0',
    borderBottom: '1px solid #2a2a2a',
    gap: '0.5rem',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    flex: 1,
    minWidth: '120px',
  },
  accionesEdicion: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  button: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    background: '#c9a84c',
    color: '#111',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
  },
  buttonSmall: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    background: '#c9a84c',
    color: '#111',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
  },
  buttonCancelar: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    background: 'transparent',
    color: '#c9a84c',
    cursor: 'pointer',
    border: '1px solid #c9a84c',
  },
  eliminarBtn: {
    background: '#6a2d2d',
    border: 'none',
    color: '#fff',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    background: 'transparent',
    border: 'none',
    color: '#c9a84c',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: 0,
  },
}