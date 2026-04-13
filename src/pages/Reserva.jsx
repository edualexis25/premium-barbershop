import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia']

export default function Reserva() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [servicios, setServicios] = useState([])
  const [horarios, setHorarios] = useState([])
  const [horasDisponibles, setHorasDisponibles] = useState([])
  const [citasOcupadas, setCitasOcupadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    servicio_id: '',
    fecha: '',
    hora: '',
    metodo_pago: '',
  })

  useEffect(() => {
    fetchServicios()
    fetchHorarios()
  }, [])

  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)

    if (error) {
      console.error('Error cargando servicios:', error)
      return
    }

    setServicios(data || [])
  }

  const fetchHorarios = async () => {
    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .eq('activo', true)

    if (error) {
      console.error('Error cargando horarios:', error)
      return
    }

    setHorarios(data || [])
  }

  const fetchCitasOcupadas = async (fecha) => {
    const { data, error } = await supabase
      .from('citas')
      .select('hora')
      .eq('fecha', fecha)
      .neq('estado', 'cancelada')

    if (error) {
      console.error('Error cargando citas ocupadas:', error)
      setCitasOcupadas([])
      return
    }

    setCitasOcupadas((data || []).map((c) => c.hora))
  }

  const generarHoras = (inicio, fin, duracion) => {
    const horas = []
    let [h, m] = inicio.split(':').map(Number)
    const [hFin, mFin] = fin.split(':').map(Number)

    while (h < hFin || (h === hFin && m < mFin)) {
      horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      m += duracion

      if (m >= 60) {
        h += Math.floor(m / 60)
        m = m % 60
      }
    }

    return horas
  }

  const handleFechaChange = async (fecha) => {
    setForm((prev) => ({ ...prev, fecha, hora: '' }))

    const diaSemana = new Date(fecha + 'T00:00:00').getDay()
    const horarioDia = horarios.find((h) => h.dia_semana === diaSemana)

    if (horarioDia) {
      const servicio = servicios.find((s) => s.id === form.servicio_id)
      const duracion = servicio ? servicio.duracion : 30
      const horas = generarHoras(
        horarioDia.hora_inicio.slice(0, 5),
        horarioDia.hora_fin.slice(0, 5),
        duracion
      )

      setHorasDisponibles(horas)
      await fetchCitasOcupadas(fecha)
    } else {
      setHorasDisponibles([])
      setCitasOcupadas([])
    }
  }

  const getDiasDisponibles = () => horarios.map((h) => h.dia_semana)

  const isFechaDisponible = (fecha) => {
    const dia = new Date(fecha + 'T00:00:00').getDay()
    return getDiasDisponibles().includes(dia)
  }

  const handleSubmit = async () => {
    const nombre = form.nombre.trim()
    const telefono = form.telefono.trim()
    const email = form.email.trim().toLowerCase()

    if (
      !nombre ||
      !telefono ||
      !email ||
      !form.servicio_id ||
      !form.fecha ||
      !form.hora ||
      !form.metodo_pago
    ) {
      setError('Completa todos los campos antes de confirmar la cita.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.rpc('crear_reserva_publica', {
        p_nombre: nombre,
        p_telefono: telefono,
        p_email: email,
        p_servicio_id: form.servicio_id,
        p_fecha: form.fecha,
        p_hora: form.hora,
        p_metodo_pago: form.metodo_pago,
      })

      if (error) {
        throw error
      }

      const reserva = Array.isArray(data) ? data[0] : null

      if (!reserva) {
        throw new Error('No se pudo crear la reserva.')
      }

      navigate('/reserva/exito', {
        state: {
          nombre,
          fecha: reserva.fecha,
          hora: reserva.hora,
          codigoReserva: reserva.codigo_reserva,
        },
      })
    } catch (e) {
      console.error('Error creando reserva:', e)
      setError(e.message || 'Hubo un error al guardar tu cita. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const servicioSeleccionado = servicios.find((s) => s.id === form.servicio_id)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>✂️ Reserva tu Cita</h1>

        <div style={styles.pasos}>
          {['Servicio', 'Fecha y Hora', 'Tus Datos', 'Confirmación'].map((p, i) => (
            <div
              key={i}
              style={{ ...styles.paso, ...(paso === i + 1 ? styles.pasoActivo : {}) }}
            >
              <span style={styles.pasoBola}>{i + 1}</span>
              <span>{p}</span>
            </div>
          ))}
        </div>

        {paso === 1 && (
          <div>
            <h3 style={styles.subtitle}>Selecciona un servicio</h3>
            <div style={styles.serviciosGrid}>
              {servicios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setForm((prev) => ({ ...prev, servicio_id: s.id }))}
                  style={{
                    ...styles.servicioCard,
                    ...(form.servicio_id === s.id ? styles.servicioSeleccionado : {}),
                  }}
                >
                  <strong>{s.nombre}</strong>
                  <p style={{ margin: '0.25rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                    {s.descripcion}
                  </p>
                  <div style={styles.servicioInfo}>
                    <span>⏱ {s.duracion} min</span>
                    <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>${s.precio}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              style={{ ...styles.button, opacity: form.servicio_id ? 1 : 0.5 }}
              disabled={!form.servicio_id}
              onClick={() => setPaso(2)}
            >
              Siguiente →
            </button>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h3 style={styles.subtitle}>Selecciona fecha y hora</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              Días disponibles: {horarios.map((h) => DIAS[h.dia_semana]).join(', ')}
            </p>
            <input
              style={styles.input}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.fecha}
              onChange={(e) => handleFechaChange(e.target.value)}
            />
            {form.fecha && !isFechaDisponible(form.fecha) && (
              <p style={styles.error}>⚠️ Este día no está disponible. Elige otro.</p>
            )}
            {horasDisponibles.length > 0 && (
              <>
                <h4 style={{ color: '#fff', marginTop: '1rem' }}>Hora disponible:</h4>
                <div style={styles.horasGrid}>
                  {horasDisponibles.map((hora) => {
                    const ocupada =
                      citasOcupadas.includes(hora + ':00') || citasOcupadas.includes(hora)

                    return (
                      <button
                        key={hora}
                        type="button"
                        disabled={ocupada}
                        onClick={() => setForm((prev) => ({ ...prev, hora }))}
                        style={{
                          ...styles.horaBtn,
                          ...(form.hora === hora ? styles.horaSeleccionada : {}),
                          ...(ocupada ? styles.horaOcupada : {}),
                        }}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            <div style={styles.botones}>
              <button type="button" style={styles.buttonSecundario} onClick={() => setPaso(1)}>
                ← Atrás
              </button>
              <button
                type="button"
                style={{ ...styles.button, opacity: form.hora ? 1 : 0.5 }}
                disabled={!form.hora}
                onClick={() => setPaso(3)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h3 style={styles.subtitle}>Tus datos</h3>
            <input
              style={styles.input}
              placeholder="Nombre completo *"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Teléfono *"
              value={form.telefono}
              onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <h4 style={{ color: '#fff' }}>Método de pago:</h4>
            <div style={styles.horasGrid}>
              {METODOS_PAGO.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, metodo_pago: m }))}
                  style={{
                    ...styles.horaBtn,
                    ...(form.metodo_pago === m ? styles.horaSeleccionada : {}),
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div style={styles.botones}>
              <button type="button" style={styles.buttonSecundario} onClick={() => setPaso(2)}>
                ← Atrás
              </button>
              <button
                type="button"
                style={{
                  ...styles.button,
                  opacity:
                    form.nombre && form.telefono && form.email && form.metodo_pago ? 1 : 0.5,
                }}
                disabled={!form.nombre || !form.telefono || !form.email || !form.metodo_pago}
                onClick={() => setPaso(4)}
              >
                Revisar →
              </button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div>
            <h3 style={styles.subtitle}>Confirma tu cita</h3>
            <div style={styles.resumen}>
              <div style={styles.resumenFila}>
                <span>Servicio</span>
                <strong>{servicioSeleccionado?.nombre}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Duración</span>
                <strong>{servicioSeleccionado?.duracion} min</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Precio</span>
                <strong style={{ color: '#c9a84c' }}>${servicioSeleccionado?.precio}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Fecha</span>
                <strong>{form.fecha}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Hora</span>
                <strong>{form.hora}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Nombre</span>
                <strong>{form.nombre}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Teléfono</span>
                <strong>{form.telefono}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Email</span>
                <strong>{form.email}</strong>
              </div>
              <div style={styles.resumenFila}>
                <span>Pago</span>
                <strong>{form.metodo_pago}</strong>
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.botones}>
              <button type="button" style={styles.buttonSecundario} onClick={() => setPaso(3)}>
                ← Atrás
              </button>
              <button type="button" style={styles.button} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Guardando...' : '✅ Confirmar Cita'}
              </button>
            </div>
          </div>
        )}
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
    maxWidth: '600px',
    border: '1px solid #333',
  },
  title: { color: '#c9a84c', textAlign: 'center', marginBottom: '1.5rem' },
  subtitle: { color: '#fff', marginBottom: '1rem' },
  pasos: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  paso: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#555',
    fontSize: '0.85rem',
  },
  pasoActivo: { color: '#c9a84c', fontWeight: 'bold' },
  pasoBola: {
    background: '#333',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  serviciosGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  servicioCard: {
    background: '#222',
    padding: '1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '2px solid #333',
  },
  servicioSeleccionado: { border: '2px solid #c9a84c' },
  servicioInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#aaa',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  },
  horasGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
  horaBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
  },
  horaSeleccionada: {
    background: '#c9a84c',
    color: '#111',
    border: '1px solid #c9a84c',
    fontWeight: 'bold',
  },
  horaOcupada: {
    background: '#2a2a2a',
    color: '#555',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
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
  },
  botones: { display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' },
  resumen: { background: '#222', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' },
  resumenFila: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #333',
    color: '#aaa',
  },
  error: { color: '#ff4444' },
}