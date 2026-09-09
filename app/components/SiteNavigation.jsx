"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { cerrarSesion, obtenerSesionActual } from "../actions";

export default function SiteNavigation({ categorias, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [perfilRequest, setPerfilRequest] = useState(0);

  useEffect(() => {
    obtenerSesionActual()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargandoUsuario(false));
  }, []);

  const handleLogout = async () => {
    await cerrarSesion();
    setUsuario(null);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      <Header
        onOpenMenu={() => setMobileMenuOpen(true)}
        usuario={usuario}
        setUsuario={setUsuario}
        cargando={cargandoUsuario}
        perfilRequest={perfilRequest}
        onLogout={handleLogout}
      />

      <div className="pp-layout">
        <Sidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          categorias={categorias}
          usuario={usuario}
          cargando={cargandoUsuario}
          onLogout={handleLogout}
          onEditProfile={() => setPerfilRequest(request => request + 1)}
        />
        {children}
      </div>
    </>
  );
}