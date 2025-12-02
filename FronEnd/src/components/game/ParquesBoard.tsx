import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { GameState } from '../../types/game';
import GameTokens from './GameTokens';
import tableroImage from './tablero.jpeg';
import styles from './GameBoard.module.css';

export const ParquesBoard: React.FC<{ gameState: GameState; onRefresh: () => Promise<void> }> = ({ gameState, onRefresh }) => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  // Dice state removed; handled in DicePanel
  const myPlayerId = authService.getUser() ? String(authService.getUser()!.id) : null;
  // Turn logic handled in DicePanel

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

  // Dice controls relocated to sidebar; keep tokens logic only

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

        {/* Dados movidos al panel lateral (DicePanel) */}

        <GameTokens 
          gameState={gameState} 
          boardDimensions={boardDimensions}
          selectedPieceId={selectedPieceId}
          onPieceClick={handlePieceClick}
          onPositionClick={handlePositionClick}
          diceValues={gameState?.last_dice_value ? [gameState.last_dice_value] : []}
          activePlayerId={gameState.current_player_id}
          myPlayerId={myPlayerId}
        />
      </div>
    </div>
  );
};

export default ParquesBoard;