import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Users, Calendar, Lock, Globe, X } from 'lucide-react';
import { gameService } from '../../services/gameService';
import type { Game } from '../../types/game';
import { Loading } from '../common/Loading';
import styles from './GameList.module.css';

type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export const GameList: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{ id: string; isPrivate: boolean } | null>(null);
  const [selectedColor, setSelectedColor] = useState<PlayerColor | null>(null);

  useEffect(() => {
    fetchAvailableGames();
  }, []);

  const fetchAvailableGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const availableGames = await gameService.getAvailableGames();
      setGames(availableGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar juegos');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string, isPrivate: boolean) => {
    setSelectedGame({ id: gameId, isPrivate });
    setShowColorModal(true);
  };

  const confirmJoinGame = async () => {
    if (!selectedGame || !selectedColor) return;

    try {
      setJoiningGameId(selectedGame.id);
      
      const joinRequest = {
        color: selectedColor,
        password: selectedGame.isPrivate ? prompt('Ingresa la contraseña del juego:') || undefined : undefined,
      };

      await gameService.joinGame(selectedGame.id, joinRequest);
      setShowColorModal(false);
      setSelectedGame(null);
      setSelectedColor(null);
      navigate(`/game/${selectedGame.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al juego');
      console.error('Error joining game:', err);
    } finally {
      setJoiningGameId(null);
    }
  };

  const cancelColorSelection = () => {
    setShowColorModal(false);
    setSelectedGame(null);
    setSelectedColor(null);
  };

  const handleCreateGame = () => {
    navigate('/create-game');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-bg-primary rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
              <h1 className="text-xl font-bold text-text-primary">Juegos Disponibles</h1>
            </div>

            <button
              onClick={handleCreateGame}
              className="btn-success flex items-center space-x-2 px-4 py-2"
            >
              <Play className="w-4 h-4" />
              <span>Crear Juego</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Selección de Color */}
      {showColorModal && (
        <div className={styles.colorModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Selecciona tu color</h2>
              <button onClick={cancelColorSelection} className={styles.closeButton}>
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className={styles.colorGrid}>
              {(['red', 'blue', 'yellow', 'green'] as PlayerColor[]).map((color) => {
                const colorStyles = {
                  red: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
                  blue: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
                  yellow: { bg: '#eab308', border: '#ca8a04', text: '#1f2937' },
                  green: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
                };
                const colorNames = {
                  red: 'Rojo',
                  blue: 'Azul',
                  yellow: 'Amarillo',
                  green: 'Verde',
                };
                
                const style = colorStyles[color];
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`${styles.colorButton} ${isSelected ? styles.selected : ''}`}
                    style={{
                      backgroundColor: style.bg,
                      borderColor: style.border,
                      color: style.text,
                    }}
                  >
                    <div className={styles.colorCircle}>
                      <div className={styles.colorDot}>●</div>
                      <div className={styles.colorName}>{colorNames[color]}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={styles.modalActions}>
              <button onClick={cancelColorSelection} className={styles.cancelButton}>
                Cancelar
              </button>
              <button
                onClick={confirmJoinGame}
                disabled={!selectedColor || joiningGameId !== null}
                className={`btn-primary ${styles.confirmButton}`}
              >
                {joiningGameId ? 'Uniéndose...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              No hay juegos disponibles
            </h2>
            <p className="text-text-secondary mb-6">
              Sé el primero en crear una partida y espera a otros jugadores
            </p>
            <button
              onClick={handleCreateGame}
              className="btn-success px-6 py-3"
            >
              Crear Primer Juego
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="card hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Header de la Card */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {game.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      game.status === 'waiting'
                        ? 'bg-warning/10 text-warning'
                        : game.status === 'in_progress'
                        ? 'bg-info/10 text-info'
                        : 'bg-success/10 text-success'
                    }`}>
                      {game.status === 'waiting' ? 'Esperando...' : game.status === 'in_progress' ? 'En Juego' : 'Finalizado'}
                    </span>
                  </div>
                </div>

                {/* Información del Juego */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      {game.current_players}/{game.max_players} Jugadores
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      {new Date(game.created_at).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {game.is_private ? (
                      <Lock className="w-4 h-4 text-warning" />
                    ) : (
                      <Globe className="w-4 h-4 text-success" />
                    )}
                    <span className="text-sm text-text-secondary">
                      {game.is_private ? 'Privado' : 'Público'}
                    </span>
                  </div>
                </div>

                {/* Progreso de Jugadores */}
                <div className="mb-4">
                  <div className="w-full bg-bg-primary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-parques-blue to-info h-2 rounded-full transition-all"
                      style={{
                        width: `${(game.current_players / game.max_players) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Botón de Acción */}
                {game.status === 'waiting' && game.current_players < game.max_players ? (
                  <button
                    onClick={() => handleJoinGame(game.id, game.is_private)}
                    disabled={joiningGameId === game.id}
                    className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      {joiningGameId === game.id ? 'Uniéndose...' : 'Unirse'}
                    </span>
                  </button>
                ) : game.status === 'in_progress' ? (
                  <button
                    onClick={() => handleJoinGame(game.id, game.is_private)}
                    disabled={joiningGameId === game.id}
                    className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      {joiningGameId === game.id ? 'Uniéndose...' : 'Ver Juego'}
                    </span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn-secondary w-full opacity-50 cursor-not-allowed"
                  >
                    Juego Finalizado
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
