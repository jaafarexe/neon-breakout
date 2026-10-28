import { Brick, BrickType, PowerUpType } from '../types/game';

export interface LevelConfig {
  levelNumber: number;
  name: string;
  ballSpeed: number;
  layout: string[];
}

export const BRICK_COLOR_MAP: Record<BrickType, { color: string; glow: string; points: number; maxHp: number }> = {
  cyan: { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.7)', points: 100, maxHp: 1 },
  green: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.7)', points: 120, maxHp: 1 },
  yellow: { color: '#ffe600', glow: 'rgba(255, 230, 0, 0.7)', points: 150, maxHp: 1 },
  pink: { color: '#ff0077', glow: 'rgba(255, 0, 119, 0.7)', points: 200, maxHp: 1 },
  purple: { color: '#bd00ff', glow: 'rgba(189, 0, 255, 0.75)', points: 300, maxHp: 2 },
  steel: { color: '#94a3b8', glow: 'rgba(203, 213, 225, 0.75)', points: 500, maxHp: 3 },
  bomb: { color: '#ff3b30', glow: 'rgba(255, 59, 48, 0.85)', points: 400, maxHp: 1 },
  mystery: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.85)', points: 250, maxHp: 1 },
};

const POWER_UP_CHOICES: PowerUpType[] = ['multiball', 'laser', 'expand', 'slow', 'fireball', 'shield', 'life'];

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'NEON HORIZON',
    ballSpeed: 6.0,
    layout: [
      'PPPPPPPPPP',
      'YYYYYYYYYY',
      'GGGG?GGGGG',
      'CCCC?CCCCC',
    ],
  },
  {
    levelNumber: 2,
    name: 'CYBER INVADER',
    ballSpeed: 6.5,
    layout: [
      '..U....U..',
      '...U..U...',
      '..UUUUUU..',
      '.UUB..BUU.',
      '.UUUUUUUU.',
      '..?.GG.?..',
      '.U......U.',
    ],
  },
  {
    levelNumber: 3,
    name: 'FORTRESS VAULT',
    ballSpeed: 7.0,
    layout: [
      'SSSSSSSSSS',
      'SPPPBBPPPS',
      'SYY....YYS',
      'SGGUUUUGGS',
      'S..????..S',
      'SSSSSSSSSS',
    ],
  },
  {
    levelNumber: 4,
    name: 'DIAMOND MATRIX',
    ballSpeed: 7.5,
    layout: [
      '....SS....',
      '...SUUS...',
      '..SYBBYs..',
      '.SPP??PPS.',
      '..SYBBYs..',
      '...SUUS...',
      '....SS....',
    ],
  },
  {
    levelNumber: 5,
    name: 'OVERDRIVE CITADEL',
    ballSpeed: 8.0,
    layout: [
      'SBSPSBSPSB',
      'UUUUUUUUUU',
      'PYGCPPYGCP',
      'S..B..B..S',
      'U.??????.U',
      'SSSSSSSSSS',
    ],
  },
];

export function createBricksForLevel(
  levelIndex: number,
  canvasWidth: number
): Brick[] {
  let config: LevelConfig;

  if (levelIndex < LEVELS.length) {
    config = LEVELS[levelIndex];
  } else {
    // Procedural level generation for endless replayability beyond Level 5
    const baseSpeed = Math.min(8.0 + (levelIndex - 4) * 0.4, 11.0);
    const proceduralLayout: string[] = [];
    const rows = 5 + Math.min(3, Math.floor((levelIndex - 4) / 2));
    const chars = ['C', 'G', 'Y', 'P', 'U', 'S', 'B', '?'];

    for (let r = 0; r < rows; r++) {
      let rowStr = '';
      for (let c = 0; c < 10; c++) {
        const rand = Math.random();
        if (rand < 0.1) rowStr += '.';
        else if (rand < 0.18) rowStr += 'B';
        else if (rand < 0.28) rowStr += '?';
        else if (rand < 0.45) rowStr += 'S';
        else if (rand < 0.65) rowStr += 'U';
        else rowStr += chars[Math.floor(Math.random() * 4)];
      }
      proceduralLayout.push(rowStr);
    }

    config = {
      levelNumber: levelIndex + 1,
      name: `SECTOR ${levelIndex + 1}`,
      ballSpeed: baseSpeed,
      layout: proceduralLayout,
    };
  }

  const cols = 10;
  const paddingX = 24;
  const spacing = 8;
  const totalAvailableWidth = canvasWidth - paddingX * 2;
  const brickWidth = (totalAvailableWidth - (cols - 1) * spacing) / cols;
  const brickHeight = 24;
  const startY = 70;

  const bricks: Brick[] = [];

  config.layout.forEach((rowStr, rowIdx) => {
    for (let colIdx = 0; colIdx < rowStr.length && colIdx < cols; colIdx++) {
      const char = rowStr[colIdx].toUpperCase();
      if (char === '.') continue;

      let type: BrickType = 'cyan';
      let powerUpDrop: PowerUpType | undefined = undefined;

      switch (char) {
        case 'C':
          type = 'cyan';
          break;
        case 'G':
          type = 'green';
          break;
        case 'Y':
          type = 'yellow';
          break;
        case 'P':
          type = 'pink';
          break;
        case 'U':
          type = 'purple';
          break;
        case 'S':
          type = 'steel';
          break;
        case 'B':
          type = 'bomb';
          break;
        case '?':
          type = 'mystery';
          powerUpDrop = POWER_UP_CHOICES[Math.floor(Math.random() * POWER_UP_CHOICES.length)];
          break;
        default:
          type = 'cyan';
      }

      // Random 14% chance for standard colored bricks to also contain a power-up
      if (type !== 'mystery' && type !== 'bomb' && Math.random() < 0.14) {
        powerUpDrop = POWER_UP_CHOICES[Math.floor(Math.random() * POWER_UP_CHOICES.length)];
      }

      const meta = BRICK_COLOR_MAP[type];
      const x = paddingX + colIdx * (brickWidth + spacing);
      const y = startY + rowIdx * (brickHeight + spacing);

      bricks.push({
        id: `brick_${rowIdx}_${colIdx}_${Math.random().toString(36).substring(2, 7)}`,
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        row: rowIdx,
        col: colIdx,
        type,
        hp: meta.maxHp,
        maxHp: meta.maxHp,
        color: meta.color,
        glow: meta.glow,
        points: meta.points,
        powerUpDrop,
        isDestroyed: false,
      });
    }
  });

  return bricks;
}

export function getLevelConfig(levelIndex: number): LevelConfig {
  if (levelIndex < LEVELS.length) {
    return LEVELS[levelIndex];
  }
  return {
    levelNumber: levelIndex + 1,
    name: `HYPER MATRIX ${levelIndex + 1}`,
    ballSpeed: Math.min(8.0 + (levelIndex - 4) * 0.4, 11.5),
    layout: [],
  };
}
