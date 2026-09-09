'use client';

import Link from "next/link";

import { ChevronRight, Users, Shield } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar({ open, onClose, categorias = [], usuario, cargando, onLogout, onEditProfile }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {open && <div className="pp-mobile-overlay" onClick={onClose} />}
      <aside className={`pp-sidebar${open ? " open" : ""}`}>
        <div style={{ padding: "0" }}>

          {/* BLOQUE 1: SECCIONES */}
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-header">
              <span style={{ fontSize: 20 }}>⭐</span> Secciones
            </div>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              <button
                className={`pp-sidebar-link${pathname === "/" ? " active" : ""}`}
                onClick={() => { router.push("/"); onClose(); }}
              >
                <ChevronRight size={14} color={pathname === "/" ? "#16505b" : "#333333"} strokeWidth={3} />
                Inicio (Partidos de Hoy)
              </button>
              <button
                className={`pp-sidebar-link${pathname === "/equipos" ? " active" : ""}`}
                onClick={() => { router.push("/equipos"); onClose(); }}
              >
                <Shield size={14} color={pathname === "/equipos" ? "#16505b" : "#333333"} /> Clubes
              </button>
              <button
                className={`pp-sidebar-link${pathname === "/foro" ? " active" : ""}`}
                onClick={() => { router.push("/foro"); onClose(); }}
              >
                <Users size={14} color={pathname === "/foro" ? "#16505b" : "#333333"} /> Debate de hinchas
              </button>
            </nav>
          </div>

          {/* BLOQUE 2: LIGAS / CATEGORÍAS */}
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-header">
              <span style={{ fontSize: 16 }}>🏆</span> Torneos
            </div>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {/* Mapeo Dinámico: Ahora navega a /categoria/[id] */}
              {categorias.map((cat) => {
                const active = pathname === `/categoria/${cat.id}`;
                return (
                  <button
                    key={cat.id}
                    className={`pp-sidebar-link${active ? " active" : ""}`}
                    onClick={() => { router.push(`/categoria/${cat.id}`); onClose(); }}
                  >
                    {active ? <ChevronRight size={14} color="#16505b" strokeWidth={3} /> : <div style={{ width: 14 }} />}
                    {cat.nombre}
                  </button>
                );
              })}

            </nav>
          </div>

          {/* BLOQUE 3: Auth */}
          <div className="pp-sidebar-card pp-sidebar-auth">
            <div className="pp-sidebar-header">
              Acceso
            </div>

            {!cargando && (usuario ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: "#333" }}>
                  {usuario.escudoUrl && (
                    <img src={usuario.escudoUrl} alt={usuario.equipoNombre || "Escudo"} width={38} height={38} style={{ objectFit: "contain" }} />
                  )}
                  <strong>{usuario.nickname}</strong>
                </div>
                {usuario.rol === "ADMIN" && (
                  <Link href="/admin" className="pp-sidebar-link" onClick={onClose}>
                    Panel admin
                  </Link>
                )}
                <button type="button" className="pp-sidebar-link" onClick={() => { onEditProfile(); onClose(); }}>
                  Editar perfil
                </button>
                <button type="button" className="pp-sidebar-link" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link href="/login" className="pp-sidebar-link" onClick={onClose}>Iniciar sesión</Link>
                <Link href="/registro" className="pp-sidebar-link" onClick={onClose}>Registrarme</Link>
              </nav>
            ))}
          </div>

        </div>
      </aside>
    </>
  );
}