import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, Dice5, Crown } from 'lucide-react';
import { gameService, type GameState, type Player } from '../../services/gameService';
import { Loading } from '../common/Loading';
import GameTokens from './GameTokens';
import tableroImage from './tablero.jpeg';

export const GameBoard: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = async () => {
    if (!gameId) {
      setError('Juego no encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const state = await gameService.getGameState(gameId);
      setGameState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el juego');
      console.error('Error fetching game state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);


  const renderPlayerCard = (player: Player) => {
    const isCurrentTurn = gameState?.current_player_id === player.id;
    return (
      <div
        key={player.id}
        className={`card border ${
          isCurrentTurn ? 'border-info/60 shadow-info/20 shadow-lg' : 'border-transparent'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-text-primary">{player.name}</p>
            <p className="text-sm text-text-secondary capitalize">
              Color: {player.color.toLowerCase()}
            </p>
          </div>
          {isCurrentTurn && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-info/10 text-info">
              Turno actual
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {player.pieces.map((piece) => (
            <div key={piece.id} className="bg-bg-secondary rounded-lg p-3">
              <p className="text-sm text-text-secondary">Ficha {piece.id.split('-').pop()}</p>
              <p className="text-sm font-semibold text-text-primary">
                Posición: {piece.position}
              </p>
              <span className="text-xs text-text-secondary capitalize">
                Estado: {piece.status.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/games')}
                className="p-2 hover:bg-bg-primary rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Tablero de Juego</h1>
                {gameState && (
                  <p className="text-sm text-text-secondary">Juego #{gameState.id}</p>
                )}
              </div>
            </div>

            <button
              onClick={fetchGameState}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-bg-primary transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 bg-error/10 border border-error rounded-lg text-error">
            {error}
          </div>
        )}

        {gameState ? (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Estado Actual</h2>
                    <p className="text-text-secondary">
                      Último dado: {gameState.last_dice_value ?? 'Aún no lanzado'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {gameState.players.length} jugadores
                      </span>
                    </div>
                    {gameState.winner_id && (
                      <div className="flex items-center space-x-2 text-success">
                        <Crown className="w-4 h-4" />
                        <span className="text-sm">
                          Ganador:{' '}
                          {gameState.players.find((p) => p.id === gameState.winner_id)?.name ??
                            'Desconocido'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <ParquesBoard gameState={gameState} />
              </div>

              <div className="space-y-4">
                <div className="card">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">Jugadores</h2>
                  <div className="space-y-3">
                    {gameState.players.map((player) => (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg border ${
                          gameState.current_player_id === player.id
                            ? 'border-info'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-text-primary">{player.name}</p>
                            <span className="text-xs text-text-secondary">
                              Color: {player.color}
                            </span>
                          </div>
                          {gameState.current_player_id === player.id && (
                            <span className="text-xs text-info">En turno</span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                          Piezas activas: {player.pieces.filter((p) => p.status === 'board' || p.status === 'safe_zone').length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">Detalles del Juego</h2>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className="capitalize">{gameState.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Último turno:</span>
                      <span>
                        {gameState.current_player_id
                          ? gameState.players.find((p) => p.id === gameState.current_player_id)?.name
                          : 'Sin turno activo'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Último dado lanzado:</span>
                      <div className="flex items-center space-x-2">
                        <Dice5 className="w-4 h-4 text-text-secondary" />
                        <span>{gameState.last_dice_value ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Piezas por Jugador</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameState.players.map((player) => renderPlayerCard(player))}
              </div>
            </section>
          </>
        ) : (
          <div className="text-center py-16 text-text-secondary">
            No se pudo cargar el estado del juego. Intenta nuevamente.
          </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;

// Componente del tablero visual de Parqués
const ParquesBoard: React.FC<{ gameState: GameState }> = ({ gameState }) => {

  return (
    <div
      className="relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-amber-800"
      style={{
        backgroundImage: `url(${tableroImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '500px',
        imageRendering: 'auto'
      }}
    >
      {/* Capa para las fichas */}
      <GameTokens gameState={gameState} />
    </div>
  );
};

