"use strict";

// =====================================================
// CANVAS
// =====================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// =====================================================
// ASSETS
// =====================================================
const assets = {
  bg: loadImage("assets/background.png"),
  spirit: loadImage("assets/spirit.png"),
  holiday: loadImage("assets/holiday.png"),
  stitch: loadImage("assets/stitch.png"),
  trash: loadImage("assets/tsprites.png")
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// =====================================================
// CONSTANTS
// =====================================================
const SPRITE_COLS = 4;
const SPRITE_ROWS = 5;

const TRASH_COLS = 8;
const TRASH_ROWS = 10;
const TRASH_FRAMES = TRASH_COLS * TRASH_ROWS;

// =====================================================
// INPUT
// =====================================================
const keys = Object.create(null);

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Space") startBeam();
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;

  if (e.code === "Space") endBeam();
});

// =====================================================
// WORLD
// =====================================================
const world = {
  width: 2000,
  height: 1200
};

const camera = { x: 0, y: 0 };

// =====================================================
// ENTITIES
// =====================================================
const player = createActor(120, 120);
const holiday = createFollower(320, 260, 2);
const stitch = createFollower(520, 180, 1.6);

const trash = [
  createTrash(260, 240),
  createTrash(520, 320),
  createTrash(740, 460),
  createTrash(900, 300)
];

// =====================================================
// GAME STATE
// =====================================================
let score = 0;

let beamActive = false;
let beamEnergy = 0;

// =====================================================
// FACTORIES
// =====================================================
function createActor(x, y) {
  return {
    x, y,
    dir: 0,
    frame: 0,
    tick: 0,
    speed: 4,
    moving: false
  };
}

function createFollower(x, y, speed) {
  return {
    x, y,
    speed,
    dir: 0,
    frame: 0,
    tick: 0
  };
}

function createTrash(x, y) {
  return {
    x, y,
    frame: Math.floor(Math.random() * TRASH_FRAMES),
    tick: 0,
    cleaned: false
  };
}

// =====================================================
// UPDATE: PLAYER
// =====================================================
function updatePlayer() {
  player.moving = false;

  if (keys["ArrowUp"]) {
    player.y -= player.speed;
    player.dir = 1;
    player.moving = true;
  } else if (keys["ArrowDown"]) {
    player.y += player.speed;
    player.dir = 0;
    player.moving = true;
  } else if (keys["ArrowLeft"]) {
    player.x -= player.speed;
    player.dir = 2;
    player.moving = true;
  } else if (keys["ArrowRight"]) {
    player.x += player.speed;
    player.dir = 3;
    player.moving = true;
  }
}

// =====================================================
// FOLLOW SYSTEM
// =====================================================
function updateFollower(f) {
  const dx = player.x - f.x;
  const dy = player.y - f.y;
  const d = Math.hypot(dx, dy);

  if (d > 2) {
    f.x += (dx / d) * f.speed;
    f.y += (dy / d) * f.speed;
  }
}

// =====================================================
// CAMERA
// =====================================================
function updateCamera() {
  camera.x = clamp(player.x - canvas.width / 2, 0, world.width - canvas.width);
  camera.y = clamp(player.y - canvas.height / 2, 0, world.height - canvas.height);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// =====================================================
// TRASH ANIMATION (CONTROLLED, NOT CHAOTIC)
// =====================================================
function updateTrash() {
  for (const t of trash) {
    if (t.cleaned) continue;

    t.tick++;

    // slow subtle animation only
    if (t.tick % 70 === 0) {
      t.frame = (t.frame + 1) % TRASH_FRAMES;
    }
  }
}

// =====================================================
// BEAM SYSTEM (SPACE ATTACK)
// =====================================================
function startBeam() {
  beamActive = true;
}

function endBeam() {
  beamActive = false;

  if (beamEnergy > 25) {
    cleanBurst();
  }

  beamEnergy = 0;
}

function updateBeam() {
  if (beamActive) beamEnergy += 2;
  else beamEnergy *= 0.9;
}

function cleanBurst() {
  const radius = 150;

  for (const t of trash) {
    if (t.cleaned) continue;

    const d = Math.hypot(player.x - t.x, player.y - t.y);

    if (d < radius) {
      t.cleaned = true;
      score += 10;
    }
  }
}

// =====================================================
// RENDER: SPRITES
// =====================================================
function drawSprite(img, e) {
  if (!img.complete || img.width === 0) return;

  const fw = img.width / SPRITE_COLS;
  const fh = img.height / SPRITE_ROWS;

  ctx.drawImage(
    img,
    e.frame * fw,
    e.dir * fh,
    fw,
    fh,
    e.x - camera.x,
    e.y - camera.y,
    48,
    48
  );
}

// =====================================================
// RENDER: TRASH (FIXED GRID)
// =====================================================
function drawTrash() {
  const img = assets.trash;

  if (!img.complete || img.width === 0) return;

  const fw = img.width / TRASH_COLS;
  const fh = img.height / TRASH_ROWS;

  for (const t of trash) {
    if (t.cleaned) continue;

    const fx = (t.frame % TRASH_COLS) * fw;
    const fy = Math.floor(t.frame / TRASH_COLS) * fh;

    ctx.drawImage(
      img,
      fx, fy, fw, fh,
      t.x - camera.x,
      t.y - camera.y,
      48,
      48
    );
  }
}

// =====================================================
// RAINBOW BEAM VISUAL
// =====================================================
function drawBeam() {
  if (!beamActive) return;

  const x = player.x - camera.x + 24;
  const y = player.y - camera.y + 24;

  const r = 150;

  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, "rgba(255,0,255,0.6)");
  g.addColorStop(0.3, "rgba(0,255,255,0.5)");
  g.addColorStop(0.6, "rgba(255,255,0,0.3)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// =====================================================
// UI
// =====================================================
function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 20, 30);
}

// =====================================================
// LOOP
// =====================================================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateFollower(holiday);
  updateFollower(stitch);
  updateTrash();
  updateBeam();
  updateCamera();

  // background
  ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);

  // world
  drawTrash();
  drawBeam();

  // characters
  drawSprite(assets.stitch, stitch);
  drawSprite(assets.holiday, holiday);
  drawSprite(assets.spirit, player);

  drawUI();

  requestAnimationFrame(loop);
}

loop();
