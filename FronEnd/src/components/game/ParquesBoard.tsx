import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { GameState } from '../../types/game';
import GameTokens from './GameTokens';
import tableroImage from './tablero.jpeg';
import styles from './GameBoard.module.css';

export const ParquesBoard: React.FC<{ gameState: GameState; onRefresh: () => Promise<void> }> = ({ gameState, onRefresh }) => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [diceValues, setDiceValues] = useState<number[]>([]);
  const [validMoves, setValidMoves] = useState<any>(null);
  const [rollingDice, setRollingDice] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const myPlayerId = authService.getUser() ? String(authService.getUser()!.id) : null;
  const isMyTurn = gameState?.current_player_id === myPlayerId;

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

  useEffect(() => {
    let ro: ResizeObserver | null = null;

    const updateDimensions = () => {
      if (!boardRef.current) return;

      const container = boardRef.current;
      const containerRect = container.getBoundingClientRect();

      const img = new Image();
      img.src = tableroImage;

      img.onload = () => {
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const containerLeft = containerRect.left + window.scrollX;
        const containerTop = containerRect.top + window.scrollY;

        const imageAspectRatio = img.naturalWidth / img.naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let imageWidth = 0,
          imageHeight = 0,
          imageX = 0,
          imageY = 0;

        if (containerAspectRatio > imageAspectRatio) {
          imageHeight = containerHeight;
          imageWidth = imageHeight * imageAspectRatio;
          imageX = (containerWidth - imageWidth) / 2;
          imageY = 0;
        } else {
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

    gameState.players = updatedPlayers;
    setSelectedPieceId(null);
  };

  const rollDice = async () => {
    if (!gameState?.id || rollCount >= 2) return;
    setRollingDice(true);
    try {
      const diceValue = await (await import('../../services/gameService')).gameService.rollDice(String(gameState.id));
      setDiceValues([diceValue]);

      await onRefresh();

      const moves = await (await import('../../services/gameService')).gameService.getValidMoves(String(gameState.id), diceValue);
      setValidMoves(moves);

      const newCount = rollCount + 1;
      setRollCount(newCount);
      if (newCount >= 2 && isMyTurn) {
        await handlePassTurn();
      }
    } catch (err) {
      setValidMoves({ error: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setRollingDice(false);
    }
  };

  const handlePassTurn = async () => {
    if (!gameState?.id) return;
    try {
      await (await import('../../services/gameService')).gameService.passTurn(String(gameState.id));
      setRollCount(0);
      setDiceValues([]);
      setValidMoves(null);
      await onRefresh();
    } catch (err) {
      // noop
    }
  };

  return (
    <div className={styles.boardWrapper}>
      <div
        ref={boardRef}
        className={styles.boardContainer}
        style={{
          backgroundImage: `url(${tableroImage})`,
        }}
      >
        {boardDimensions.imageWidth > 0 && (
          <div
            className={styles.imageOverlay}
            style={{
              left: `${boardDimensions.imageX}px`,
              top: `${boardDimensions.imageY}px`,
              width: `${boardDimensions.imageWidth}px`,
              height: `${boardDimensions.imageHeight}px`,
            }}
          />
        )}

        <div className="dice-controls" style={{ position: 'absolute', left: 12, top: 12, zIndex: 5, background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
          <button className="btn" onClick={rollDice} disabled={ rollingDice || rollCount >= 2} >
            {rollingDice ? 'Tirando...' : 'Tirar dados'}
          </button>
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            Dado: {gameState.last_dice_value ?? '—'}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
            Tiros restantes: {Math.max(0, 2 - rollCount)}
          </div>
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={handlePassTurn} disabled={!isMyTurn || rollingDice || rollCount < 2}>
              Pasar turno
            </button>
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

        <GameTokens 
          gameState={gameState} 
          boardDimensions={boardDimensions}
          selectedPieceId={selectedPieceId}
          onPieceClick={handlePieceClick}
          onPositionClick={handlePositionClick}
          diceValues={diceValues}
          activePlayerId={gameState.current_player_id}
          myPlayerId={myPlayerId}
        />
      </div>
    </div>
  );
};

export default ParquesBoard;