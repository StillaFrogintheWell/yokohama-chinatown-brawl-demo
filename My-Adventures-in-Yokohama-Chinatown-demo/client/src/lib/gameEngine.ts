// ============================================================
// 横浜中華街アドベンチャー - Game Engine Core
// Design: Chinese Festival Pop style
// Colors: Deep red, gold, festive orange
// ============================================================

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const DOUBLE_JUMP_FORCE = -10;
export const PLAYER_SPEED = 4;
export const TILE_SIZE = 32;

export type GameState = "title" | "playing" | "paused" | "gameover" | "stageclear" | "gameclear";

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function rectContains(a: Rect, px: number, py: number): boolean {
  return px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h;
}

// ---- Player ----
export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  jumpsLeft: number;
  hp: number;
  maxHp: number;
  invincible: number; // frames of invincibility
  superStar: number;  // frames of star power
  teaBoost: number;   // frames of tea boost
  facing: 1 | -1;
  animFrame: number;
  animTimer: number;
  state: "idle" | "run" | "jump" | "fall" | "hurt";
  dead: boolean;
  kungFuMode: number; // frames of kung fu mode
  attackPower: number; // 1.0 = normal, 1.5 = kung fu mode
}

export function createPlayer(x: number, y: number): Player {
  return {
    x, y, w: 28, h: 32,
    vx: 0, vy: 0,
    onGround: false,
    jumpsLeft: 2,
    hp: 3, maxHp: 3,
    invincible: 0,
    superStar: 0,
    teaBoost: 0,
    facing: 1,
    animFrame: 0,
    animTimer: 0,
    state: "idle",
    dead: false,
    kungFuMode: 0,
    attackPower: 1.0,
  };
}

// ---- Platform ----
export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "ground" | "brick" | "roof" | "moving" | "cloud";
  moveDir?: 1 | -1;
  moveRange?: number;
  moveOriginX?: number;
  moveSpeed?: number;
}

// ---- Enemy ----
export type EnemyType = "goldfish" | "crab" | "minidragon" | "boss_dragon";

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  animFrame: number;
  animTimer: number;
  dead: boolean;
  deathTimer: number;
  stunned: number;
  fireTimer?: number; // for minidragon
  patrolMin?: number;
  patrolMax?: number;
  // Boss-specific
  bossPhase?: number; // 1, 2, 3
  bossAttackTimer?: number;
  bossAttackType?: "fireball" | "charge" | "jump";
  bossChargeDir?: number; // -1 or 1
}

export function createEnemy(id: number, type: EnemyType, x: number, y: number, patrolMin?: number, patrolMax?: number): Enemy {
  const sizes: Record<EnemyType, { w: number; h: number }> = {
    goldfish: { w: 28, h: 24 },
    crab: { w: 32, h: 24 },
    minidragon: { w: 36, h: 32 },
    boss_dragon: { w: 80, h: 64 },
  };
  const hps: Record<EnemyType, number> = { goldfish: 1, crab: 2, minidragon: 3, boss_dragon: 15 };
  const s = sizes[type];
  return {
    id, type, x, y, w: s.w, h: s.h,
    vx: type === "goldfish" ? -1.5 : type === "crab" ? -1 : -1.2,
    vy: 0,
    onGround: false,
    hp: hps[type], maxHp: hps[type],
    facing: -1,
    animFrame: 0, animTimer: 0,
    dead: false, deathTimer: 0,
    stunned: 0,
    fireTimer: type === "minidragon" ? 120 : undefined,
    patrolMin, patrolMax,
    // Boss-specific initialization
    bossPhase: type === "boss_dragon" ? 1 : undefined,
    bossAttackTimer: type === "boss_dragon" ? 120 : undefined,
    bossAttackType: type === "boss_dragon" ? "fireball" : undefined,
    bossChargeDir: type === "boss_dragon" ? -1 : undefined,
  };
}

// ---- Coin / Item ----
export type ItemType = "coin" | "nikuman" | "star" | "tea" | "kung_fu" | "nunchaku";

export interface Item {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  bobOffset: number;
  bobTimer: number;
}

export function createItem(id: number, type: ItemType, x: number, y: number): Item {
  return {
    id, type, x, y, w: 24, h: 24,
    collected: false,
    bobOffset: 0,
    bobTimer: Math.random() * Math.PI * 2,
  };
}

// ---- Projectile (dragon fire) ----
export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromEnemy: boolean;
  dead: boolean;
}

// ---- Particle ----
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "spark" | "coin" | "smoke" | "lantern" | "star";
}

// ---- Floating Text ----
export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

// ---- Goal ----
export interface Goal {
  x: number;
  y: number;
  w: number;
  h: number;
  reached: boolean;
}

// ---- Stage Definition ----
export interface StageData {
  id: number;
  name: string;
  bgKey: string;
  bgKey2?: string;
  playerStart: Vector2;
  platforms: Platform[];
  enemies: Enemy[];
  items: Item[];
  goal: Goal;
  worldWidth: number;
}

// ---- Game World ----
export interface GameWorld {
  player: Player;
  platforms: Platform[];
  enemies: Enemy[];
  items: Item[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  goal: Goal;
  camera: Vector2;
  worldWidth: number;
  score: number;
  coins: number;
  time: number;
  stage: number;
  bgKey: string;
  bgKey2?: string;
  nextEnemyId: number;
  nextItemId: number;
  nextProjectileId: number;
  deathTimer?: number;
  audioManager?: any;
}

export function createWorld(stageData: StageData): GameWorld {
  return {
    player: createPlayer(stageData.playerStart.x, stageData.playerStart.y),
    platforms: stageData.platforms,
    enemies: stageData.enemies,
    items: stageData.items,
    projectiles: [],
    particles: [],
    floatingTexts: [],
    goal: stageData.goal,
    camera: { x: 0, y: 0 },
    worldWidth: stageData.worldWidth,
    score: 0,
    coins: 0,
    time: 0,
    stage: stageData.id,
    bgKey: stageData.bgKey,
    bgKey2: stageData.bgKey2,
    nextEnemyId: 1000,
    nextItemId: 2000,
    nextProjectileId: 3000,
  };
}

// ---- Input ----
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean; // single-frame press
}

// ---- Physics helpers ----
export function applyGravity(obj: { vy: number; onGround: boolean }, gravity = GRAVITY) {
  if (!obj.onGround) {
    obj.vy += gravity;
    if (obj.vy > 16) obj.vy = 16;
  }
}

export function resolvePlayerPlatformCollision(
  player: Player,
  platforms: Platform[]
): void {
  player.onGround = false;

  for (const plat of platforms) {
    const pr: Rect = { x: player.x, y: player.y, w: player.w, h: player.h };
    const platR: Rect = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };

    if (!rectsOverlap(pr, platR)) continue;

    const overlapX = Math.min(pr.x + pr.w, platR.x + platR.w) - Math.max(pr.x, platR.x);
    const overlapY = Math.min(pr.y + pr.h, platR.y + platR.h) - Math.max(pr.y, platR.y);

    if (overlapX < overlapY) {
      // horizontal
      if (pr.x < platR.x) player.x -= overlapX;
      else player.x += overlapX;
      player.vx = 0;
    } else {
      // vertical
      if (pr.y < platR.y) {
        // landing on top
        player.y = platR.y - pr.h;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;
      } else {
        // hitting bottom
        player.y = platR.y + platR.h;
        player.vy = 0;
      }
    }
  }
}

export function resolveEnemyPlatformCollision(
  enemy: Enemy,
  platforms: Platform[]
): void {
  enemy.onGround = false;

  for (const plat of platforms) {
    const er: Rect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
    const platR: Rect = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };

    if (!rectsOverlap(er, platR)) continue;

    const overlapX = Math.min(er.x + er.w, platR.x + platR.w) - Math.max(er.x, platR.x);
    const overlapY = Math.min(er.y + er.h, platR.y + platR.h) - Math.max(er.y, platR.y);

    if (overlapX < overlapY) {
      if (er.x < platR.x) { enemy.x -= overlapX; enemy.vx *= -1; enemy.facing = enemy.facing === 1 ? -1 : 1; }
      else { enemy.x += overlapX; enemy.vx *= -1; enemy.facing = enemy.facing === 1 ? -1 : 1; }
    } else {
      if (er.y < platR.y) {
        enemy.y = platR.y - er.h;
        enemy.vy = 0;
        enemy.onGround = true;
      } else {
        enemy.y = platR.y + platR.h;
        enemy.vy = 0;
      }
    }
  }
}

// ---- Particle factory ----
export function spawnParticles(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  type: Particle["type"],
  colors: string[]
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      type,
    });
  }
}

export function spawnFloatingText(
  floatingTexts: FloatingText[],
  x: number,
  y: number,
  text: string,
  color: string
) {
  floatingTexts.push({ x, y, text, color, life: 60, maxLife: 60, vy: -1.5 });
}
