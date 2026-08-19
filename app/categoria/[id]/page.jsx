'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  obtenerCategorias,
  obtenerCategoriaConTorneos,
  obtenerTablaPosiciones,
  obtenerFixturePorTorneo,
  obtenerGoleadores
} from "../../actions"; 
import s from './categoria.module.css';

function clubBadge(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}

function slugify(name) {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriaPage() {
  const params = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const [categoria, setCategoria] = useState(null);
  const [selectedTorneoId, setSelectedTorneoId] = useState("");
  const [tablaData, setTablaData] = useState(null);
  const [fixtureData, setFixtureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goleadoresData, setGoleadoresData] = useState([]);

  const [activeFechaIndex, setActiveFechaIndex] = useState(0);

  useEffect(() => {
    obtenerCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    setLoading(true);
    obtenerCategoriaConTorneos(params.id).then(cat => {
      setCategoria(cat);
      if (cat?.torneos?.length > 0) {
        const activo = cat.torneos.find(t => t.estado === 'Activo') || cat.torneos[0];
        setSelectedTorneoId(activo.id);
      } else {
        setLoading(false); // Fix: apaga el loading si no hay torneos
      }
    });
  }, [params.id]);

  // Recordá importar obtenerGoleadores desde tus actions
  useEffect(() => {
    if (selectedTorneoId) {
      setLoading(true);
      Promise.all([
        obtenerTablaPosiciones(selectedTorneoId),
        obtenerFixturePorTorneo(selectedTorneoId),
        obtenerGoleadores(selectedTorneoId) // <- NUEVA PETICIÓN
      ]).then(([tabla, fixture, goleadores]) => {
        setTablaData(tabla);
        setFixtureData(fixture);
        setGoleadoresData(goleadores); // <- GUARDAMOS LA DATA

        if (fixture?.length > 0) {
          let currentIdx = fixture.length - 1;
          const idxEnJuego = fixture.findIndex(g => g.days?.some(d => d.matches?.some(m => m.status !== "final")));
          if (idxEnJuego !== -1) currentIdx = idxEnJuego;
          setActiveFechaIndex(Math.max(0, currentIdx));
        }

        setLoading(false);
      });
    }
  }, [selectedTorneoId]);

  return (
    <div className={s.page}>
      <Header onOpenMenu={() => setMobileMenuOpen(true)} />

      <div className="pp-layout">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} categorias={categorias} />

        <div className="pp-main-wrap">
          {!categoria ? (
            <div className={s.loadingBox}>
              Cargando liga...
            </div>
          ) : (
            <>
              {/* CABECERA Y SELECTOR DE TORNEOS */}
              <div className={s.header}>
                <span className={s.headerTitle}>
                  {categoria.nombre}
                </span>

                {categoria.torneos?.length > 0 && (
                  <select
                    className={s.torneoSelect}
                    value={selectedTorneoId}
                    onChange={(e) => setSelectedTorneoId(e.target.value)}
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
                <div className={s.loadingBox} style={{padding: 40}}>
                  Cargando torneo...
                </div>
              ) : (
                <>
                  {/* TABLA DE POSICIONES */}
                  <div className={s.tablaWrapper}>
                    <div className={s.sectionHeader}>
                      TABLA DE POSICIONES
                    </div>
                    {!tablaData?.length ? (
                      <div className={s.emptyState}>Aún no hay posiciones registradas.</div>
                    ) : (
                      <table className={s.table}>
                        <thead className={s.tableThead}>
                          <tr>
                            <th className={s.th} style={{ width: 30 }}>#</th>
                            <th className={s.thLeft}>Equipo</th>
                            <th className={s.thHighlight}>Pts</th>
                            <th className={s.th}>PJ</th>
                            <th className={s.th}>PG</th>
                            <th className={s.th}>PE</th>
                            <th className={s.th}>PP</th>
                            <th className={s.th}>GF</th>
                            <th className={s.th}>GC</th>
                            <th className={s.th}>DIF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tablaData.map((eq, index) => (
                            <tr key={eq.id || index} className={s.tr}>
                              <td className={`${s.tdRank} ${index < 4 ? s.tdRankTop : ''}`}>{index + 1}</td>
                              <td className={s.tdTeam}>
                                <TeamLine name={eq.nombre} escudo={eq.escudo_url} size={22} />
                              </td>
                              <td className={s.tdPts}>{eq.pts}</td>
                              <td className={s.td}>{eq.pj}</td>
                              <td className={s.td}>{eq.pg}</td>
                              <td className={s.td}>{eq.pe}</td>
                              <td className={s.td}>{eq.pp}</td>
                              <td className={s.td}>{eq.gf}</td>
                              <td className={s.td}>{eq.gc}</td>
                              <td className={`${s.tdDif} ${eq.dif !== 0 ? s.tdDifNonZero : ''} ${eq.dif > 0 ? s.tdDifPositive : eq.dif < 0 ? s.tdDifNegative : ''}`}>
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
                    <div className={s.emptyStateDark}>
                      Sin partidos cargados en este torneo.
                    </div>
                  ) : (
                    <>
                      {/* SELECTOR DE FECHA */}
                      <div className={s.fechaSelector}>
                        <button
                          className={s.fechaButton}
                          onClick={() => setActiveFechaIndex(i => Math.max(0, i - 1))}
                          disabled={activeFechaIndex === 0}
                        >
                          <ChevronLeft size={16} strokeWidth={3} /> <span className="hide-mobile-text" style={{ fontWeight: 600 }}>Ant</span>
                        </button>

                        <div className={s.fechaLabel}>
                          {fixtureData[activeFechaIndex]?.league}
                        </div>

                        <button
                          className={s.fechaButton}
                          onClick={() => setActiveFechaIndex(i => Math.min(fixtureData.length - 1, i + 1))}
                          disabled={activeFechaIndex === fixtureData.length - 1}
                        >
                          <span className="hide-mobile-text" style={{ fontWeight: 600 }}>Sig</span> <ChevronRight size={16} strokeWidth={3} />
                        </button>
                      </div>

                      {/* PARTIDOS SEPARADOS POR DÍA */}
                      {fixtureData[activeFechaIndex] && (
                        <div className={s.fixtureContainer}>
                          {fixtureData[activeFechaIndex].days?.map((dayGroup) => (
                            <div key={dayGroup.dayLabel}>
                              <div className={s.dayHeader}>
                                {dayGroup.dayLabel}
                              </div>
                              <div className={s.matchesContainer}>
                                {dayGroup.matches?.map((m, idx) => (
                                  <MatchRow key={m.id} match={m} isLast={idx === dayGroup.matches.length - 1} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <TablaGoleadores data={goleadoresData} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchRow({ match, isLast }) {
  const { home, homeEscudo, away, awayEscudo, status, homeScore, awayScore, time, minute, homeId, awayId } = match;
  
  const isLive = status === "live";
  const isFinal = status === "final";
  
  // --- LÓGICA DE GOLEADORES CON DIFERENCIACIÓN DE EQUIPO ---
  const dbScorers = (match.goles || []).map(g => {
    const minStr = g.minuto ? `${g.minuto}' ` : '';
    const nombre = g.jugador?.nombre || '';
    
    // Identificamos si pertenece al Local o Visitante
    let tag = '';
    if (g.jugador?.equipoId) {
      if (g.jugador.equipoId === homeId) tag = ' (L)';
      else if (g.jugador.equipoId === awayId) tag = ' (V)';
    }

    return `${minStr}${nombre}${tag}`;
  });

  const manualScorers = match.goleadores ? [match.goleadores] : [];
  
  // Evitamos duplicar si ya viene formateado desde goleadores manuales
  const allScorers = dbScorers.length > 0 ? dbScorers : manualScorers;
  // ---------------------------------------------------------

  return (
    <div className={s.matchRow}>
      <div className={s.matchRowInner}>
        
        <div className={`${s.matchTime} ${isFinal ? s.matchTimeFinal : ''} ${isLive ? s.matchTimeLive : ''}`}>
          <span className={`${s.timeText} ${isLive ? s.timeTextLive : ''}`}>
            {isFinal ? "Final" : isLive ? minute : time}
          </span>
        </div>
        
        <div className={`${s.matchTeam} ${s.matchTeamHome}`}>
          <TeamLine name={home} escudo={homeEscudo} reverse={true} />
        </div>
        
        <div className={s.matchScore}>
          <span className={s.scoreText}>{homeScore ?? ""}</span>
        </div>
        
        <div className={s.matchScore} style={{borderRight: '1px solid #CCC'}}>
          <span className={s.scoreText}>{awayScore ?? ""}</span>
        </div>
        
        <div className={`${s.matchTeam} ${s.matchTeamAway}`}>
          <TeamLine name={away} escudo={awayEscudo} reverse={false} />
        </div>
      </div>

      {/* LISTA DE GOLEADORES CON ETIQUETAS (L) / (V) */}
      {allScorers.length > 0 && (
        <div className={s.scorers}>
          {allScorers.join(", ")}
        </div>
      )}
    </div>
  );
}

function TeamLine({ name, escudo, reverse = false, size = 28 }) {
  const [imgError, setImgError] = useState(false);
  const crestSrc = escudo || (name ? `/escudos/${slugify(name)}.png` : null);

  useEffect(() => {
    setImgError(false);
  }, [crestSrc]);

  const crest = imgError || !crestSrc ? (
    <div className={s.crestFallback} style={{ width: size, height: size, fontSize: size < 25 ? 8 : 9 }}>
      {clubBadge(name)}
    </div>
  ) : (
    <img src={crestSrc} alt={`Escudo de ${name}`} width={size} height={size} onError={() => setImgError(true)} className={s.crestImage} style={{ width: size, height: size }} />
  );

  const text = (
    <span className={`${s.teamName} ${reverse ? s.teamNameHome : s.teamNameAway}`} style={{ fontSize: size < 25 ? 14 : 15 }}>
      {name}
    </span>
  );

  return (
    <div className={`${s.teamLine} ${reverse ? s.teamLineHome : s.teamLineAway}`}>
      {reverse ? <>{text}{crest}</> : <>{crest}{text}</>}
    </div>
  );
}

function TablaGoleadores({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={`${s.tablaWrapper} ${s.goleadoresTable}`}>
      <div className={s.sectionHeader}>
        TABLA DE GOLEADORES
      </div>
      <table className={s.table}>
        <thead className={s.tableThead}>
          <tr>
            {/* Le sacamos los style={{ width: 30 }} y {{ width: 60 }} */}
            <th className={s.th}>#</th>
            <th className={s.thLeft}>Jugador</th>
            <th className={s.thLeft}>Equipo</th>
            <th className={s.thHighlight}>Goles</th>
          </tr>
        </thead>
        <tbody>
          {data.map((jugador, index) => (
            <tr key={jugador.id || index} className={s.tr}>
              {/* Posición (Top 3 resaltado) */}
              <td className={`${s.tdRank} ${index < 3 ? s.tdRankTop : ''}`}>
                {index + 1}
              </td>

              {/* Nombre del Jugador */}
              <td className={s.tdTeam}>
                {jugador.nombre}
              </td>

              {/* Equipo (Reutilizamos TeamLine pero más chico) */}
              <td className={s.tdTeam}>
                <TeamLine name={jugador.equipo} escudo={jugador.equipo_escudo} size={18} />
              </td>

              {/* Goles */}
              <td className={s.tdPts}>
                {jugador.goles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}