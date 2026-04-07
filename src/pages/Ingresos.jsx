import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PERIODOS = [
  { label: 'Hoy', valor: 'hoy' },
  { label: 'Esta semana', valor: 'semana' },
  { label: 'Este mes', valor: 'mes' },
  { label: 'Todo', valor: 'todo' }
]

export default function Ingresos() {
  const [citas, setCitas] = useState([])
  const [periodo, setPeriodo] = useState('mes')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCitas() }, [])

  const fetchCitas = async () => {
    const { data } = await supabase
      .from('citas')
      .select(`*, clientes(nombre), servicios(nombre, precio)`)
      .eq('estado', 'completada')
      .order('fecha', { ascending: false })
    if (data) setCitas(data)
    setLoading(false)
  }

  const filtrarPorPeriodo = (citas) => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return citas.filter(c => {
      const fecha = new Date(c.fecha + 'T00:00:00')
      if (periodo === 'hoy') return fecha.toDateString() === hoy.toDateString()
      if (periodo === 'semana') {
        const lunes = new Date(hoy)
        lunes.setDate(hoy.getDate() - hoy.getDay() + 1)
        return fecha >= lunes
      }
      if (periodo === 'mes') return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
      return true
    })
  }

  const citasFiltradas = filtrarPorPeriodo(citas)

  const totalIngresos = citasFiltradas.reduce((sum, c) => sum + (c.monto_pagado || 0), 0)
  const totalCitas = citasFiltradas.length
  const promedio = totalCitas > 0 ? totalIngresos / totalCitas : 0

  const ingresosPorServicio = citasFiltradas.reduce((acc, c) => {
    const nombre = c.servicios?.nombre || 'Sin servicio'
    if (!acc[nombre]) acc[nombre] = { total: 0, cantidad: 0 }
    acc[nombre].total += c.monto_pagado || 0
    acc[nombre].cantidad += 1
    return acc
  }, {})

  const ingresosPorMetodo = citasFiltradas.reduce((acc, c) => {
    const metodo = c.metodo_pago || 'Sin método'
    if (!acc[metodo]) acc[metodo] = 0
    acc[metodo] += c.monto_pagado || 0
    return acc
  }, {})

  const maxServicio = Math.max(...Object.values(ingresosPorServicio).map(s => s.total), 1)
  const maxMetodo = Math.max(...Object.values(ingresosPorMetodo), 1)

  if (loading) return <div style={{color:'#fff', padding:'2rem'}}>Cargando...</div>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💰 Control de Ingresos</h2>

      {/* Filtro de período */}
      <div style={styles.filtros}>
        {PERIODOS.map(p => (
          <button
            key={p.valor}
            onClick={() => setPeriodo(p.valor)}
            style={{...styles.filtroBtn, ...(periodo === p.valor ? styles.filtroActivo : {})}}
          >{p.label}</button>
        ))}
      </div>

      {/* Tarjetas resumen */}
      <div style={styles.resumenGrid}>
        <div style={styles.resumenCard}>
          <p style={styles.resumenLabel}>Total Ingresos</p>
          <h2 style={styles.resumenValor}>${totalIngresos.toFixed(2)}</h2>
        </div>
        <div style={styles.resumenCard}>
          <p style={styles.resumenLabel}>Citas Completadas</p>
          <h2 style={styles.resumenValor}>{totalCitas}</h2>
        </div>
        <div style={styles.resumenCard}>
          <p style={styles.resumenLabel}>Promedio por Cita</p>
          <h2 style={styles.resumenValor}>${promedio.toFixed(2)}</h2>
        </div>
      </div>

      <div style={styles.dosColumnas}>

        {/* Ingresos por servicio */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>✂️ Por Servicio</h3>
          {Object.keys(ingresosPorServicio).length === 0 ? (
            <p style={{color:'#888'}}>Sin datos</p>
          ) : (
            Object.entries(ingresosPorServicio)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([nombre, data]) => (
                <div key={nombre} style={styles.barraItem}>
                  <div style={styles.barraLabel}>
                    <span style={{color:'#fff'}}>{nombre}</span>
                    <span style={{color:'#c9a84c'}}>${data.total.toFixed(2)}</span>
                  </div>
                  <div style={styles.barraFondo}>
                    <div style={{...styles.barraRelleno, width: `${(data.total / maxServicio) * 100}%`}} />
                  </div>
                  <p style={styles.barraSub}>{data.cantidad} cita{data.cantidad !== 1 ? 's' : ''}</p>
                </div>
              ))
          )}
        </div>

        {/* Ingresos por método de pago */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💳 Por Método de Pago</h3>
          {Object.keys(ingresosPorMetodo).length === 0 ? (
            <p style={{color:'#888'}}>Sin datos</p>
          ) : (
            Object.entries(ingresosPorMetodo)
              .sort((a, b) => b[1] - a[1])
              .map(([metodo, total]) => (
                <div key={metodo} style={styles.barraItem}>
                  <div style={styles.barraLabel}>
                    <span style={{color:'#fff'}}>{metodo}</span>
                    <span style={{color:'#c9a84c'}}>${total.toFixed(2)}</span>
                  </div>
                  <div style={styles.barraFondo}>
                    <div style={{...styles.barraRelleno, width: `${(total / maxMetodo) * 100}%`, background:'#4a90d9'}} />
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Historial de pagos */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📋 Historial de Pagos</h3>
        {citasFiltradas.length === 0 ? (
          <p style={{color:'#888'}}>No hay citas completadas en este período</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Fecha','Cliente','Servicio','Método','Monto'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map(c => (
                <tr key={c.id}>
                  <td style={styles.td}>{c.fecha}</td>
                  <td style={styles.td}>{c.clientes?.nombre}</td>
                  <td style={styles.td}>{c.servicios?.nombre}</td>
                  <td style={styles.td}>{c.metodo_pago}</td>
                  <td style={{...styles.td, color:'#c9a84c', fontWeight:'bold'}}>${c.monto_pagado?.toFixed(2) || '0.00'}</td>
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
  filtros: { display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' },
  filtroBtn: { padding:'0.4rem 1.25rem', borderRadius:'20px', border:'1px solid #333', background:'#222', color:'#aaa', cursor:'pointer' },
  filtroActivo: { background:'#c9a84c', color:'#111', fontWeight:'bold', border:'1px solid #c9a84c' },
  resumenGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1rem', marginBottom:'1.5rem' },
  resumenCard: { background:'#1a1a1a', border:'1px solid #333', borderRadius:'12px', padding:'1.25rem', textAlign:'center' },
  resumenLabel: { color:'#888', margin:'0 0 0.5rem', fontSize:'0.9rem' },
  resumenValor: { color:'#c9a84c', margin:0, fontSize:'1.8rem' },
  dosColumnas: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' },
  card: { background:'#1a1a1a', border:'1px solid #333', borderRadius:'12px', padding:'1.25rem', marginBottom:'1rem' },
  cardTitle: { color:'#c9a84c', marginBottom:'1rem', marginTop:0 },
  barraItem: { marginBottom:'1rem' },
  barraLabel: { display:'flex', justifyContent:'space-between', marginBottom:'0.3rem', fontSize:'0.9rem' },
  barraFondo: { background:'#333', borderRadius:'4px', height:'8px', overflow:'hidden' },
  barraRelleno: { background:'#c9a84c', height:'100%', borderRadius:'4px', transition:'width 0.3s ease' },
  barraSub: { color:'#666', fontSize:'0.8rem', margin:'0.25rem 0 0' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { color:'#c9a84c', textAlign:'left', padding:'0.75rem', borderBottom:'1px solid #333', fontSize:'0.9rem' },
  td: { color:'#aaa', padding:'0.75rem', borderBottom:'1px solid #222', fontSize:'0.9rem' }
}