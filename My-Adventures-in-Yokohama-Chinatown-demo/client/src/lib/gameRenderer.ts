// ============================================================
// 横浜中華街アドベンチャー - Canvas Renderer
// Design: Chinese Festival Pop - pixel art style
// ============================================================
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GameWorld,
  Player,
  Enemy,
  Item,
  Platform,
  Particle,
  FloatingText,
  Goal,
  Projectile,
} from "./gameEngine";

// ---- Sprite drawing helpers ----

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawOutlinedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  outline: string,
  lineW = 2
) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineW;
  ctx.strokeRect(Math.round(x) + lineW / 2, Math.round(y) + lineW / 2, w - lineW, h - lineW);
}

// ---- Player sprite ----
function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, camX: number) {
  const px = player.x - camX;
  const py = player.y;
  const { w, h, facing, state, animFrame, superStar, invincible } = player;

  // Blink when invincible
  if (invincible > 0 && Math.floor(invincible / 4) % 2 === 0) return;

  // Dead - red tint
  if (player.dead) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.translate(px + w / 2, py + h / 2);
    ctx.rotate(player.animFrame * 0.3);
    ctx.translate(-(px + w / 2), -(py + h / 2));
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(Math.round(px), Math.round(py), w, h);
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }

  ctx.save();
  if (facing === -1) {
    ctx.translate(px + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(px + w / 2), 0);
  }

  const glow = superStar > 0;
  if (glow) {
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 16;
  }

  // Body - Chinese boy character
  // Legs
  const legOffset = state === "run" ? (animFrame % 2 === 0 ? 2 : -2) : 0;
  drawPixelRect(ctx, px + 4, py + h - 12, 8, 12, "#cc3300"); // left leg
  drawPixelRect(ctx, px + w - 12, py + h - 12 + legOffset, 8, 12, "#cc3300"); // right leg
  // Shoes
  drawPixelRect(ctx, px + 2, py + h - 4, 10, 4, "#222222");
  drawPixelRect(ctx, px + w - 12, py + h - 4 + legOffset, 10, 4, "#222222");

  // Body - red Chinese jacket
  drawPixelRect(ctx, px + 2, py + h - 28, w - 4, 18, "#dd1111");
  // Gold trim
  drawPixelRect(ctx, px + 2, py + h - 28, 3, 18, "#ffd700");
  drawPixelRect(ctx, px + w - 5, py + h - 28, 3, 18, "#ffd700");
  drawPixelRect(ctx, px + 2, py + h - 28, w - 4, 3, "#ffd700");

  // Arms
  const armOffset = state === "run" ? (animFrame % 2 === 0 ? -3 : 3) : 0;
  drawPixelRect(ctx, px - 4, py + h - 26 + armOffset, 8, 14, "#dd1111"); // left arm
  drawPixelRect(ctx, px + w - 4, py + h - 26 - armOffset, 8, 14, "#dd1111"); // right arm
  // Hands
  drawPixelRect(ctx, px - 4, py + h - 14 + armOffset, 8, 6, "#f5c89a");
  drawPixelRect(ctx, px + w - 4, py + h - 14 - armOffset, 8, 6, "#f5c89a");

  // Head
  drawPixelRect(ctx, px + 4, py + 2, w - 8, h - 30, "#f5c89a");
  // Hair - black
  drawPixelRect(ctx, px + 4, py + 2, w - 8, 8, "#111111");
  // Eyes
  drawPixelRect(ctx, px + 8, py + 14, 4, 4, "#111111");
  drawPixelRect(ctx, px + w - 12, py + 14, 4, 4, "#111111");
  // Mouth
  if (state === "jump" || state === "fall") {
    drawPixelRect(ctx, px + 10, py + 20, 8, 2, "#111111");
  } else {
    drawPixelRect(ctx, px + 10, py + 20, 8, 3, "#111111");
    drawPixelRect(ctx, px + 10, py + 21, 3, 2, "#f5c89a");
    drawPixelRect(ctx, px + 15, py + 21, 3, 2, "#f5c89a");
  }

  // Chinese hat
  drawPixelRect(ctx, px + 2, py - 4, w - 4, 8, "#cc0000");
  drawPixelRect(ctx, px + 6, py - 10, w - 12, 8, "#cc0000");
  drawPixelRect(ctx, px + 10, py - 14, w - 20, 6, "#cc0000");
  // Hat decoration
  drawPixelRect(ctx, px + w / 2 - 2, py - 16, 4, 4, "#ffd700");

  ctx.restore();
}

// ---- Enemy sprites ----
function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, camX: number) {
  if (enemy.dead && enemy.deathTimer <= 0) return;

  const ex = enemy.x - camX;
  const ey = enemy.y;
  const { w, h, facing, animFrame, dead, deathTimer } = enemy;

  const alpha = dead ? deathTimer / 20 : 1;
  ctx.globalAlpha = alpha;

  ctx.save();
  if (facing === 1) {
    ctx.translate(ex + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(ex + w / 2), 0);
  }

  if (enemy.type === "goldfish") {
    drawGoldfish(ctx, ex, ey, w, h, animFrame);
  } else if (enemy.type === "crab") {
    drawCrab(ctx, ex, ey, w, h, animFrame);
  } else if (enemy.type === "minidragon") {
    drawMiniDragon(ctx, ex, ey, w, h, animFrame);
  } else if (enemy.type === "boss_dragon") {
    drawBossDragon(ctx, ex, ey, w, h, animFrame, enemy.hp, enemy.maxHp, enemy.bossPhase || 1);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawGoldfish(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const bob = Math.sin(frame * 0.3) * 2;
  // Body
  drawPixelRect(ctx, x + 4, y + bob, w - 8, h - 6, "#ff6600");
  // Scales
  drawPixelRect(ctx, x + 6, y + 4 + bob, 6, 4, "#ff8800");
  drawPixelRect(ctx, x + 14, y + 4 + bob, 6, 4, "#ff8800");
  // Tail
  drawPixelRect(ctx, x, y + 4 + bob, 8, h - 10, "#ff4400");
  // Fin
  drawPixelRect(ctx, x + 6, y + bob, w - 12, 6, "#ffaa00");
  // Eye
  drawPixelRect(ctx, x + w - 10, y + 4 + bob, 5, 5, "#ffffff");
  drawPixelRect(ctx, x + w - 9, y + 5 + bob, 3, 3, "#000000");
}

function drawCrab(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const legAnim = Math.sin(frame * 0.4) * 2;
  // Shell
  drawPixelRect(ctx, x + 4, y + 4, w - 8, h - 8, "#cc2200");
  drawPixelRect(ctx, x + 6, y + 2, w - 12, 6, "#dd3300");
  // Claws
  drawPixelRect(ctx, x - 4, y + 6, 10, 8, "#cc2200");
  drawPixelRect(ctx, x + w - 6, y + 6, 10, 8, "#cc2200");
  drawPixelRect(ctx, x - 6, y + 4, 6, 6, "#dd3300");
  drawPixelRect(ctx, x + w, y + 4, 6, 6, "#dd3300");
  // Legs
  for (let i = 0; i < 3; i++) {
    drawPixelRect(ctx, x + 4 + i * 6, y + h - 4, 3, 6 + (i % 2 === 0 ? legAnim : -legAnim), "#aa1100");
  }
  // Eyes
  drawPixelRect(ctx, x + 6, y + 6, 5, 5, "#ffffff");
  drawPixelRect(ctx, x + w - 11, y + 6, 5, 5, "#ffffff");
  drawPixelRect(ctx, x + 7, y + 7, 3, 3, "#000000");
  drawPixelRect(ctx, x + w - 10, y + 7, 3, 3, "#000000");
}

function drawMiniDragon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const wave = Math.sin(frame * 0.2) * 3;
  // Body
  drawPixelRect(ctx, x + 4, y + 4, w - 8, h - 8, "#228800");
  // Scales
  for (let i = 0; i < 3; i++) {
    drawPixelRect(ctx, x + 6 + i * 8, y + 6, 6, 4, "#33aa00");
  }
  // Wings
  drawPixelRect(ctx, x - 4, y + wave, 12, 16, "#33aa00");
  drawPixelRect(ctx, x + w - 8, y - wave, 12, 16, "#33aa00");
  // Tail
  drawPixelRect(ctx, x, y + h - 12, 8, 8, "#228800");
  drawPixelRect(ctx, x - 4, y + h - 8, 6, 6, "#228800");
  // Head
  drawPixelRect(ctx, x + w - 12, y, 16, 14, "#228800");
  // Horns
  drawPixelRect(ctx, x + w - 8, y - 6, 3, 6, "#ffdd00");
  drawPixelRect(ctx, x + w - 3, y - 4, 3, 4, "#ffdd00");
  // Eyes
  drawPixelRect(ctx, x + w - 8, y + 3, 4, 4, "#ffdd00");
  drawPixelRect(ctx, x + w - 3, y + 3, 4, 4, "#ffdd00");
  drawPixelRect(ctx, x + w - 7, y + 4, 2, 2, "#ff0000");
  drawPixelRect(ctx, x + w - 2, y + 4, 2, 2, "#ff0000");
}

function drawBossDragon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number, hp: number, maxHp: number, phase: number) {
  const wave = Math.sin(frame * 0.15) * 4;
  
  // Body - larger and more detailed
  drawPixelRect(ctx, x + 8, y + 12, w - 16, h - 20, "#dd0000");
  // Gold accents on body
  drawPixelRect(ctx, x + 12, y + 16, w - 24, 4, "#ffdd00");
  drawPixelRect(ctx, x + 12, y + 28, w - 24, 4, "#ffdd00");
  
  // Wings - large and menacing
  drawPixelRect(ctx, x - 8, y + 8 + wave, 16, 28, "#ff6600");
  drawPixelRect(ctx, x + w - 8, y + 12 - wave, 16, 28, "#ff6600");
  // Wing details
  drawPixelRect(ctx, x - 4, y + 12 + wave, 8, 4, "#ffaa00");
  drawPixelRect(ctx, x + w - 4, y + 16 - wave, 8, 4, "#ffaa00");
  
  // Tail
  drawPixelRect(ctx, x + 4, y + h - 12, 12, 10, "#dd0000");
  drawPixelRect(ctx, x, y + h - 8, 8, 6, "#dd0000");
  
  // Head - larger and more intimidating
  drawPixelRect(ctx, x + w - 20, y + 2, 24, 18, "#dd0000");
  // Horns - more prominent
  drawPixelRect(ctx, x + w - 14, y - 8, 4, 10, "#ffdd00");
  drawPixelRect(ctx, x + w - 6, y - 6, 4, 8, "#ffdd00");
  
  // Eyes - glowing red
  drawPixelRect(ctx, x + w - 14, y + 4, 6, 6, "#ffff00");
  drawPixelRect(ctx, x + w - 6, y + 6, 6, 6, "#ffff00");
  drawPixelRect(ctx, x + w - 12, y + 5, 3, 3, "#ff0000");
  drawPixelRect(ctx, x + w - 4, y + 7, 3, 3, "#ff0000");
  
  // Mouth
  drawPixelRect(ctx, x + w - 16, y + 14, 8, 4, "#ff6600");
  
  // Phase indicator - aura color changes
  const auraColor = phase === 1 ? "#ff8800" : phase === 2 ? "#ff4400" : "#ff0000";
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.strokeRect(Math.round(x - 2), Math.round(y - 2), w + 4, h + 4);
  ctx.globalAlpha = 1;
  
  // HP bar
  const hpPercent = hp / maxHp;
  const barWidth = w - 4;
  const barX = x + 2;
  const barY = y - 8;
  drawPixelRect(ctx, barX, barY, barWidth, 4, "#333333");
  const hpColor = hpPercent > 0.5 ? "#00dd00" : hpPercent > 0.25 ? "#ffdd00" : "#ff0000";
  drawPixelRect(ctx, barX, barY, barWidth * hpPercent, 4, hpColor);
}

// ---- Item sprites ----
function drawItem(ctx: CanvasRenderingContext2D, item: Item, camX: number) {
  if (item.collected) return;
  const ix = item.x - camX;
  const iy = item.y + item.bobOffset;
  const { w, h, type } = item;

  ctx.save();
  if (type === "coin") {
    // Gyoza coin - gold circle
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.ellipse(ix + w / 2, iy + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cc8800";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Gyoza shape inside
    ctx.fillStyle = "#cc8800";
    ctx.font = "bold 14px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("餃", ix + w / 2, iy + h / 2);
  } else if (type === "nikuman") {
    // Nikuman - white bun
    ctx.shadowColor = "#ffaaaa";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#fff5f0";
    ctx.beginPath();
    ctx.ellipse(ix + w / 2, iy + h / 2, w / 2, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ddbbaa";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Swirl
    ctx.strokeStyle = "#cc8866";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ix + w / 2, iy + h / 2, 5, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = "#cc8866";
    ctx.font = "10px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("肉", ix + w / 2, iy + h / 2 + 1);
  } else if (type === "star") {
    // Shaoxing wine bottle - amber/brown color
    ctx.shadowColor = "#cc6600";
    ctx.shadowBlur = 12;
    // Bottle body
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(ix + 6, iy + 4, w - 12, h - 6);
    // Wine inside
    ctx.fillStyle = "#cc6600";
    ctx.fillRect(ix + 7, iy + 6, w - 14, h - 10);
    // Bottle neck
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(ix + 9, iy + 2, w - 18, 4);
    // Label
    ctx.fillStyle = "#ffdd00";
    ctx.fillRect(ix + 8, iy + 10, w - 16, 6);
    // Chinese character on label
    ctx.fillStyle = "#cc6600";
    ctx.font = "bold 6px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("酒", ix + w / 2, iy + 13);
  } else if (type === "tea") {
    // Pu-erh tea cup
    ctx.shadowColor = "#88ffaa";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#4a7c59";
    ctx.fillRect(ix + 2, iy + 6, w - 4, h - 8);
    ctx.fillStyle = "#6aaa79";
    ctx.fillRect(ix + 4, iy + 4, w - 8, 6);
    ctx.fillStyle = "#88cc99";
    ctx.fillRect(ix + 6, iy + 2, w - 12, 4);
    // Steam
    ctx.strokeStyle = "#aaffbb";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ix + w / 2 - 4, iy);
    ctx.quadraticCurveTo(ix + w / 2 - 2, iy - 4, ix + w / 2, iy - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ix + w / 2 + 2, iy - 1);
    ctx.quadraticCurveTo(ix + w / 2 + 4, iy - 5, ix + w / 2 + 2, iy - 3);
    ctx.stroke();
  } else if (type === "kung_fu") {
    // Kung fu scroll - glowing orange
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ff6600";
    // Scroll body
    ctx.fillRect(ix + 4, iy + 4, w - 8, h - 8);
    ctx.fillStyle = "#ffaa00";
    ctx.fillRect(ix + 6, iy + 6, w - 12, h - 12);
    // Chinese character
    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 12px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("武", ix + w / 2, iy + h / 2);
    // Glow effect
    ctx.strokeStyle = "#ffdd00";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(ix + 2, iy + 2, w - 4, h - 4);
    ctx.globalAlpha = 1;
  } else if (type === "nunchaku") {
    // Nunchaku - spinning sticks
    ctx.shadowColor = "#ff8800";
    ctx.shadowBlur = 12;
    const angle = (item.bobTimer * 0.3) % (Math.PI * 2);
    ctx.save();
    ctx.translate(ix + w / 2, iy + h / 2);
    ctx.rotate(angle);
    // Stick 1
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-8, -2, 8, 4);
    // Ball 1
    ctx.fillStyle = "#ffaa00";
    ctx.beginPath();
    ctx.arc(-8, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    // Stick 2
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, -2, 8, 4);
    // Ball 2
    ctx.fillStyle = "#ffaa00";
    ctx.beginPath();
    ctx.arc(8, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}

// ---- Platform sprites ----
function drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, camX: number) {
  const px = plat.x - camX;
  const { y, w, h, type } = plat;

  if (type === "ground") {
    // Stone ground
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(Math.round(px), Math.round(y), w, h);
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(Math.round(px), Math.round(y), w, 8);
    // Stone tiles
    ctx.strokeStyle = "#4a2a0a";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 32) {
      ctx.strokeRect(Math.round(px + i), Math.round(y), 32, 8);
    }
  } else if (type === "brick") {
    // Red brick platform
    ctx.fillStyle = "#8b1a1a";
    ctx.fillRect(Math.round(px), Math.round(y), w, h);
    ctx.fillStyle = "#aa2222";
    ctx.fillRect(Math.round(px), Math.round(y), w, 4);
    // Brick pattern
    ctx.strokeStyle = "#661111";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 16) {
      ctx.strokeRect(Math.round(px + i), Math.round(y), 16, h);
    }
    // Gold trim on top
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(Math.round(px), Math.round(y), w, 3);
  } else if (type === "roof") {
    // Chinese roof platform - red with upturned edges
    ctx.fillStyle = "#cc1111";
    ctx.fillRect(Math.round(px), Math.round(y), w, h);
    // Roof tiles
    ctx.fillStyle = "#aa0000";
    for (let i = 0; i < w; i += 12) {
      ctx.fillRect(Math.round(px + i), Math.round(y), 10, h);
    }
    // Gold edge
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(Math.round(px), Math.round(y), w, 3);
    ctx.fillRect(Math.round(px), Math.round(y + h - 3), w, 3);
    // Upturned corners
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(Math.round(px), Math.round(y - 4), 8, 8);
    ctx.fillRect(Math.round(px + w - 8), Math.round(y - 4), 8, 8);
  } else if (type === "moving") {
    // Moving platform - cloud/boat style
    ctx.fillStyle = "#cc6600";
    ctx.fillRect(Math.round(px), Math.round(y), w, h);
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(Math.round(px), Math.round(y), w, 4);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(Math.round(px), Math.round(y), w, 2);
    // Decorative dots
    ctx.fillStyle = "#ffcc00";
    for (let i = 8; i < w - 8; i += 16) {
      ctx.fillRect(Math.round(px + i), Math.round(y + h / 2 - 2), 4, 4);
    }
  }
}

// ---- Goal sprite ----
function drawGoal(ctx: CanvasRenderingContext2D, goal: Goal, camX: number, time: number) {
  const gx = goal.x - camX;
  const gy = goal.y;
  const { w, h } = goal;

  // Gate post
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(Math.round(gx), Math.round(gy), 12, h);
  ctx.fillRect(Math.round(gx + w - 12), Math.round(gy), 12, h);

  // Gate top
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(Math.round(gx - 8), Math.round(gy - 16), w + 16, 16);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(Math.round(gx - 8), Math.round(gy - 18), w + 16, 4);

  // Flag
  const flagWave = Math.sin(time * 0.05) * 4;
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.moveTo(Math.round(gx + 6), Math.round(gy - 40));
  ctx.lineTo(Math.round(gx + 6 + 24 + flagWave), Math.round(gy - 32));
  ctx.lineTo(Math.round(gx + 6), Math.round(gy - 24));
  ctx.closePath();
  ctx.fill();

  // Pole
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(Math.round(gx + 4), Math.round(gy - 50), 4, 50);

  // Lanterns
  const lanternBob = Math.sin(time * 0.04) * 3;
  ctx.fillStyle = "#ff2200";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(Math.round(gx + w / 2), Math.round(gy - 30 + lanternBob), 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 善隣門 text
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 10px 'Noto Serif JP', serif";
  ctx.textAlign = "center";
  ctx.fillText("善隣門", Math.round(gx + w / 2), Math.round(gy + h / 2));
}

// ---- Projectile ----
function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile, camX: number) {
  const px = proj.x - camX;
  ctx.save();
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#ff4400";
  ctx.beginPath();
  ctx.ellipse(px, proj.y, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffaa00";
  ctx.beginPath();
  ctx.ellipse(px, proj.y, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---- Particles ----
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], camX: number) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.type === "spark" || p.type === "coin" || p.type === "star") {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(Math.round(p.x - camX - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
    } else if (p.type === "smoke") {
      ctx.beginPath();
      ctx.arc(Math.round(p.x - camX), Math.round(p.y), p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "lantern") {
      ctx.beginPath();
      ctx.ellipse(Math.round(p.x - camX), Math.round(p.y), p.size, p.size * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

// ---- Floating texts ----
function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[], camX: number) {
  for (const t of texts) {
    const alpha = t.life / t.maxLife;
    ctx.globalAlpha = alpha;
    ctx.font = "bold 18px 'Press Start 2P', 'Noto Sans JP', monospace";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(t.text, Math.round(t.x - camX), Math.round(t.y));
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, Math.round(t.x - camX), Math.round(t.y));
  }
  ctx.globalAlpha = 1;
}

// ---- Background ----
function drawBackground(
  ctx: CanvasRenderingContext2D,
  bgImages: Map<string, HTMLImageElement>,
  bgKey: string,
  bgKey2: string | undefined,
  camX: number,
  worldWidth: number
) {
  const img = bgImages.get(bgKey);
  if (img && img.complete) {
    // Parallax: background scrolls slower
    const parallaxX = camX * 0.3;
    const bgW = CANVAS_WIDTH * 1.5;
    // Tile background
    const startTile = Math.floor(parallaxX / bgW);
    for (let i = startTile - 1; i <= startTile + 2; i++) {
      ctx.drawImage(img, i * bgW - parallaxX, 0, bgW, CANVAS_HEIGHT);
    }
  } else {
    // Fallback gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#1a0533");
    grad.addColorStop(0.5, "#8b1a1a");
    grad.addColorStop(1, "#3a1a00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

// ---- HUD ----
function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  coins: number,
  hp: number,
  maxHp: number,
  time: number,
  stage: number,
  superStar: number,
  teaBoost: number,
  kungFuMode: number = 0
) {
  // HUD background with decorative border
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, 52);
  // Gold top border
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(0, 50, CANVAS_WIDTH, 2);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(0, 51, CANVAS_WIDTH, 1);

  // Score
  ctx.font = "bold 10px 'Press Start 2P', monospace";
  ctx.fillStyle = "#ffaa44";
  ctx.textAlign = "left";
  ctx.fillText("SCORE", 12, 16);
  ctx.font = "bold 14px 'Press Start 2P', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(score.toString().padStart(7, "0"), 12, 38);

  // Coins - center
  ctx.fillStyle = "#ffd700";
  ctx.textAlign = "center";
  ctx.font = "bold 11px 'Press Start 2P', monospace";
  ctx.fillText(`餃 × ${coins.toString().padStart(2, "0")}`, CANVAS_WIDTH / 2, 22);

  // Stage name - center
  ctx.fillStyle = "#ffccaa";
  ctx.font = "bold 9px 'Press Start 2P', monospace";
  ctx.fillText(`STAGE ${stage}`, CANVAS_WIDTH / 2, 42);

  // HP hearts - right side
  ctx.textAlign = "right";
  ctx.font = "22px serif";
  for (let i = 0; i < maxHp; i++) {
    ctx.fillStyle = i < hp ? "#ff2244" : "#333333";
    ctx.shadowColor = i < hp ? "#ff0000" : "transparent";
    ctx.shadowBlur = i < hp ? 6 : 0;
    ctx.fillText("❤", CANVAS_WIDTH - 10 - (maxHp - 1 - i) * 28, 34);
  }
  ctx.shadowBlur = 0;

  // Power-up indicators
  let powerX = 12;
  if (superStar > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(powerX - 2, 54, 80, 18);
    ctx.fillStyle = "#ffdd00";
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 6;
    ctx.fillText(`★ ${Math.ceil(superStar / 60)}s`, powerX, 66);
    ctx.shadowBlur = 0;
    powerX += 90;
  }
  if (teaBoost > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(powerX - 2, 54, 80, 18);
    ctx.fillStyle = "#88ffaa";
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#88ffaa";
    ctx.shadowBlur = 6;
    ctx.fillText(`茶 ${Math.ceil(teaBoost / 60)}s`, powerX, 66);
    ctx.shadowBlur = 0;
    powerX += 90;
  }
  if (kungFuMode > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(powerX - 2, 54, 80, 18);
    ctx.fillStyle = "#ff6600";
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 8;
    ctx.fillText(`武 ${Math.ceil(kungFuMode / 60)}s`, powerX, 66);
    ctx.shadowBlur = 0;
  }
}

// ---- Main render function ----
export function renderGame(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  bgImages: Map<string, HTMLImageElement>
) {
  const camX = world.camera.x;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Background
  drawBackground(ctx, bgImages, world.bgKey, world.bgKey2, camX, world.worldWidth);

  // Platforms
  for (const plat of world.platforms) {
    if (plat.x - camX > CANVAS_WIDTH + 64 || plat.x + plat.w - camX < -64) continue;
    drawPlatform(ctx, plat, camX);
  }

  // Goal
  drawGoal(ctx, world.goal, camX, world.time);

  // Items
  for (const item of world.items) {
    if (item.x - camX > CANVAS_WIDTH + 32 || item.x - camX < -32) continue;
    drawItem(ctx, item, camX);
  }

  // Enemies
  for (const enemy of world.enemies) {
    if (enemy.x - camX > CANVAS_WIDTH + 64 || enemy.x - camX < -64) continue;
    drawEnemy(ctx, enemy, camX);
  }

  // Projectiles
  for (const proj of world.projectiles) {
    drawProjectile(ctx, proj, camX);
  }

  // Player
  drawPlayer(ctx, world.player, camX);

  // Particles
  drawParticles(ctx, world.particles, camX);

  // Floating texts
  drawFloatingTexts(ctx, world.floatingTexts, camX);

  // HUD
  drawHUD(
    ctx,
    world.score,
    world.coins,
    world.player.hp,
    world.player.maxHp,
    world.time,
    world.stage,
    world.player.superStar,
    world.player.teaBoost,
    world.player.kungFuMode
  );
}
