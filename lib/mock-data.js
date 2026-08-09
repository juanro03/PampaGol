
const hoy = new Date();
const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);

export const CATEGORIAS = [
  { id: "cat_lpa",  nombre: "Liga Pampeana A" },
  { id: "cat_lpb",  nombre: "Liga Pampeana B" },
  { id: "cat_resa", nombre: "Reserva A" },
];

export const EQUIPOS = [
  { id: "eq_1",     nombre: "Alvear FBC",               ombreCorto: "Alvear",           escudo_url: null },
  { id: "eq_2",     nombre: "Costa Brava",              nombreCorto: "Costa",           escudo_url: null },
  { id: "eq_3",     nombre: "Ferro de Pico",            nombreCorto: "Ferro",           escudo_url: null },
  { id: "eq_4",     nombre: "Sportivo Independiente",   nombreCorto: "Independiente",   escudo_url: null },
  { id: "eq_5",     nombre: "Cultura Integral",         nombreCorto: "Cultura",         escudo_url: null },
  { id: "eq_6",     nombre: "Alta Italia FBC",          nombreCorto: "Alta Italia",     escudo_url: null },
];

export const TORNEOS = [
  { id: "tor_1", nombre: "Liga Pampeana A Clausura 2026", categoriaId: "cat_lpa", estado: "Activo" },
  { id: "tor_2", nombre: "Liga Pampeana B Clausura 2026", categoriaId: "cat_lpb", estado: "Activo" },
];

// Simulamos los registros exactos que te devolvería Prisma
export const PARTIDOS = [
  {
    id: "part_1", fecha_numero: 1, torneoId: "tor_1", localId: "eq_1", visitanteId: "eq_2",
    estado: "Finalizado", goles_l: 3, goles_v: 1, dia_hora: ayer.toISOString(),
    goleadores: "15' J. Perez (ALV), 80' M. Gomez (ALV), 45' L. Rossi (COS)" // Partido de AYER
  },
  {
    id: "part_2", fecha_numero: 1, torneoId: "tor_1", localId: "eq_3", visitanteId: "eq_4",
    estado: "En Juego", goles_l: 0, goles_v: 0, dia_hora: hoy.toISOString(),
    goleadores: null // Partido de HOY
  },
  {
    id: "part_3", fecha_numero: 1, torneoId: "tor_2", localId: "eq_5", visitanteId: "eq_6",
    estado: "Programado", goles_l: null, goles_v: null, dia_hora: manana.toISOString(),
    goleadores: null // Partido de MAÑANA
  }
];