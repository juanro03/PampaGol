'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registrarUsuario } from '../actions';
import styles from './RegistroUsuario.module.css';

export default function RegistroUsuario({ equipos }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCargando(true);

    const formData = new FormData(e.target);

    try {
      await registrarUsuario(formData);
      setSuccess('¡Registro exitoso! Ya podés iniciar sesión.');
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Botón hacia atrás */}

        <div className={styles.headerContainer}>
          <Link href="/" className={styles.backLink}>
            ←
          </Link>

          <h2 className={styles.header}>Registro de hincha</h2>

        </div>


        <div className={styles.body}>
          {error && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Dividimos Nombre y Apellido en dos columnas */}
            <div className={styles.nameInputGroup}>
              <div>
                <label className={styles.label}>Nombre</label>
                <input type="text" name="nombre" required className={styles.input} placeholder="Nombre..." />
              </div>
              <div>
                <label className={styles.label}>Apellido</label>
                <input type="text" name="apellido" required className={styles.input} placeholder="Apellido..." />
              </div>
            </div>

            <label className={styles.label}>Correo Electrónico</label>
            <input type="email" name="email" required className={styles.input} placeholder="Correo electrónico..." />

            <label className={styles.label}>Contraseña</label>
            <input type="password" name="password" required minLength={6} className={styles.input} placeholder="Mínimo 6 caracteres" />

            <label className={styles.label}>Nombre de usuario (Para el foro)</label>
            <input type="text" name="nickname" required className={styles.input} placeholder="Usuario..." />

            <label className={styles.label}>Fecha de Nacimiento</label>
            <input type="date" name="fecha_nac" required className={styles.input} />

            <label className={styles.label}>¿De qué equipo sos?</label>
            <select name="equipoId" required className={styles.input}>
              <option value="" className={styles.selectOption}>Seleccioná tu equipo...</option>
              {equipos.map(eq => (
                <option key={eq.id} value={eq.id} className={styles.selectOption}>
                  {eq.nombre}
                </option>
              ))}
            </select>

            <button 
              type="submit" 
              disabled={cargando} 
              className={`${styles.btn} ${cargando ? styles.btnDisabled : ''}`.trim()}
            >
              {cargando ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          {/* Link hacia el login */}
          <div className={styles.footerLink}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className={styles.link}>
              Iniciar sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}