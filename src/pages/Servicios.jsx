import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState({ nombre: '', descripcion: '', duracion: '', precio: '' })
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { fetchServicios() }, [])

  const fetchServicios = async () => {
    const { data } = await supabase.from('servicios').select('*').order('created_at')
    if (data) setServicios(data)
  }

  const handleGuardar = async () => {
    if (!form.nombre || !form.duracion || !form.precio) {
      setMensaje('Por favor completa los campos obligatorios')
      return
    }
    setLoading(true)
    if (editandoId) {
      await supabase.from('servicios').update({
        nombre: form.nombre,
        descripcion: form.descripcion,
        duracion: parseInt(form.duracion),
        precio: parseFloat(form.precio)
      }).eq('id', editandoId)
      setMensaje('Servicio actualizado ✅')
      setEditandoId(null)
    } else {
      await supabase.from('servicios').insert([{
        nombre: form.nombre,
        descripcion: form.descripcion,
        duracion: parseInt(form.duracion),
        precio: parseFloat(form.precio)
      }])
      setMensaje('Servicio guardado ✅')
    }
    setForm({ nombre: '', descripcion: '', duracion: '', precio: '' })
    fetchServicios()
    setLoading(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleEditar = (s) => {
    setEditandoId(s.id)
    setForm({ nombre: s.nombre, descripcion: s.descripcion || '', duracion: s.duracion, precio: s.precio })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelarEdicion = () => {
    setEditandoId(null)
    setForm({ nombre: '', descripcion: '', duracion: '', precio: '' })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return
    await supabase.from('servicios').delete().eq('id', id)
    fetchServicios()
  }

  const handleToggle = async (id, activo) => {
    await supabase.from('servicios').update({ activo: !activo }).eq('id', id)
    fetchServicios()
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✂️ Servicios</h2>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>
          {editandoId ? '✏️ Editar Servicio' : 'Agregar Servicio'}
        </h3>
        <div style={styles.grid}>
          <input style={styles.input} placeholder="Nombre *" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          <input style={styles.input} placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
          <input style={styles.input} placeholder="Duración (minutos) *" type="number" value={form.duracion} onChange={e => setForm({...form, duracion: e.target.value})} />
          <input style={styles.input} placeholder="Precio *" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} />
        </div>
        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        <div style={{display:'flex', gap:'0.75rem'}}>
          <button style={styles.button} onClick={handleGuardar} disabled={loading}>
            {loading ? 'Guardando...' : editandoId ? 'Actualizar Servicio' : 'Guardar Servicio'}
          </button>
          {editandoId && (
            <button style={styles.buttonCancelar} onClick={handleCancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Servicios Registrados</h3>
        {servicios.length === 0 ? <p style={{color:'#888'}}>No hay servicios aún</p> : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Nombre','Descripción','Duración','Precio','Estado','Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {servicios.map(s => (
                <tr key={s.id} style={editandoId === s.id ? {background:'#1f1f2e'} : {}}>
                  <td style={styles.td}>{s.nombre}</td>
                  <td style={styles.td}>{s.descripcion || '—'}</td>
                  <td style={styles.td}>{s.duracion} min</td>
                  <td style={styles.td}>${s.precio}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggle(s.id, s.activo)}
                      style={{...styles.badge, background: s.activo ? '#2d6a2d' : '#6a2d2d'}}
                    >{s.activo ? 'Activo' : 'Inactivo'}</button>
                  </td>
                  <td style={styles.td}>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                      <button onClick={() => handleEditar(s)} style={{...styles.badge, background:'#1a3a5c'}}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleEliminar(s.id)} style={{...styles.badge, background:'#6a2d2d'}}>
                        🗑️ Eliminar
                      </button>
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
  container: { padding:'2rem', background:'#111', minHeight:'100vh' },
  title: { color:'#c9a84c', marginBottom:'1.5rem' },
  subtitle: { color:'#c9a84c', marginBottom:'1rem' },
  card: { background:'#1a1a1a', padding:'1.5rem', borderRadius:'12px', marginBottom:'1.5rem', border:'1px solid #333' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' },
  input: { padding:'0.75rem', borderRadius:'8px', border:'1px solid #333', background:'#222', color:'#fff', fontSize:'0.95rem' },
  button: { padding:'0.75rem 2rem', borderRadius:'8px', background:'#c9a84c', color:'#111', fontWeight:'bold', cursor:'pointer', border:'none' },
  buttonCancelar: { padding:'0.75rem 2rem', borderRadius:'8px', background:'transparent', color:'#c9a84c', fontWeight:'bold', cursor:'pointer', border:'1px solid #c9a84c' },
  mensaje: { color:'#4caf50', marginBottom:'0.5rem' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { color:'#c9a84c', textAlign:'left', padding:'0.75rem', borderBottom:'1px solid #333' },
  td: { color:'#fff', padding:'0.75rem', borderBottom:'1px solid #222' },
  badge: { padding:'0.25rem 0.75rem', borderRadius:'20px', color:'#fff', border:'none', cursor:'pointer', fontSize:'0.85rem' }
}