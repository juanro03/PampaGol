'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from "lucide-react";
import Select from 'react-select';
import { actualizarPerfil, obtenerTodosLosEquipos } from '../actions';

const normalizarTexto = texto => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase()
  .trim();

export default function Header({ onOpenMenu, usuario, setUsuario, cargando, perfilRequest, onLogout }) {
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [perfilError, setPerfilError] = useState('');
  const [perfilExito, setPerfilExito] = useState('');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');

  const handleLogout = async () => {
    await onLogout();
  };

  useEffect(() => {
    if (perfilRequest > 0 && usuario) abrirPerfil();
  }, [perfilRequest]);

  const abrirPerfil = async () => {
    setPerfilError('');
    setPerfilExito('');
    setEquipoSeleccionado(usuario?.equipoId || '');
    setPerfilAbierto(true);

    if (equipos.length === 0) {
      setCargandoEquipos(true);
      try {
        setEquipos(await obtenerTodosLosEquipos());
      } catch {
        setPerfilError('No se pudieron cargar los clubes.');
      } finally {
        setCargandoEquipos(false);
      }
    }
  };

  const handlePerfilSubmit = async (event) => {
    event.preventDefault();
    setGuardandoPerfil(true);
    setPerfilError('');
    setPerfilExito('');

    try {
      const resultado = await actualizarPerfil(new FormData(event.currentTarget));
      if (resultado?.error) {
        setPerfilError(resultado.error);
        return;
      }

      setUsuario(current => ({
        ...current,
        nickname: resultado.nickname,
        equipoId: resultado.equipoId,
        equipoNombre: resultado.equipoNombre,
        escudoUrl: resultado.escudoUrl
      }));
      setPerfilExito('Perfil actualizado correctamente.');
    } catch {
      setPerfilError('No se pudo actualizar el perfil. Intentá nuevamente.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  return (
    <header className="pp-header">
      <div className="pp-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="pp-mobile-toggle" onClick={onOpenMenu} aria-label="Abrir menú">
            <Menu size={20} />
          </button>

          <div className="pp-logo-container">
            <img src="/icon.png" alt="logo pampagol" className="pp-logo-img" />
            <div className="pp-title-wrapper">
              <Link href="/" aria-label="Ir al inicio" style={{ textDecoration: 'none' }}>
                <span className="titulo-header pampa">
                  PampaGol
                </span>
              </Link>
            </div>
          </div>
        </div>
        {/* Estado de Usuario / Botones de Acceso */}
        {!cargando && (
          <div
            className="pp-header-auth"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {usuario ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {usuario.rol === 'ADMIN' && (
                  <Link
                    href="/admin"
                    style={{
                      color: '#FCD34D',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: 4,
                      border: '1px solid #FCD34D'
                    }}
                  >
                    Panel admin
                  </Link>
                )}
                {usuario.escudoUrl && (
                  <img src={usuario.escudoUrl} alt={usuario.equipoNombre || 'Escudo'}
                    style={{ width: 40, height: 40, objectFit: 'contain' }} />
                )}
                <span style={{ fontSize: 17, fontWeight: 600, color: '#F3EFE3' }}>
                  {usuario.nickname}
                </span>
                <button
                  type="button"
                  onClick={abrirPerfil}
                  style={{
                    background: 'transparent',
                    border: '1px solid #85BAE6',
                    color: '#85BAE6',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Editar perfil
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 15,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href="/login"
                  style={{
                    color: '#F3EFE3',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 4,
                    border: '1px solid #376C2F'
                  }}
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  style={{
                    background: '#1E4D3B',
                    color: '#FFF',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 4,
                    border: '1px solid #376C2F'
                  }}
                >
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
      {perfilAbierto && usuario && (
        <div
          role="presentation"
          onClick={() => setPerfilAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0, 0, 0, 0.45)'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="perfil-title"
            onClick={event => event.stopPropagation()}
            style={{
              width: 'min(100%, 360px)',
              background: '#1F2937',
              border: '1px solid #376C2F',
              borderRadius: 8,
              padding: 20,
              color: '#F3EFE3',
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 id="perfil-title" style={{ margin: 0, fontSize: 20 }}>Editar perfil</h2>
              <button type="button" onClick={() => setPerfilAbierto(false)} aria-label="Cerrar" style={{ background: 'transparent', border: 0, color: '#F3EFE3', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            {perfilError && <div role="alert" style={{ color: '#FCA5A5', marginBottom: 12 }}>{perfilError}</div>}
            {perfilExito && <div role="status" style={{ color: '#A7F3D0', marginBottom: 12 }}>{perfilExito}</div>}
            <form onSubmit={handlePerfilSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>
                Nombre de usuario
                <input
                  name="nickname"
                  type="text"
                  defaultValue={usuario.nickname}
                  minLength={3}
                  maxLength={30}
                  required
                  pattern="[A-Za-zÀ-ÿ0-9_.-]+"
                  style={{ width: '100%', marginTop: 5, padding: 9, borderRadius: 4, border: '1px solid #4B5563', background: '#374151', color: '#FFF' }}
                />
              </label>
              <label>
                Club del que sos hincha
                <Select
                  inputId="perfil-equipo"
                  instanceId="perfil-equipo"
                  isSearchable
                  isClearable={false}
                  isDisabled={cargandoEquipos}
                  isLoading={cargandoEquipos}
                  placeholder="Buscá un club..."
                  noOptionsMessage={() => 'No se encontraron clubes'}
                  options={equipos.map(equipo => ({ value: equipo.id, label: equipo.nombre }))}
                  value={equipos
                    .map(equipo => ({ value: equipo.id, label: equipo.nombre }))
                    .find(opcion => opcion.value === equipoSeleccionado) || null}
                  onChange={opcion => setEquipoSeleccionado(opcion?.value || '')}
                  filterOption={(option, inputValue) =>
                    normalizarTexto(option.label).includes(normalizarTexto(inputValue))
                  }
                  styles={{
                    control: base => ({ ...base, marginTop: 5, background: '#374151', borderColor: '#4B5563' }),
                    menu: base => ({ ...base, background: '#1F2937', zIndex: 1001 }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isFocused ? '#374151' : '#1F2937',
                      color: '#FFF'
                    }),
                    singleValue: base => ({ ...base, color: '#FFF' }),
                    input: base => ({ ...base, color: '#FFF' }),
                    placeholder: base => ({ ...base, color: '#D1D5DB' })
                  }}
                />
                <input type="hidden" name="equipoId" value={equipoSeleccionado} />
              </label>
              <button type="submit" disabled={guardandoPerfil || cargandoEquipos} style={{ padding: 10, border: 0, borderRadius: 4, background: '#10B981', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}>
                {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}