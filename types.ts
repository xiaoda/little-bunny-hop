
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type ItemType = 'carrot' | 'rock';

export interface GameItem {
  id: number;
  type: ItemType;
  lane: number; // 0, 1, 2
  y: number; // Percentage down the screen (0-100)
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
}
