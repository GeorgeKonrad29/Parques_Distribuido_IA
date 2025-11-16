import { API_BASE_URL } from '../types/api';
import { authService } from './authService';

export interface Game {
  id: string;
  name: string;
  status: string;
  max_players: number;
  current_players: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface GameCreateRequest {
  name: string;
  max_players: number;
  is_private: boolean;
  password?: string;
  creator_color: string;
}

export interface GameJoinRequest {
  color: string;
  password?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  pieces: Piece[];
  is_ai: boolean;
}

export interface Piece {
  id: string;
  position: number;
  status: string;
}

export interface GameState {
  id: string;
  status: string;
  players: Player[];
  current_player_id: string | null;
  board: { [key: number]: string[] };
  last_dice_value: number | null;
  winner_id: string | null;
}

class GameService {
  private baseUrl = `${API_BASE_URL}/api/v1/games`;

  async getAvailableGames(): Promise<Game[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener juegos disponibles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available games:', error);
      throw error;
    }
  }

  async createGame(request: GameCreateRequest): Promise<Game> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear juego');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  async joinGame(gameId: string, request: GameJoinRequest): Promise<Player> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al unirse al juego');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  }

  async getGameState(gameId: string): Promise<GameState> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/${gameId}/state`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estado del juego');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching game state:', error);
      throw error;
    }
  }

  async startGame(gameId: string): Promise<void> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/${gameId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al iniciar juego');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  async leaveGame(gameId: string): Promise<void> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/${gameId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al abandonar juego');
      }
    } catch (error) {
      console.error('Error leaving game:', error);
      throw error;
    }
  }

  async rollDice(gameId: string): Promise<number> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/${gameId}/roll-dice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al lanzar dado');
      }

      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error('Error rolling dice:', error);
      throw error;
    }
  }
}

export const gameService = new GameService();
