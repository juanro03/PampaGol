'use client';

import { useState, useEffect } from "react";
import SiteNavigation from "./components/SiteNavigation";
import { obtenerFixtureInicio, obtenerCategorias } from "./actions";
import Link from "next/link";

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

export default function Inicio() {
  const [fixture, setFixture] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    obtenerFixtureInicio()
      .then(setFixture)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0D241D", minHeight: "100vh", color: "#F3EFE3" }}>
      <SiteNavigation categorias={categorias}>
        <div className="pp-main-wrap">
          {/* FIXTURE */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              Cargando partidos...
            </div>
          ) : fixture.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              No hay partidos programados para este día.
            </div>
          ) : (
            <>
              {fixture.map((group) => (
                <section key={group.league} style={{ marginBottom: 20 }}>
                  <div style={{ background: "#083726", border: "1px solid #032115", padding: "6px 12px", textAlign: "center" }}>
                    <Link
                      href={`/categoria/${group.categoriaId}?torneo=${group.torneoId}`}
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        textDecoration: "none"
                      }}
                    >
                      {group.league}
                    </Link>
                  </div>
                  <div style={{ background: "#FFFFFF", border: "1px solid #CCC", borderTop: "none" }}>
                    {group.matches?.map((m, idx) => (
                      <MatchRow key={m.id || idx} match={m} isLast={idx === group.matches.length - 1} />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </SiteNavigation>
    </div>
  );
}

function MatchRow({ match, isLast }) {
  const { home, homeEscudo, away, awayEscudo, status, homeScore, awayScore, time, minute, homeId, awayId } = match;

  const isLive = status === "live";
  const isFinal = status === "final";
  let statusBg = "#0D311F";
  if (isFinal) statusBg = "#303030";
  if (isLive) statusBg = "#B31B1B";

  const dbScorers = (match.goles || []).map(g => {
    const minStr = g.minuto ? `${g.minuto}' ` : '';
    const nombre = g.jugador?.nombre || '';

    let tag = '';
    if (g.jugador?.equipoId) {
      if (g.jugador.equipoId === homeId) tag = ' (L)';
      else if (g.jugador.equipoId === awayId) tag = ' (V)';
    }

    return `${minStr}${nombre}${tag}`;
  });

  const manualScorers = match.goleadores ? [match.goleadores] : [];

  const allScorers = dbScorers.length > 0 ? dbScorers : manualScorers;

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #CCC", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 40 }}>

        <div className="match-time" style={{ width: 58, display: "flex", alignItems: "center", justifyContent: "center", background: statusBg, borderRight: "1px solid #CCC", flexShrink: 0 }}>
          <span style={{ fontSize: isLive ? 10 : 14, textAlign: "center", fontWeight: 700, color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
            {isFinal ? "Final" : isLive ? minute : time}
          </span>
        </div>

        <div className="match-team" style={{ flex: 1, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", minWidth: 0 }}>
          <TeamLine name={home} escudo={homeEscudo} reverse={true} />
        </div>

        <div className="match-score" style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #CCC", borderRight: "1px solid #CCC", background: "#F5F5F5", flexShrink: 0 }}>
          <span className="bc" style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{homeScore ?? ""}</span>
        </div>

        <div className="match-score" style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #CCC", background: "#F5F5F5", flexShrink: 0 }}>
          <span className="bc" style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{awayScore ?? ""}</span>
        </div>

        <div className="match-team" style={{ flex: 1, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "flex-start", overflow: "hidden", minWidth: 0 }}>
          <TeamLine name={away} escudo={awayEscudo} reverse={false} />
        </div>
      </div>

      {/* LISTA DE GOLEADORES CON ETIQUETAS (L) / (V) */}
      {allScorers.length > 0 && (
        <div style={{ padding: "3px 12px 4px 62px", fontSize: 11, color: "#A9211F", background: "#FFFFFF", borderTop: "1px solid #EFEFEF", fontFamily: "'Inter', sans-serif" }}>
          {allScorers.join(", ")}
        </div>
      )}
    </div>
  );
}
function TeamLine({ name, escudo, reverse = false }) {
  const [imgError, setImgError] = useState(false);
  const crestSrc = escudo || (name ? `/escudos/${slugify(name)}.png` : null);

  useEffect(() => {
    setImgError(false);
  }, [crestSrc]);

  const crest = imgError || !crestSrc ? (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EFE6C8", color: "#8A6D1F", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {clubBadge(name)}
    </div>
  ) : (
    <img src={crestSrc} alt={`Escudo de ${name}`} width={28} height={28} onError={() => setImgError(true)} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
  );

  const text = (
    <span className="team-name" style={{
      fontSize: 15,
      fontWeight: 500,
      color: "#111",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      minWidth: 0,
      flex: 1,
      textAlign: reverse ? "right" : "left"
    }}>
      {name}
    </span>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: reverse ? "flex-end" : "flex-start", overflow: "hidden", minWidth: 0 }}>
      {reverse ? <>{text}{crest}</> : <>{crest}{text}</>}
    </div>
  );
}