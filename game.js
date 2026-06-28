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
  bg: load("assets/background.png"),
  spirit: load("assets/spirit.png"),
  holiday: load("assets/holiday.png"),
  stitch: load("assets/stitch.png"),
  trash: load("assets/tsprites.png")
};

function load(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// =====================================================
// CONFIG
// =====================================================
const SPRITE_COLS = 4;
const SPRITE_ROWS = 5;

const TRASH_COLS = 14;
const TRASH_ROWS = 7;
const TRASH_FRAMES = TRASH_COLS * TRASH_ROWS;

const MAX_BEAM = 60;

// =====================================================
// INPUT
// =====================================================
const keys = Object.create(null);

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") beamStart();
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
  if (e.code === "Space") beamEnd();
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
const player = makeActor(120, 120);
const holiday = makeFollower(320, 260, 2);
const stitch = makeFollower(520, 180, 1.6);

const trash = [
  makeTrash(260, 240),
  makeTrash(520, 320),
  makeTrash(740, 460),
  makeTrash(900, 300),
  makeTrash(1100, 500)
];

// =====================================================
// GAME STATE
// =====================================================
let score = 0;

let beamActive = false;
let beamPower = 0;

// =====================================================
// FACTORIES
// =====================================================
function makeActor(x, y) {
  return {
    x, y,
    dir: 0,
    frame: 0,
    tick: 0,
    speed: 4,
    moving: false
  };
}

function makeFollower(x, y, speed) {
  return {
    x, y,
    speed,
    dir: 0,
    frame: 0,
    tick: 0,
    moving: false
  };
}

function makeTrash(x, y) {
  return {
    x,
    y,
    frame: Math.floor(Math.random() * TRASH_FRAMES),
    cleaned: false
  };
}

// =====================================================
// INPUT HELPERS
// =====================================================
function getDirection(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 3 : 2;
  } else {
    return dy > 0 ? 0 : 1;
  }
}

// =====================================================
// PLAYER UPDATE
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

  if (player.moving) {
    player.tick++;
    if (player.tick % 10 === 0) {
      player.frame = (player.frame + 1) % SPRITE_COLS;
    }
  } else {
    player.frame = 0;
  }
}

// =====================================================
// FOLLOWERS
// =====================================================
function updateFollower(f) {
  const dx = player.x - f.x;
  const dy = player.y - f.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 2) {
    f.x += (dx / dist) * f.speed;
    f.y += (dy / dist) * f.speed;
    f.moving = true;
    f.dir = getDirection(dx, dy);

    f.tick++;
    if (f.tick % 10 === 0) {
      f.frame = (f.frame + 1) % SPRITE_COLS;
    }
  } else {
    f.moving = false;
    f.frame = 0;
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
// TRASH (STATIC)
// =====================================================
function updateTrash() {
  // intentionally empty
}

// =====================================================
// BEAM SYSTEM
// =====================================================
function beamStart() {
  beamActive = true;
}

function beamEnd() {
  beamActive = false;

  if (beamPower >= MAX_BEAM) {
    burstClean();
  }

  beamPower = 0;
}

function updateBeam() {
  if (beamActive) beamPower += 2;
  else beamPower *= 0.85;

  beamPower = Math.max(0, Math.min(MAX_BEAM, beamPower));
}

function burstClean() {
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
  if (!img || !img.complete || img.width === 0) return;

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
// RENDER: TRASH (FIXED ATLAS)
// =====================================================
function drawTrash() {
  const img = assets.trash;
  if (!img || !img.complete || img.width === 0) return;

  const fw = img.width / TRASH_COLS;
  const fh = img.height / TRASH_ROWS;

  for (const t of trash) {
    if (t.cleaned) continue;

    const sx = (t.frame % TRASH_COLS) * fw;
    const sy = Math.floor(t.frame / TRASH_COLS) * fh;

    ctx.drawImage(
      img,
      sx,
      sy,
      fw,
      fh,
      t.x - camera.x,
      t.y - camera.y,
      48,
      48
    );
  }
}

// =====================================================
// BEAM VISUAL
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

  // beam bar
  const x = 20, y = 50, w = 200, h = 12;
  const pct = beamPower / MAX_BEAM;

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, "purple");
  grad.addColorStop(0.5, "cyan");
  grad.addColorStop(1, "yellow");

  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w * pct, h);

  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y, w, h);

  if (pct >= 1) {
    ctx.fillStyle = "lime";
    ctx.fillText("READY - RELEASE SPACE", 240, 60);
  } else if (beamActive) {
    ctx.fillText("Charging...", 240, 60);
  }
}

// =====================================================
// LOOP
// =====================================================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateFollower(holiday);
  updateFollower(stitch);
  updateBeam();
  updateCamera();

  ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);

  drawTrash();
  drawBeam();

  drawSprite(assets.stitch, stitch);
  drawSprite(assets.holiday, holiday);
  drawSprite(assets.spirit, player);

  drawUI();

  requestAnimationFrame(loop);
}

loop();
