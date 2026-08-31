'use client';

import { useState } from 'react';
import Link from 'next/link';
import { iniciarSesion } from '../actions';
import styles from './LoginUsuario.module.css';

export default function LoginUsuario() {
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        const formData = new FormData(e.target);

        try {
            const res = await iniciarSesion(formData);
            if (res.success) {
                window.location.href = '/';
            }
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
                    <h2 className={styles.header}>Iniciar Sesión</h2>
                </div>


                <div className={styles.body}>
                    {error && <div className={styles.alertError}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <label className={styles.label}>Email o Usuario</label>
                        <input
                            type="text"
                            name="identifier"
                            required
                            className={styles.input}
                            placeholder="Ingresar email o usuario"                            
                        />

                        <label className={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className={styles.input}
                            placeholder="Ingresar contraseña"
                        />

                        {/* Recuperar contraseña */}
                        <div className={styles.forgotPassword}>
                            ¿Olvidaste tu contraseña?{' '}
                            <Link href="/recuperar" className={styles.link}>
                                Recuperar
                            </Link>
                        </div>

                        <button 
                          type="submit" 
                          disabled={cargando} 
                          className={`${styles.btn} ${cargando ? styles.btnDisabled : ''}`.trim()}
                        >
                            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Link hacia el registro */}
                    <div className={styles.footerLink}>
                        ¿Todavía no tenés cuenta?{' '}
                        <Link href="/registro" className={styles.link}>
                            Registrate acá
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}