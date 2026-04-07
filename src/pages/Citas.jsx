import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ESTADOS = ['pendiente','confirmada','completada','cancelada']
const ESTADO_COLORES = { pendiente:'#b8860b', confirmada:'#2d6a2d', completada:'#1a4a7a', cancelada:'#6a2d2d' }

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [editando, setEditando] = useState(null)
  const [monto, setMonto] = useState('')
  const [estado, setEstado] = useState('')
  const [extras, setExtras] = useState([])
  const [nuevoExtra, setNuevoExtra] = useState({ descripcion: '', precio: '' })
  const [extrasMap, setExtrasMap] = useState({})

  useEffect(() => { fetchCitas() }, [])

  const fetchCitas = async () => {
    const { data } = await supabase
      .from('citas')
      .select(`*, clientes(nombre, telefono, email), servicios(nombre, precio)`)
      .order('fecha', { ascending: true })
    if (data) {
      setCitas(data)
      fetchTodosExtras(data.map(c => c.id))
    }
  }

  const fetchTodosExtras = async (citaIds) => {
    const { data } = await supabase
      .from('cita_extras')
      .select('*')
      .in('cita_id', citaIds)
    if (data) {
      const map = {}
      data.forEach(e => {
        if (!map[e.cita_id]) map[e.cita_id] = []
        map[e.cita_id].push(e)
      })
      setExtrasMap(map)
    }
  }

  const fetchExtras = async (citaId) => {
    const { data } = await supabase
      .from('cita_extras')
      .select('*')
      .eq('cita_id', citaId)
    if (data) setExtras(data)
  }

  const handleAbrirEdicion = async (cita) => {
    setEditando(cita.id)
    setEstado(cita.estado)
    setMonto(cita.monto_pagado || '')
    setNuevoExtra({ descripcion: '', precio: '' })
    await fetchExtras(cita.id)
  }

  const handleActualizar = async (id) => {
    await supabase.from('citas').update({
      estado,
      monto_pagado: monto ? parseFloat(monto) : null
    }).eq('id', id)
    setEditando(null)
    fetchCitas()
  }

  const handleAgregarExtra = async (citaId) => {
    if (!nuevoExtra.descripcion || !nuevoExtra.precio) return
    await supabase.from('cita_extras').insert([{
      cita_id: citaId,
      descripcion: nuevoExtra.descripcion,
      precio: parseFloat(nuevoExtra.precio)
    }])
    setNuevoExtra({ descripcion: '', precio: '' })
    await fetchExtras(citaId)
    fetchCitas()
  }

  const handleEliminarExtra = async (extraId, citaId) => {
    await supabase.from('cita_extras').delete().eq('id', extraId)
    await fetchExtras(citaId)
    fetchCitas()
  }

  const calcularTotal = (cita) => {
    const base = parseFloat(cita.servicios?.precio || 0)
    const sumExtras = (extrasMap[cita.id] || []).reduce((s, e) => s + parseFloat(e.precio), 0)
    return (base + sumExtras).toFixed(2)
  }

  const citasFiltradas = filtro === 'todas' ? citas : citas.filter(c => c.estado === filtro)

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Citas</h2>

      <div style={styles.filtros}>
        {['todas', ...ESTADOS].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{...styles.filtroBtn, ...(filtro === f ? styles.filtroActivo : {})}}
          >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {citasFiltradas.length === 0 ? (
        <p style={{color:'#888'}}>No hay citas {filtro !== 'todas' ? `con estado "${filtro}"` : ''}</p>
      ) : (
        citasFiltradas.map(cita => {
          const citaExtras = extrasMap[cita.id] || []
          return (
            <div key={cita.id} style={styles.citaCard}>

              {/* Header */}
              <div style={styles.citaHeader}>
                <div style={{display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.75rem'}}>
                  <strong style={{color:'#fff'}}>{cita.clientes?.nombre}</strong>
                  <span style={styles.infoChip}>📞 {cita.clientes?.telefono}</span>
                  <span style={styles.infoChip}>✉️ {cita.clientes?.email}</span>
                </div>
                <span style={{...styles.estadoBadge, background: ESTADO_COLORES[cita.estado]}}>
                  {cita.estado}
                </span>
              </div>

              {/* Info cita */}
              <div style={styles.citaInfo}>
                <span>✂️ {cita.servicios?.nombre}</span>
                <span>📅 {cita.fecha}</span>
                <span>🕐 {cita.hora?.slice(0,5)}</span>
                <span>💳 {cita.metodo_pago}</span>
                <span style={{color:'#c9a84c'}}>💰 {cita.monto_pagado ? `$${cita.monto_pagado}` : 'Pendiente'}</span>
              </div>

              {/* Extras ya agregados */}
              {citaExtras.length > 0 && (
                <div style={styles.extrasLista}>
                  <p style={styles.extrasTitle}>Servicios / Productos adicionales:</p>
                  {citaExtras.map(e => (
                    <div key={e.id} style={styles.extraItem}>
                      <span>{e.descripcion}</span>
                      <span style={{color:'#c9a84c'}}>${parseFloat(e.precio).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={styles.totalRow}>
                    <span style={{color:'#aaa'}}>Total estimado:</span>
                    <span style={{color:'#c9a84c', fontWeight:'bold'}}>${calcularTotal(cita)}</span>
                  </div>
                </div>
              )}

              {/* Formulario de edición */}
              {editando === cita.id ? (
                <div style={styles.editForm}>

                  {/* Estado y monto */}
                  <div style={styles.editFila}>
                    <select style={styles.select} value={estado} onChange={e => setEstado(e.target.value)}>
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Monto pagado"
                      value={monto}
                      onChange={e => setMonto(e.target.value)}
                    />
                  </div>

                  {/* Agregar extras */}
                  <div style={styles.extrasSeccion}>
                    <p style={styles.extrasTitle}>➕ Agregar servicio / producto adicional:</p>
                    <div style={styles.editFila}>
                      <input
                        style={{...styles.input, flex:2}}
                        placeholder="Descripción (ej: Tinte, Producto X)"
                        value={nuevoExtra.descripcion}
                        onChange={e => setNuevoExtra({...nuevoExtra, descripcion: e.target.value})}
                      />
                      <input
                        style={{...styles.input, flex:1}}
                        type="number"
                        placeholder="Precio"
                        value={nuevoExtra.precio}
                        onChange={e => setNuevoExtra({...nuevoExtra, precio: e.target.value})}
                      />
                      <button style={styles.buttonSmall} onClick={() => handleAgregarExtra(cita.id)}>
                        Agregar
                      </button>
                    </div>

                    {/* Lista de extras en edición */}
                    {extras.length > 0 && (
                      <div style={{marginTop:'0.5rem'}}>
                        {extras.map(e => (
                          <div key={e.id} style={styles.extraItemEdit}>
                            <span style={{color:'#aaa'}}>{e.descripcion}</span>
                            <span style={{color:'#c9a84c'}}>${parseFloat(e.precio).toFixed(2)}</span>
                            <button
                              onClick={() => handleEliminarExtra(e.id, cita.id)}
                              style={styles.eliminarBtn}
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botones guardar/cancelar */}
                  <div style={{display:'flex', gap:'0.5rem', marginTop:'0.75rem'}}>
                    <button style={styles.button} onClick={() => handleActualizar(cita.id)}>Guardar</button>
                    <button style={styles.buttonCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button
                  style={styles.editBtn}
                  onClick={() => handleAbrirEdicion(cita)}
                >
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
  container: { padding:'2rem', background:'#111', minHeight:'100vh' },
  title: { color:'#c9a84c', marginBottom:'1.5rem' },
  filtros: { display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' },
  filtroBtn: { padding:'0.4rem 1rem', borderRadius:'20px', border:'1px solid #333', background:'#222', color:'#aaa', cursor:'pointer' },
  filtroActivo: { background:'#c9a84c', color:'#111', fontWeight:'bold', border:'1px solid #c9a84c' },
  citaCard: { background:'#1a1a1a', border:'1px solid #333', borderRadius:'12px', padding:'1.25rem', marginBottom:'1rem' },
  citaHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' },
  estadoBadge: { padding:'0.25rem 0.75rem', borderRadius:'20px', color:'#fff', fontSize:'0.85rem', whiteSpace:'nowrap' },
  infoChip: { color:'#888', fontSize:'0.85rem' },
  citaInfo: { display:'flex', flexWrap:'wrap', gap:'1rem', color:'#aaa', fontSize:'0.9rem', marginBottom:'0.75rem' },
  extrasLista: { background:'#222', borderRadius:'8px', padding:'0.75rem', marginBottom:'0.75rem' },
  extrasTitle: { color:'#888', fontSize:'0.85rem', margin:'0 0 0.5rem' },
  extraItem: { display:'flex', justifyContent:'space-between', color:'#ccc', fontSize:'0.9rem', padding:'0.25rem 0', borderBottom:'1px solid #2a2a2a' },
  totalRow: { display:'flex', justifyContent:'space-between', marginTop:'0.5rem', fontSize:'0.95rem' },
  editForm: { marginTop:'0.75rem', borderTop:'1px solid #2a2a2a', paddingTop:'0.75rem' },
  editFila: { display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.5rem', alignItems:'center' },
  extrasSeccion: { background:'#222', borderRadius:'8px', padding:'0.75rem', marginTop:'0.5rem' },
  extraItemEdit: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.3rem 0', borderBottom:'1px solid #2a2a2a', gap:'0.5rem' },
  select: { padding:'0.5rem', borderRadius:'8px', border:'1px solid #333', background:'#222', color:'#fff' },
  input: { padding:'0.5rem', borderRadius:'8px', border:'1px solid #333', background:'#222', color:'#fff', flex:1, minWidth:'120px' },
  button: { padding:'0.5rem 1.25rem', borderRadius:'8px', background:'#c9a84c', color:'#111', fontWeight:'bold', cursor:'pointer', border:'none' },
  buttonSmall: { padding:'0.5rem 0.75rem', borderRadius:'8px', background:'#c9a84c', color:'#111', fontWeight:'bold', cursor:'pointer', border:'none', whiteSpace:'nowrap' },
  buttonCancelar: { padding:'0.5rem 1.25rem', borderRadius:'8px', background:'transparent', color:'#c9a84c', cursor:'pointer', border:'1px solid #c9a84c' },
  eliminarBtn: { background:'#6a2d2d', border:'none', color:'#fff', borderRadius:'50%', width:'22px', height:'22px', cursor:'pointer', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center' },
  editBtn: { background:'transparent', border:'none', color:'#c9a84c', cursor:'pointer', fontSize:'0.9rem', padding:0 }
}