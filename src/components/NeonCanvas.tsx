import React, { useRef, useEffect, useCallback } from 'react';
import {
  Ball,
  Paddle,
  Brick,
  PowerUpItem,
  ActivePowerUp,
  LaserBeam,
  Particle,
  FloatingText,
  GameState,
  GameStats,
  PowerUpType,
} from '../types/game';
import { createBricksForLevel, getLevelConfig } from '../utils/levels';
import { soundFx } from '../utils/audio';

interface NeonCanvasProps {
  gameState: GameState;
  stats: GameStats;
  activePowerUps: ActivePowerUp[];
  onStatsChange: (updater: (prev: GameStats) => GameStats) => void;
  onActivePowerUpsChange: (updater: (prev: ActivePowerUp[]) => ActivePowerUp[]) => void;
  onLevelCleared: () => void;
  onGameOver: () => void;
  onTogglePause: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BASE_PADDLE_WIDTH = 110;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 7;

export const NeonCanvas: React.FC<NeonCanvasProps> = ({
  gameState,
  stats,
  activePowerUps,
  onStatsChange,
  onActivePowerUpsChange,
  onLevelCleared,
  onGameOver,
  onTogglePause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game entity references that mutate inside requestAnimationFrame
  const paddleRef = useRef<Paddle>({
    x: CANVAS_WIDTH / 2 - BASE_PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 38,
    width: BASE_PADDLE_WIDTH,
    baseWidth: BASE_PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    targetX: CANVAS_WIDTH / 2 - BASE_PADDLE_WIDTH / 2,
    hasLaser: false,
    hasCatch: false,
    laserCooldown: 0,
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const hasShieldRef = useRef<boolean>(false);

  // Screen shake timer and intensity
  const shakeRef = useRef<{ intensity: number; decay: number }>({ intensity: 0, decay: 0.9 });

  // Input states
  const keysRef = useRef<{ left: boolean; right: boolean; space: boolean }>({
    left: false,
    right: false,
    space: false,
  });

  // Combo timer to reset combo after no bricks hit for 3 seconds
  const comboTimerRef = useRef<number>(0);

  // Track animation frame
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize level
  const initLevel = useCallback((levelIndex: number) => {
    const config = getLevelConfig(levelIndex);
    const newBricks = createBricksForLevel(levelIndex, CANVAS_WIDTH);
    bricksRef.current = newBricks;

    // Reset paddle
    paddleRef.current = {
      x: CANVAS_WIDTH / 2 - BASE_PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 38,
      width: BASE_PADDLE_WIDTH,
      baseWidth: BASE_PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      targetX: CANVAS_WIDTH / 2 - BASE_PADDLE_WIDTH / 2,
      hasLaser: false,
      hasCatch: false,
      laserCooldown: 0,
    };

    // Reset ball stuck to paddle
    ballsRef.current = [
      {
        id: 'ball_main',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 38 - BALL_RADIUS - 1,
        dx: 0,
        dy: 0,
        radius: BALL_RADIUS,
        speed: config.ballSpeed,
        baseSpeed: config.ballSpeed,
        isFireball: false,
        stuck: true,
        stuckOffsetX: 0,
        trail: [],
      },
    ];

    // Clear active effects & drops
    powerUpsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    hasShieldRef.current = false;
    onActivePowerUpsChange(() => []);
  }, [onActivePowerUpsChange]);

  // Load level when stats.level changes
  useEffect(() => {
    initLevel(stats.level - 1);
  }, [stats.level, initLevel]);

  // Spawn visual floating text
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -1.4,
      color,
      alpha: 1.0,
      life: 0,
      maxLife: 45,
    });
  }, []);

  // Spawn visual particle blast
  const spawnParticles = useCallback((
    x: number,
    y: number,
    color: string,
    count: number = 16,
    type: 'spark' | 'smoke' | 'debris' | 'shockwave' = 'spark'
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 20),
        type,
      });
    }
  }, []);

  // Trigger screen shake
  const triggerShake = (intensity: number) => {
    shakeRef.current.intensity = Math.max(shakeRef.current.intensity, intensity);
  };

  // Launch stuck balls
  const launchBall = useCallback(() => {
    let launchedAny = false;
    ballsRef.current.forEach((b) => {
      if (b.stuck) {
        b.stuck = false;
        // Launch at an upward angle slightly influenced by offset
        const angle = -Math.PI / 2 + (Math.random() * 0.4 - 0.2);
        b.dx = Math.sin(angle) * b.speed;
        b.dy = Math.cos(angle) * b.speed;
        launchedAny = true;
      }
    });

    if (launchedAny) {
      soundFx.playPaddleHit();
    }
  }, []);

  // Fire laser cannons
  const fireLasers = useCallback(() => {
    if (!paddleRef.current.hasLaser || paddleRef.current.laserCooldown > 0) return;

    paddleRef.current.laserCooldown = 14; // cooldown frames (~230ms)
    soundFx.playLaser();

    const paddle = paddleRef.current;
    // Left cannon and Right cannon
    lasersRef.current.push({
      id: Math.random().toString(),
      x: paddle.x + 8,
      y: paddle.y - 6,
      vy: -12,
      width: 4,
      height: 14,
      color: '#ff0077',
    });
    lasersRef.current.push({
      id: Math.random().toString(),
      x: paddle.x + paddle.width - 12,
      y: paddle.y - 6,
      vy: -12,
      width: 4,
      height: 14,
      color: '#ff0077',
    });
  }, []);

  // Handle Power-Up Collection
  const activatePowerUp = useCallback((type: PowerUpType) => {
    soundFx.playPowerUpCollect();
    onStatsChange((prev) => ({
      ...prev,
      powerupsCollected: prev.powerupsCollected + 1,
      score: prev.score + 250,
    }));

    const paddle = paddleRef.current;

    switch (type) {
      case 'multiball': {
        addFloatingText('MULTI-BALL!', paddle.x + paddle.width / 2, paddle.y - 20, '#00f0ff');
        // Duplicate existing balls or spawn 2 more
        const baseBall = ballsRef.current[0] || {
          x: paddle.x + paddle.width / 2,
          y: paddle.y - 20,
          speed: 6.5,
          baseSpeed: 6.5,
        };
        const currentSpeed = baseBall.speed || 6.5;

        for (let i = 0; i < 2; i++) {
          const angle = -Math.PI / 2 + (i === 0 ? -0.45 : 0.45);
          ballsRef.current.push({
            id: `ball_extra_${Math.random()}`,
            x: baseBall.x,
            y: baseBall.y,
            dx: Math.sin(angle) * currentSpeed,
            dy: Math.cos(angle) * currentSpeed,
            radius: BALL_RADIUS,
            speed: currentSpeed,
            baseSpeed: currentSpeed,
            isFireball: baseBall.isFireball || false,
            stuck: false,
            stuckOffsetX: 0,
            trail: [],
          });
        }
        break;
      }

      case 'laser': {
        addFloatingText('LASER CANNONS!', paddle.x + paddle.width / 2, paddle.y - 20, '#ff0077');
        paddle.hasLaser = true;
        onActivePowerUpsChange((prev) => [
          ...prev.filter((p) => p.type !== 'laser'),
          { type: 'laser', timeLeft: 12, totalDuration: 12, label: 'Laser Cannons', color: '#ff0077' },
        ]);
        break;
      }

      case 'expand': {
        addFloatingText('WIDE PADDLE!', paddle.x + paddle.width / 2, paddle.y - 20, '#bd00ff');
        paddle.width = paddle.baseWidth * 1.5;
        // Keep within screen
        if (paddle.x + paddle.width > CANVAS_WIDTH) {
          paddle.x = CANVAS_WIDTH - paddle.width;
        }
        onActivePowerUpsChange((prev) => [
          ...prev.filter((p) => p.type !== 'expand'),
          { type: 'expand', timeLeft: 14, totalDuration: 14, label: 'Wide Paddle', color: '#bd00ff' },
        ]);
        break;
      }

      case 'fireball': {
        addFloatingText('FIREBALL!', paddle.x + paddle.width / 2, paddle.y - 20, '#ff7700');
        ballsRef.current.forEach((b) => (b.isFireball = true));
        onActivePowerUpsChange((prev) => [
          ...prev.filter((p) => p.type !== 'fireball'),
          { type: 'fireball', timeLeft: 9, totalDuration: 9, label: 'Piercing Fireball', color: '#ff7700' },
        ]);
        break;
      }

      case 'slow': {
        addFloatingText('SLOW MOTION!', paddle.x + paddle.width / 2, paddle.y - 20, '#00ff88');
        ballsRef.current.forEach((b) => {
          b.speed = b.baseSpeed * 0.65;
          const currAngle = Math.atan2(b.dy, b.dx);
          b.dx = Math.cos(currAngle) * b.speed;
          b.dy = Math.sin(currAngle) * b.speed;
        });
        onActivePowerUpsChange((prev) => [
          ...prev.filter((p) => p.type !== 'slow'),
          { type: 'slow', timeLeft: 10, totalDuration: 10, label: 'Slow Motion', color: '#00ff88' },
        ]);
        break;
      }

      case 'shield': {
        addFloatingText('SAFETY BARRIER!', paddle.x + paddle.width / 2, paddle.y - 20, '#00f0ff');
        hasShieldRef.current = true;
        onActivePowerUpsChange((prev) => [
          ...prev.filter((p) => p.type !== 'shield'),
          { type: 'shield', timeLeft: 20, totalDuration: 20, label: 'Safety Net', color: '#00f0ff' },
        ]);
        break;
      }

      case 'life': {
        addFloatingText('+1 LIFE CORE!', paddle.x + paddle.width / 2, paddle.y - 20, '#ff0077');
        onStatsChange((prev) => ({
          ...prev,
          lives: Math.min(prev.maxLives, prev.lives + 1),
        }));
        break;
      }
    }
  }, [addFloatingText, onActivePowerUpsChange, onStatsChange]);

  // Handle Brick Hit & Destruction
  const hitBrick = useCallback((brick: Brick, isLaser: boolean = false, isBombRadius: boolean = false) => {
    if (brick.isDestroyed) return;

    brick.hp -= 1;

    if (brick.hp <= 0) {
      brick.isDestroyed = true;
      soundFx.playBrickDestroy();

      // Combo handling
      comboTimerRef.current = 180; // 3 seconds at 60fps
      onStatsChange((prev) => {
        const newCombo = prev.combo + 1;
        const pts = brick.points * newCombo;
        return {
          ...prev,
          score: prev.score + pts,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          bricksDestroyed: prev.bricksDestroyed + 1,
        };
      });

      // Visual feedback
      spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 18, 'debris');
      addFloatingText(`+${brick.points}`, brick.x + brick.width / 2, brick.y, brick.color);

      // Handle Bomb explosion
      if (brick.type === 'bomb' && !isBombRadius) {
        soundFx.playBombExplosion();
        triggerShake(10);
        spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#ff3b30', 35, 'shockwave');

        const blastRadius = 90;
        bricksRef.current.forEach((other) => {
          if (!other.isDestroyed && other.id !== brick.id) {
            const dist = Math.hypot(
              other.x + other.width / 2 - (brick.x + brick.width / 2),
              other.y + other.height / 2 - (brick.y + brick.height / 2)
            );
            if (dist < blastRadius) {
              hitBrick(other, false, true);
            }
          }
        });
      }

      // Handle Power-Up drop
      if (brick.powerUpDrop) {
        soundFx.playPowerUpSpawn();
        const type = brick.powerUpDrop;
        let symbol = '★';
        let color = '#00f0ff';
        let label = 'Power-Up';

        switch (type) {
          case 'multiball':
            symbol = '●●';
            color = '#00f0ff';
            label = 'Multi-Ball';
            break;
          case 'laser':
            symbol = '⚡';
            color = '#ff0077';
            label = 'Laser';
            break;
          case 'expand':
            symbol = '⬌';
            color = '#bd00ff';
            label = 'Wide';
            break;
          case 'fireball':
            symbol = '🔥';
            color = '#ff7700';
            label = 'Fire';
            break;
          case 'slow':
            symbol = '⏳';
            color = '#00ff88';
            label = 'Slow';
            break;
          case 'shield':
            symbol = '🛡';
            color = '#38bdf8';
            label = 'Shield';
            break;
          case 'life':
            symbol = '♥';
            color = '#ff0077';
            label = '+Life';
            break;
        }

        powerUpsRef.current.push({
          id: Math.random().toString(),
          x: brick.x + brick.width / 2 - 14,
          y: brick.y + brick.height / 2,
          vy: 2.3,
          type,
          width: 28,
          height: 18,
          color,
          symbol,
          label,
        });
      }

      // Check if all destructible bricks are destroyed
      const remainingBricks = bricksRef.current.filter((b) => !b.isDestroyed);
      if (remainingBricks.length === 0) {
        soundFx.playLevelComplete();
        onLevelCleared();
      }
    } else {
      // Brick damaged but not destroyed
      soundFx.playBrickHit(stats.combo);
      spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 8, 'spark');
      if (!isLaser) {
        triggerShake(3);
      }
    }
  }, [addFloatingText, onLevelCleared, onStatsChange, spawnParticles, stats.combo]);

  // Main Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // clamp delta
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const paddle = paddleRef.current;

      // Only advance physics if in PLAYING state
      if (gameState === 'PLAYING') {
        // 1. Combo timer decay
        if (comboTimerRef.current > 0) {
          comboTimerRef.current -= 1;
          if (comboTimerRef.current <= 0) {
            onStatsChange((prev) => ({ ...prev, combo: 0 }));
          }
        }

        // 2. Active power-ups timer decay
        onActivePowerUpsChange((prev) => {
          if (prev.length === 0) return prev;
          let changed = false;
          const next = prev
            .map((p) => {
              const remaining = p.timeLeft - dt;
              if (remaining <= 0) {
                changed = true;
                // Deactivate buff effects on expiration
                if (p.type === 'expand') {
                  paddle.width = paddle.baseWidth;
                } else if (p.type === 'laser') {
                  paddle.hasLaser = false;
                } else if (p.type === 'fireball') {
                  ballsRef.current.forEach((b) => (b.isFireball = false));
                } else if (p.type === 'slow') {
                  ballsRef.current.forEach((b) => {
                    b.speed = b.baseSpeed;
                    const angle = Math.atan2(b.dy, b.dx);
                    b.dx = Math.cos(angle) * b.speed;
                    b.dy = Math.sin(angle) * b.speed;
                  });
                } else if (p.type === 'shield') {
                  hasShieldRef.current = false;
                }
                return null;
              }
              return { ...p, timeLeft: remaining };
            })
            .filter(Boolean) as ActivePowerUp[];

          return changed ? next : prev;
        });

        // 3. Paddle keyboard movement
        const paddleMoveSpeed = 8.5;
        if (keysRef.current.left) {
          paddle.targetX = Math.max(0, paddle.x - paddleMoveSpeed);
        } else if (keysRef.current.right) {
          paddle.targetX = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + paddleMoveSpeed);
        }

        // Smooth paddle interpolation
        paddle.x += (paddle.targetX - paddle.x) * 0.35;
        paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));

        // Decrement laser cooldown
        if (paddle.laserCooldown > 0) {
          paddle.laserCooldown -= 1;
        }

        // 4. Update lasers
        for (let i = lasersRef.current.length - 1; i >= 0; i--) {
          const laser = lasersRef.current[i];
          laser.y += laser.vy;

          // Check laser vs bricks
          let hit = false;
          for (let b = 0; b < bricksRef.current.length; b++) {
            const brick = bricksRef.current[b];
            if (
              !brick.isDestroyed &&
              laser.x >= brick.x &&
              laser.x <= brick.x + brick.width &&
              laser.y >= brick.y &&
              laser.y <= brick.y + brick.height
            ) {
              hitBrick(brick, true);
              hit = true;
              break;
            }
          }

          if (hit || laser.y < -20) {
            lasersRef.current.splice(i, 1);
          }
        }

        // 5. Update power-ups falling
        for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
          const item = powerUpsRef.current[i];
          item.y += item.vy;

          // Check collision with paddle
          if (
            item.y + item.height >= paddle.y &&
            item.y <= paddle.y + paddle.height &&
            item.x + item.width >= paddle.x &&
            item.x <= paddle.x + paddle.width
          ) {
            activatePowerUp(item.type);
            spawnParticles(item.x + item.width / 2, item.y, item.color, 12, 'spark');
            powerUpsRef.current.splice(i, 1);
            continue;
          }

          // Offscreen
          if (item.y > CANVAS_HEIGHT + 20) {
            powerUpsRef.current.splice(i, 1);
          }
        }

        // 6. Update balls
        for (let i = ballsRef.current.length - 1; i >= 0; i--) {
          const ball = ballsRef.current[i];

          // Stuck to paddle (launch phase)
          if (ball.stuck) {
            ball.x = paddle.x + paddle.width / 2 + ball.stuckOffsetX;
            ball.y = paddle.y - ball.radius - 1;
            continue;
          }

          // Save trail history
          ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.8 });
          if (ball.trail.length > 7) {
            ball.trail.shift();
          }
          ball.trail.forEach((t) => (t.alpha *= 0.82));

          // Move ball
          ball.x += ball.dx;
          ball.y += ball.dy;

          // Wall collision: Left & Right
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.dx = Math.abs(ball.dx);
            soundFx.playPaddleHit();
            spawnParticles(ball.x, ball.y, '#00f0ff', 6, 'spark');
          } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - ball.radius;
            ball.dx = -Math.abs(ball.dx);
            soundFx.playPaddleHit();
            spawnParticles(ball.x, ball.y, '#00f0ff', 6, 'spark');
          }

          // Wall collision: Top
          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.dy = Math.abs(ball.dy);
            soundFx.playPaddleHit();
            spawnParticles(ball.x, ball.y, '#00f0ff', 6, 'spark');
          }

          // Paddle collision
          if (
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height &&
            ball.x >= paddle.x - ball.radius &&
            ball.x <= paddle.x + paddle.width + ball.radius &&
            ball.dy > 0
          ) {
            soundFx.playPaddleHit();
            spawnParticles(ball.x, paddle.y, '#00f0ff', 8, 'spark');

            // Calculate bounce angle based on hit position
            const paddleCenter = paddle.x + paddle.width / 2;
            const hitOffset = (ball.x - paddleCenter) / (paddle.width / 2);
            const clampedOffset = Math.max(-0.95, Math.min(0.95, hitOffset));

            // Max bounce angle 65 deg
            const maxAngle = Math.PI * 0.36;
            const bounceAngle = clampedOffset * maxAngle;

            // Maintain ball speed
            ball.dx = ball.speed * Math.sin(bounceAngle);
            ball.dy = -Math.abs(ball.speed * Math.cos(bounceAngle));

            // Prevent pure horizontal ping-pong
            if (Math.abs(ball.dy) < 2.0) {
              ball.dy = -2.0;
            }

            ball.y = paddle.y - ball.radius - 1;
          }

          // Bottom boundary collision (Safety net or Ball Lost)
          if (ball.y + ball.radius >= CANVAS_HEIGHT) {
            if (hasShieldRef.current) {
              // Safety Net catches the ball!
              ball.y = CANVAS_HEIGHT - ball.radius - 8;
              ball.dy = -Math.abs(ball.dy);
              soundFx.playPaddleHit();
              triggerShake(5);
              spawnParticles(ball.x, CANVAS_HEIGHT - 6, '#00f0ff', 20, 'shockwave');
              addFloatingText('BARRIER REFLECT!', ball.x, CANVAS_HEIGHT - 30, '#00f0ff');
              hasShieldRef.current = false;
              onActivePowerUpsChange((prev) => prev.filter((p) => p.type !== 'shield'));
            } else {
              // Ball fell out!
              ballsRef.current.splice(i, 1);
              continue;
            }
          }

          // Brick collisions
          for (let b = 0; b < bricksRef.current.length; b++) {
            const brick = bricksRef.current[b];
            if (brick.isDestroyed) continue;

            // Find closest point on brick to ball center
            const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
            const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
            const distX = ball.x - closestX;
            const distY = ball.y - closestY;
            const distanceSq = distX * distX + distY * distY;

            if (distanceSq <= ball.radius * ball.radius) {
              // Hit detected!
              hitBrick(brick);

              // If NOT a fireball, reflect ball trajectory
              if (!ball.isFireball) {
                // Determine collision normal based on penetration depth
                const overlapLeft = ball.x + ball.radius - brick.x;
                const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
                const overlapTop = ball.y + ball.radius - brick.y;
                const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                  ball.dx = -ball.dx;
                } else {
                  ball.dy = -ball.dy;
                }
              }
              break; // One brick collision per ball frame
            }
          }
        }

        // If all balls are lost:
        if (ballsRef.current.length === 0) {
          soundFx.playLifeLost();
          triggerShake(8);

          onStatsChange((prev) => {
            const nextLives = prev.lives - 1;
            if (nextLives <= 0) {
              soundFx.playGameOver();
              onGameOver();
              return { ...prev, lives: 0, combo: 0 };
            }
            return { ...prev, lives: nextLives, combo: 0 };
          });

          // Reset new ball on paddle
          const config = getLevelConfig(stats.level - 1);
          ballsRef.current = [
            {
              id: `ball_reset_${Math.random()}`,
              x: paddle.x + paddle.width / 2,
              y: paddle.y - BALL_RADIUS - 1,
              dx: 0,
              dy: 0,
              radius: BALL_RADIUS,
              speed: config.ballSpeed,
              baseSpeed: config.ballSpeed,
              isFireball: false,
              stuck: true,
              stuckOffsetX: 0,
              trail: [],
            },
          ];

          // Cancel active powerups except life
          onActivePowerUpsChange(() => []);
          paddle.hasLaser = false;
          paddle.width = paddle.baseWidth;
        }

        // 7. Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // subtle gravity
          p.life += 1;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life >= p.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // 8. Update Floating Texts
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y += ft.vy;
          ft.life += 1;
          ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);

          if (ft.life >= ft.maxLife) {
            floatingTextsRef.current.splice(i, 1);
          }
        }
      }

      // RENDER SECTION
      ctx.save();

      // Screen shake transform
      if (shakeRef.current.intensity > 0.1) {
        const shakeX = (Math.random() - 0.5) * shakeRef.current.intensity;
        const shakeY = (Math.random() - 0.5) * shakeRef.current.intensity;
        ctx.translate(shakeX, shakeY);
        shakeRef.current.intensity *= shakeRef.current.decay;
      } else {
        shakeRef.current.intensity = 0;
      }

      // Background
      ctx.fillStyle = '#07080f';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle neon perspective grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Render Bricks
      bricksRef.current.forEach((brick) => {
        if (brick.isDestroyed) return;

        ctx.save();
        ctx.shadowColor = brick.glow;
        ctx.shadowBlur = 10;

        // Brick body gradient
        const grad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        grad.addColorStop(0, brick.color);
        grad.addColorStop(1, '#05070f');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();

        // Brick neon border
        ctx.strokeStyle = brick.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Multi-hit crack indicators or Bomb icon
        if (brick.type === 'bomb') {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
        } else if (brick.type === 'mystery') {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
        } else if (brick.maxHp > 1) {
          // Draw armor bars or cracks
          const remainingPct = brick.hp / brick.maxHp;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(brick.x + 4, brick.y + brick.height - 4, (brick.width - 8) * remainingPct, 2);
        }

        ctx.restore();
      });

      // Render Bottom Safety Shield if active
      if (hasShieldRef.current) {
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 6]);
        ctx.beginPath();
        ctx.moveTo(10, CANVAS_HEIGHT - 6);
        ctx.lineTo(CANVAS_WIDTH - 10, CANVAS_HEIGHT - 6);
        ctx.stroke();
        ctx.restore();
      }

      // Render Paddle
      ctx.save();
      ctx.shadowColor = paddle.hasLaser ? '#ff0077' : '#00f0ff';
      ctx.shadowBlur = 15;

      // Paddle neon fill
      const paddleGrad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
      paddleGrad.addColorStop(0, paddle.hasLaser ? '#ff0077' : '#00f0ff');
      paddleGrad.addColorStop(1, '#02182b');

      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
      ctx.fill();

      ctx.strokeStyle = paddle.hasLaser ? '#ffffff' : '#e0f7ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Laser cannons attachments on paddle
      if (paddle.hasLaser) {
        ctx.fillStyle = '#ff0077';
        ctx.fillRect(paddle.x + 6, paddle.y - 4, 5, 6);
        ctx.fillRect(paddle.x + paddle.width - 11, paddle.y - 4, 5, 6);
      }
      ctx.restore();

      // Render Lasers
      lasersRef.current.forEach((laser) => {
        ctx.save();
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(laser.x, laser.y, laser.width, laser.height);
        ctx.restore();
      });

      // Render Falling Power-Ups
      powerUpsRef.current.forEach((item) => {
        ctx.save();
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 12;

        // Capsule container
        ctx.fillStyle = '#0a0d1a';
        ctx.beginPath();
        ctx.roundRect(item.x, item.y, item.width, item.height, 8);
        ctx.fill();

        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Symbol
        ctx.fillStyle = item.color;
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, item.x + item.width / 2, item.y + item.height / 2 + 1);

        ctx.restore();
      });

      // Render Balls with glowing trails
      ballsRef.current.forEach((ball) => {
        ctx.save();

        // Render trail
        ball.trail.forEach((t) => {
          ctx.beginPath();
          ctx.arc(t.x, t.y, ball.radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = ball.isFireball
            ? `rgba(255, 119, 0, ${t.alpha * 0.4})`
            : `rgba(0, 240, 255, ${t.alpha * 0.4})`;
          ctx.fill();
        });

        // Main Ball
        ctx.shadowColor = ball.isFireball ? '#ff7700' : '#00f0ff';
        ctx.shadowBlur = 16;

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.isFireball ? '#ffea00' : '#ffffff';
        ctx.fill();

        ctx.strokeStyle = ball.isFireball ? '#ff3b00' : '#00f0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      // Render Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.type === 'shockwave') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + p.life * 0.8), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Render Floating Texts
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Hint prompt if ball is stuck
      const hasStuckBall = ballsRef.current.some((b) => b.stuck);
      if (hasStuckBall && gameState === 'PLAYING') {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACEBAR OR CLICK TO LAUNCH', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 65);
        ctx.restore();
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    gameState,
    activatePowerUp,
    hitBrick,
    onActivePowerUpsChange,
    onGameOver,
    onStatsChange,
    spawnParticles,
    stats.combo,
    stats.level,
  ]);

  // Mouse & Touch Input Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const clientX = e.clientX - rect.left;
    const targetPaddleX = clientX * scaleX - paddleRef.current.width / 2;

    paddleRef.current.targetX = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.width, targetPaddleX));
  };

  const handlePointerDown = () => {
    // Launch ball or fire laser on click/tap
    if (gameState === 'PLAYING') {
      launchBall();
      if (paddleRef.current.hasLaser) {
        fireLasers();
      }
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          launchBall();
          if (paddleRef.current.hasLaser) {
            fireLasers();
          }
        }
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, fireLasers, launchBall, onTogglePause]);

  return (
    <div className="relative w-full flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-[800px] aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.2)] bg-[#07080f]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="w-full h-full block cursor-crosshair touch-none"
        />
        {/* Subtle scanline overlay for arcade vibes */}
        <div className="absolute inset-0 retro-scanlines pointer-events-none" />
      </div>
    </div>
  );
};
