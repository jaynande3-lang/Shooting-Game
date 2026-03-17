export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  radius: number;
  color: string;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  score: number;
  speed: number;
}

export interface Bullet extends Entity {
  velocity: Point;
  damage: number;
}

export interface Enemy extends Entity {
  velocity: Point;
  health: number;
  speed: number;
  type: 'standard' | 'fast' | 'tank';
}

export interface Particle extends Entity {
  velocity: Point;
  life: number;
  maxLife: number;
  opacity: number;
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  particles: Particle[];
  isGameOver: boolean;
  isPaused: boolean;
  wave: number;
  enemySpawnTimer: number;
}
