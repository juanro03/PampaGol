'use client';

import { useId, useState } from 'react';
import Select from 'react-select';
import { 
  crearCategoria, editarCategoria, eliminarCategoria, 
  crearEquipo, editarEquipo, eliminarEquipo, 
  crearTorneo, editarTorneo, eliminarTorneo, 
  crearPartido, actualizarPartido, eliminarPartido 
} from './actions';
import GestorGoles from './GestorGoles';

const selectStyles = {
  container: base => ({ ...base, flex: 1, minWidth: 180 }),
  control: base => ({ ...base, background: '#374151', borderColor: '#4B5563', color: '#FFF' }),
  menu: base => ({ ...base, background: '#1F2937', zIndex: 10 }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? '#374151' : '#1F2937',
    color: '#FFF'
  }),
  multiValue: base => ({ ...base, background: '#4B5563' }),
  multiValueLabel: base => ({ ...base, color: '#FFF' }),
  input: base => ({ ...base, color: '#FFF' }),
  singleValue: base => ({ ...base, color: '#FFF' }),
  placeholder: base => ({ ...base, color: '#D1D5DB' })
};

function BuscadorSelect({
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  isMulti = false,
  styles
}) {
  const instanceId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? (isMulti ? [] : ''));
  const currentValue = value !== undefined ? value : internalValue;
  const selectedValue = isMulti
    ? options.filter(option => (currentValue || []).map(String).includes(String(option.value)))
    : options.find(option => String(option.value) === String(currentValue || '')) || null;

  const serializedValue = isMulti
    ? JSON.stringify((currentValue || []).map(String))
    : currentValue;

  return (
    <>
      <Select
        instanceId={instanceId}
        isSearchable
        isMulti={isMulti}
        options={options}
        value={value !== undefined ? selectedValue : undefined}
        defaultValue={value === undefined ? selectedValue : undefined}
        onChange={selected => {
          const nextValue = isMulti
            ? (selected || []).map(option => option.value)
            : selected?.value || '';
          setInternalValue(nextValue);
          onChange?.(nextValue);
        }}
        placeholder={placeholder}
        noOptionsMessage={() => 'No se encontraron coincidencias'}
        styles={styles}
      />
      {name && <input type="hidden" name={name} value={serializedValue} />}
    </>
  );
}

export default function AdminClient({ categorias, equipos, torneos, partidos }) {
  // Estados de edición
  const [editCat, setEditCat] = useState(null);
  const [editEq, setEditEq] = useState(null);
  const [editTor, setEditTor] = useState(null);
  const [editPart, setEditPart] = useState(null);

  // Estados para los filtros de partidos
  const [filtroCat, setFiltroCat] = useState('');
  const [filtroTor, setFiltroTor] = useState('');
  const [filtroFec, setFiltroFec] = useState('');
  const [cantidadZonas, setCantidadZonas] = useState(0);
  const [zonas, setZonas] = useState([]);
  const [torneoPartidoId, setTorneoPartidoId] = useState('');

  const torneosParaFiltrar = filtroCat
    ? torneos.filter(t => (t.categoria?.id || t.categoriaId).toString() === filtroCat)
    : torneos;

  const actualizarCantidadZonas = (value) => {
    const count = Math.max(0, Number(value) || 0);
    setCantidadZonas(count);
    setZonas(current => Array.from({ length: count }, (_, index) => current[index] || {
      nombre: `Zona ${String.fromCharCode(65 + index)}`,
      cupo: 1,
      equipoIds: []
    }));
  };

  const actualizarZona = (index, changes) => {
    setZonas(current => current.map((zona, zonaIndex) =>
      zonaIndex === index ? { ...zona, ...changes } : zona
    ));
  };

  const torneoPartido = torneos.find(torneo => torneo.id === torneoPartidoId);
  const opcionesCategorias = categorias.map(categoria => ({ value: categoria.id, label: categoria.nombre }));
  const opcionesEquipos = equipos.map(equipo => ({ value: equipo.id, label: equipo.nombreCorto || equipo.nombre }));
  const opcionesTorneos = torneos.map(torneo => ({
    value: torneo.id,
    label: `${torneo.categoria.nombre} - ${torneo.nombre} ${torneo.anio}`
  }));
  const opcionesTorneosFiltrados = torneosParaFiltrar.map(torneo => ({
    value: torneo.id,
    label: `${torneo.nombre} ${torneo.anio}`
  }));

  const confirmarEliminacion = (e) => {
    if (!window.confirm("¿Eliminar registro? Esta acción es irreversible y puede estar bloqueada si hay datos vinculados.")) {
      e.preventDefault();
    }
  };

  const s = {
    card: { background: "#1F2937", padding: 20, borderRadius: 8 },
    h2: { color: "#FFF", marginTop: 0, fontSize: "1.2rem", borderBottom: "2px solid #374151", paddingBottom: 10 },
    form: { display: "flex", gap: 8, marginBottom: 15, flexWrap: "wrap" },
    input: { padding: "8px", borderRadius: 4, border: "1px solid #4B5563", background: "#374151", color: "#FFF", flex: 1 },
    inputSmall: { padding: "8px", borderRadius: 4, border: "1px solid #4B5563", background: "#374151", color: "#FFF", width: 80 },
    btn: { padding: "8px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold", color: "#FFF" },
    list: { listStyle: "none", padding: 0, margin: 0, maxHeight: 350, overflowY: "auto" },
    item: { padding: "10px 0", borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }
  };

  const partidosVisibles = partidos.filter(p => {
    let pasaCat = true;
    let pasaTor = true;
    let pasaFec = true;

    if (filtroCat) pasaCat = (p.torneo.categoria?.id || p.torneo.categoriaId).toString() === filtroCat;
    if (filtroTor) pasaTor = p.torneo.id.toString() === filtroTor;
    if (filtroFec) pasaFec = p.fecha_numero.toString() === filtroFec;

    return pasaCat && pasaTor && pasaFec;
  });

  return (
    <div style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "0 20px" }}>
      
      <style>{`
        .grilla-admin {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .grilla-admin {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      <div className="grilla-admin">
        
        {/* ================= CATEGORÍAS ================= */}
        <div style={s.card}>
          <h2 style={{...s.h2, borderColor: "#10B981"}}>Categorías</h2>
          <form action={crearCategoria} style={s.form}>
            <input type="text" name="nombre" placeholder="Nombre" required style={s.input} />
            <button type="submit" style={{...s.btn, background: "#10B981"}}>Crear</button>
          </form>
          <ul style={s.list}>
            {categorias.map(cat => (
              <li key={cat.id} style={s.item}>
                {editCat === cat.id ? (
                  <form action={async (fd) => { await editarCategoria(fd); setEditCat(null); }} style={{ display: "flex", gap: 8, width: "100%" }}>
                    <input type="hidden" name="id" value={cat.id} />
                    <input type="text" name="nombre" defaultValue={cat.nombre} required style={s.input} />
                    <button type="submit" style={{...s.btn, background: "#3B82F6"}}>Guardar</button>
                    <button type="button" onClick={() => setEditCat(null)} style={{...s.btn, background: "#6B7280"}}>X</button>
                  </form>
                ) : (
                  <>
                    <span>{cat.nombre}</span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setEditCat(cat.id)} style={{...s.btn, background: "#374151"}}>Editar</button>
                      <form action={eliminarCategoria} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={cat.id} /><button type="submit" style={{...s.btn, background: "#EF4444"}}>Borrar</button></form>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ================= EQUIPOS ================= */}
        <div style={s.card}>
          <h2 style={{...s.h2, borderColor: "#3B82F6"}}>Equipos</h2>
          <form action={crearEquipo} style={s.form}>
            <input type="text" name="nombre" placeholder="Nombre" required style={s.input} />
            <input type="text" name="nombreCorto" placeholder="Corto" style={s.inputSmall} />
            <input type="url" name="escudo_url" placeholder="URL Escudo" style={{...s.input, minWidth: "100%"}} />
            <button type="submit" style={{...s.btn, background: "#3B82F6", width: "100%"}}>Crear</button>
          </form>
          <ul style={s.list}>
            {equipos.map(eq => (
              <li key={eq.id} style={s.item}>
                {editEq === eq.id ? (
                  <form action={async (fd) => { await editarEquipo(fd); setEditEq(null); }} style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                    <input type="hidden" name="id" value={eq.id} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" name="nombre" defaultValue={eq.nombre} required style={s.input} />
                      <input type="text" name="nombreCorto" defaultValue={eq.nombreCorto || ''} style={s.inputSmall} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="url" name="escudo_url" defaultValue={eq.escudo_url || ''} placeholder="URL Escudo" style={s.input} />
                      <button type="submit" style={{...s.btn, background: "#3B82F6"}}>Guardar</button>
                      <button type="button" onClick={() => setEditEq(null)} style={{...s.btn, background: "#6B7280"}}>X</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {eq.escudo_url ? <img src={eq.escudo_url} alt="" width={20} height={20} style={{objectFit: "contain"}} /> : <div style={{width: 20, height: 20, background: "#374151", borderRadius: "50%"}} />}
                      {eq.nombre} <small style={{color: "#9CA3AF"}}>({eq.nombreCorto})</small>
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setEditEq(eq.id)} style={{...s.btn, background: "#374151"}}>Editar</button>
                      <form action={eliminarEquipo} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={eq.id} /><button type="submit" style={{...s.btn, background: "#EF4444"}}>Borrar</button></form>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ================= TORNEOS ================= */}
        <div style={s.card}>
          <h2 style={{...s.h2, borderColor: "#F59E0B"}}>Torneos</h2>
          <form action={crearTorneo} style={s.form}>
            <input type="text" name="nombre" placeholder="Nombre (Ej: Clausura)" required style={s.input} />
            <input type="number" name="anio" placeholder="Año" defaultValue={new Date().getFullYear()} required style={s.inputSmall} />
            <input type="number" name="fechaInicio" placeholder="Fecha visible" defaultValue={1} min="1" required style={s.inputSmall} />
            <div style={{ width: "100%" }}>
              <BuscadorSelect name="categoriaId" options={opcionesCategorias} placeholder="Buscar categoría..." required styles={selectStyles} />
            </div>
            <label style={{ width: "100%", color: "#D1D5DB" }}>
              Cantidad de zonas
              <input
                type="number"
                min="0"
                value={cantidadZonas}
                onChange={e => actualizarCantidadZonas(e.target.value)}
                style={{...s.input, marginTop: 6}}
              />
            </label>
            <input type="hidden" name="zonas" value={JSON.stringify(zonas)} />
            {zonas.map((zona, index) => (
              <div key={index} style={{ width: "100%", border: "1px solid #4B5563", padding: 10, borderRadius: 6 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={zona.nombre}
                    onChange={e => actualizarZona(index, { nombre: e.target.value })}
                    placeholder="Nombre de zona"
                    required
                    style={s.input}
                  />
                  <input
                    type="number"
                    min="1"
                    value={zona.cupo}
                    onChange={e => actualizarZona(index, { cupo: Number(e.target.value), equipoIds: zona.equipoIds.slice(0, Number(e.target.value)) })}
                    required
                    style={s.inputSmall}
                  />
                </div>
                <BuscadorSelect
                  options={opcionesEquipos}
                  value={zona.equipoIds}
                  onChange={equipoIds => actualizarZona(index, { equipoIds })}
                  placeholder="Buscar y seleccionar equipos..."
                  isMulti
                  styles={selectStyles}
                />
                <small style={{ color: "#9CA3AF" }}>Seleccioná exactamente {zona.cupo} equipos.</small>
              </div>
            ))}
            <button type="submit" style={{...s.btn, background: "#F59E0B", width: "100%"}}>Crear</button>
          </form>
          <ul style={s.list}>
            {torneos.map(tor => (
              <li key={tor.id} style={s.item}>
                {editTor === tor.id ? (
                  <form action={async (fd) => { await editarTorneo(fd); setEditTor(null); }} style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                    <input type="hidden" name="id" value={tor.id} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" name="nombre" defaultValue={tor.nombre} required style={s.input} />
                      <input type="number" name="anio" defaultValue={tor.anio} required style={s.inputSmall} />
                      <input type="number" name="fechaInicio" defaultValue={tor.fechaInicio || 1} min="1" required style={s.inputSmall} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <select name="estado" defaultValue={tor.estado} style={s.input}>
                        <option value="Activo">Activo</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                      <BuscadorSelect
                        name="campeonId"
                        options={opcionesEquipos}
                        defaultValue={tor.campeonId || ''}
                        placeholder="Sin campeón..."
                        styles={selectStyles}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setEditTor(null)} style={{...s.btn, background: "#6B7280"}}>Cancelar</button>
                      <button type="submit" style={{...s.btn, background: "#3B82F6"}}>Guardar</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span>
                      <small style={{color: "#9CA3AF"}}>{tor.categoria.nombre}</small><br/>
                      <b>{tor.nombre} {tor.anio}</b> ({tor.estado}) 
                      {tor.campeonId && " - Campeón"}
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setEditTor(tor.id)} style={{...s.btn, background: "#374151"}}>Editar</button>
                      <form action={eliminarTorneo} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={tor.id} /><button type="submit" style={{...s.btn, background: "#EF4444"}}>Borrar</button></form>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ================= PARTIDOS ================= */}
        <div style={{...s.card, gridColumn: "1 / -1", marginTop: 10}}>
          <h2 style={{...s.h2, borderColor: "#8B5CF6"}}>Partidos y Resultados</h2>
          
          {/* Formulario de Creación */}
          <form action={crearPartido} style={{...s.form, background: "#111827", padding: 15, borderRadius: 8}}>
            <BuscadorSelect
              name="torneoId"
              options={opcionesTorneos}
              value={torneoPartidoId}
              onChange={setTorneoPartidoId}
              placeholder="Buscar torneo..."
              required
              styles={selectStyles}
            />
            {torneoPartido?.zonas?.length > 0 && (
              <BuscadorSelect
                name="zonaId"
                options={torneoPartido.zonas.map(zona => ({ value: zona.id, label: zona.nombre }))}
                placeholder="Buscar zona..."
                required
                styles={selectStyles}
              />
            )}
            <input type="number" name="fecha_numero" placeholder="Fecha N°" required style={s.inputSmall} min="1" />
            <BuscadorSelect name="localId" options={opcionesEquipos} placeholder="Buscar local..." required styles={selectStyles} />
            <BuscadorSelect name="visitanteId" options={opcionesEquipos} placeholder="Buscar visitante..." required styles={selectStyles} />
            <input type="datetime-local" name="dia_hora" style={s.input} />
            <button type="submit" style={{...s.btn, background: "#8B5CF6"}}>Programar</button>
          </form>

          {/* BARRA DE FILTROS */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, padding: 15, background: "#111827", borderRadius: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#9CA3AF", fontWeight: "bold" }}>Filtros:</span>
            
            <BuscadorSelect
              options={opcionesCategorias}
              value={filtroCat}
              onChange={value => { setFiltroCat(value); setFiltroTor(''); }}
              placeholder="Todas las categorías"
              styles={selectStyles}
            />

            <BuscadorSelect
              options={opcionesTorneosFiltrados}
              value={filtroTor}
              onChange={setFiltroTor}
              placeholder="Todos los torneos"
              styles={selectStyles}
            />

            <input 
              type="number" 
              placeholder="Fecha N°" 
              style={s.inputSmall} 
              value={filtroFec} 
              onChange={e => setFiltroFec(e.target.value)} 
            />

            {(filtroCat || filtroTor || filtroFec) && (
              <button onClick={() => { setFiltroCat(''); setFiltroTor(''); setFiltroFec(''); }} style={{...s.btn, background: "#EF4444"}}>
                Limpiar
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {partidosVisibles.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: "#9CA3AF" }}>
                No hay partidos que coincidan con estos filtros.
              </div>
            )}

            {/* Acá iteramos sobre partidosVisibles en lugar de partidos */}
            {partidosVisibles.map(p => (
              <div key={p.id} style={{ background: "#374151", padding: 15, borderRadius: 8 }}>
                {editPart === p.id ? (
                  <form action={async (fd) => { await actualizarPartido(fd); setEditPart(null); }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="hidden" name="id" value={p.id} />
                    
                    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                      <span style={{flex: 1, textAlign: "right", fontWeight: "bold"}}>{p.local.nombre}</span>
                      <input type="number" name="goles_l" defaultValue={p.goles_l ?? ''} placeholder="0" style={{...s.input, maxWidth: 60, textAlign: "center", fontSize: 18}} />
                      <span> - </span>
                      <input type="number" name="goles_v" defaultValue={p.goles_v ?? ''} placeholder="0" style={{...s.input, maxWidth: 60, textAlign: "center", fontSize: 18}} />
                      <span style={{flex: 1, fontWeight: "bold"}}>{p.visitante.nombre}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, margin: "10px 0" }}>
                      <GestorGoles partido={p} equipo={p.local} tipo="local" />
                      <GestorGoles partido={p} equipo={p.visitante} tipo="visitante" />
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <input type="datetime-local" name="dia_hora" defaultValue={p.dia_hora ? new Date(p.dia_hora).toISOString().slice(0, 16) : ''} style={s.input} />
                      <select name="estado" defaultValue={p.estado} style={s.input}>
                        <option value="Programado">Programado</option>
                        <option value="En Juego">En Juego</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Suspendido">Suspendido</option>
                      </select>
                      <input type="text" name="goleadores" defaultValue={p.goleadores || ''} placeholder="Goleadores (Ej: 15' Perez)" style={{...s.input, flex: 2}} />
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setEditPart(null)} style={{...s.btn, background: "#6B7280"}}>Cancelar</button>
                      <button type="submit" style={{...s.btn, background: "#10B981"}}>Guardar Cambios</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>{p.torneo.categoria.nombre} - {p.torneo.nombre} {p.torneo.anio} | Fecha {p.fecha_numero}</div>
                      <div style={{ fontSize: 16, marginTop: 5 }}>
                        <b>{p.local.nombre} {p.goles_l ?? '-'}</b> vs <b>{p.goles_v ?? '-'} {p.visitante.nombre}</b> 
                        <span style={{ marginLeft: 10, fontSize: 12, padding: "2px 6px", borderRadius: 4, background: p.estado === 'Finalizado' ? '#111827' : p.estado === 'En Juego' ? '#DC2626' : p.estado === 'Suspendido' ? '#D97706' : '#4B5563' }}>
                          {p.estado}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 5 }}>
                        {p.dia_hora ? new Date(p.dia_hora).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'}) : 'A confirmar'}
                        {p.goleadores && <span style={{marginLeft: 10}}>| Goles: {p.goleadores}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setEditPart(p.id)} style={{...s.btn, background: "#10B981"}}>Editar</button>
                      <form action={eliminarPartido} onSubmit={confirmarEliminacion}><input type="hidden" name="id" value={p.id} /><button type="submit" style={{...s.btn, background: "#EF4444"}}>Borrar</button></form>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}