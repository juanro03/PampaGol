'use client';

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; 
import Header from "../components/Header"; 
import { obtenerCategorias, obtenerTodosLosEquipos } from "../actions";
import s from './equipos.module.css';

// --- FUNCIÓN DE FALLBACK PARA ESCUDOS ---
function clubBadge(name) {
  if (!name) return "??";
  const parts = name.split(" ");
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}

export default function EquiposPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar Categorías (para el Sidebar) y Equipos (para la grilla)
  useEffect(() => {
    Promise.all([
      obtenerCategorias(),
      obtenerTodosLosEquipos()
    ]).then(([cats, eqs]) => {
      setCategorias(cats);
      setEquipos(eqs);
      setLoading(false);
    });
  }, []);

  return (
    <div className={s.page}>
      <Header onOpenMenu={() => setMobileMenuOpen(true)} />

      <div className="pp-layout">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} categorias={categorias} />

        <div className="pp-main-wrap">

          {/* TÍTULO DE LA SECCIÓN */}
          <div className={s.header}>
            <span className={s.headerTitle}>
              Todos los Equipos
            </span>
          </div>

          {loading ? (
            <div className={s.loadingBox}>
              Cargando equipos...
            </div>
          ) : equipos.length === 0 ? (
            <div className={s.loadingBox}>
              Aún no hay equipos registrados en la base de datos.
            </div>
          ) : (
            /* LA CUADRÍCULA (GRID) */
            <div className={s.grid}>
              {equipos.map(eq => (
                <div key={eq.id} className={s.card}>
                  {/* ESCUDO O FALLBACK */}
                  {eq.escudo_url ? (
                    <img src={eq.escudo_url} alt={`Escudo de ${eq.nombre}`} className={s.cardImage} />
                  ) : (
                    <div className={s.cardBadge}>
                      {clubBadge(eq.nombre)}
                    </div>
                  )}

                  {/* NOMBRE DEL EQUIPO */}
                  <span className={s.cardName}>
                    {eq.nombre}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}