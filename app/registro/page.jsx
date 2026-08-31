// app/registro/page.jsx
import { PrismaClient } from '@prisma/client';
import RegistroUsuario from './RegistroUsuario'; 
const prisma = new PrismaClient();

export default async function RegistroPage() {

  const equipos = await prisma.equipo.findMany({
    orderBy: { nombre: 'asc' }
  });

  return (
    <main>
      <RegistroUsuario equipos={equipos} />
    </main>
  );
}