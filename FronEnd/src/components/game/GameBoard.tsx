import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, Dice5, Crown } from 'lucide-react';
import { gameService, type GameState, type Player, type Piece } from '../../services/gameService';
import { Loading } from '../common/Loading';

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
                          Piezas activas: {player.pieces.filter((p) => p.status === 'on_board').length}
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
  const COLOR_THEME: Record<string, { bg: string; text: string; border: string }> = {
    RED: { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
    BLUE: { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' },
    GREEN: { bg: '#22c55e', text: '#ffffff', border: '#16a34a' },
    YELLOW: { bg: '#eab308', text: '#1f2937', border: '#ca8a04' },
  };

  const STARTING_POSITIONS: Record<string, number> = {
    RED: 5,
    BLUE: 22,
    YELLOW: 39,
    GREEN: 56,
  };
  const GOAL_ENTRY_POSITIONS: Record<string, number> = {
    RED: 0,
    BLUE: 17,
    YELLOW: 34,
    GREEN: 51,
  };
  const SAFE_POSITIONS = [5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 0];
  const GOAL_POSITIONS = 8;

  // Obtener fichas en una posición específica
  const getPiecesAtPosition = (position: number): Piece[] => {
    const pieces: Piece[] = [];
    gameState.players.forEach((player) => {
      player.pieces.forEach((piece) => {
        if (piece.position === position && piece.status === 'on_board') {
          pieces.push(piece);
        }
      });
    });
    return pieces;
  };

  // Obtener fichas en casa por color
  const getHomePieces = (color: string): Piece[] => {
    const player = gameState.players.find((p) => p.color.toUpperCase() === color);
    if (!player) return [];
    return player.pieces.filter((p) => p.status === 'home');
  };

  // Obtener fichas en meta por color
  const getGoalPieces = (color: string): Piece[] => {
    const player = gameState.players.find((p) => p.color.toUpperCase() === color);
    if (!player) return [];
    return player.pieces.filter((p) => p.status === 'goal');
  };

  // Renderizar una ficha
  const renderPiece = (piece: Piece, size: 'sm' | 'md' = 'md') => {
    const player = gameState.players.find((p) => p.pieces.some((p) => p.id === piece.id));
    if (!player) return null;
    const color = COLOR_THEME[player.color.toUpperCase()] || COLOR_THEME.RED;
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
    const textSize = size === 'sm' ? 'text-[8px]' : 'text-[10px]';

    return (
      <div
        key={piece.id}
        className={`${sizeClass} rounded-full border-2 flex items-center justify-center font-bold ${textSize} shadow-md`}
        style={{
          backgroundColor: color.bg,
          borderColor: color.border,
          color: color.text,
        }}
        title={`${player.name} - Ficha ${piece.id.split('-').pop()}`}
      >
        {piece.id.split('-').pop()?.slice(-1) || '?'}
      </div>
    );
  };

  // Renderizar casa de un jugador
  const renderHome = (color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW', position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const homePieces = getHomePieces(color);
    const theme = COLOR_THEME[color];
    const player = gameState.players.find((p) => p.color.toUpperCase() === color);

    return (
      <div
        className={`relative bg-gradient-to-br ${
          position === 'top-left'
            ? 'rounded-tl-3xl'
            : position === 'top-right'
            ? 'rounded-tr-3xl'
            : position === 'bottom-left'
            ? 'rounded-bl-3xl'
            : 'rounded-br-3xl'
        } border-2 p-3 flex flex-col items-center justify-center`}
        style={{
          backgroundColor: `${theme.bg}20`,
          borderColor: theme.border,
        }}
      >
        <div className="text-xs font-semibold mb-2" style={{ color: theme.text }}>
          {player?.name || color}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {homePieces.length > 0 ? (
            homePieces.map((piece) => renderPiece(piece, 'md'))
          ) : (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-dashed opacity-30"
                  style={{ borderColor: theme.border }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  // Renderizar casilla del camino principal
  const renderMainTrackCell = (position: number, isHorizontal: boolean) => {
    const pieces = getPiecesAtPosition(position);
    const isSafe = SAFE_POSITIONS.includes(position);
    const isStart = Object.values(STARTING_POSITIONS).includes(position);
    const isGoalEntry = Object.values(GOAL_ENTRY_POSITIONS).includes(position);

    return (
      <div
        key={position}
        className={`relative flex items-center justify-center ${
          isHorizontal ? 'w-8 h-12' : 'w-12 h-8'
        } border border-gray-400 ${
          isSafe || isStart || isGoalEntry
            ? 'bg-amber-800 text-white font-semibold'
            : 'bg-white'
        } text-[10px]`}
        title={`Casilla ${position}${isSafe ? ' (SEGURO)' : ''}${isStart ? ' (SALIDA)' : ''}`}
      >
        {isStart && (
          <span className="absolute top-0 left-0 text-[8px] px-1 bg-amber-900 rounded-br">
            SALIDA
          </span>
        )}
        {isSafe && !isStart && (
          <span className="absolute top-0 left-0 text-[8px] px-1 bg-amber-900 rounded-br">
            SEGURO
          </span>
        )}
        <div className="flex flex-wrap gap-0.5 justify-center items-center">
          {pieces.length > 0 ? (
            pieces.map((piece) => renderPiece(piece, 'sm'))
          ) : (
            <span className="text-gray-400 text-[8px]">{position}</span>
          )}
        </div>
      </div>
    );
  };

  // Renderizar camino de meta (coloreado)
  const renderGoalPath = (color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW', direction: 'up' | 'down' | 'left' | 'right') => {
    const theme = COLOR_THEME[color];
    const goalPieces = getGoalPieces(color);
    const entryPos = GOAL_ENTRY_POSITIONS[color];

    return (
      <div
        className={`flex ${
          direction === 'up' || direction === 'down' ? 'flex-col' : 'flex-row'
        } gap-1`}
      >
        {Array.from({ length: GOAL_POSITIONS }, (_, i) => {
          const goalPosition = entryPos + i + 1;
          const piecesAtGoal = goalPieces.filter((p) => p.position === goalPosition);

          return (
            <div
              key={i}
              className={`w-10 h-10 border-2 flex items-center justify-center text-[10px] font-semibold`}
              style={{
                backgroundColor: `${theme.bg}40`,
                borderColor: theme.border,
                color: theme.text,
              }}
              title={`Meta ${i + 1}`}
            >
              {piecesAtGoal.length > 0 ? (
                piecesAtGoal.map((piece) => renderPiece(piece, 'sm'))
              ) : (
                <span className="opacity-50">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar centro
  const renderCenter = () => {
    const allGoalPieces: Piece[] = [];
    gameState.players.forEach((player) => {
      const goalPieces = player.pieces.filter((p) => p.status === 'goal' && p.position > 68);
      allGoalPieces.push(...goalPieces);
    });

    return (
      <div className="relative w-32 h-32 rounded-full border-4 border-cyan-500 bg-gradient-to-br from-cyan-400 to-cyan-600 flex flex-col items-center justify-center shadow-2xl">
        <div className="text-white text-center">
          <div className="text-2xl font-black mb-1">
            {gameState.last_dice_value ?? '—'}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-semibold">
            Parqués
          </div>
        </div>
        {allGoalPieces.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-wrap gap-1 justify-center">
              {allGoalPieces.map((piece) => renderPiece(piece, 'sm'))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar sección del camino principal
  const renderTrackSection = (positions: number[], isHorizontal: boolean) => {
    return (
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-0`}>
        {positions.map((pos) => renderMainTrackCell(pos, isHorizontal))}
      </div>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-3xl border-4 border-amber-800 shadow-2xl overflow-hidden">
      <div className="relative w-full aspect-square max-w-5xl mx-auto">
        {/* Grid principal 3x3 */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
          {/* Top row - RED (top-left), camino horizontal, GREEN (top-right) */}
          {renderHome('RED', 'top-left')}
          <div className="bg-white/90 border-2 border-gray-500 rounded-lg flex items-center justify-center overflow-hidden relative">
            {renderTrackSection(Array.from({ length: 17 }, (_, i) => i), true)}
          </div>
          {renderHome('GREEN', 'top-right')}

          {/* Middle row - camino vertical GREEN, centro, camino vertical BLUE */}
          <div className="bg-white/90 border-2 border-gray-500 rounded-lg flex items-center justify-center overflow-hidden relative">
            {renderGoalPath('GREEN', 'left')}
          </div>
          <div className="flex items-center justify-center bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border-2 border-cyan-500 relative">
            {renderCenter()}
            {/* Caminos de meta verticales dentro del centro */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-full flex flex-col items-center justify-center gap-1">
                {renderGoalPath('RED', 'down')}
                <div className="flex-1" />
                {renderGoalPath('YELLOW', 'up')}
              </div>
            </div>
          </div>
          <div className="bg-white/90 border-2 border-gray-500 rounded-lg flex items-center justify-center overflow-hidden relative">
            {renderGoalPath('BLUE', 'right')}
          </div>

          {/* Bottom row - YELLOW (bottom-left), camino horizontal, BLUE (bottom-right) */}
          {renderHome('YELLOW', 'bottom-left')}
          <div className="bg-white/90 border-2 border-gray-500 rounded-lg flex items-center justify-center overflow-hidden relative">
            {renderTrackSection(Array.from({ length: 17 }, (_, i) => 34 + i), true)}
          </div>
          {renderHome('BLUE', 'bottom-right')}
        </div>

        {/* Secciones verticales del camino (izquierda y derecha) */}
        <div className="absolute left-0 top-1/3 bottom-1/3 w-1/3 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 border-2 border-gray-500 rounded-lg h-full flex items-center justify-center overflow-hidden">
            {renderTrackSection(Array.from({ length: 17 }, (_, i) => 51 + i), false)}
          </div>
        </div>
        <div className="absolute right-0 top-1/3 bottom-1/3 w-1/3 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 border-2 border-gray-500 rounded-lg h-full flex items-center justify-center overflow-hidden">
            {renderTrackSection(Array.from({ length: 17 }, (_, i) => 17 + i), false)}
          </div>
        </div>
      </div>
    </div>
  );
};

