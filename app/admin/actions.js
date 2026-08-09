'use server';

import prisma from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

// ================= CATEGORÍAS =================
export async function crearCategoria(formData) {
  await prisma.categoria.create({ data: { nombre: formData.get('nombre') } });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function editarCategoria(formData) {
  await prisma.categoria.update({
    where: { id: formData.get('id') },
    data: { nombre: formData.get('nombre') }
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function eliminarCategoria(formData) {
  try {
    await prisma.categoria.delete({ where: { id: formData.get('id') } });
    revalidatePath('/admin'); revalidatePath('/');
  } catch (e) { console.error("Error al eliminar categoría. ¿Tiene torneos vinculados?"); }
}

// ================= EQUIPOS =================
export async function crearEquipo(formData) {
  await prisma.equipo.create({
    data: { nombre: formData.get('nombre'), nombreCorto: formData.get('nombreCorto'), escudo_url: formData.get('escudo_url') || null }
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function editarEquipo(formData) {
  await prisma.equipo.update({
    where: { id: formData.get('id') },
    data: { nombre: formData.get('nombre'), nombreCorto: formData.get('nombreCorto'), escudo_url: formData.get('escudo_url') || null }
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function eliminarEquipo(formData) {
  try {
    await prisma.equipo.delete({ where: { id: formData.get('id') } });
    revalidatePath('/admin'); revalidatePath('/');
  } catch (e) { console.error("Error al eliminar equipo. ¿Tiene partidos jugados?"); }
}

// ================= TORNEOS =================
export async function crearTorneo(formData) {
  await prisma.torneo.create({
    data: { nombre: formData.get('nombre'), categoriaId: formData.get('categoriaId'), estado: 'Activo' }
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function editarTorneo(formData) {
  await prisma.torneo.update({
    where: { id: formData.get('id') },
    data: { nombre: formData.get('nombre'), estado: formData.get('estado') }
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function eliminarTorneo(formData) {
  try {
    await prisma.torneo.delete({ where: { id: formData.get('id') } });
    revalidatePath('/admin'); revalidatePath('/');
  } catch (e) { console.error("Error al eliminar torneo. ¿Tiene partidos programados?"); }
}

// ================= PARTIDOS =================
export async function crearPartido(formData) {
  const dia_hora_str = formData.get('dia_hora');
  await prisma.partido.create({
    data: {
      torneoId: formData.get('torneoId'),
      localId: formData.get('localId'),
      visitanteId: formData.get('visitanteId'),
      fecha_numero: parseInt(formData.get('fecha_numero')),
      dia_hora: dia_hora_str ? new Date(dia_hora_str) : null,
      estado: 'Programado'
    },
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function actualizarPartido(formData) {
  const goles_l = formData.get('goles_l');
  const goles_v = formData.get('goles_v');

  await prisma.partido.update({
    where: { id: formData.get('id') },
    data: {
      estado: formData.get('estado'),
      goles_l: goles_l ? parseInt(goles_l) : null,
      goles_v: goles_v ? parseInt(goles_v) : null,
      goleadores: formData.get('goleadores') || null
    }
  });
  revalidatePath('/admin'); revalidatePath('/');
}
export async function eliminarPartido(formData) {
  await prisma.partido.delete({ where: { id: formData.get('id') } });
  revalidatePath('/admin'); revalidatePath('/');
}