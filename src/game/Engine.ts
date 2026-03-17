import { GameState, Point } from '../types';
import { createPlayer, createBullet, createEnemy, createParticle } from './entities';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private keys: Set<string> = new Set();
  private mousePos: Point = { x: 0, y: 0 };
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.state = this.getInitialState();
    this.setupListeners();
  }

  private getInitialState(): GameState {
    return {
      player: createPlayer(this.canvas.width / 2, this.canvas.height / 2),
      bullets: [],
      enemies: [],
      particles: [],
      isGameOver: false,
      isPaused: false,
      wave: 1,
      enemySpawnTimer: 0,
    };
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    });
    window.addEventListener('mousedown', () => {
      if (!this.state.isGameOver && !this.state.isPaused) {
        this.shoot();
      }
    });
  }

  private shoot() {
    const bullet = createBullet(
      this.state.player.x,
      this.state.player.y,
      this.mousePos.x,
      this.mousePos.y
    );
    this.state.bullets.push(bullet);
  }

  public start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public reset() {
    this.state = this.getInitialState();
  }

  public setPaused(paused: boolean) {
    this.state.isPaused = paused;
  }

  private loop(currentTime: number) {
    const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalized to 60fps
    this.lastTime = currentTime;

    if (!this.state.isPaused && !this.state.isGameOver) {
      this.update(deltaTime);
    }
    this.draw();

    this.animationFrameId = requestAnimationFrame((time) => this.loop(time));
  }

  private update(dt: number) {
    const { player, bullets, enemies, particles } = this.state;

    // Player movement
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) player.y -= player.speed * dt;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) player.y += player.speed * dt;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) player.x -= player.speed * dt;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) player.x += player.speed * dt;

    // Bound player
    player.x = Math.max(player.radius, Math.min(this.canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(this.canvas.height - player.radius, player.y));

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.velocity.x * dt;
      b.y += b.velocity.y * dt;

      if (b.x < 0 || b.x > this.canvas.width || b.y < 0 || b.y > this.canvas.height) {
        bullets.splice(i, 1);
      }
    }

    // Update enemies
    this.state.enemySpawnTimer -= dt;
    if (this.state.enemySpawnTimer <= 0) {
      this.state.enemies.push(createEnemy(this.canvas.width, this.canvas.height, player, this.state.wave));
      this.state.enemySpawnTimer = Math.max(10, 60 - (this.state.wave * 2));
      
      // Wave progression
      if (this.state.enemies.length % 10 === 0 && this.state.enemies.length > 0) {
        this.state.wave++;
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      e.x += (dx / dist) * e.speed * dt;
      e.y += (dy / dist) * e.speed * dt;

      // Collision with player
      if (dist < player.radius + e.radius) {
        player.health -= 0.5 * dt;
        if (player.health <= 0) {
          this.state.isGameOver = true;
        }
      }

      // Collision with bullets
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const bdx = b.x - e.x;
        const bdy = b.y - e.y;
        const bdist = Math.sqrt(bdx * bdx + bdy * bdy);

        if (bdist < e.radius + b.radius) {
          e.health -= b.damage;
          bullets.splice(j, 1);
          
          // Hit particles
          for (let k = 0; k < 3; k++) {
            particles.push(createParticle(b.x, b.y, e.color));
          }

          if (e.health <= 0) {
            player.score += e.type === 'tank' ? 50 : (e.type === 'fast' ? 20 : 10);
            // Explosion particles
            for (let k = 0; k < 10; k++) {
              particles.push(createParticle(e.x, e.y, e.color));
            }
            enemies.splice(i, 1);
            break;
          }
        }
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.velocity.x * dt;
      p.y += p.velocity.y * dt;
      p.life -= dt;
      p.opacity = p.life / p.maxLife;

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  private draw() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const { player, bullets, enemies, particles } = this.state;

    // Draw particles
    particles.forEach(p => {
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Draw bullets
    bullets.forEach(b => {
      this.ctx.fillStyle = b.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = b.color;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw enemies
    enemies.forEach(e => {
      this.ctx.fillStyle = e.color;
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = e.color;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Health bar for enemies
      const healthPct = e.health / (e.type === 'tank' ? 150 : (e.type === 'fast' ? 25 : 50));
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(e.x - 10, e.y - e.radius - 8, 20, 3);
      this.ctx.fillStyle = e.color;
      this.ctx.fillRect(e.x - 10, e.y - e.radius - 8, 20 * healthPct, 3);
      this.ctx.shadowBlur = 0;
    });

    // Draw player
    this.ctx.fillStyle = player.color;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = player.color;
    this.ctx.beginPath();
    this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Player aim line
    this.ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(player.x, player.y);
    this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.shadowBlur = 0;
  }

  public getState() {
    return this.state;
  }
}
