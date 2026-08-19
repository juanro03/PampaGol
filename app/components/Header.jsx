'use client';

import { Menu } from "lucide-react";

export default function Header({ onOpenMenu }) {
  return (
    <header className="pp-header">
      <div className="pp-header-inner">
        
        {/* Botón Hamburguesa */}
        <button
          className="pp-mobile-toggle"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Contenedor del Logo y Título */}
        <div className="pp-logo-container">
          <img 
            src="/icon.png" 
            alt="logo pampagol" 
            className="pp-logo-img"
          />
          
          <div className="pp-title-wrapper">
            <span className="titulo-header pampa">
              PampaGol
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}