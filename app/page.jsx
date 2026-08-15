'use client';

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; 
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { obtenerFixtureDelDia, obtenerCategorias } from "./actions";
import styles from './page.module.css';
import { clsx } from 'clsx';

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

function formatDayLabel(offset) {
  if (offset === 0) return "HOY";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const s = d.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" });
  return s.replace(/\./g, "").toUpperCase();
}

export default function Inicio() {
  const [dayOffset, setDayOffset] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fixture, setFixture] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    setLoading(true);
    obtenerFixtureDelDia(dayOffset).then(data => {
      setFixture(data || []);
      setLoading(false);
    });
  }, [dayOffset]);

  return (
    <div className={styles.root}>
      <Header onOpenMenu={() => setMobileMenuOpen(true)} />

      <div className="pp-layout">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} categorias={categorias} />

        <div className="pp-main-wrap">
          {/* SELECTOR DE FECHA */}
          <div className={styles.dateSelector}>
            <button 
              onClick={() => setDayOffset(d => d - 1)} 
              className={styles.dateButton}
            >
              <ChevronLeft size={16} strokeWidth={3} /> 
              <span className={clsx("hide-mobile-text", styles.dateButtonText)}>Ayer</span>
            </button>

            <div className={styles.dateDisplay}>
              <span className={styles.dateDisplayLabel}>PARTIDOS</span>
              {formatDayLabel(dayOffset)}
            </div>

            <button 
              onClick={() => setDayOffset(d => d + 1)} 
              className={styles.dateButton}
            >
              <span className={clsx("hide-mobile-text", styles.dateButtonText)}>Man</span> 
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>

          {/* FIXTURE */}
          {loading ? (
            <div className={styles.loadingState}>
              Cargando partidos...
            </div>
          ) : fixture.length === 0 ? (
            <div className={styles.emptyState}>
              No hay partidos programados para este día.
            </div>
          ) : (
            fixture.map((group) => (
              <section key={group.league} className={styles.leagueSection}>
                <div className={styles.leagueHeader}>
                  <span className={styles.leagueHeaderText}>
                    {group.league}
                  </span>
                </div>
                <div className={styles.matchesContainer}>
                  {group.matches?.map((m, idx) => (
                    <MatchRow key={m.id || idx} match={m} isLast={idx === group.matches.length - 1} />
                  ))}
                </div>
              </section>
            ))
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

  let statusBg = styles.statusDefault;
  if (isFinal) statusBg = styles.statusFinal;
  if (isLive) statusBg = styles.statusLive;

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
    <div className={clsx(styles.matchRow, isLast && styles.matchRowLast)}>
      <div className={styles.matchRowMain}>

        <div className={clsx(styles.matchTime, statusBg)}>
          <span className={clsx(styles.matchTimeText, isLive && styles.timeTextLive)}>
            {isFinal ? "Final" : isLive ? minute : time}
          </span>
        </div>

        <div className={clsx("match-team", styles.matchTeam, styles.matchTeamHome)}>
          <TeamLine name={home} escudo={homeEscudo} reverse={true} />
        </div>

        <div className={clsx(styles.matchScore, styles.matchScoreFirst)}>
          <span className={clsx("bc", styles.matchScoreText)}>{homeScore ?? ""}</span>
        </div>

        <div className={styles.matchScore}>
          <span className={clsx("bc", styles.matchScoreText)}>{awayScore ?? ""}</span>
        </div>

        <div className={clsx("match-team", styles.matchTeam, styles.matchTeamAway)}>
          <TeamLine name={away} escudo={awayEscudo} reverse={false} />
        </div>
      </div>

      {allScorers.length > 0 && (
        <div className={styles.scorersList}>
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
    <div className={styles.teamCrestPlaceholder}>
      {clubBadge(name)}
    </div>
  ) : (
    <img src={crestSrc} alt={`Escudo de ${name}`} width={28} height={28} onError={() => setImgError(true)} className={styles.teamCrest} />
  );

  const text = (
    <span className={clsx("team-name", styles.teamName, reverse ? styles.teamNameHome : styles.teamNameAway)}>
      {name}
    </span>
  );

  return (
    <div className={clsx(styles.teamLine, reverse ? styles.teamLineHome : styles.teamLineAway)}>
      {reverse ? <>{text}{crest}</> : <>{crest}{text}</>}
    </div>
  );
}