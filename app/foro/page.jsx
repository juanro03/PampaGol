import { obtenerSesionActual } from '../actions';
import { obtenerComentarios } from '../actions';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import prisma from '../../lib/prisma';
import ForoClient from './ForoClient';

export default async function ForoPage() {
  const sesion = await obtenerSesionActual();
  const comentarios = await obtenerComentarios();
  
  const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0D241D", minHeight: "100vh", color: "#F3EFE3" }}>
      <Header />
      
      <div className="pp-layout">
        <Sidebar categorias={categorias} />
        
        <div className="pp-main-wrap">
           <div style={{ background: "#1E4D3B", borderBottom: "4px solid #083524", padding: "10px 15px", marginBottom: "20px" }}>
             <h2 className="titulo-header gol" style={{ fontSize: 24, margin: 0 }}>LA TRIBUNA (Foro)</h2>
           </div>
           
           <ForoClient sesion={sesion} comentariosIniciales={comentarios} />
        </div>
      </div>
    </div>
  );
}