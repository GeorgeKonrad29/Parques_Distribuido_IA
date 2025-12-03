import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Globe } from 'lucide-react';
import { gameService } from '../../services/gameService';

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    maxPlayers: 4,
    isPrivate: false,
    password: '',
    creatorColor: 'red',
  });

  const colors = ['red', 'blue', 'green', 'yellow'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre del juego es requerido');
      return;
    }

    if (formData.isPrivate && !formData.password.trim()) {
      setError('La contraseña es requerida para juegos privados');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const createRequest = {
        name: formData.name,
        max_players: parseInt(formData.maxPlayers.toString()),
        is_private: formData.isPrivate,
        password: formData.isPrivate ? formData.password : undefined,
        creator_color: formData.creatorColor,
      };

      const newGame = await gameService.createGame(createRequest);
      navigate(`/game/${newGame.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el juego');
      console.error('Error creating game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 h-16">
            <button
              onClick={() => navigate('/games')}
              className="p-2 hover:bg-bg-primary rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-text-primary" />
            </button>
            <h1 className="text-xl font-bold text-text-primary">Crear Nueva Partida</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Configura tu partida
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del Juego */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Nombre de la Partida
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Partida Épica, Torneo 2024, etc."
                maxLength={100}
                className="w-full px-4 py-2 bg-bg-primary border border-surface rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-parques-blue"
              />
              <p className="mt-1 text-xs text-text-muted">
                {formData.name.length}/100 caracteres
              </p>
            </div>

            {/* Número de Jugadores */}
            <div>
              <label htmlFor="maxPlayers" className="block text-sm font-medium text-text-primary mb-2">
                Número de Jugadores
              </label>
              <select
                id="maxPlayers"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-surface rounded-lg text-text-primary focus:outline-none focus:border-parques-blue"
              >
                <option value={2}>2 Jugadores</option>
                <option value={3}>3 Jugadores</option>
                <option value={4}>4 Jugadores</option>
              </select>
              <p className="mt-1 text-xs text-text-muted">
                Selecciona cuántos jugadores participarán
              </p>
            </div>

            {/* Color del Creador */}
            <div>
              <label htmlFor="creatorColor" className="block text-sm font-medium text-text-primary mb-2">
                Tu Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, creatorColor: color }))}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.creatorColor === color
                        ? `bg-parques-${color.toLowerCase()} text-white ring-2 ring-offset-2 ring-parques-${color.toLowerCase()}`
                        : 'bg-bg-primary border border-surface text-text-primary hover:border-parques-blue'
                    }`}
                  >
                    {color === 'red' ? '🔴' : color === 'blue' ? '🔵' : color === 'green' ? '🟢' : '🟡'}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacidad */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Tipo de Partida
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-surface rounded-lg cursor-pointer hover:bg-bg-primary/50 transition"
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: false }))}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={!formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="w-4 h-4"
                  />
                  <Globe className="w-5 h-5 text-success ml-3 mr-3" />
                  <div>
                    <p className="font-medium text-text-primary">Pública</p>
                    <p className="text-sm text-text-muted">Cualquiera puede unirse</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-surface rounded-lg cursor-pointer hover:bg-bg-primary/50 transition"
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="w-4 h-4"
                  />
                  <Lock className="w-5 h-5 text-warning ml-3 mr-3" />
                  <div>
                    <p className="font-medium text-text-primary">Privada</p>
                    <p className="text-sm text-text-muted">Requiere contraseña</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Contraseña (si es privada) */}
            {formData.isPrivate && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa una contraseña"
                  maxLength={50}
                  className="w-full px-4 py-2 bg-bg-primary border border-surface rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-parques-blue"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Compartida con los jugadores que desees invitar
                </p>
              </div>
            )}

            {/* Resumen */}
            <div className="bg-bg-primary border border-surface rounded-lg p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">Resumen</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-text-secondary">Nombre:</span>
                  <span className="ml-2 text-text-primary font-medium">{formData.name || '—'}</span>
                </p>
                <p>
                  <span className="text-text-secondary">Jugadores:</span>
                  <span className="ml-2 text-text-primary font-medium">{formData.maxPlayers}</span>
                </p>
                <p>
                  <span className="text-text-secondary">Tipo:</span>
                  <span className="ml-2 text-text-primary font-medium">
                    {formData.isPrivate ? '🔒 Privada' : '🌐 Pública'}
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Tu color:</span>
                  <span className="ml-2 text-text-primary font-medium">{formData.creatorColor}</span>
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/games')}
                className="flex-1 btn-secondary py-3"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-success py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Partida'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
