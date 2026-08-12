'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registrarUsuario } from '../actions';

export default function RegistroUsuario({ equipos }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(false);

  const s = {
    wrapper: {
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0D241D",
      minHeight: "70vh",
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
      maxWidth: "480px",
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
      marginTop: "10px",
      transition: "background 0.2s ease"
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
    alertSuccess: {
      background: "#065F46",
      border: "1px solid #10B981",
      color: "#D1FAE5",
      padding: "10px 14px",
      borderRadius: "6px",
      marginBottom: "16px",
      fontSize: "14px"
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
    setSuccess('');
    setCargando(true);

    const formData = new FormData(e.target);

    try {
      await registrarHincha(formData);
      setSuccess('¡Registro exitoso! Ya podés iniciar sesión.');
      e.target.reset();
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

          <h2 style={s.header}>Unite a la Tribuna</h2>

        </div>


        <div style={s.body}>
          {error && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Dividimos Nombre y Apellido en dos columnas */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Nombre</label>
                <input type="text" name="nombre" required style={s.input} placeholder="Juan" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Apellido</label>
                <input type="text" name="apellido" required style={s.input} placeholder="Pérez" />
              </div>
            </div>

            <label style={s.label}>Correo Electrónico</label>
            <input type="email" name="email" required style={s.input} placeholder="juan@mail.com" />

            <label style={s.label}>Contraseña</label>
            <input type="password" name="password" required minLength={6} style={s.input} placeholder="Mínimo 6 caracteres" />

            <label style={s.label}>Nickname (Para el foro)</label>
            <input type="text" name="nickname" required style={s.input} placeholder="Juan_Pampa" />

            <label style={s.label}>Fecha de Nacimiento</label>
            <input type="date" name="fecha_nac" required style={s.input} />

            <label style={s.label}>¿De qué equipo sos?</label>
            <select name="equipoId" required style={s.input}>
              <option value="" style={{ background: "#0D241D", color: "#F3EFE3" }}>Seleccioná tu equipo...</option>
              {equipos.map(eq => (
                <option key={eq.id} value={eq.id} style={{ background: "#0D241D", color: "#F3EFE3" }}>
                  {eq.nombre}
                </option>
              ))}
            </select>

            <button type="submit" disabled={cargando} style={{ ...s.btn, opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          {/* Link hacia el login */}
          <div style={s.footerLink}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={s.link}>
              Iniciar sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}