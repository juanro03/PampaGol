'use client';

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; 
import Header from "../components/Header"; 
import { obtenerCategorias, obtenerTodosLosEquipos } from "../actions";

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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0D241D", minHeight: "100vh", color: "#F3EFE3" }}>
      <Header onOpenMenu={() => setMobileMenuOpen(true)} />

      <div className="pp-layout">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} categorias={categorias} />

        <div className="pp-main-wrap">
          
          {/* TÍTULO DE LA SECCIÓN */}
          

          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              Cargando equipos...
            </div>
          ) : equipos.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#8A9A90", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              Aún no hay equipos registrados en la base de datos.
            </div>
          ) : (
            /* LA CUADRÍCULA (GRID) */
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
              gap: 15 
            }}>
              {equipos.map(eq => (
                <div key={eq.id} style={{ 
                  background: "#FFFFFF", 
                  border: "1px solid #CCC", 
                  borderRadius: 8, 
                  padding: "20px 10px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease-in-out",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {/* ESCUDO O FALLBACK */}
                  {eq.escudo_url ? (
                    <img 
                      src={eq.escudo_url} 
                      alt={`Escudo de ${eq.nombre}`} 
                      style={{ width: 60, height: 60, objectFit: "contain", marginBottom: 15 }} 
                    />
                  ) : (
                    <div style={{ 
                      width: 60, height: 60, 
                      background: "#EFE6C8", color: "#8A6D1F", 
                      fontSize: 22, fontWeight: 700, 
                      borderRadius: "50%", 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      marginBottom: 15 
                    }}>
                      {clubBadge(eq.nombre)}
                    </div>
                  )}

                  {/* NOMBRE DEL EQUIPO */}
                  <span style={{ 
                    color: "#111", 
                    fontSize: 14, 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
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