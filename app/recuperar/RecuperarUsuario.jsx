'use client';

import { useState } from 'react';
import Link from 'next/link';
import { solicitarRecuperacion } from '../actions';
import styles from '../login/LoginUsuario.module.css';

export default function RecuperarUsuario() {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setMensaje('');
    setError('');
    setCargando(true);
    try {
      const result = await solicitarRecuperacion(new FormData(form));
      if (result.error) setError(result.error);
      if (result.success) {
        setMensaje(result.message);
        form.reset();
      }
    } catch {
      setError('No se pudo procesar la solicitud. Intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.headerContainer}>
          <Link href="/login" className={styles.backLink}>←</Link>
          <h2 className={styles.header}>Recuperar contraseña</h2>
        </div>
        <div className={styles.body}>
          {error && <div className={styles.alertError}>{error}</div>}
          {mensaje && <div className={styles.alertSuccess}>{mensaje}</div>}
          <p>Ingresá el correo de tu cuenta y te enviaremos un enlace para restablecerla.</p>
          <form onSubmit={handleSubmit}>
            <label className={styles.label}>Correo electrónico</label>
            <input type="email" name="email" required className={styles.input} />
            <button type="submit" disabled={cargando} className={`${styles.btn} ${cargando ? styles.btnDisabled : ''}`}>
              {cargando ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
          <div className={styles.footerLink}>
            <Link href="/login" className={styles.link}>Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
