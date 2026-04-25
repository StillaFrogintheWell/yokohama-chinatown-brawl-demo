// ============================================================
// 横浜中華街アドベンチャー - Stage Definitions
// ============================================================
import {
  StageData,
  createEnemy,
  createItem,
  TILE_SIZE as T,
} from "./gameEngine";

const GROUND_Y = 400;

// Helper to create a ground segment
function ground(x: number, w: number, y = GROUND_Y): import("./gameEngine").Platform {
  return { x, y, w, h: 50, type: "ground" };
}

function brick(x: number, y: number, w: number): import("./gameEngine").Platform {
  return { x, y, w, h: T, type: "brick" };
}

function roof(x: number, y: number, w: number): import("./gameEngine").Platform {
  return { x, y, w, h: T, type: "roof" };
}

function moving(x: number, y: number, w: number, range: number, speed = 1.5): import("./gameEngine").Platform {
  return { x, y, w, h: T, type: "moving", moveDir: 1, moveRange: range, moveOriginX: x, moveSpeed: speed };
}

// ============================================================
// STAGE 1: 中華街大通り（昼〜夕暮れ）
// ============================================================
export const stage1: StageData = {
  id: 1,
  name: "中華街大通り",
  bgKey: "bg_day",
  playerStart: { x: 80, y: 340 },
  worldWidth: 3200,
  platforms: [
    // Ground
    ground(0, 500),
    ground(550, 300),
    ground(900, 400),
    ground(1350, 350),
    ground(1750, 300),
    ground(2100, 500),
    ground(2650, 550),

    // Platforms - low
    brick(200, 320, 96),
    brick(380, 280, 96),
    brick(600, 300, 128),
    brick(800, 260, 64),

    // Platforms - mid
    brick(950, 330, 96),
    brick(1100, 290, 128),
    brick(1280, 250, 96),

    // Platforms - high
    roof(1400, 200, 160),
    roof(1600, 160, 128),
    roof(1800, 200, 96),

    // Moving platforms
    moving(1050, 340, 80, 120),
    moving(1700, 300, 80, 100, 1.2),

    // Late stage
    brick(2150, 330, 128),
    brick(2350, 290, 96),
    brick(2500, 250, 128),
    roof(2700, 200, 160),
    brick(2900, 240, 96),
    brick(3050, 200, 128),
  ],
  enemies: [
    createEnemy(1, "goldfish", 350, 368, 300, 500),
    createEnemy(2, "goldfish", 650, 368, 600, 850),
    createEnemy(3, "goldfish", 1000, 368, 950, 1200),
    createEnemy(4, "crab", 1150, 368, 1100, 1300),
    createEnemy(5, "goldfish", 1450, 168, 1400, 1550),
    createEnemy(6, "crab", 1650, 368, 1600, 1900),
    createEnemy(7, "goldfish", 2200, 368, 2150, 2400),
    createEnemy(8, "minidragon", 2600, 368, 2550, 2800),
    createEnemy(9, "goldfish", 2800, 368, 2750, 3000),
    createEnemy(10, "crab", 3000, 368, 2950, 3100),
  ],
  items: [
    createItem(1, "coin", 220, 290),
    createItem(2, "coin", 260, 290),
    createItem(3, "coin", 400, 250),
    createItem(4, "coin", 620, 270),
    createItem(5, "coin", 660, 270),
    createItem(6, "nikuman", 820, 230),
    createItem(7, "coin", 970, 300),
    createItem(8, "coin", 1010, 300),
    createItem(9, "coin", 1120, 260),
    createItem(10, "star", 1300, 220),
    createItem(11, "coin", 1420, 170),
    createItem(12, "coin", 1460, 170),
    createItem(13, "coin", 1500, 170),
    createItem(14, "tea", 1620, 130),
    createItem(15, "coin", 1820, 170),
    createItem(16, "coin", 2170, 300),
    createItem(17, "coin", 2210, 300),
    createItem(18, "nikuman", 2370, 260),
    createItem(19, "coin", 2520, 220),
    createItem(20, "coin", 2560, 220),
    createItem(21, "coin", 2720, 170),
    createItem(22, "star", 2760, 170),
    createItem(23, "coin", 3060, 170),
    createItem(24, "coin", 3100, 170),
    createItem(25, "coin", 3140, 170),
  ],
  goal: { x: 3050, y: 300, w: 60, h: 100, reached: false },
};

// ============================================================
// STAGE 2: 横浜港（夕暮れ）
// ============================================================
export const stage2: StageData = {
  id: 2,
  name: "横浜港",
  bgKey: "bg_harbor",
  playerStart: { x: 80, y: 340 },
  worldWidth: 3600,
  platforms: [
    ground(0, 400),
    ground(450, 200),
    ground(700, 300),
    ground(1050, 250),
    ground(1350, 400),
    ground(1800, 300),
    ground(2150, 400),
    ground(2600, 300),
    ground(2950, 500),

    brick(150, 300, 96),
    brick(320, 260, 128),
    brick(500, 330, 96),

    // Dock platforms
    roof(750, 280, 160),
    roof(950, 240, 128),
    roof(1100, 200, 96),

    // Ship platforms
    brick(1200, 300, 160),
    brick(1400, 260, 128),
    brick(1600, 220, 96),
    brick(1750, 180, 128),

    // Moving platforms over water
    moving(1400, 340, 96, 150, 1.8),
    moving(1650, 300, 80, 120, 2),
    moving(2000, 280, 96, 140, 1.5),

    brick(2200, 300, 128),
    brick(2400, 260, 96),
    brick(2550, 220, 128),
    roof(2700, 180, 160),
    brick(2900, 220, 96),
    brick(3050, 180, 128),
    brick(3200, 220, 96),
    brick(3350, 260, 128),
  ],
  enemies: [
    createEnemy(1, "goldfish", 200, 368, 150, 380),
    createEnemy(2, "crab", 400, 368, 350, 580),
    createEnemy(3, "goldfish", 760, 248, 750, 900),
    createEnemy(4, "goldfish", 1000, 368, 950, 1200),
    createEnemy(5, "crab", 1250, 268, 1200, 1350),
    createEnemy(6, "minidragon", 1450, 228, 1400, 1600),
    createEnemy(7, "goldfish", 1800, 368, 1750, 2000),
    createEnemy(8, "crab", 2000, 368, 1950, 2200),
    createEnemy(9, "minidragon", 2250, 268, 2200, 2400),
    createEnemy(10, "goldfish", 2600, 368, 2550, 2800),
    createEnemy(11, "crab", 2800, 368, 2750, 3000),
    createEnemy(12, "minidragon", 3100, 148, 3050, 3250),
    createEnemy(13, "goldfish", 3300, 228, 3250, 3450),
  ],
  items: [
    createItem(1, "coin", 170, 270),
    createItem(2, "coin", 210, 270),
    createItem(3, "coin", 340, 230),
    createItem(4, "nikuman", 520, 300),
    createItem(5, "coin", 770, 250),
    createItem(6, "coin", 810, 250),
    createItem(7, "coin", 970, 210),
    createItem(8, "star", 1120, 170),
    createItem(9, "coin", 1220, 270),
    createItem(10, "coin", 1260, 270),
    createItem(11, "tea", 1420, 230),
    createItem(12, "coin", 1620, 190),
    createItem(13, "coin", 1770, 150),
    createItem(14, "coin", 1810, 150),
    createItem(15, "nikuman", 2220, 270),
    createItem(16, "coin", 2420, 230),
    createItem(17, "coin", 2570, 190),
    createItem(18, "star", 2720, 150),
    createItem(19, "coin", 2920, 190),
    createItem(20, "coin", 3070, 150),
    createItem(21, "coin", 3220, 190),
    createItem(22, "coin", 3370, 230),
  ],
  goal: { x: 3450, y: 300, w: 60, h: 100, reached: false },
};

// ============================================================
// STAGE 3: 関帝廟の境内（夜）
// ============================================================
export const stage3: StageData = {
  id: 3,
  name: "関帝廟の境内",
  bgKey: "bg_night",
  playerStart: { x: 80, y: 340 },
  worldWidth: 4000,
  platforms: [
    ground(0, 350),
    ground(400, 200),
    ground(650, 250),
    ground(950, 300),
    ground(1300, 200),
    ground(1550, 300),
    ground(1900, 250),
    ground(2200, 350),
    ground(2600, 250),
    ground(2900, 300),
    ground(3300, 400),

    brick(100, 300, 96),
    brick(250, 260, 128),

    // Temple steps
    roof(420, 300, 128),
    roof(460, 260, 96),
    roof(500, 220, 64),

    brick(680, 280, 96),
    brick(800, 240, 128),
    brick(970, 260, 96),
    brick(1100, 220, 128),

    // High temple platforms
    roof(1320, 200, 160),
    roof(1500, 160, 128),
    roof(1700, 120, 96),
    roof(1920, 160, 128),

    // Moving platforms
    moving(1200, 260, 80, 120, 2),
    moving(1600, 200, 80, 100, 2.2),
    moving(2100, 240, 96, 130, 1.8),

    brick(2250, 280, 128),
    brick(2420, 240, 96),
    brick(2620, 200, 128),
    roof(2820, 160, 160),
    brick(3020, 200, 96),
    brick(3150, 160, 128),
    brick(3300, 200, 96),
    brick(3450, 160, 128),
    roof(3600, 120, 160),
    brick(3800, 160, 128),
  ],
  enemies: [
    createEnemy(1, "crab", 200, 368, 150, 350),
    createEnemy(2, "goldfish", 440, 268, 420, 540),
    createEnemy(3, "minidragon", 700, 248, 680, 850),
    createEnemy(4, "crab", 1000, 368, 950, 1200),
    createEnemy(5, "minidragon", 1150, 188, 1100, 1280),
    createEnemy(6, "goldfish", 1340, 168, 1320, 1480),
    createEnemy(7, "crab", 1520, 128, 1500, 1680),
    createEnemy(8, "minidragon", 1940, 128, 1920, 2080),
    createEnemy(9, "crab", 2270, 248, 2250, 2420),
    createEnemy(10, "minidragon", 2450, 208, 2420, 2600),
    createEnemy(11, "goldfish", 2640, 168, 2620, 2800),
    createEnemy(12, "crab", 2840, 128, 2820, 2980),
    createEnemy(13, "minidragon", 3040, 168, 3020, 3180),
    createEnemy(14, "crab", 3320, 168, 3300, 3460),
    createEnemy(15, "minidragon", 3470, 128, 3450, 3620),
    createEnemy(16, "goldfish", 3620, 88, 3600, 3760),
    createEnemy(17, "crab", 3820, 128, 3800, 3960),
  ],
  items: [
    createItem(1, "coin", 120, 270),
    createItem(2, "coin", 270, 230),
    createItem(3, "nikuman", 440, 270),
    createItem(4, "coin", 700, 250),
    createItem(5, "coin", 820, 210),
    createItem(6, "star", 990, 230),
    createItem(7, "coin", 1120, 190),
    createItem(8, "tea", 1340, 170),
    createItem(9, "coin", 1380, 170),
    createItem(10, "coin", 1520, 130),
    createItem(11, "coin", 1560, 130),
    createItem(12, "nikuman", 1720, 90),
    createItem(13, "coin", 1940, 130),
    createItem(14, "star", 1980, 130),
    createItem(15, "coin", 2270, 250),
    createItem(16, "coin", 2440, 210),
    createItem(17, "coin", 2640, 170),
    createItem(18, "tea", 2860, 130),
    createItem(19, "coin", 3060, 170),
    createItem(20, "coin", 3170, 130),
    createItem(21, "coin", 3320, 170),
    createItem(22, "nikuman", 3470, 130),
    createItem(23, "coin", 3640, 90),
    createItem(24, "star", 3680, 90),
    createItem(25, "coin", 3820, 130),
  ],
  goal: { x: 3880, y: 240, w: 60, h: 100, reached: false },
};

// ============================================================
// BOSS STAGE: ドラゴン商会の親分
// ============================================================
export const bossstage: StageData = {
  id: 4,
  name: "ドラゴン商会の親分",
  bgKey: "bg_night",
  playerStart: { x: 80, y: 340 },
  worldWidth: 2000,
  platforms: [
    ground(0, 1000),
    brick(200, 320, 128),
    brick(400, 280, 96),
    brick(600, 320, 128),
    brick(800, 280, 96),
    brick(1000, 320, 128),
    brick(1200, 280, 96),
    brick(1400, 320, 128),
    brick(1600, 280, 96),
  ],
  enemies: [
    createEnemy(100, "minidragon", 900, 200, 700, 1100),
  ],
  items: [
    createItem(1, "coin", 250, 290),
    createItem(2, "nikuman", 450, 250),
    createItem(3, "coin", 650, 290),
    createItem(4, "star", 850, 250),
    createItem(5, "coin", 1050, 290),
    createItem(6, "tea", 1250, 250),
    createItem(7, "coin", 1450, 290),
    createItem(8, "nikuman", 1650, 250),
  ],
  goal: { x: 1800, y: 200, w: 80, h: 120, reached: false },
};

export const ALL_STAGES: StageData[] = [stage1, stage2, stage3, bossstage];
