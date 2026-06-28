console.log("game.js loaded");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================
// CANVAS
// =====================
canvas.width = 800;
canvas.height = 600;

// =====================
// IMAGES
// =====================
const bgImg = new Image();
bgImg.src = "assets/background.png";

const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

const holidayImg = new Image();
holidayImg.src = "assets/holiday.png";

const stitchImg = new Image();
stitchImg.src = "assets/stitch.png";

const trashImg = new Image();
trashImg.src = "assets/trash.png"; // sprite sheet (4x4)

// =====================
// LOAD FLAGS
// =====================
let bgReady = false;

bgImg.onload = () => bgReady = true;

// =====================
// WORLD
// =====================
const TILE_SIZE = 40;

const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const world = {
  width: map[0].length * TILE_SIZE,
  height: map.length * TILE_SIZE
};

// =====================
// CAMERA
// =====================
const camera = { x: 0, y: 0 };

// =====================
// INPUT
// =====================
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.code === "Space") {
    cleanTrash();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// =====================
// SPRITE SETTINGS
// =====================
const COLS = 4;
const ROWS = 5;

// =====================
// PLAYER
// =====================
const player = {
  x: 120,
  y: 120,
  speed: 4,
  moving: false,
  dir: 0,
  frame: 0,
  tick: 0
};

// =====================
// COMPANIONS
// =====================
const holiday = { x: 300, y: 300 };
const stitch = { x: 500, y: 200 };

// =====================
// TRASH SYSTEM
// =====================
const trash = [
  { x: 250, y: 250, cleaned: false, frame: 0, tick: 0 },
  { x: 500, y: 300, cleaned: false, frame: 0, tick: 0 },
  { x: 700, y: 450, cleaned: false, frame: 0, tick: 0 },
  { x: 350, y: 500, cleaned: false, frame: 0, tick: 0 }
];

let score = 0;

// =====================
// COLLISION
// =====================
function blocked(x, y) {
  const c = Math.floor(x / TILE_SIZE);
  const r = Math.floor(y / TILE_SIZE);
  return !map[r] || map[r][c] === 1;
}

// =====================
// PLAYER UPDATE
// =====================
function updatePlayer() {
  let nx = player.x;
  let ny = player.y;

  player.moving = false;

  if (keys["ArrowUp"]) {
    ny -= player.speed;
    player.dir = 1;
    player.moving = true;
  } else if (keys["ArrowDown"]) {
    ny += player.speed;
    player.dir = 0;
    player.moving = true;
  } else if (keys["ArrowLeft"]) {
    nx -= player.speed;
    player.dir = 2;
    player.moving = true;
  } else if (keys["ArrowRight"]) {
    nx += player.speed;
    player.dir = 3;
    player.moving = true;
  }

  if (!blocked(nx, player.y)) player.x = nx;
  if (!blocked(player.x, ny)) player.y = ny;
}

// =====================
// COMPANION FOLLOW
// =====================
function updateFollowers() {
  const follow = (obj, speed) => {
    const dx = player.x - obj.x;
    const dy = player.y - obj.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 2) {
      obj.x += (dx / d) * speed;
      obj.y += (dy / d) * speed;
    }
  };

  follow(holiday, 2);
  follow(stitch, 1.5);
}

// =====================
// CAMERA
// =====================
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(0, Math.min(world.width - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(world.height - canvas.height, camera.y));
}

// =====================
// TRASH ANIMATION
// =====================
function updateTrash() {
  trash.forEach(t => {
    if (t.cleaned) return;

    t.tick++;
    if (t.tick % 10 === 0) {
      t.frame = (t.frame + 1) % 16;
    }
  });
}

// =====================
// CLEAN SYSTEM (SPACE BAR)
// =====================
function cleanTrash() {
  trash.forEach(t => {
    if (t.cleaned) return;

    const dist = Math.hypot(player.x - t.x, player.y - t.y);

    if (dist < 45) {
      t.cleaned = true;
      score++;
    }
  });
}

// =====================
// DRAW BACKGROUND
// =====================
function drawBackground() {
  if (!bgReady) return;

  ctx.drawImage(
    bgImg,
    -camera.x * 0.1,
    -camera.y * 0.1,
    canvas.width,
    canvas.height
  );
}

// =====================
// DRAW MAP
// =====================
function drawMap() {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      ctx.fillStyle = map[r][c] === 1
        ? "rgba(80,80,80,0.6)"
        : "rgba(20,20,20,0.4)";

      ctx.fillRect(
        c * TILE_SIZE - camera.x,
        r * TILE_SIZE - camera.y,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

// =====================
// DRAW SPRITE SHEET (TRASH)
// =====================
function drawTrash() {
  if (!trashImg.complete || trashImg.naturalWidth === 0) return;

  const cols = 4;
  const rows = 4;

  const fw = trashImg.naturalWidth / cols;
  const fh = trashImg.naturalHeight / rows;

  trash.forEach(t => {
    if (t.cleaned) return;

    const fx = (t.frame % cols) * fw;
    const fy = Math.floor(t.frame / cols) * fh;

    ctx.drawImage(
      trashImg,
      fx, fy, fw, fh,
      t.x - camera.x,
      t.y - camera.y,
      48,
      48
    );
  });
}

// =====================
// DRAW PLAYER + NPCS
// =====================
function drawSimple(img, x, y) {
  if (!img.complete) return;

  ctx.drawImage(img, x - camera.x, y - camera.y, 48, 48);
}

// =====================
// LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateFollowers();
  updateTrash();
  updateCamera();

  drawBackground();
  drawMap();

  drawTrash();

  drawSimple(stitchImg, stitch.x, stitch.y);
  drawSimple(holidayImg, holiday.x, holiday.y);
  drawSimple(spiritImg, player.x, player.y);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  requestAnimationFrame(loop);
}

loop();
