import React from 'react';
import { type GameState, type Piece, type Player } from '../../types/game';
import styles from './GameTokens.module.css';

interface BoardDimensions {
  imageWidth: number;
  imageHeight: number;
  imageX: number;
  imageY: number;
}

const GameTokens: React.FC<{ gameState: GameState; boardDimensions: BoardDimensions }> = ({ gameState, boardDimensions }) => {
  const BOARD_SIZE = 68;
  const GOAL_POSITIONS = 8;

  const COLOR_THEME: Record<string, { bg: string; text: string; border: string }> = {
    RED: { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
    BLUE: { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' },
    GREEN: { bg: '#22c55e', text: '#ffffff', border: '#16a34a' },
    YELLOW: { bg: '#eab308', text: '#1f2937', border: '#ca8a04' },
  };

  const GOAL_ENTRY_POSITIONS: Record<string, number> = {
    RED: 0,
    BLUE: 17,
    YELLOW: 34,
    GREEN: 51,
  };

  // Calcular coordenadas para posiciones del tablero principal (0-67)
  // El tablero es circular, así que mapeamos las posiciones a coordenadas porcentuales
  const getBoardPositionCoords = (position: number): { x: number; y: number } => {
    // Normalizar posición (0-67)
    const normalizedPos = position % BOARD_SIZE;

    // Dividir el tablero en 4 cuadrantes (cada uno con ~17 posiciones)
    // Top: 0-16, Right: 17-33, Bottom: 34-50, Left: 51-67
    if (normalizedPos >= 0 && normalizedPos <= 16) {
      // Top horizontal (de izquierda a derecha)
      const progress = normalizedPos / 16;
      return { x: 15 + progress * 70, y: 12 };
    } else if (normalizedPos >= 17 && normalizedPos <= 33) {
      // Right vertical (de arriba a abajo)
      const progress = (normalizedPos - 17) / 16;
      return { x: 88, y: 15 + progress * 70 };
    } else if (normalizedPos >= 34 && normalizedPos <= 50) {
      // Bottom horizontal (de derecha a izquierda)
      const progress = (normalizedPos - 34) / 16;
      return { x: 85 - progress * 70, y: 88 };
    } else {
      // Left vertical (de abajo a arriba)
      const progress = (normalizedPos - 51) / 16;
      return { x: 12, y: 85 - progress * 70 };
    }
  };

  // Calcular coordenadas para fichas en casa (4 posiciones por jugador)
  const getHomePositionCoords = (color: string, pieceIndex: number): { x: number; y: number } => {
    const homePositions: Record<string, { x: number; y: number }[]> = {
      RED: [
        { x: 8, y: 8 },   // Top-left corner
        { x: 8, y: 4 },
        { x: 4, y: 8 },
        { x: 4, y: 4 },
      ],
      GREEN: [
        { x: 92, y: 8 },  // Top-right corner
        { x: 96, y: 8 },
        { x: 92, y: 4 },
        { x: 96, y: 4 },
      ],
      YELLOW: [
        { x: 8, y: 92 },  // Bottom-left corner
        { x: 8, y: 96 },
        { x: 4, y: 92 },
        { x: 4, y: 96 },
      ],
      BLUE: [
        { x: 92, y: 92 }, // Bottom-right corner
        { x: 96, y: 92 },
        { x: 92, y: 96 },
        { x: 96, y: 96 },
      ],
    };

    const positions = homePositions[color.toUpperCase()] || homePositions.RED;
    return positions[pieceIndex % 4];
  };

  // Calcular coordenadas para fichas en meta (8 posiciones por jugador)
  const getGoalPositionCoords = (color: string, goalIndex: number): { x: number; y: number } => {
    // goalIndex: 0-7 (8 posiciones de meta)
    const progress = (goalIndex + 1) / (GOAL_POSITIONS + 1);

    const goalPaths: Record<string, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
      RED: {
        start: { x: 50, y: 12 },
        end: { x: 50, y: 35 },
      },
      GREEN: {
        start: { x: 88, y: 50 },
        end: { x: 65, y: 50 },
      },
      YELLOW: {
        start: { x: 50, y: 88 },
        end: { x: 50, y: 65 },
      },
      BLUE: {
        start: { x: 12, y: 50 },
        end: { x: 35, y: 50 },
      },
    };

    const path = goalPaths[color.toUpperCase()] || goalPaths.RED;
    return {
      x: path.start.x + (path.end.x - path.start.x) * progress,
      y: path.start.y + (path.end.y - path.start.y) * progress,
    };
  };

  // Obtener todas las fichas con sus coordenadas
  const getAllPiecesWithCoords = () => {
    const pieces: Array<{ piece: Piece; player: Player; x: number; y: number }> = [];

    gameState.players.forEach((player) => {
      player.pieces.forEach((piece, index) => {
        let coords: { x: number; y: number };

        if (piece.status === 'home') {
          coords = getHomePositionCoords(player.color, index);
        } else if (piece.status === 'goal') {
          // Para fichas en meta, la posición relativa a la entrada de meta
          const entryPos = GOAL_ENTRY_POSITIONS[player.color.toUpperCase()] || 0;
          const goalIndex = piece.position - entryPos - 1;
          coords = getGoalPositionCoords(player.color, Math.max(0, Math.min(goalIndex, GOAL_POSITIONS - 1)));
        } else if (piece.status === 'board' || piece.status === 'safe_zone') {
          // Fichas en el tablero (board o safe_zone)
          coords = getBoardPositionCoords(piece.position);
        } else {
          // Estado desconocido, usar posición del tablero por defecto
          coords = getBoardPositionCoords(piece.position);
        }

        pieces.push({ piece, player, ...coords });
      });
    });

    return pieces;
  };

  // Renderizar una ficha
  const renderPiece = (piece: Piece, player: Player, x: number, y: number) => {
    const color = COLOR_THEME[player.color.toUpperCase()] || COLOR_THEME.RED;
    const pieceNumber = piece.id.split('-').pop()?.slice(-1) || '?';

    // Si no hay dimensiones calculadas aún, no renderizar
    if (!boardDimensions.imageWidth || !boardDimensions.imageHeight) return null;

    // Convertir coords porcentuales (0-100) a píxeles sobre el área de imagen ('contain')
    const absoluteX = boardDimensions.imageX + (x / 100) * boardDimensions.imageWidth;
    const absoluteY = boardDimensions.imageY + (y / 100) * boardDimensions.imageHeight;

    return (
      <div
        key={piece.id}
        className={styles.token}
        style={{ left: `${absoluteX}px`, top: `${absoluteY}px` }}
        title={`${player.name} - Ficha ${pieceNumber} - Pos: ${piece.position}`}
      >
        <div
          className={styles['token-inner']}
          style={{ backgroundColor: color.bg, borderColor: color.border, color: color.text }}
        >
          {pieceNumber}
        </div>
      </div>
    );
  };

  const piecesWithCoords = getAllPiecesWithCoords();

  return (
    <div className={styles['tokens-overlay']}>
      {piecesWithCoords.map(({ piece, player, x, y }) =>
        renderPiece(piece, player, x, y)
      )}
    </div>
  );
};

export default GameTokens;