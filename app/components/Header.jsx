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
            src="/logo.png" 
            alt="Logo Promiedos Pampeano" 
            style={{ 
              width: 45, 
              height: 45, 
              objectFit: "contain", 
              flexShrink: 0 
            }} 
          />
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontFamily: "Comic Sans MS, sans-serif", fontSize: 26, fontWeight: 700, color: "#D6A63C", letterSpacing: 0.3 }}>
              PROMIEDOS
            </span>
            <span style={{ fontFamily: "Comic Sans MS, sans-serif", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
              {" "}PAMPEANO
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}