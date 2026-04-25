// ============================================================
// 横浜中華街アドベンチャー - Game Logic / Update Loop
// ============================================================
import {
  GameWorld,
  GameState,
  InputState,
  Player,
  Enemy,
  Item,
  Particle,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRAVITY,
  JUMP_FORCE,
  DOUBLE_JUMP_FORCE,
  PLAYER_SPEED,
  applyGravity,
  resolvePlayerPlatformCollision,
  resolveEnemyPlatformCollision,
  rectsOverlap,
  spawnParticles,
  spawnFloatingText,
  createItem,
} from "./gameEngine";

const COIN_COLORS = ["#ffd700", "#ffcc00", "#ffaa00", "#ff8800"];
const STAR_COLORS = ["#ffff00", "#ffdd00", "#ff8800", "#ffffff"];
const SMOKE_COLORS = ["#888888", "#aaaaaa", "#666666"];
const FIRE_COLORS = ["#ff4400", "#ff6600", "#ffaa00"];

// ---- Update moving platforms ----
function updateMovingPlatforms(world: GameWorld) {
  for (const plat of world.platforms) {
    if (plat.type !== "moving") continue;
    plat.x += (plat.moveDir ?? 1) * (plat.moveSpeed ?? 1.5);
    const origin = plat.moveOriginX ?? plat.x;
    const range = plat.moveRange ?? 100;
    if (plat.x > origin + range) plat.moveDir = -1;
    if (plat.x < origin - range) plat.moveDir = 1;
  }
}

// ---- Update player ----
function updatePlayer(world: GameWorld, input: InputState) {
  const p = world.player;
  if (p.dead) return;

  // Update kung fu mode
  if (p.kungFuMode > 0) {
    p.kungFuMode--;
  } else {
    p.attackPower = 1.0;
  }

  // Horizontal movement
  const speed = p.teaBoost > 0 ? PLAYER_SPEED * 1.4 : PLAYER_SPEED;
  if (input.left) {
    p.vx = -speed;
    p.facing = -1;
  } else if (input.right) {
    p.vx = speed;
    p.facing = 1;
  } else {
    p.vx *= 0.8;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;
  }

  // Jump
  if (input.jumpPressed && p.jumpsLeft > 0 && !p.dead) {
    p.vy = p.jumpsLeft === 2 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
    p.jumpsLeft--;
    spawnParticles(world.particles, p.x + p.w / 2, p.y + p.h, 6, "smoke", SMOKE_COLORS);
    // Play jump SFX
    if (world.audioManager) {
      world.audioManager.playSfx("jump", "/manus-storage/sfx-jump_174b1bee.wav");
    }
  }

  // Gravity
  applyGravity(p);

  // Move
  p.x += p.vx;
  p.y += p.vy;

  // World bounds
  if (p.x < 0) p.x = 0;
  if (p.x + p.w > world.worldWidth) p.x = world.worldWidth - p.w;

  // Platform collision
  resolvePlayerPlatformCollision(p, world.platforms);

  // Fall off screen - instant death
  if (p.y > CANVAS_HEIGHT + 60 && !p.dead) {
    p.hp = 0;
    p.dead = true;
    spawnParticles(world.particles, p.x + p.w / 2, p.y, 12, "spark", ["#ff2244", "#ff8800", "#ffffff"]);
  }

  // Dead animation - player spins and falls
  if (p.dead) {
    p.vy += GRAVITY;
    p.y += p.vy;
    p.animFrame = (p.animFrame + 1) % 4;
    return;
  }

  // Timers
  if (p.invincible > 0) p.invincible--;
  if (p.superStar > 0) {
    p.superStar--;
    if (p.superStar % 3 === 0) {
      spawnParticles(world.particles, p.x + p.w / 2, p.y + p.h / 2, 2, "star", STAR_COLORS);
    }
  }
  if (p.teaBoost > 0) p.teaBoost--;

  // Animation
  p.animTimer++;
  if (p.animTimer >= 8) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % 4;
  }

  // State
  if (!p.onGround) {
    p.state = p.vy < 0 ? "jump" : "fall";
  } else if (Math.abs(p.vx) > 0.5) {
    p.state = "run";
  } else {
    p.state = "idle";
  }
}

function damagePlayer(world: GameWorld, amount: number, instant = false) {
  const p = world.player;
  if (p.invincible > 0 || p.superStar > 0) return;
  p.hp -= amount;
  p.invincible = instant ? 0 : 90;
  p.state = "hurt";
  spawnParticles(world.particles, p.x + p.w / 2, p.y + p.h / 2, 10, "spark", ["#ff2244", "#ff8800", "#ffffff"]);
  // Play damage SFX
  if (world.audioManager) {
    world.audioManager.playSfx("damage", "/manus-storage/sfx-damage_2801af7c.wav");
  }
  if (p.hp <= 0) {
    p.hp = 0;
    p.dead = true;
    p.vy = -8;
  }
}

// ---- Update enemies ----
function updateEnemies(world: GameWorld) {
  const p = world.player;

  for (const enemy of world.enemies) {
    if (enemy.dead) {
      enemy.deathTimer--;
      continue;
    }

    // Stunned
    if (enemy.stunned > 0) {
      enemy.stunned--;
      applyGravity(enemy);
      enemy.y += enemy.vy;
      resolveEnemyPlatformCollision(enemy, world.platforms);
      continue;
    }

    // Boss Dragon AI
    if (enemy.type === "boss_dragon" && enemy.bossPhase !== undefined && enemy.bossAttackTimer !== undefined) {
      enemy.bossAttackTimer--;
      const distX = p.x - enemy.x;
      const distY = p.y - enemy.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      // Phase change based on HP
      if (enemy.hp <= 10 && enemy.bossPhase === 1) enemy.bossPhase = 2;
      if (enemy.hp <= 5 && enemy.bossPhase === 2) enemy.bossPhase = 3;
      
      // Attack patterns
      if (enemy.bossAttackTimer <= 0) {
        const attackType = Math.floor(Math.random() * 3);
        if (enemy.bossPhase === 1) {
          enemy.bossAttackType = "fireball";
          enemy.bossAttackTimer = 100;
        } else if (enemy.bossPhase === 2) {
          enemy.bossAttackType = attackType < 2 ? "fireball" : "charge";
          enemy.bossAttackTimer = attackType < 2 ? 80 : 60;
        } else {
          enemy.bossAttackType = ["fireball", "charge", "jump"][attackType] as any;
          enemy.bossAttackTimer = 60;
        }
      }
      
      // Execute attack
      if (enemy.bossAttackType === "fireball" && Math.abs(distX) < 400) {
        const dir = distX < 0 ? -1 : 1;
        world.projectiles.push({
          id: world.nextProjectileId++,
          x: enemy.x + (dir > 0 ? enemy.w : 0),
          y: enemy.y + enemy.h / 2,
          vx: dir * 6,
          vy: 0,
          fromEnemy: true,
          dead: false,
        });
      } else if (enemy.bossAttackType === "charge") {
        if (enemy.bossChargeDir === undefined) enemy.bossChargeDir = distX < 0 ? -1 : 1;
        enemy.vx = enemy.bossChargeDir * 4;
        enemy.facing = enemy.bossChargeDir as any;
      } else if (enemy.bossAttackType === "jump" && enemy.onGround) {
        enemy.vy = -14;
        enemy.vx = (distX < 0 ? -1 : 1) * 3;
      }
      
      // Patrol when not attacking
      if (Math.abs(enemy.vx) < 0.5) {
        enemy.vx = (Math.random() < 0.5 ? -1 : 1) * 1.5;
        enemy.facing = enemy.vx < 0 ? -1 : 1;
      }
    }
    
    // Patrol AI
    if (enemy.type !== "boss_dragon" && enemy.patrolMin !== undefined && enemy.patrolMax !== undefined) {
      if (enemy.x < enemy.patrolMin) { enemy.vx = Math.abs(enemy.vx); enemy.facing = 1; }
      if (enemy.x + enemy.w > enemy.patrolMax) { enemy.vx = -Math.abs(enemy.vx); enemy.facing = -1; }
    }

    // Dragon fire
    if (enemy.type === "minidragon" && enemy.fireTimer !== undefined) {
      enemy.fireTimer--;
      if (enemy.fireTimer <= 0) {
        enemy.fireTimer = 150 + Math.floor(Math.random() * 60);
        const distX = p.x - enemy.x;
        if (Math.abs(distX) < 350) {
          const dir = distX < 0 ? -1 : 1;
          world.projectiles.push({
            id: world.nextProjectileId++,
            x: enemy.x + (dir > 0 ? enemy.w : 0),
            y: enemy.y + enemy.h / 2,
            vx: dir * 5,
            vy: 0,
            fromEnemy: true,
            dead: false,
          });
        }
      }
    }

    // Move
    enemy.x += enemy.vx;
    applyGravity(enemy);
    enemy.y += enemy.vy;
    resolveEnemyPlatformCollision(enemy, world.platforms);

    // Animation
    enemy.animTimer++;
    if (enemy.animTimer >= 6) {
      enemy.animTimer = 0;
      enemy.animFrame = (enemy.animFrame + 1) % 8;
    }

    // ---- Player vs Enemy collision ----
    const er = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
    const pr = { x: p.x, y: p.y, w: p.w, h: p.h };

    if (!p.dead && rectsOverlap(pr, er)) {
      // Stomp check: player falling onto enemy from above
      const playerBottom = p.y + p.h;
      const enemyTop = enemy.y;
      const stompThreshold = 12;

      if (
        p.vy > 0 &&
        playerBottom - p.vy <= enemyTop + stompThreshold &&
        enemy.type !== "crab" // crabs can't be stomped
      ) {
        // Stomp!
        const damage = Math.ceil(1 * p.attackPower);
        enemy.hp -= damage;
        p.vy = -8; // bounce
        spawnParticles(world.particles, enemy.x + enemy.w / 2, enemy.y, 12, "spark", COIN_COLORS);
        const scoreGain = Math.floor(100 * p.attackPower);
        spawnFloatingText(world.floatingTexts, enemy.x + enemy.w / 2, enemy.y - 10, "+" + scoreGain, p.kungFuMode > 0 ? "#ff6600" : "#ffd700");
        world.score += scoreGain;

        if (enemy.hp <= 0) {
          killEnemy(world, enemy);
        } else {
          enemy.stunned = 60;
          enemy.vy = -4;
        }
      } else if (p.superStar > 0) {
        // Star power - kill enemy
        killEnemy(world, enemy);
        spawnParticles(world.particles, enemy.x + enemy.w / 2, enemy.y, 12, "star", STAR_COLORS);
        spawnFloatingText(world.floatingTexts, enemy.x + enemy.w / 2, enemy.y - 10, "+200", "#ffdd00");
        world.score += 200;
      } else {
        // Damage player
        damagePlayer(world, 1);
        // Knockback
        p.vx = p.x < enemy.x ? -5 : 5;
        p.vy = -4;
      }
    }
  }
}

function killEnemy(world: GameWorld, enemy: Enemy) {
  enemy.dead = true;
  enemy.deathTimer = 20;
  spawnParticles(world.particles, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 8, "smoke", SMOKE_COLORS);
}

// ---- Update items ----
function updateItems(world: GameWorld) {
  const p = world.player;

  for (const item of world.items) {
    if (item.collected) continue;

    // Gravity for kung fu items (fall from sky)
    if (item.type === "kung_fu" || item.type === "nunchaku") {
      item.y += 1.5; // Fall speed (half of original 3)
      // Remove if falls off screen
      if (item.y > CANVAS_HEIGHT + 100) {
        item.collected = true; // Mark as collected to remove
        continue;
      }
    }

    // Bob animation
    item.bobTimer += 0.05;
    item.bobOffset = Math.sin(item.bobTimer) * 4;

    const ir = { x: item.x, y: item.y + item.bobOffset, w: item.w, h: item.h };
    const pr = { x: p.x, y: p.y, w: p.w, h: p.h };

    if (!p.dead && rectsOverlap(pr, ir)) {
      item.collected = true;

      if (item.type === "coin") {
        world.score += 10;
        world.coins++;
        spawnParticles(world.particles, item.x + item.w / 2, item.y, 6, "coin", COIN_COLORS);
        spawnFloatingText(world.floatingTexts, item.x + item.w / 2, item.y - 10, "+10", "#ffd700");
        if (world.audioManager) {
          world.audioManager.playSfx("coin", "/manus-storage/sfx-coin_53dbd30e.wav");
        }
      } else if (item.type === "nikuman") {
        world.score += 50;
        if (p.hp < p.maxHp) p.hp++;
        spawnParticles(world.particles, item.x + item.w / 2, item.y, 8, "spark", ["#fff5f0", "#ffccaa", "#ff8866"]);
        spawnFloatingText(world.floatingTexts, item.x + item.w / 2, item.y - 10, "肉まん！+50", "#ffccaa");
      } else if (item.type === "star") {
        world.score += 100;
        p.superStar = 300; // 5 seconds
        spawnParticles(world.particles, item.x + item.w / 2, item.y, 16, "spark", ["#cc6600", "#dd7700", "#ee8800", "#ffaa00"]);
        spawnFloatingText(world.floatingTexts, item.x + item.w / 2, item.y - 10, "紹興酒！無敵", "#cc6600");
      } else if (item.type === "tea") {
        world.score += 30;
        p.teaBoost = 600; // 10 seconds
        spawnParticles(world.particles, item.x + item.w / 2, item.y, 8, "smoke", ["#88ffaa", "#aaffcc", "#66cc88"]);
        spawnFloatingText(world.floatingTexts, item.x + item.w / 2, item.y - 10, "茶パワー！", "#88ffaa");
      } else if (item.type === "kung_fu") {
        world.score += 150;
        p.kungFuMode = 450; // 7.5 seconds
        p.attackPower = 1.8; // 80% stronger
        spawnParticles(world.particles, item.x + item.w / 2, item.y, 20, "spark", ["#ff6600", "#ffaa00", "#ffdd00"]);
        spawnFloatingText(world.floatingTexts, item.x + item.w / 2, item.y - 10, "カンフー奥義！", "#ff6600");
      } else if (item.type === "nunchaku") {
        world.score += 120;
        p.kungFuMode = 350; // 5.8 seconds
        p.attackPower = 1.5; // 50% stronger
        spawnParticles(world.particles, item.x + item.w / 2, item.y, 16, "spark", ["#ff8800", "#ffaa00", "#ffcc00"]);
        spawnFloatingText(world.floatingTexts, item.x + item.w / 2, item.y - 10, "ヌンチャク！", "#ff8800");
      }
    }
  }
}

// ---- Update projectiles ----
function updateProjectiles(world: GameWorld) {
  const p = world.player;

  for (const proj of world.projectiles) {
    if (proj.dead) continue;

    proj.x += proj.vx;
    proj.y += proj.vy;

    // Out of bounds
    if (proj.x < world.camera.x - 100 || proj.x > world.camera.x + CANVAS_WIDTH + 100) {
      proj.dead = true;
      continue;
    }

    // Hit player
    if (proj.fromEnemy && !p.dead) {
      const pr = { x: p.x, y: p.y, w: p.w, h: p.h };
      const projR = { x: proj.x - 8, y: proj.y - 5, w: 16, h: 10 };
      if (rectsOverlap(pr, projR)) {
        if (p.superStar === 0) {
          damagePlayer(world, 1);
          p.vx = p.x < proj.x ? -5 : 5;
          p.vy = -4;
        }
        proj.dead = true;
        spawnParticles(world.particles, proj.x, proj.y, 6, "spark", FIRE_COLORS);
      }
    }
  }

  // Remove dead projectiles
  world.projectiles = world.projectiles.filter(proj => !proj.dead);
}

// ---- Update particles ----
function updateParticles(world: GameWorld) {
  for (const p of world.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity
    p.vx *= 0.95;
    p.life--;
  }
  world.particles = world.particles.filter(p => p.life > 0);
}

// ---- Update floating texts ----
function updateFloatingTexts(world: GameWorld) {
  for (const t of world.floatingTexts) {
    t.y += t.vy;
    t.life--;
  }
  world.floatingTexts = world.floatingTexts.filter(t => t.life > 0);
}

// ---- Update camera ----
function updateCamera(world: GameWorld) {
  const p = world.player;
  const targetX = p.x - CANVAS_WIDTH / 3;
  world.camera.x += (targetX - world.camera.x) * 0.1;
  world.camera.x = Math.max(0, Math.min(world.camera.x, world.worldWidth - CANVAS_WIDTH));
}

// ---- Check goal ----
function checkGoal(world: GameWorld): boolean {
  const p = world.player;
  const g = world.goal;
  const pr = { x: p.x, y: p.y, w: p.w, h: p.h };
  const gr = { x: g.x, y: g.y, w: g.w, h: g.h };
  if (!p.dead && rectsOverlap(pr, gr)) {
    g.reached = true;
    return true;
  }
  return false;
}

// ---- Main update ----
export function updateGame(
  world: GameWorld,
  input: InputState
): { newState?: GameState; scoreBonus?: number } {
  world.time++;

  // Spawn kung fu items from sky (random chance)
  if (Math.random() < 0.002) { // ~0.2% chance per frame
    const itemType = Math.random() < 0.5 ? "kung_fu" : "nunchaku";
    const randomX = Math.random() * (world.worldWidth - 100) + 50;
    world.items.push(createItem(world.nextItemId++, itemType as any, randomX, -30));
  }

  updateMovingPlatforms(world);
  updatePlayer(world, input);
  updateEnemies(world);
  updateItems(world);
  updateProjectiles(world);
  updateParticles(world);
  updateFloatingTexts(world);
  updateCamera(world);

  // Check game over
  if (world.player.dead) {
    // Wait for death animation then show game over
    if (world.deathTimer === undefined) {
      world.deathTimer = 90;
    }
    world.deathTimer--;
    if (world.deathTimer <= 0 || world.player.y > CANVAS_HEIGHT + 100) {
      return { newState: "gameover" };
    }
  }

  // Check goal
  if (checkGoal(world)) {
    // Time bonus
    const timeBonus = Math.max(0, 3000 - world.time) * 2;
    world.score += timeBonus;
    return { newState: "stageclear", scoreBonus: timeBonus };
  }

  return {};
}
