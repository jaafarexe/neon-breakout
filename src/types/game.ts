export type BrickType =
  | 'cyan'     // 1 hit, 100 pts
  | 'green'    // 1 hit, 120 pts
  | 'yellow'   // 1 hit, 150 pts
  | 'pink'     // 1 hit, 200 pts
  | 'purple'   // 2 hits, 300 pts
  | 'steel'    // 3 hits, armored, 500 pts
  | 'bomb'     // explosive brick, clears adjacent, 400 pts
  | 'mystery'; // contains guaranteed power-up

export type PowerUpType =
  | 'multiball' // Spawns 2 extra balls
  | 'laser'     // Laser cannons on paddle
  | 'expand'    // Wider paddle
  | 'slow'      // Slow down balls
  | 'fireball'  // Ball burns through bricks without rebounding
  | 'shield'    // Bottom laser barrier protects against 1 ball loss
  | 'life';     // Extra heart/life

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
  baseSpeed: number;
  isFireball: boolean;
  stuck: boolean;
  stuckOffsetX: number;
  trail: TrailPoint[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  baseWidth: number;
  targetX: number;
  hasLaser: boolean;
  hasCatch: boolean;
  laserCooldown: number;
}

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  col: number;
  type: BrickType;
  hp: number;
  maxHp: number;
  color: string;
  glow: string;
  points: number;
  powerUpDrop?: PowerUpType;
  isDestroyed: boolean;
  pulseTimer?: number;
}

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  width: number;
  height: number;
  color: string;
  symbol: string;
  label: string;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeLeft: number; // in seconds
  totalDuration: number;
  label: string;
  color: string;
}

export interface LaserBeam {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'debris' | 'shockwave';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export type GameState =
  | 'START'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_TRANSITION'
  | 'GAME_OVER'
  | 'VICTORY';

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  level: number;
  combo: number;
  maxCombo: number;
  bricksDestroyed: number;
  powerupsCollected: number;
}
