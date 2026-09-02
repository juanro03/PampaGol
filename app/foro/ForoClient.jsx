'use client';

import { useState } from 'react';
import Link from 'next/link';
import { publicarComentario, eliminarComentario } from '../actions';

export default function ForoClient({ sesion, comentariosIniciales }) {
  const [cargando, setCargando] = useState(false);
  const [respondiendoA, setRespondiendoA] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    const formData = new FormData(e.target);
    await publicarComentario(formData);
    e.target.reset();
    setRespondiendoA(null);
    setCargando(false);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que querés borrar este mensaje?")) {
      await eliminarComentario(id);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  const Mensaje = ({ c, esRespuesta }) => (
    <div style={{ 
      background: esRespuesta ? "#163B30" : "#1E4D3B", 
      border: "1px solid #376C2F", 
      borderRadius: 6, 
      padding: 12, 
      marginBottom: 10,
      marginLeft: esRespuesta ? 40 : 0
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <img 
            src={c.usuario.equipo.escudo_url || '/icon.png'} 
            alt="Escudo" 
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
          <strong style={{ color: "#85bae6", fontSize: 14 }}>{c.usuario.nickname}</strong>
          <span style={{ color: "#9CA3AF", fontSize: 12 }}>{formatearFecha(c.createdAt)}</span>
        </div>
        
        {sesion?.id === c.usuarioId && (
          <button onClick={() => handleEliminar(c.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, fontWeight: "bold" }}>
            X
          </button>
        )}
      </div>
      
      <p style={{ margin: "0 0 10px 0", fontSize: 14, color: "#F3EFE3" }}>{c.texto}</p>
      
      {!esRespuesta && sesion && (
        <button 
          onClick={() => setRespondiendoA(respondiendoA === c.id ? null : c.id)}
          style={{ background: "transparent", border: "none", color: "#A7F3D0", cursor: "pointer", fontSize: 12, padding: 0 }}
        >
          {respondiendoA === c.id ? 'Cancelar' : 'Responder'}
        </button>
      )}

      {/* Caja de respuesta para este hilo en particular */}
      {respondiendoA === c.id && (
        <form onSubmit={handleSubmit} style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input type="hidden" name="parentId" value={c.id} />
          <input 
            type="text" 
            name="texto" 
            required 
            placeholder={`Responder a ${c.usuario.nickname}...`} 
            style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #376C2F", background: "#0D241D", color: "#FFF" }} 
          />
          <button type="submit" disabled={cargando} style={{ padding: "8px 12px", borderRadius: 4, background: "#10B981", border: "none", color: "#FFF", cursor: "pointer", fontWeight: "bold" }}>
            Enviar
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div>
      {/* 1. CAJA PARA NUEVO COMENTARIO PRINCIPAL */}
      {sesion ? (
        <form onSubmit={handleSubmit} style={{ background: "#163B30", padding: 15, borderRadius: 6, marginBottom: 20, border: "1px solid #376C2F" }}>
          <textarea 
            name="texto" 
            required 
            placeholder="¿Qué opinás de la fecha? Dejá tu comentario..." 
            rows="3"
            style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #376C2F", background: "#0D241D", color: "#FFF", resize: "vertical", marginBottom: 10 }}
          />
          <button type="submit" disabled={cargando} style={{ background: "#10B981", color: "#FFF", border: "none", padding: "8px 16px", borderRadius: 4, fontWeight: "bold", cursor: "pointer" }}>
            Publicar
          </button>
        </form>
      ) : (
        <div style={{ background: "#163B30", padding: 15, borderRadius: 6, marginBottom: 20, textAlign: "center", border: "1px solid #376C2F" }}>
          <p style={{ margin: "0 0 10px 0" }}>Para comentar tenés que estar registrado.</p>
          <Link href="/login" style={{ color: "#85bae6", fontWeight: "bold", textDecoration: "none" }}>Iniciar Sesión</Link>
          <span style={{ margin: "0 10px" }}>|</span>
          <Link href="/registro" style={{ color: "#85bae6", fontWeight: "bold", textDecoration: "none" }}>Registrarme</Link>
        </div>
      )}

      {/* 2. FEED DE COMENTARIOS */}
      <div>
        {comentariosIniciales.map(comentario => (
          <div key={comentario.id}>
            {/* Comentario principal */}
            <Mensaje c={comentario} esRespuesta={false} />
            
            {/* Respuestas anidadas */}
            {comentario.respuestas.map(respuesta => (
              <Mensaje key={respuesta.id} c={respuesta} esRespuesta={true} />
            ))}
          </div>
        ))}
        {comentariosIniciales.length === 0 && (
          <p style={{ textAlign: "center", color: "#9CA3AF" }}>Todavía no hay comentarios. ¡Sé el primero en romper el hielo!</p>
        )}
      </div>
    </div>
  );
}