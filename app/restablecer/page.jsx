'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { restablecerContrasena } from '../actions';
import styles from '../login/LoginUsuario.module.css';

function RestablecerForm() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setCargando(true);
    try {
      const result = await restablecerContrasena(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      if (result.success) setExito(true);
    } catch {
      setError('No se pudo restablecer la contraseña. Intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.headerContainer}>
          <Link href="/login" className={styles.backLink}>←</Link>
          <h2 className={styles.header}>Nueva contraseña</h2>
        </div>
        <div className={styles.body}>
          {error && <div className={styles.alertError}>{error}</div>}
          {exito ? (
            <>
              <div className={styles.alertSuccess}>Tu contraseña fue actualizada correctamente.</div>
              <Link href="/login" className={styles.link}>Iniciar sesión</Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="token" value={token} />
              <label className={styles.label}>Nueva contraseña</label>
              <input type="password" name="password" minLength={6} required className={styles.input} />
              <label className={styles.label}>Repetir contraseña</label>
              <input type="password" name="confirmPassword" minLength={6} required className={styles.input} />
              <button type="submit" disabled={cargando || !token} className={`${styles.btn} ${cargando ? styles.btnDisabled : ''}`}>
                {cargando ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RestablecerPage() {
  return (
    <Suspense fallback={<div className={styles.wrapper}>Cargando...</div>}>
      <RestablecerForm />
    </Suspense>
  );
}
