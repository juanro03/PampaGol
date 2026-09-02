'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from "lucide-react";
import { obtenerSesionActual, cerrarSesion } from '../actions';

export default function Header({ onOpenMenu }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerSesionActual()
      .then((sesion) => setUsuario(sesion))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const handleLogout = async () => {
    await cerrarSesion();
    setUsuario(null);
    window.location.href = '/';
  };

  return (
    <header className="pp-header">
      <div className="pp-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="pp-mobile-toggle" onClick={onOpenMenu} aria-label="Abrir menú">
            <Menu size={20} />
          </button>

          <div className="pp-logo-container">
            <img src="/icon.png" alt="logo pampagol" className="pp-logo-img" />
            <div className="pp-title-wrapper">
              <span className="titulo-header pampa">
                PampaGol
              </span>
            </div>
          </div>
        </div>
        {/* Estado de Usuario / Botones de Acceso */}
        {/* Estado de Usuario / Botones de Acceso */}
        {!cargando && (
          <div
            className="pp-header-auth"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {usuario ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {usuario.escudoUrl && (
                  <img src={usuario.escudoUrl} alt={usuario.equipoNombre || 'Escudo'}
                    style={{ width: 40, height: 40, objectFit: 'contain' }} />
                )}
                <span style={{ fontSize: 17, fontWeight: 600, color: '#F3EFE3' }}>
                  {usuario.nickname}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 15,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href="/login"
                  style={{
                    color: '#F3EFE3',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 4,
                    border: '1px solid #376C2F'
                  }}
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  style={{
                    background: '#1E4D3B',
                    color: '#FFF',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 4,
                    border: '1px solid #376C2F'
                  }}
                >
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}