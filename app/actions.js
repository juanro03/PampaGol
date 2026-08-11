'use server';

import prisma from '../lib/prisma';

export async function obtenerCategorias() {
  return await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' }
  });
}

function formatSubDayLabel(dateObj) {
  if (!dateObj) return "Fecha A Confirmar";
  const d = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const days = ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."];
  const dayName = days[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${dayName} ${day}/${month}`;
}

// OBTENER FIXTURE POR TORNEO (Agrupado por Fecha y luego por Día)
export async function obtenerFixturePorTorneo(torneoId) {
  const partidos = await prisma.partido.findMany({
    where: { torneoId },
    include: {
      local: true,
      visitante: true,
      goles: {
        include: { jugador: true },
        orderBy: { minuto: 'asc' }
      }
    },
    orderBy: [{ fecha_numero: 'asc' }, { dia_hora: 'asc' }]
  });

  const agrupados = {};
  partidos.forEach(p => {
    const fechaStr = `Fecha ${p.fecha_numero}`;
    if (!agrupados[fechaStr]) {
      agrupados[fechaStr] = { league: fechaStr, days: [] };
    }

    const dayLabel = formatSubDayLabel(p.dia_hora);

    let dayGroup = agrupados[fechaStr].days.find(d => d.dayLabel === dayLabel);
    if (!dayGroup) {
      dayGroup = { dayLabel: dayLabel, matches: [] };
      agrupados[fechaStr].days.push(dayGroup);
    }

    let status = "scheduled";
    if (p.estado === "Finalizado") status = "final";
    if (p.estado === "En Juego") status = "live";

    const timeStr = p.dia_hora ? p.dia_hora.toLocaleTimeString("es-AR", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires"
    }) : "A conf.";

    // Mantenemos scorersArr por retrocompatibilidad, pero sumamos las nuevas variables
    const scorersArr = p.goleadores ? p.goleadores.split(',').map(s => s.trim()) : [];

    dayGroup.matches.push({
      id: p.id,
      homeId: p.localId,
      awayId: p.visitanteId,
      home: p.local.nombre,
      homeEscudo: p.local.escudo_url,
      away: p.visitante.nombre,
      awayEscudo: p.visitante.escudo_url,
      status: status,
      homeScore: p.goles_l,
      awayScore: p.goles_v,
      time: timeStr,
      minute: status === "live" ? "En Juego" : null,
      scorers: scorersArr,
      goles: p.goles,
      goleadores: p.goleadores
    });
  });

  return Object.values(agrupados);
}

export async function obtenerFixtureDelDia(dayOffset) {
  // Obtenemos el tiempo exacto de ARGENTINA
  const targetDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  targetDate.setDate(targetDate.getDate() + dayOffset);
  const tY = targetDate.getFullYear();
  const tM = targetDate.getMonth();
  const tD = targetDate.getDate();

  const partidosDB = await prisma.partido.findMany({
    include: {
      local: true,
      visitante: true,
      torneo: { include: { categoria: true } },
      goles: {
        include: { jugador: true },
        orderBy: { minuto: 'asc' }
      }
    }
  });

  const grouped = {};

  partidosDB.forEach(p => {
    if (!p.dia_hora) return;

    // Transformamos el dia_hora del partido a zona horaria de Argentina
    const matchDate = new Date(p.dia_hora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));

    // Comparamos Año, Mes y Día exactos
    if (matchDate.getFullYear() !== tY || matchDate.getMonth() !== tM || matchDate.getDate() !== tD) return;

    const leagueName = p.torneo.categoria.nombre;
    if (!grouped[leagueName]) grouped[leagueName] = { league: leagueName, matches: [] };

    let status = "scheduled";
    if (p.estado === "Finalizado") status = "final";
    if (p.estado === "En Juego") status = "live";

    const timeStr = p.dia_hora.toLocaleTimeString("es-AR", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires"
    });

    const scorersArr = p.goleadores ? p.goleadores.split(',').map(s => s.trim()) : [];

    grouped[leagueName].matches.push({
      id: p.id,
      homeId: p.localId,
      awayId: p.visitanteId,
      home: p.local.nombre,
      homeEscudo: p.local.escudo_url,
      away: p.visitante.nombre,
      awayEscudo: p.visitante.escudo_url,
      status: status,
      homeScore: p.goles_l,
      awayScore: p.goles_v,
      time: timeStr,
      minute: status === "live" ? "En Juego" : null,
      scorers: scorersArr,
      goles: p.goles,
      goleadores: p.goleadores
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
    tabla[eq.id] = {
      id: eq.id, nombre: eq.nombreCorto || eq.nombre,
      escudo_url: eq.escudo_url,
      pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0
    };
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

export async function obtenerTodosLosEquipos() {
  return await prisma.equipo.findMany({
    orderBy: { nombre: 'asc' } // Los ordenamos de la A a la Z
  });
}

export async function obtenerGoleadores(torneoId) {
  try {
    // 1. Buscamos a los jugadores que tengan AL MENOS UN GOL en este torneo
    const jugadores = await prisma.jugador.findMany({
      where: {
        goles: {
          some: {
            partido: {
              torneoId: torneoId
            }
          }
        }
      },
      select: {
        id: true,
        nombre: true,
        equipo: {
          select: {
            nombre: true,
            nombreCorto: true,
            escudo_url: true,
          }
        },
        // Le pedimos a Prisma que cuente los goles, pero SOLO los de este torneo
        _count: {
          select: {
            goles: {
              where: {
                partido: {
                  torneoId: torneoId
                }
              }
            }
          }
        }
      }
    });

    // 2. Formateamos los datos para que tu componente de React los entienda igual que antes
    const tablaGoleadores = jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      equipo: j.equipo.nombreCorto || j.equipo.nombre, // Usamos el corto si existe
      equipo_escudo: j.equipo.escudo_url,
      goles: j._count.goles
    }));

    // 3. Ordenamos de mayor a menor y devolvemos el Top 15 (podés cambiar el número)
    return tablaGoleadores
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 15);

  } catch (error) {
    console.error("Error obteniendo goleadores:", error);
    return [];
  }
}