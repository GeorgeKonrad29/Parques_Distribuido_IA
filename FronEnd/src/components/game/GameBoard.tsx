import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, Dice5, Crown } from 'lucide-react';
import { gameService} from '../../services/gameService';
import { authService } from '../../services/authService';
import type { Game } from '../../types/game';
import { type GameState, type Player } from '../../types/game';
import { Loading } from '../common/Loading';
import GameTokens from './GameTokens';
import tableroImage from './tablero.jpeg';
import styles from './GameBoard.module.css';

export const GameBoard: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameMeta, setGameMeta] = useState<Game | null>(null);
  const [startingGame, setStartingGame] = useState(false);
  const currentUserId = authService.getUser() ? String(authService.getUser()!.id) : null;

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
      // Si el juego está esperando, obtener metadata para saber el creador
      if (state.status === 'waiting') {
        try {
          const available = await gameService.getAvailableGames();
          const meta = available.find(g => g.id === state.id) || null;
          setGameMeta(meta);
        } catch (e) {
          // Silenciar error de metadata
        }
      } else {
        setGameMeta(null);
      }
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
      <div key={player.id} className={`card border ${isCurrentTurn ? styles.activeTurn : 'border-transparent'}`}>
        <div className={styles.playerCardHeader}>
          <div>
            <p className={styles.playerCardName}>{player.name}</p>
            <p className={styles.playerCardColor}>Color: {player.color.toLowerCase()}</p>
          </div>
          {isCurrentTurn && (
            <span className={styles.currentTurnBadge}>Turno actual</span>
          )}
        </div>

        <div className={styles.piecesInfo}>
          {player.pieces.map((piece) => (
            <div key={piece.id} className={styles.pieceCard}>
              <p className={styles.pieceLabel}>Ficha {piece.id.split('-').pop()}</p>
              <p className={styles.piecePosition}>Posición: {piece.position}</p>
              <span className={styles.pieceStatus}>Estado: {piece.status.toLowerCase()}</span>
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <button onClick={() => navigate('/games')} className={styles.backButton}>
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
              <div>
                <h1 className={styles.headerTitle}>Tablero de Juego</h1>
                {gameState && (
                  <p className={styles.headerSubtitle}>Juego #{gameState.id}</p>
                )}
              </div>
            </div>
            <div className={styles.headerActions}>
              <button onClick={fetchGameState} className={styles.refreshButton}>
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
              {gameState && gameState.status === 'waiting' && (
                <button
                  onClick={async () => {
                    if (!gameState) return;
                    setStartingGame(true);
                    try {
                      await gameService.startGame(String(gameState.id));
                      await fetchGameState();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error al iniciar el juego');
                    } finally {
                      setStartingGame(false);
                    }
                  }}
                  className={`btn-success ${styles.refreshButton}`}
                  style={{ marginLeft: 8 }}
                  disabled={startingGame}
                >
                  {startingGame ? 'Iniciando...' : 'Iniciar juego'}
                </button>
              )}
              {gameState && (
                <button
                  onClick={async () => {
                    try {
                      await gameService.leaveGame(String(gameState.id));
                      navigate('/games');
                    } catch (err) {
                      console.error('Error al abandonar el juego:', err);
                    }
                  }}
                  className={`btn-danger ${styles.refreshButton}`}
                  style={{ marginLeft: 8 }}
                >
                  Abandonar juego
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorAlert}>{error}</div>
        )}

        {gameState ? (
          <div className={styles.mainContent}>
            <section className={styles.gridSection}>
              <div className={`card ${styles.boardCard}`}>
                <div className={styles.boardHeader}>
                  <div>
                    <h2 className={styles.boardTitle}>Estado Actual</h2>
                    <p className={styles.boardSubtitle}>
                      Último dado: {gameState.last_dice_value ?? 'Aún no lanzado'}
                    </p>
                  </div>
                  <div className={styles.boardStats}>
                    <div className={styles.statItem}>
                      <Users className="w-4 h-4 text-text-secondary" />
                      <span className={styles.statText}>
                        {gameState.players.length} jugadores
                      </span>
                    </div>
                    {gameState.winner_id && (
                      <div className={styles.winnerBadge}>
                        <Crown className="w-4 h-4" />
                        <span className={styles.winnerText}>
                          Ganador:{' '}
                          {gameState.players.find((p) => p.id === gameState.winner_id)?.name ??
                            'Desconocido'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <ParquesBoard gameState={gameState} onRefresh={fetchGameState} />
              </div>

              <div className={styles.sidebar}>
                <div className={`card ${styles.playersCard}`}>
                  <h2 className={styles.playersTitle}>Jugadores</h2>
                  <div className={styles.playersList}>
                    {gameState.players.map((player) => (
                      <div
                        key={player.id}
                        className={`${styles.playerItem} ${
                          gameState.current_player_id === player.id ? styles.currentTurn : ''
                        }`}
                      >
                        <div className={styles.playerHeader}>
                          <div>
                            <p className={styles.playerName}>{player.name}</p>
                            <span className={styles.playerColor}>
                              Color: {player.color}
                            </span>
                          </div>
                          {gameState.current_player_id === player.id && (
                            <span className={styles.turnBadge}>En turno</span>
                          )}
                        </div>
                        <p className={styles.playerPieces}>
                          Piezas activas: {player.pieces.filter((p) => p.status === 'board' || p.status === 'safe_zone').length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`card ${styles.detailsCard}`}>
                  <h2 className={styles.detailsTitle}>Detalles del Juego</h2>
                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Estado:</span>
                      <span className={styles.detailValue}>{gameState.status.replace('_', ' ')}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Último turno:</span>
                      <span>
                        {gameState.current_player_id
                          ? gameState.players.find((p) => p.id === gameState.current_player_id)?.name
                          : 'Sin turno activo'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Último dado lanzado:</span>
                      <div className={styles.diceValue}>
                        <Dice5 className="w-4 h-4 text-text-secondary" />
                        <span>{gameState.last_dice_value ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estado (JSON) para depuración */}
                <div className={`card ${styles.detailsCard}`}>
                  <h2 className={styles.detailsTitle}>Estado (JSON)</h2>
                  <pre className={styles.jsonBlock}>
                    {JSON.stringify(gameState, null, 2)}
                  </pre>
                </div>
              </div>
            </section>

            <section className={`card ${styles.piecesSection}`}>
              <h2 className={styles.piecesTitle}>Piezas por Jugador</h2>
              <div className={styles.piecesGrid}>
                {gameState.players.map((player) => renderPlayerCard(player))}
              </div>
            </section>
          </div>
        ) : (
          <div className={styles.emptyState}>
            No se pudo cargar el estado del juego. Intenta nuevamente.
          </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;

// Componente del tablero visual de Parqués
const ParquesBoard: React.FC<{ gameState: GameState; onRefresh: () => Promise<void> }> = ({ gameState, onRefresh }) => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [diceValues, setDiceValues] = useState<number[]>([]);
  const [validMoves, setValidMoves] = useState<any>(null);
  const [rollingDice, setRollingDice] = useState(false);
  
  // IDs para comparación de turnos
  const myPlayerId = authService.getUser() ? String(authService.getUser()!.id) : null;
  const activePlayerId = gameState.current_player_id; // Ya viene como string del backend
  const isMyTurn = myPlayerId !== null && activePlayerId !== null && activePlayerId === myPlayerId;
  
  const [boardDimensions, setBoardDimensions] = useState({
    containerWidth: 0,
    containerHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
    imageX: 0,
    imageY: 0,
    containerLeft: 0,
    containerTop: 0,
    imageScreenX: 0,
    imageScreenY: 0,
  });

  // Drag-to-pan eliminado

  useEffect(() => {
    let ro: ResizeObserver | null = null;

    const updateDimensions = () => {
      if (!boardRef.current) return;

      const container = boardRef.current;
      const containerRect = container.getBoundingClientRect();

      // Crear una imagen temporal para obtener dimensiones naturales
      const img = new Image();
      img.src = tableroImage;

      img.onload = () => {
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const containerLeft = containerRect.left + window.scrollX;
        const containerTop = containerRect.top + window.scrollY;

        // Calcular dimensiones con 'contain'
        const imageAspectRatio = img.naturalWidth / img.naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let imageWidth = 0,
          imageHeight = 0,
          imageX = 0,
          imageY = 0;

        if (containerAspectRatio > imageAspectRatio) {
          // El contenedor es más ancho, la imagen se ajusta por altura
          imageHeight = containerHeight;
          imageWidth = imageHeight * imageAspectRatio;
          imageX = (containerWidth - imageWidth) / 2;
          imageY = 0;
        } else {
          // El contenedor es más alto, la imagen se ajusta por ancho
          imageWidth = containerWidth;
          imageHeight = imageWidth / imageAspectRatio;
          imageX = 0;
          imageY = (containerHeight - imageHeight) / 2;
        }

        const imageScreenX = containerLeft + imageX;
        const imageScreenY = containerTop + imageY;

        setBoardDimensions({
          containerWidth,
          containerHeight,
          imageWidth,
          imageHeight,
          imageX,
          imageY,
          containerLeft,
          containerTop,
          imageScreenX,
          imageScreenY,
        });
      };
    };

    updateDimensions();

    if (window.ResizeObserver) {
      ro = new ResizeObserver(updateDimensions);
      if (boardRef.current) ro.observe(boardRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', updateDimensions, { passive: true });

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
    };
  }, []);

  const handlePieceClick = (pieceId: string) => {
    setSelectedPieceId(pieceId === selectedPieceId ? null : pieceId);
  };

  const handlePositionClick = (position: number) => {
    if (!selectedPieceId) return;

    // Crear una copia profunda del estado para forzar re-render
    const updatedPlayers = gameState.players.map(player => ({
      ...player,
      pieces: player.pieces.map(piece => {
        if (piece.id === selectedPieceId) {
          return {
            ...piece,
            position: position,
            status: 'board' as const
          };
        }
        return piece;
      })
    }));

    // Actualizar el estado del juego
    gameState.players = updatedPlayers;
    
    // Limpiar selección
    setSelectedPieceId(null);

    console.log(`Ficha ${selectedPieceId} movida a posición ${position}`);
  };

  // Lanzar dados llamando al backend
  const rollDice = async () => {
    if (!gameState?.id || !isMyTurn) return;
    
    setRollingDice(true);
    try {
      const diceValue = await gameService.rollDice(String(gameState.id));
      setDiceValues([diceValue]);
      
      // Refrescar estado del juego para obtener last_dice_value actualizado
      await onRefresh();
      
      // Obtener movimientos válidos para este valor de dado
      const moves = await gameService.getValidMoves(String(gameState.id), diceValue);
      setValidMoves(moves);
      
      console.log('Dado lanzado:', diceValue);
      console.log('Movimientos válidos:', moves);
    } catch (err) {
      console.error('Error al lanzar dado:', err);
      setValidMoves({ error: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setRollingDice(false);
    }
  };

  return (
    <div className={styles.boardWrapper}>
      {/* Tablero con overlay visual */}
      <div
        ref={boardRef}
        className={styles.boardContainer}
        style={{
          backgroundImage: `url(${tableroImage})`,
        }}
      >
        {/* Visualización del área de la imagen */}
        {boardDimensions.imageWidth > 0 && (
          <div
            className={styles.imageOverlay}
            style={{
              left: `${boardDimensions.imageX}px`,
              top: `${boardDimensions.imageY}px`,
              width: `${boardDimensions.imageWidth}px`,
              height: `${boardDimensions.imageHeight}px`,
            }}
          >
          </div>
        )}

        {/* Controles de dados */}
        <div className="dice-controls" style={{ position: 'absolute', left: 12, top: 12, zIndex: 5, background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
          <button className="btn" onClick={rollDice} disabled={!isMyTurn || rollingDice} title={isMyTurn ? 'Tu turno' : 'No es tu turno'}>
            {rollingDice ? 'Tirando...' : 'Tirar dados'}
          </button>
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            Dado: {gameState.last_dice_value ?? '—'}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
            {isMyTurn ? '✓ Tu turno' : `Turno: ${gameState.players.find(p => p.id === activePlayerId)?.name ?? '—'}`}
          </div>
          {validMoves && (
            <div style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Movimientos válidos:</div>
              <pre style={{ fontSize: 10, background: 'var(--bg-primary)', padding: 6, borderRadius: 4, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(validMoves, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Capa para las fichas */}
        <GameTokens 
          gameState={gameState} 
          boardDimensions={boardDimensions}
          selectedPieceId={selectedPieceId}
          onPieceClick={handlePieceClick}
          onPositionClick={handlePositionClick}
          diceValues={diceValues}
          activePlayerId={activePlayerId}
          myPlayerId={myPlayerId}
        />
      </div>
    </div>
  );
};

