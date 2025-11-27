import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, Dice5, Crown } from 'lucide-react';
import { gameService} from '../../services/gameService';
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

            <button onClick={fetchGameState} className={styles.refreshButton}>
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
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

                <ParquesBoard gameState={gameState} />
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
const ParquesBoard: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
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

  // Handlers de arrastre (drag-to-pan)
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPan({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
    };

    const onPointerUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    // Cleanup defensivo si el componente se desmonta durante el drag
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignorar clicks con botones distintos al primario
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.originX = pan.x;
    dragRef.current.originY = pan.y;
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const onPointerMove = (evt: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = evt.clientX - dragRef.current.startX;
      const dy = evt.clientY - dragRef.current.startY;
      setPan({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
    };
    const onPointerUp = () => {
      dragRef.current.dragging = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

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

  return (
    <div className={styles.boardWrapper}>
      {/* Tablero con overlay visual */}
      <div
        ref={boardRef}
        className={`${styles.boardContainer} ${isDragging ? styles.grabbing : styles.grab}`}
        style={{
          backgroundImage: `url(${tableroImage})`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
        }}
        onPointerDown={onPointerDown}
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

        {/* Capa para las fichas */}
        <GameTokens gameState={gameState} boardDimensions={boardDimensions} />
      </div>
    </div>
  );
};

