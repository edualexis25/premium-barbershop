import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ESTADO_COLORES = {
  pendiente: '#b8860b',
  confirmada: '#2d6a2d',
  completada: '#1a4a7a',
  cancelada: '#6a2d2d'
}

export default function MisCitas() {
  const [email, setEmail] = useState('')
  const [citas, setCitas] = useState([])
  const [buscado, setBuscado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleBuscar = async () => {
    if (!email) return
    setLoading(true)
    setBuscado(false)

    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        clientes!inner(nombre, email),
        servicios(nombre, precio, duracion)
      `)
      .eq('clientes.email', email)
      .order('fecha', { ascending: false })

    if (error) console.error(error)
    setCitas(data || [])
    setBuscado(true)
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>✂️ Mis Citas</h1>
        <p style={styles.subtitulo}>Ingresa tu email para ver el historial de tus reservas</p>

        <div style={styles.buscador}>
          <input
            style={styles.input}
            type="email"
            placeholder="Tu email *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
          />
          <button style={styles.button} onClick={handleBuscar} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {buscado && citas.length === 0 && (
          <div style={styles.vacio}>
            <p>😕 No encontramos citas asociadas a ese email.</p>
            <p style={{fontSize:'0.9rem', color:'#666'}}>Verifica que sea el mismo email con el que hiciste la reserva.</p>
          </div>
        )}

        {citas.length > 0 && (
          <div>
            <h3 style={{...styles.subtitulo, marginBottom:'1rem'}}>Tus reservas ({citas.length})</h3>
            {citas.map(c => (
              <div key={c.id} style={styles.citaCard}>
                <div style={styles.citaHeader}>
                  <strong style={{color:'#fff', fontSize:'1.05rem'}}>{c.servicios?.nombre}</strong>
                  <span style={{...styles.estadoBadge, background: ESTADO_COLORES[c.estado]}}>
                    {c.estado}
                  </span>
                </div>
                <div style={styles.citaInfo}>
                  <span>📅 {c.fecha}</span>
                  <span>🕐 {c.hora?.slice(0,5)}</span>
                  <span>⏱ {c.servicios?.duracion} min</span>
                  <span>💳 {c.metodo_pago}</span>
                  {c.monto_pagado && (
                    <span style={{color:'#c9a84c'}}>💰 ${c.monto_pagado}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.reservaLink}>
          <a href="/reserva" style={styles.link}>+ Hacer una nueva reserva</a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' },
  card: { background:'#1a1a1a', padding:'2rem', borderRadius:'16px', width:'100%', maxWidth:'580px', border:'1px solid #333' },
  title: { color:'#c9a84c', textAlign:'center', marginBottom:'0.5rem' },
  subtitulo: { color:'#888', textAlign:'center', marginBottom:'1.5rem' },
  buscador: { display:'flex', gap:'0.75rem', marginBottom:'1.5rem' },
  input: { flex:1, padding:'0.75rem', borderRadius:'8px', border:'1px solid #333', background:'#222', color:'#fff', fontSize:'0.95rem' },
  button: { padding:'0.75rem 1.5rem', borderRadius:'8px', background:'#c9a84c', color:'#111', fontWeight:'bold', cursor:'pointer', border:'none', whiteSpace:'nowrap' },
  vacio: { textAlign:'center', color:'#aaa', padding:'2rem 0' },
  citaCard: { background:'#222', borderRadius:'10px', padding:'1rem', marginBottom:'1rem', border:'1px solid #2a2a2a' },
  citaHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' },
  estadoBadge: { padding:'0.2rem 0.75rem', borderRadius:'20px', color:'#fff', fontSize:'0.8rem' },
  citaInfo: { display:'flex', flexWrap:'wrap', gap:'0.75rem', color:'#aaa', fontSize:'0.9rem' },
  reservaLink: { textAlign:'center', marginTop:'1.5rem' },
  link: { color:'#c9a84c', textDecoration:'none', fontSize:'0.95rem' }
}