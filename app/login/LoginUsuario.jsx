'use client';

import { useState } from 'react';
import Link from 'next/link';
import { iniciarSesion } from '../actions';

export default function LoginUsuario() {
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const s = {
        wrapper: {
            fontFamily: "'Inter', system-ui, sans-serif",
            background: "#0D241D",
            minHeight: "100vh",
            color: "#F3EFE3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        },
        card: {
            background: "#163B30",
            border: "1px solid #376C2F",
            width: "100%",
            maxWidth: "420px",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)"
        },
        backLink: {
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: 600,
            zIndex: 1,
        },
        header: {
            background: "#1E4D3B",
            color: "#F3EFE3",
            padding: "16px 20px",
            fontSize: "20px",
            fontWeight: 700,
            borderBottom: "3px solid #083524",
            textAlign: "center"
        },
        headerContainer: {
            position: "relative",
        },
        body: {
            padding: "24px 20px"
        },
        label: {
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
            fontSize: "14px",
            color: "#F3EFE3"
        },
        input: {
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #376C2F",
            background: "#0D241D",
            color: "#F3EFE3",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: "16px",
            fontFamily: "inherit",
            fontSize: "14px",
            outline: "none"
        },
        btn: {
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            color: "#FFFFFF",
            width: "100%",
            background: "#1E4D3B",
            fontSize: "16px",
            fontFamily: "inherit",
            marginTop: "10px"
        },
        alertError: {
            background: "#7F1D1D",
            border: "1px solid #EF4444",
            color: "#FEE2E2",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "14px"
        },
        forgotPassword: {
            display: "block",
            textAlign: "right",
            marginTop: "-10px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#9CA3AF"
        },
        footerLink: {
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
            color: "#9CA3AF"
        },
        link: {
            color: "#85bae6",
            textDecoration: "underline",
            fontWeight: 600
        }
    };

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
        <div style={s.wrapper}>
            <div style={s.card}>

                {/* Botón hacia atrás */}
                <div style={s.headerContainer}>
                    <Link href="/" style={s.backLink}>
                        ←
                    </Link>
                    <h2 style={s.header}>Ingresar a la Tribuna</h2>
                </div>


                <div style={s.body}>
                    {error && <div style={s.alertError}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <label style={s.label}>Email o Usuario</label>
                        <input
                            type="text"
                            name="identifier"
                            required
                            style={s.input}
                            placeholder="Ej: juan@mail.com o Juan_Pampa"
                        />

                        <label style={s.label}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            style={s.input}
                            placeholder="Ingresá tu contraseña"
                        />

                        {/* Recuperar contraseña */}
                        <div style={s.forgotPassword}>
                            ¿Olvidaste tu contraseña?{' '}
                            <Link href="/recuperar" style={s.link}>
                                Recuperar
                            </Link>
                        </div>

                        <button type="submit" disabled={cargando} style={{ ...s.btn, opacity: cargando ? 0.7 : 1 }}>
                            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Link hacia el registro */}
                    <div style={s.footerLink}>
                        ¿Todavía no tenés cuenta?{' '}
                        <Link href="/registro" style={s.link}>
                            Registrate acá
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}