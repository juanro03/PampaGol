import prisma from './prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function getAuthenticatedUser() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado.');
  }

  const token = (await cookies()).get('session_token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      return null;
    }

    return prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        nickname: true,
        nombre: true,
        equipoId: true,
        rol: true,
      },
    });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (!user || user.rol !== 'ADMIN') {
    throw new Error('No autorizado.');
  }

  return user;
}
