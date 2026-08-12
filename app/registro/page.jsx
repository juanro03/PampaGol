// app/registro/page.jsx
import { PrismaClient } from '@prisma/client';
import RegistroUsuario from './RegistroUsuario'; 
const prisma = new PrismaClient();

export default async function RegistroPage() {
  // Buscamos los equipos
  const equipos = await prisma.equipo.findMany({
    orderBy: { nombre: 'asc' }
  });

  return (
    <main style={{ padding: "40px 20px" }}>
      {/* Le pasamos los equipos al componente cliente */}
      <RegistroUsuario equipos={equipos} />
    </main>
  );
}