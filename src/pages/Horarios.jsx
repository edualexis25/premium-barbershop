import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

export default function Horarios() {
  const [horarios, setHorarios] = useState([])
  const [form, setForm] = useState({ dia_semana: '1', hora_inicio: '09:00', hora_fin: '18:00' })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { fetchHorarios() }, [])

  const fetchHorarios = async () => {
    const { data } = await supabase.from('horarios').select('*').order('dia_semana')
    if (data) setHorarios(data)
  }

  const handleGuardar = async () => {
    const { error } = await supabase.from('horarios').insert([{
      dia_semana: parseInt(form.dia_semana),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin
    }])
    if (!error) {
      setMensaje('Horario guardado ✅')
      fetchHorarios()
    }
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleToggle = async (id, activo) => {
    await supabase.from('horarios').update({ activo: !activo }).eq('id', id)
    fetchHorarios()
  }

  const handleEliminar = async (id) => {
    await supabase.from('horarios').delete().eq('id', id)
    fetchHorarios()
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗓️ Horarios de Trabajo</h2>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Agregar Horario</h3>
        <div style={styles.grid}>
          <select style={styles.input} value={form.dia_semana} onChange={e => setForm({...form, dia_semana: e.target.value})}>
            {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <div style={{display:'flex', gap:'1rem'}}>
            <input style={styles.input} type="time" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})} />
            <input style={styles.input} type="time" value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})} />
          </div>
        </div>
        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        <button style={styles.button} onClick={handleGuardar}>Guardar Horario</button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Horarios Configurados</h3>
        {horarios.length === 0 ? <p style={{color:'#888'}}>No hay horarios aún</p> : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Día','Hora Inicio','Hora Fin','Estado',''].map((h,i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map(h => (
                <tr key={h.id}>
                  <td style={styles.td}>{DIAS[h.dia_semana]}</td>
                  <td style={styles.td}>{h.hora_inicio}</td>
                  <td style={styles.td}>{h.hora_fin}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleToggle(h.id, h.activo)} style={{...styles.badge, background: h.activo ? '#2d6a2d' : '#6a2d2d'}}>
                      {h.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEliminar(h.id)} style={{...styles.badge, background: '#6a2d2d'}}>
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
  container: { padding: '2rem', background: '#111', minHeight: '100vh' },
  title: { color: '#c9a84c', marginBottom: '1.5rem' },
  subtitle: { color: '#c9a84c', marginBottom: '1rem' },
  card: { background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #333' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '0.95rem', width: '100%' },
  button: { padding: '0.75rem 2rem', borderRadius: '8px', background: '#c9a84c', color: '#111', fontWeight: 'bold', cursor: 'pointer', border: 'none' },
  mensaje: { color: '#4caf50', marginBottom: '0.5rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#c9a84c', textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #333' },
  td: { color: '#fff', padding: '0.75rem', borderBottom: '1px solid #222' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '20px', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }
}