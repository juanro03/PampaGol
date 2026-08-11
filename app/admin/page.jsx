import prisma from '../../lib/prisma';
import AdminClient from './AdminClient';

export default async function AdminPanel() {
  const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  const equipos = await prisma.equipo.findMany({ orderBy: { nombre: 'asc' } });
  const torneos = await prisma.torneo.findMany({ include: { categoria: true }, orderBy: { nombre: 'asc' } });
  const partidos = await prisma.partido.findMany({  include: {local: true, visitante: true, torneo: { include: { categoria: true } },
    goles: {
      include: {
        jugador: true
      }
    }
  },
  orderBy: { dia_hora: 'asc' }
});

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#111827", minHeight: "100vh", color: "#F9FAFB", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ borderBottom: "1px solid #374151", paddingBottom: 20, marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#10B981" }}>Promiedos Admin</h1>
          <p style={{ color: "#9CA3AF", margin: "5px 0 0 0" }}>Control de la Base de Datos</p>
        </header>

        {/* Llamamos a nuestro componente interactivo */}
        <AdminClient 
          categorias={categorias} 
          equipos={equipos} 
          torneos={torneos} 
          partidos={partidos} 
        />
      </div>
    </div>
  );
}