import { Point, Player, Enemy, Bullet, Particle, GameState } from '../types';

export const PLAYER_RADIUS = 15;
export const BULLET_RADIUS = 4;
export const ENEMY_RADIUS = 12;

export const createPlayer = (x: number, y: number): Player => ({
  x,
  y,
  radius: PLAYER_RADIUS,
  color: '#00ffcc',
  health: 100,
  maxHealth: 100,
  score: 0,
  speed: 5,
});

export const createBullet = (x: number, y: number, targetX: number, targetY: number): Bullet => {
  const angle = Math.atan2(targetY - y, targetX - x);
  const speed = 10;
  return {
    x,
    y,
    radius: BULLET_RADIUS,
    color: '#ffff00',
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    damage: 25,
  };
};

export const createEnemy = (width: number, height: number, player: Player, wave: number): Enemy => {
  let x, y;
  const side = Math.floor(Math.random() * 4);
  
  if (side === 0) { // Top
    x = Math.random() * width;
    y = -20;
  } else if (side === 1) { // Right
    x = width + 20;
    y = Math.random() * height;
  } else if (side === 2) { // Bottom
    x = Math.random() * width;
    y = height + 20;
  } else { // Left
    x = -20;
    y = Math.random() * height;
  }

  const typeRand = Math.random();
  let type: Enemy['type'] = 'standard';
  let health = 50 + (wave * 5);
  let speed = 2 + (Math.random() * 1);
  let color = '#ff0055';
  let radius = ENEMY_RADIUS;

  if (typeRand > 0.8) {
    type = 'tank';
    health *= 3;
    speed *= 0.5;
    color = '#9900ff';
    radius *= 1.5;
  } else if (typeRand > 0.6) {
    type = 'fast';
    health *= 0.5;
    speed *= 1.8;
    color = '#ffaa00';
    radius *= 0.8;
  }

  return { x, y, radius, color, velocity: { x: 0, y: 0 }, health, speed, type };
};

export const createParticle = (x: number, y: number, color: string): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 4 + 1;
  const life = Math.random() * 30 + 20;
  return {
    x,
    y,
    radius: Math.random() * 3 + 1,
    color,
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    life,
    maxLife: life,
    opacity: 1,
  };
};
