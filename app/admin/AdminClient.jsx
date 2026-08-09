'use client';

import { useState } from 'react';
import { 
  crearCategoria, editarCategoria, eliminarCategoria, 
  crearEquipo, editarEquipo, eliminarEquipo, 
  crearTorneo, editarTorneo, eliminarTorneo, 
  crearPartido, actualizarPartido, eliminarPartido 
} from './actions';

export default function AdminClient({ categorias, equipos, torneos, partidos }) {
  // Estados para saber qué fila estamos editando
  const [editCat, setEditCat] = useState(null);
  const [editEq, setEditEq] = useState(null);
  const [editTor, setEditTor] = useState(null);
  const [editPart, setEditPart] = useState(null);

  // Función maestra de doble confirmación
  const confirmarEliminacion = (e) => {
    if (!window.confirm("⚠️ ¿Estás seguro de ELIMINAR este registro?\n\nEsta acción no se puede deshacer. Si el registro tiene datos vinculados (ej. un equipo con partidos jugados), la base de datos bloqueará la eliminación por seguridad.")) {
      e.preventDefault();
    }
  };

  const inputStyle = { padding: "8px", borderRadius: 4, border: "1px solid #4B5563", background: "#374151", color: "#FFF" };
  const btnStyle = { padding: "6px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 30 }}>
      
      {/* ================= CATEGORÍAS ================= */}
      <div style={{ background: "#1F2937", padding: 24, borderRadius: 12 }}>
        <h2 style={{ color: "#10B981", marginTop: 0 }}>Categorías</h2>
        <form action={crearCategoria} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input type="text" name="nombre" placeholder="Nueva categoría..." required style={{...inputStyle, flex: 1}} />
          <button type="submit" style={{...btnStyle, background: "#10B981", color: "#FFF"}}>Crear</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {categorias.map(cat => (
            <li key={cat.id} style={{ padding: "10px", borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {editCat === cat.id ? (
                <form action={async (fd) => { await editarCategoria(fd); setEditCat(null); }} style={{ display: "flex", gap: 5, width: "100%" }}>
                  <input type="hidden" name="id" value={cat.id} />
                  <input type="text" name="nombre" defaultValue={cat.nombre} required style={{...inputStyle, flex: 1}} />
                  <button type="submit" style={{...btnStyle, background: "#3B82F6", color: "#FFF"}}>✔</button>
                  <button type="button" onClick={() => setEditCat(null)} style={{...btnStyle, background: "#6B7280", color: "#FFF"}}>✖</button>
                </form>
              ) : (
                <>
                  <span>{cat.nombre}</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => setEditCat(cat.id)} style={{...btnStyle, background: "#3B82F6", color: "#FFF"}}>Editar</button>
                    <form action={eliminarCategoria} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={cat.id} /><button type="submit" style={{...btnStyle, background: "#EF4444", color: "#FFF"}}>Eliminar</button></form>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ================= EQUIPOS ================= */}
      <div style={{ background: "#1F2937", padding: 24, borderRadius: 12 }}>
        <h2 style={{ color: "#3B82F6", marginTop: 0 }}>Equipos</h2>
        <form action={crearEquipo} style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input type="text" name="nombre" placeholder="Nombre completo" required style={{...inputStyle, flex: 1, minWidth: "150px"}} />
          <input type="text" name="nombreCorto" placeholder="Corto" style={{...inputStyle, width: 80}} />
          {/* NUEVO: Escudo URL */}
          <input type="url" name="escudo_url" placeholder="URL Escudo (Opcional)" style={{...inputStyle, width: "100%"}} />
          <button type="submit" style={{...btnStyle, background: "#3B82F6", color: "#FFF", width: "100%"}}>Crear Equipo</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 300, overflowY: "auto" }}>
          {equipos.map(eq => (
            <li key={eq.id} style={{ padding: "10px", borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {editEq === eq.id ? (
                <form action={async (fd) => { await editarEquipo(fd); setEditEq(null); }} style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                  <input type="hidden" name="id" value={eq.id} />
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="text" name="nombre" defaultValue={eq.nombre} required style={{...inputStyle, flex: 1}} />
                    <input type="text" name="nombreCorto" defaultValue={eq.nombreCorto || ''} style={{...inputStyle, width: 80}} />
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="url" name="escudo_url" defaultValue={eq.escudo_url || ''} placeholder="URL Escudo..." style={{...inputStyle, flex: 1}} />
                    <button type="submit" style={{...btnStyle, background: "#3B82F6", color: "#FFF"}}>✔</button>
                    <button type="button" onClick={() => setEditEq(null)} style={{...btnStyle, background: "#6B7280", color: "#FFF"}}>✖</button>
                  </div>
                </form>
              ) : (
                <>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {eq.escudo_url ? <img src={eq.escudo_url} alt="" width={20} height={20} style={{objectFit: "contain"}} /> : <div style={{width: 20, height: 20, background: "#374151", borderRadius: "50%"}} />}
                    {eq.nombre} <small style={{color: "#9CA3AF"}}>({eq.nombreCorto})</small>
                  </span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => setEditEq(eq.id)} style={{...btnStyle, background: "#3B82F6", color: "#FFF"}}>Editar</button>
                    <form action={eliminarEquipo} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={eq.id} /><button type="submit" style={{...btnStyle, background: "#EF4444", color: "#FFF"}}>Eliminar</button></form>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ================= TORNEOS ================= */}
      <div style={{ background: "#1F2937", padding: 24, borderRadius: 12 }}>
        <h2 style={{ color: "#F59E0B", marginTop: 0 }}>Torneos</h2>
        <form action={crearTorneo} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <input type="text" name="nombre" placeholder="Ej: Clausura" required style={{...inputStyle, flex: 1, minWidth: "120px"}} />
          {/* NUEVO: Año */}
          <input type="number" name="anio" placeholder="Año" defaultValue={new Date().getFullYear()} required style={{...inputStyle, width: 80}} />
          <select name="categoriaId" required style={{...inputStyle, width: "100%"}}>
            <option value="">Categoría...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <button type="submit" style={{...btnStyle, background: "#F59E0B", color: "#FFF", width: "100%"}}>Crear Torneo</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {torneos.map(tor => (
            <li key={tor.id} style={{ padding: "10px", borderBottom: "1px solid #374151" }}>
              {editTor === tor.id ? (
                <form action={async (fd) => { await editarTorneo(fd); setEditTor(null); }} style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                  <input type="hidden" name="id" value={tor.id} />
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="text" name="nombre" defaultValue={tor.nombre} required style={{...inputStyle, flex: 1}} />
                    <input type="number" name="anio" defaultValue={tor.anio} required style={{...inputStyle, width: 80}} />
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <select name="estado" defaultValue={tor.estado} style={{...inputStyle, flex: 1}}>
                      <option value="Activo">Activo</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                    {/* NUEVO: Seleccionar Campeón */}
                    <select name="campeonId" defaultValue={tor.campeonId || ''} style={{...inputStyle, flex: 1}}>
                      <option value="">Sin campeón...</option>
                      {equipos.map(e => <option key={e.id} value={e.id}>{e.nombreCorto || e.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setEditTor(null)} style={{...btnStyle, background: "#6B7280", color: "#FFF"}}>Cancelar</button>
                    <button type="submit" style={{...btnStyle, background: "#3B82F6", color: "#FFF"}}>Guardar</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    {tor.categoria.nombre} - <b>{tor.nombre} {tor.anio}</b> ({tor.estado}) 
                    {tor.campeonId && " 🏆"}
                  </span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => setEditTor(tor.id)} style={{...btnStyle, background: "#3B82F6", color: "#FFF"}}>Editar</button>
                    <form action={eliminarTorneo} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={tor.id} /><button type="submit" style={{...btnStyle, background: "#EF4444", color: "#FFF"}}>Eliminar</button></form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ================= PARTIDOS (RESULTADOS) ================= */}
      <div style={{ background: "#1F2937", padding: 24, borderRadius: 12, gridColumn: "1 / -1" }}>
        <h2 style={{ color: "#8B5CF6", marginTop: 0 }}>Gestión de Partidos y Resultados</h2>
        
        {/* Formulario de Creación */}
        <form action={crearPartido} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30, background: "#111827", padding: 15, borderRadius: 8 }}>
          <select name="torneoId" required style={inputStyle}><option value="">Torneo...</option>{torneos.map(t => <option key={t.id} value={t.id}>{t.categoria.nombre} - {t.nombre} {t.anio}</option>)}</select>
          <input type="number" name="fecha_numero" placeholder="Fecha N°" required style={{...inputStyle, width: 90}} min="1" />
          <select name="localId" required style={inputStyle}><option value="">Local...</option>{equipos.map(e => <option key={e.id} value={e.id}>{e.nombreCorto || e.nombre}</option>)}</select>
          <select name="visitanteId" required style={inputStyle}><option value="">Visitante...</option>{equipos.map(e => <option key={e.id} value={e.id}>{e.nombreCorto || e.nombre}</option>)}</select>
          <input type="datetime-local" name="dia_hora" style={inputStyle} />
          <button type="submit" style={{...btnStyle, background: "#8B5CF6", color: "#FFF"}}>+ Programar</button>
        </form>

        {/* Lista de Partidos (Con edición de goles, estados y reprogramación) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {partidos.map(p => (
            <div key={p.id} style={{ background: "#374151", padding: 15, borderRadius: 8 }}>
              {editPart === p.id ? (
                <form action={async (fd) => { await actualizarPartido(fd); setEditPart(null); }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input type="hidden" name="id" value={p.id} />
                  
                  {/* Edición de Goles */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                    <span style={{flex: 1, textAlign: "right"}}>{p.local.nombre}</span>
                    <input type="number" name="goles_l" defaultValue={p.goles_l ?? ''} placeholder="0" style={{...inputStyle, width: 60, textAlign: "center", fontSize: 20}} />
                    <span> - </span>
                    <input type="number" name="goles_v" defaultValue={p.goles_v ?? ''} placeholder="0" style={{...inputStyle, width: 60, textAlign: "center", fontSize: 20}} />
                    <span style={{flex: 1}}>{p.visitante.nombre}</span>
                  </div>

                  {/* NUEVO: Reprogramar Día y Hora / Cambiar Estado / Goleadores */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input 
                      type="datetime-local" 
                      name="dia_hora" 
                      defaultValue={p.dia_hora ? new Date(p.dia_hora).toISOString().slice(0, 16) : ''} 
                      style={{...inputStyle, flex: 1}} 
                    />
                    <select name="estado" defaultValue={p.estado} style={{...inputStyle, flex: 1}}>
                      <option value="Programado">Programado</option>
                      <option value="En Juego">En Juego (Vivo)</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                    <input type="text" name="goleadores" defaultValue={p.goleadores || ''} placeholder="Ej: 15' J. Perez (L), 80' M. Gomez (V)" style={{...inputStyle, flex: 2}} />
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setEditPart(null)} style={{...btnStyle, background: "#6B7280", color: "#FFF"}}>Cancelar</button>
                    <button type="submit" style={{...btnStyle, background: "#10B981", color: "#FFF"}}>💾 Guardar Cambios</button>
                  </div>
                </form>
              ) : (
                // VISTA NORMAL DEL PARTIDO
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#FCD34D", fontWeight: "bold" }}>{p.torneo.categoria.nombre} - {p.torneo.nombre} {p.torneo.anio} - Fecha {p.fecha_numero}</div>
                    <div style={{ fontSize: 16, marginTop: 5 }}>
                      <b>{p.local.nombre} {p.goles_l ?? '-'}</b> vs <b>{p.goles_v ?? '-'} {p.visitante.nombre}</b> 
                      <span style={{ marginLeft: 10, fontSize: 12, padding: "2px 6px", borderRadius: 4, background: p.estado === 'Finalizado' ? '#111827' : p.estado === 'En Juego' ? '#DC2626' : p.estado === 'Suspendido' ? '#D97706' : '#4B5563' }}>
                        {p.estado}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 5 }}>
                      📅 {p.dia_hora ? new Date(p.dia_hora).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'}) : 'A confirmar'}
                      {p.goleadores && <span style={{marginLeft: 10}}>⚽ {p.goleadores}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => setEditPart(p.id)} style={{...btnStyle, background: "#10B981", color: "#FFF"}}>Editar</button>
                    <form action={eliminarPartido} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={p.id} /><button type="submit" style={{...btnStyle, background: "#EF4444", color: "#FFF"}}>Eliminar</button></form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}