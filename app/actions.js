'use server';

import prisma from '../lib/prisma';

export async function obtenerCategorias() {
  return await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export async function obtenerFixtureDelDia(dayOffset) {
  // Calculamos la fecha solicitada
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dayOffset);
  const targetDateString = targetDate.toISOString().split('T')[0];

  // Traemos todos los partidos de la BD con sus relaciones
  const partidosDB = await prisma.partido.findMany({
    include: {
      local: true,
      visitante: true,
      torneo: { include: { categoria: true } }
    }
  });

  const grouped = {};

  partidosDB.forEach(p => {
    if (!p.dia_hora) return;
    
    // Filtramos para enviar al frontend solo los de este día
    const matchDateString = p.dia_hora.toISOString().split('T')[0];
    if (matchDateString !== targetDateString) return;

    const leagueName = p.torneo.categoria.nombre;

    if (!grouped[leagueName]) {
      grouped[leagueName] = { league: leagueName, matches: [] };
    }

    let status = "scheduled";
    if (p.estado === "Finalizado") status = "final";
    if (p.estado === "En Juego") status = "live";

    const timeStr = p.dia_hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const scorersArr = p.goleadores ? p.goleadores.split(',').map(s => s.trim()) : [];

    grouped[leagueName].matches.push({
      id: p.id,
      home: p.local.nombre,
      homeEscudo: p.local.escudo_url,
      away: p.visitante.nombre,
      awayEscudo: p.visitante.escudo_url,
      status: status,
      homeScore: p.goles_l,
      awayScore: p.goles_v,
      time: timeStr,
      minute: status === "live" ? "ST" : null,
      scorers: scorersArr
    });
  });

  return Object.values(grouped);
}

// NUEVA FUNCIÓN: Trae los torneos de una liga, ordenados del más nuevo al más viejo
export async function obtenerTorneosPorCategoria(categoriaNombre) {
  return await prisma.torneo.findMany({
    where: { categoria: { nombre: categoriaNombre } },
    orderBy: [{ anio: 'desc' }, { nombre: 'desc' }]
  });
}

// FUNCIÓN MODIFICADA: Ahora recibe torneoId en lugar de categoriaNombre
export async function obtenerTablaPosiciones(torneoId) {
  // Traemos TODOS los partidos de ESE torneo y todos los equipos
  const partidos = await prisma.partido.findMany({
    where: { torneoId },
    include: { local: true, visitante: true }
  });

  const equipos = await prisma.equipo.findMany();

  // Inicializamos la tabla
  const tabla = {};
  equipos.forEach(eq => {
    tabla[eq.id] = { id: eq.id, nombre: eq.nombreCorto || eq.nombre, 
    escudo_url: eq.escudo_url,
    pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0 };
  });

  const equiposParticipantes = new Set();

  // Calculamos los puntos
  partidos.forEach(p => {
    equiposParticipantes.add(p.localId);
    equiposParticipantes.add(p.visitanteId);

    if (p.estado === "Finalizado" && p.goles_l !== null && p.goles_v !== null) {
      const local = tabla[p.localId];
      const visita = tabla[p.visitanteId];

      local.pj += 1; visita.pj += 1;
      local.gf += p.goles_l; visita.gf += p.goles_v;
      local.gc += p.goles_v; visita.gc += p.goles_l;
      local.dif = local.gf - local.gc; visita.dif = visita.gf - visita.gc;

      if (p.goles_l > p.goles_v) {
        local.pts += 3; local.pg += 1; visita.pp += 1;
      } else if (p.goles_l < p.goles_v) {
        visita.pts += 3; visita.pg += 1; local.pp += 1;
      } else {
        local.pts += 1; visita.pts += 1; local.pe += 1; visita.pe += 1;
      }
    }
  });

  return Object.values(tabla)
    .filter(eq => equiposParticipantes.has(eq.id))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts; // 1° Puntos
      if (b.dif !== a.dif) return b.dif - a.dif; // 2° Dif de gol
      return b.gf - a.gf; // 3° Goles a favor
    });
}

// Busca una categoría por ID y trae sus torneos disponibles
export async function obtenerCategoriaConTorneos(categoriaId) {
  return await prisma.categoria.findUnique({
    where: { id: categoriaId },
    include: {
      torneos: { orderBy: [{ anio: 'desc' }, { nombre: 'desc' }] }
    }
  });
}

// Trae TODOS los partidos de un torneo y los agrupa por "Fecha"
export async function obtenerFixturePorTorneo(torneoId) {
  const partidos = await prisma.partido.findMany({
    where: { torneoId },
    include: { local: true, visitante: true },
    orderBy: [{ fecha_numero: 'desc' }, { dia_hora: 'asc' }] // Ordenamos para ver la última fecha arriba
  });
  
  const agrupados = {};
  partidos.forEach(p => {
    const fechaStr = `Fecha ${p.fecha_numero}`;
    if (!agrupados[fechaStr]) agrupados[fechaStr] = { league: fechaStr, matches: [] };
    
    let status = "scheduled";
    if (p.estado === "Finalizado") status = "final";
    if (p.estado === "En Juego") status = "live";

    const timeStr = p.dia_hora ? p.dia_hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "A conf.";
    const scorersArr = p.goleadores ? p.goleadores.split(',').map(s => s.trim()) : [];

    agrupados[fechaStr].matches.push({
      id: p.id,
      home: p.local.nombre,
      homeEscudo: p.local.escudo_url,
      away: p.visitante.nombre,
      awayEscudo: p.visitante.escudo_url,
      status: status,
      homeScore: p.goles_l,
      awayScore: p.goles_v,
      time: timeStr,
      minute: status === "live" ? "ST" : null,
      scorers: scorersArr
    });
  });
  
  return Object.values(agrupados);
}

export async function obtenerTodosLosEquipos() {
  return await prisma.equipo.findMany({
    orderBy: { nombre: 'asc' } // Los ordenamos de la A a la Z
  });
}