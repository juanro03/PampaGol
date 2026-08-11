'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import { ChevronLeft, ChevronRight } from "lucide-react"; 
import Sidebar from "../../components/Sidebar"; 
import Header from "../../components/Header"; 
import { obtenerCategorias, obtenerCategoriaConTorneos, obtenerTablaPosiciones, obtenerFixturePorTorneo } from "../../actions";

// --- FUNCIONES DE AYUDA ---
function clubBadge(name) {
  const parts = name.split(" ");
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}

function slugify(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// --- COMPONENTE PRINCIPAL ---
export default function CategoriaPage() {
  const params = useParams(); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  
  const [categoria, setCategoria] = useState(null);
  const [selectedTorneoId, setSelectedTorneoId] = useState("");
  const [tablaData, setTablaData] = useState(null);
  const [fixtureData, setFixtureData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFechaIndex, setActiveFechaIndex] = useState(0);

  useEffect(() => { obtenerCategorias().then(setCategorias); }, []);

  useEffect(() => {
    setLoading(true);
    obtenerCategoriaConTorneos(params.id).then(cat => {
      setCategoria(cat);
      if (cat?.torneos?.length > 0) {
        const activo = cat.torneos.find(t => t.estado === 'Activo') || cat.torneos[0];
        setSelectedTorneoId(activo.id);
      } else {
        setLoading(false);
      }
    });
  }, [params.id]);

  useEffect(() => {
    if (selectedTorneoId) {
      setLoading(true);
      Promise.all([
        obtenerTablaPosiciones(selectedTorneoId),
        obtenerFixturePorTorneo(selectedTorneoId)
      ]).then(([tabla, fixture]) => {
        setTablaData(tabla);
        setFixtureData(fixture);
        
        if (fixture.length > 0) {
          let currentIdx = fixture.length - 1;
          const idxEnJuego = fixture.findIndex(g => g.days.some(d => d.matches.some(m => m.status !== "final")));
          if (idxEnJuego !== -1) currentIdx = idxEnJuego;
          setActiveFechaIndex(Math.max(0, currentIdx));
        }

        setLoading(false);
      });
    }
  }, [selectedTorneoId]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0D241D", minHeight: "100vh", color: "#F3EFE3" }}>
      <Header onOpenMenu={() => setMobileMenuOpen(true)} />

      <div className="pp-layout">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} categorias={categorias} />

        <div className="pp-main-wrap">
          {!categoria ? (
            <div style={{ padding: 60, textAlign: "center", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              Cargando liga... ⚽
            </div>
          ) : (
            <>
              {/* CABECERA Y SELECTOR DE TORNEOS */}
              <div style={{ background: "#083726", border: "1px solid #032115", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                <span style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, textTransform: "uppercase" }}>
                  {categoria.nombre}
                </span>

                {categoria.torneos.length > 0 && (
                  <select 
                    value={selectedTorneoId}
                    onChange={(e) => setSelectedTorneoId(e.target.value)}
                    style={{ background: "#1E4D3B", color: "#FFF", border: "1px solid #376C2F", padding: "6px 12px", borderRadius: 6, fontWeight: "bold", cursor: "pointer", outline: "none", fontSize: 14 }}
                  >
                    {categoria.torneos.map(tor => (
                      <option key={tor.id} value={tor.id}>
                        {tor.nombre} {tor.anio} {tor.estado === "Finalizado" ? "(Finalizado)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                  Cargando torneo... ⚽
                </div>
              ) : (
                <>
                  {/* TABLA DE POSICIONES (Agregada la clase tabla-wrapper) */}
                  <div className="tabla-wrapper" style={{ background: "#FFFFFF", border: "1px solid #CCC", overflowX: "hidden", marginBottom: 25 }}>
                    <div style={{ background: "#1E4D3B", padding: "6px 12px", fontSize: 13, fontWeight: 700, color: "#FCD34D" }}>
                      TABLA DE POSICIONES
                    </div>
                    {!tablaData?.length ? (
                      <div style={{ padding: 20, textAlign: "center", color: "#666" }}>Aún no hay posiciones registradas.</div>
                    ) : (
                      <table className="tabla-posiciones" style={{ width: "100%", borderCollapse: "collapse", color: "#111", fontSize: 14, textAlign: "center" }}>
                        <thead style={{ background: "#EAEAEA", borderBottom: "2px solid #CCC", fontSize: 12, fontWeight: 700, color: "#333" }}>
                          <tr>
                            <th style={{ padding: "10px 5px", width: 30 }}>#</th>
                            <th style={{ padding: "10px 5px", textAlign: "left" }}>Equipo</th>
                            <th style={{ padding: "10px 5px", background: "#D9D9D9", color: "#000" }}>Pts</th>
                            <th style={{ padding: "10px 5px" }}>PJ</th>
                            <th style={{ padding: "10px 5px" }}>PG</th>
                            <th style={{ padding: "10px 5px" }}>PE</th>
                            <th style={{ padding: "10px 5px" }}>PP</th>
                            <th style={{ padding: "10px 5px" }}>GF</th>
                            <th style={{ padding: "10px 5px" }}>GC</th>
                            <th style={{ padding: "10px 5px" }}>DIF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tablaData.map((eq, index) => (
                            <tr key={eq.id} style={{ borderBottom: "1px solid #EEE", background: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA" }}>
                              <td style={{ padding: "10px 5px", fontWeight: 700, color: index < 4 ? "#0D241D" : "#555" }}>{index + 1}</td>
                              <td style={{ padding: "10px 5px", textAlign: "left", fontWeight: 600 }}>
                                {/* Modificación Clave: Envolver escudo y nombre en flex */}
                                <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
                                  {eq.escudo_url ? (
                                    <img src={eq.escudo_url} alt={eq.nombre} width={22} height={22} style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
                                  ) : (
                                    <div style={{ width: 22, height: 22, background: "#EFE6C8", color: "#8A6D1F", fontSize: 9, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      {eq.nombre.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="team-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.nombre}</span>
                                </div>
                              </td>
                              <td style={{ padding: "10px 5px", background: "#F5F5F5", fontWeight: 700, fontSize: 16 }}>{eq.pts}</td>
                              <td style={{ padding: "10px 5px", color: "#444" }}>{eq.pj}</td>
                              <td style={{ padding: "10px 5px", color: "#444" }}>{eq.pg}</td>
                              <td style={{ padding: "10px 5px", color: "#444" }}>{eq.pe}</td>
                              <td style={{ padding: "10px 5px", color: "#444" }}>{eq.pp}</td>
                              <td style={{ padding: "10px 5px", color: "#444" }}>{eq.gf}</td>
                              <td style={{ padding: "10px 5px", color: "#444" }}>{eq.gc}</td>
                              <td style={{ padding: "10px 5px", fontWeight: eq.dif !== 0 ? 700 : 500, color: eq.dif > 0 ? "#228B22" : eq.dif < 0 ? "#B22222" : "#555" }}>
                                {eq.dif > 0 ? `+${eq.dif}` : eq.dif}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* FIXTURE PAGINADO POR FECHA */}
                  {!fixtureData?.length ? (
                    <div style={{ padding: 20, textAlign: "center", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                      Sin partidos cargados en este torneo.
                    </div>
                  ) : (
                    <>
                      {/* SELECTOR DE FECHA (BARRA PRINCIPAL) */}
                      <div className="selector-fecha" style={{ background: "#1E4D3B", border: "1px solid #1E4D3B", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", marginBottom: 15, width: "100%" }}>
                        <button 
                          onClick={() => setActiveFechaIndex(i => Math.max(0, i - 1))}
                          disabled={activeFechaIndex === 0}
                          style={{ background: "transparent", border: "none", color: activeFechaIndex === 0 ? "#8A9A90" : "#ffffff", display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", cursor: activeFechaIndex === 0 ? "default" : "pointer" }}
                        >
                          <ChevronLeft size={16} strokeWidth={3} /> <span className="hide-mobile-text" style={{ fontWeight: 600 }}>Ant</span>
                        </button>
                        
                        <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 16, textAlign: "center", textTransform: "uppercase" }}>
                          {fixtureData[activeFechaIndex]?.league}
                        </div>
                        
                        <button 
                          onClick={() => setActiveFechaIndex(i => Math.min(fixtureData.length - 1, i + 1))}
                          disabled={activeFechaIndex === fixtureData.length - 1}
                          style={{ background: "transparent", border: "none", color: activeFechaIndex === fixtureData.length - 1 ? "#8A9A90" : "#ffffff", display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", cursor: activeFechaIndex === fixtureData.length - 1 ? "default" : "pointer" }}
                        >
                          <span className="hide-mobile-text" style={{ fontWeight: 600 }}>Sig</span> <ChevronRight size={16} strokeWidth={3} />
                        </button>
                      </div>

                      {/* PARTIDOS SEPARADOS POR DÍA DENTRO DE LA FECHA */}
                      {fixtureData[activeFechaIndex] && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                          {fixtureData[activeFechaIndex].days.map((dayGroup) => (
                            <div key={dayGroup.dayLabel}>
                              
                              <div style={{ background: "#0D311F", border: "1px solid #032115", padding: "4px 10px", fontSize: 13, fontWeight: 700, color: "#FCD34D", textAlign: "center" }}>
                                {dayGroup.dayLabel}
                              </div>

                              <div style={{ background: "#FFFFFF", border: "1px solid #CCC", borderTop: "none" }}>
                                {dayGroup.matches.map((m, idx) => (
                                  <MatchRow key={m.id} match={m} isLast={idx === dayGroup.matches.length - 1} />
                                ))}
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES PARA LOS PARTIDOS ---
function MatchRow({ match, isLast }) {
  const { home, homeEscudo, away, awayEscudo, status, homeScore, awayScore, scorers, time, minute } = match;
  const isLive = status === "live";
  const isFinal = status === "final";
  let statusBg = "#0D311F"; 
  if (isFinal) statusBg = "#303030"; 
  if (isLive) statusBg = "#B31B1B"; 

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #CCC", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 40 }}>
        
        <div className="match-time" style={{ width: 58, display: "flex", alignItems: "center", justifyContent: "center", background: statusBg, borderRight: "1px solid #CCC", flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
            {isFinal ? "Final" : isLive ? minute : time}
          </span>
        </div>
        
        <div className="match-team" style={{ flex: 1, padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden" }}>
          <TeamLine name={home} escudo={homeEscudo} reverse={true} />
        </div>
        
        <div className="match-score" style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #CCC", borderRight: "1px solid #CCC", background: "#F5F5F5", flexShrink: 0 }}>
          <span className="bc" style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{homeScore !== null ? homeScore : ""}</span>
        </div>
        
        <div className="match-score" style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #CCC", background: "#F5F5F5", flexShrink: 0 }}>
          <span className="bc" style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{awayScore !== null ? awayScore : ""}</span>
        </div>
        
        <div className="match-team" style={{ flex: 1, padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "flex-start", overflow: "hidden" }}>
          <TeamLine name={away} escudo={awayEscudo} reverse={false} />
        </div>
        
        <div className="match-btn-container" style={{ width: 38, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #CCC", flexShrink: 0, background: "#FAFAFA" }}>
           <button style={{ background: "#6DA961", border: "1px solid #376C2F", color: "#FFF", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, lineHeight: 1, cursor: "pointer", borderRadius: 2 }}>+</button>
        </div>

      </div>
      {scorers.length > 0 && (
        <div style={{ padding: "3px 12px 4px 62px", fontSize: 11, color: "#A9211F", background: "#FFFFFF", borderTop: "1px solid #EFEFEF", fontFamily: "'Inter', sans-serif" }}>
          {scorers.join(", ")}
        </div>
      )}
    </div>
  );
}

function TeamLine({ name, escudo, reverse }) {
  const [imgError, setImgError] = useState(false);
  const crestSrc = escudo || `/escudos/${slugify(name)}.png`;

  const crest = imgError || !crestSrc ? (
    <div style={{ width: 25, height: 25, borderRadius: "50%", background: "#EFE6C8", color: "#8A6D1F", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {clubBadge(name)}
    </div>
  ) : (
    <img src={crestSrc} alt={`Escudo de ${name}`} width={28} height={28} onError={() => setImgError(true)} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
  );

  const text = (
    <span className="team-name" style={{ fontSize: 16, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {name}
    </span>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: reverse ? "flex-end" : "flex-start", overflow: "hidden" }}>
      {reverse ? <>{text}{crest}</> : <>{crest}{text}</>}
    </div>
  );
}