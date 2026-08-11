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
  const id = formData.get('id');
  const dia_hora_str = formData.get('dia_hora');
  
  // Atrapamos los JSON de goleadores
  const golesLocalRaw = formData.get('goles_data_local');
  const golesVisitanteRaw = formData.get('goles_data_visitante');

  let golesLocalArray = [];
  let golesVisitanteArray = [];

  try {
    if (golesLocalRaw) golesLocalArray = JSON.parse(golesLocalRaw);
    if (golesVisitanteRaw) golesVisitanteArray = JSON.parse(golesVisitanteRaw);
  } catch (e) {
    console.error("Error parseando el JSON de goles:", e);
  }

  // Leemos inputs manuales
  const inputGolesL = formData.get('goles_l');
  const inputGolesV = formData.get('goles_v');

  // LÓGICA CLAVE:
  // Si hay goles detallados en el gestor, el marcador es el tamaño de esa lista.
  // Si la lista está vacía, se usa el input numérico manual.
  const finalGolesL = golesLocalArray.length > 0 
    ? golesLocalArray.length 
    : (inputGolesL !== '' && inputGolesL !== null ? parseInt(inputGolesL) : null);

  const finalGolesV = golesVisitanteArray.length > 0 
    ? golesVisitanteArray.length 
    : (inputGolesV !== '' && inputGolesV !== null ? parseInt(inputGolesV) : null);

  await prisma.$transaction(async (tx) => {
    // 1. Actualizamos el partido con los goles finales sincronizados
    await tx.partido.update({
      where: { id },
      data: {
        estado: formData.get('estado'),
        goles_l: finalGolesL,
        goles_v: finalGolesV,
        goleadores: formData.get('goleadores') || null,
        dia_hora: dia_hora_str ? new Date(dia_hora_str) : null,
      }
    });

    // 2. Recreamos la relación de goles
    const todosLosGoles = [...golesLocalArray, ...golesVisitanteArray];

    await tx.gol.deleteMany({ where: { partidoId: id } });

    if (todosLosGoles.length > 0) {
      await tx.gol.createMany({
        data: todosLosGoles.map(g => ({
          partidoId: id,
          jugadorId: g.jugadorId,
          minuto: g.minuto ? parseInt(g.minuto) : null
        }))
      });
    }
  });

  revalidatePath('/admin');
  revalidatePath('/');
}
export async function eliminarPartido(formData) {
  // Primero borramos los goles asociados para que no haya error de llave foránea
  await prisma.gol.deleteMany({ where: { partidoId: formData.get('id') } });

  await prisma.partido.delete({ where: { id: formData.get('id') } });
  revalidatePath('/admin'); revalidatePath('/');
}

// ================= JUGADORES Y GOLES (NUEVO) =================
export async function obtenerJugadoresPorEquipo(equipoId) {
  return await prisma.jugador.findMany({
    where: { equipoId },
    orderBy: { nombre: 'asc' }
  });
}

export async function crearJugador(nombre, equipoId) {
  const jugador = await prisma.jugador.create({
    data: { nombre, equipoId }
  });
  return jugador;
}