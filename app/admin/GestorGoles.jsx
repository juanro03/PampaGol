'use client';

import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { obtenerJugadoresPorEquipo, crearJugador } from './actions';

export default function GestorGoles({ partido, equipo, tipo, onCountChange }) {
    const [jugadores, setJugadores] = useState([]);
    const [goles, setGoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        obtenerJugadoresPorEquipo(equipo.id).then(data => {
            setJugadores(data.map(j => ({ value: j.id, label: j.nombre })));
        });

        if (partido?.goles && partido.goles.length > 0) {
            const golesGuardados = partido.goles
                .filter(g => g.jugador && g.jugador.equipoId === equipo.id)
                .map(g => ({
                    id: g.id,
                    jugador: { value: g.jugador.id, label: g.jugador.nombre },
                    minuto: g.minuto ?? ''
                }));

            setGoles(golesGuardados);

            // Notificamos la cantidad inicial al contador del marcador
            if (onCountChange) onCountChange(golesGuardados.length);
        } else {
            setGoles([]);
            if (onCountChange) onCountChange(0);
        }
    }, [equipo.id, partido]);

    const handleCrearJugador = async (inputValue) => {
        setLoading(true);
        const nuevoJugador = await crearJugador(inputValue, equipo.id);
        const nuevaOpcion = { value: nuevoJugador.id, label: nuevoJugador.nombre };
        setJugadores(prev => [...prev, nuevaOpcion]);

        // Agregar automáticamente una fila de gol con el jugador recién creado
        agregarFilaGol(nuevaOpcion);
        setLoading(false);
    };

    const agregarFilaGol = (jugadorOpcion = null) => {
        setGoles([...goles, { id: Date.now(), jugador: jugadorOpcion, minuto: '' }]);
    };

    const actualizarFila = (id, campo, valor) => {
        setGoles(goles.map(g => g.id === id ? { ...g, [campo]: valor } : g));
    };

    const eliminarFila = (id) => {
        setGoles(goles.filter(g => g.id !== id));
    };

    // Estilos oscuros para react-select
    const selectStyles = {
        control: (base) => ({ ...base, background: '#374151', borderColor: '#4B5563', color: 'white' }),
        menu: (base) => ({ ...base, background: '#1F2937' }),
        option: (base, state) => ({ ...base, background: state.isFocused ? '#374151' : 'transparent', color: 'white' }),
        singleValue: (base) => ({ ...base, color: 'white' }),
        input: (base) => ({ ...base, color: 'white' }),
    };

    return (
        <div style={{ background: '#1F2937', padding: 10, borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 10px 0', color: tipo === 'local' ? '#3B82F6' : '#EF4444' }}>
                Goles {equipo.nombre}
            </h4>

            {goles.map((gol) => (
                <div key={gol.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <CreatableSelect
                            isDisabled={loading}
                            isLoading={loading}
                            onChange={(opcion) => actualizarFila(gol.id, 'jugador', opcion)}
                            onCreateOption={handleCrearJugador}
                            options={jugadores}
                            value={gol.jugador}
                            placeholder="Jugador..."
                            styles={selectStyles}
                            formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
                        />
                    </div>
                    <input
                        type="number"
                        placeholder="Minuto"
                        value={gol.minuto}
                        onChange={(e) => actualizarFila(gol.id, 'minuto', e.target.value)}
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #4B5563', background: '#374151', color: 'white', width: 70 }}
                    />
                    <button type="button" onClick={() => eliminarFila(gol.id)} style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: 4, padding: '8px 12px', cursor: 'pointer' }}>X</button>
                </div>
            ))}

            {/* MAGIA ACÁ: Empaquetamos todo el array de goles en un solo String JSON */}
            <input
                type="hidden"
                name={`goles_data_${tipo}`}
                value={JSON.stringify(goles.filter(g => g.jugador).map(g => ({
                    jugadorId: g.jugador.value,
                    minuto: g.minuto
                })))}
            />

            <button type="button" onClick={() => agregarFilaGol()} style={{ background: '#4B5563', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
                + Agregar Gol
            </button>
        </div>
    );
}