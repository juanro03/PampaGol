'use client';

import { Menu } from "lucide-react";

// Recibe la función "onOpenMenu" como prop para avisarle a la página que abra el sidebar
export default function Header({ onOpenMenu }) {
  return (
    <header className="pp-header">
      <div className="pp-header-inner">
        <button
          className="pp-mobile-toggle"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          style={{ background: "transparent", border: "1px solid #376C2F", borderRadius: 6, padding: 6, color: "#F3EFE3", cursor: "pointer", alignItems: "center", justifyContent: "center" }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* LOGO DESDE LA CARPETA PUBLIC */}
          
          <img 
            src="/icon.png" 
            alt="Logo2 Promiedos Pampeano" 
            style={{ 
              paddingLeft: -5,
              width: 35, 
              height: 45, 
              objectFit: "contain", 
              flexShrink: 0 
            }} 
          />
          
          <div style={{ lineHeight: 1}}>
            <span className="titulo-header" style={{ color: "#D6A63C" }}>
              PROMIEDOS
            </span>
            <span className="titulo-header" style={{ color: "#ffffff" }}>
              {" "}PAMPEANO
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}