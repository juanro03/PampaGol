import Sidebar from "../components/Sidebar"; 
import Header from "../components/Header"; 
import { obtenerCategorias, obtenerTodosLosEquipos } from "../actions";
import s from "./equipos.module.css";
import SiteNavigation from "../components/SiteNavigation";


function clubBadge(name) {
  if (!name) return "??";

  const parts = name.split(" ");
  const initials =
    parts.length > 1
      ? parts[0][0] + parts[1][0]
      : name.slice(0, 2);

  return initials.toUpperCase();
}

export default async function EquiposPage() {
  const [categorias, equipos] = await Promise.all([
    obtenerCategorias(),
    obtenerTodosLosEquipos()
  ]);

  return (
    <div className={s.page}>
      <SiteNavigation categorias={categorias} />

      <div className="pp-layout">
        <Sidebar categorias={categorias} />

        <div className="pp-main-wrap">

          <div className={s.header}>
            <span className={s.headerTitle}>
              Clubes pampeanos
            </span>
          </div>

          {equipos.length === 0 ? (
            <div className={s.loadingBox}>
              Aún no hay equipos registrados en la base de datos.
            </div>
          ) : (
            <div className={s.grid}>
              {equipos.map(eq => (
                <div key={eq.id} className={s.card}>
                  {eq.escudo_url ? (
                    <img
                      src={eq.escudo_url}
                      alt={`Escudo de ${eq.nombre}`}
                      className={s.cardImage}
                    />
                  ) : (
                    <div className={s.cardBadge}>
                      {clubBadge(eq.nombre)}
                    </div>
                  )}

                  <span className={s.cardName}>
                    {eq.nombre}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}