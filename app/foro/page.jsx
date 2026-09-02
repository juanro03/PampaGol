import { obtenerSesionActual, obtenerComentarios, obtenerCategorias } from '../actions';
import SiteNavigation from '../components/SiteNavigation';
import ForoClient from './ForoClient';

export default async function ForoPage() {
  const [categorias, sesion, comentarios] = await Promise.all([
    obtenerCategorias(),
    obtenerSesionActual(),
    obtenerComentarios()
  ]);

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#0D241D",
        minHeight: "100vh",
        color: "#F3EFE3"
      }}
    >
      <SiteNavigation categorias={categorias} />

      <div className="pp-main-wrap">
        <div
          style={{
            background: "#1E4D3B",
            borderBottom: "4px solid #083524",
            padding: "10px 15px",
            marginBottom: "20px"
          }}
        >
          <h2
            className="titulo-header gol"
            style={{ fontSize: 24, margin: 0 }}
          >
            Debate de Hinchas
          </h2>
        </div>

        <ForoClient
          sesion={sesion}
          comentariosIniciales={comentarios}
        />
      </div>
    </div>
  );
}