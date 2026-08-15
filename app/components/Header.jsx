'use client';

import { Menu } from "lucide-react";
import styles from './Header.module.css';

export default function Header({ onOpenMenu }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        
        {/* Botón Hamburguesa */}
        <button
          className={styles.mobileToggle}
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Contenedor del Logo y Título */}
        <div className={styles.logoContainer}>
          <img 
            src="/icon.png" 
            alt="logo pampagol" 
            className={styles.logoImg}
          />
          
          <div className={styles.titleWrapper}>
            <span className={styles.pampa}>
              PAMPA
            </span>
            <span className={styles.gol}>
              GOL
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}