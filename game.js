const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

// =====================
// LOAD FLAGS
// =====================
let bgReady = false;
let spiritReady = false;
let holidayReady = false;
let stitchReady = false;

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
// PLAYER (SPIRIT SPRITE SHEET)
// =====================
const player = {
  x: 120,
  y: 120,
  speed: 4,
  moving: false,
  dir: 0
};

// =====================
// HOLIDAY (SPRITE SHEET)
// =====================
const holiday = {
  x: 300,
  y: 300,
  frame: 0,
  tick: 0,

  // IMPORTANT: assume 4 columns, 5 rows like spirit OR adjust if needed
  cols: 4,
  rows: 5
};

// =====================
// STITCH (STATIC)
// =====================
const stitch = {
  x: 500,
  y: 200
};

// =====================
// INPUT
// =====================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// =====================
// SPRITE CONFIG (SPIRIT)
// =====================
const COLS = 4;
const ROWS = 5;

let SW = 0;
let SH = 0;

let frame = 0;
let tick = 0;
const MAX_FRAMES = 4;

// =====================
// LOAD HANDLERS
// =====================
bgImg.onload = () => bgReady = true;

spiritImg.onload = () => {
  spiritReady = true;
  SW = spiritImg.width / COLS;
  SH = spiritImg.height / ROWS;
  start();
};

holidayImg.onload = () => holidayReady = true;
stitchImg.onload = () => stitchReady = true;

function start() {
  loop();
}

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
  player.moving = false;

  let nx = player.x;
  let ny = player.y;

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
// HOLIDAY FOLLOW + ANIMATION
// =====================
function updateHoliday() {
  const dx = player.x - holiday.x;
  const dy = player.y - holiday.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 2) {
    holiday.x += (dx / dist) * 2;
    holiday.y += (dy / dist) * 2;
  }

  holiday.tick++;
  if (holiday.tick % 10 === 0) {
    holiday.frame = (holiday.frame + 1) % holiday.cols;
  }
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
// ANIMATION (SPIRIT)
// =====================
function updateAnimation() {
  if (!player.moving) {
    frame = 0;
    return;
  }

  tick++;
  if (tick % 10 === 0) {
    frame = (frame + 1) % MAX_FRAMES;
  }
}

// =====================
// BACKGROUND (FIXED FOR SMALL IMAGE)
// =====================
function drawBackground() {
  if (!bgReady) return;

  const x = (canvas.width / 2) - (bgImg.width / 2) - camera.x * 0.1;
  const y = (canvas.height / 2) - (bgImg.height / 2) - camera.y * 0.1;

  ctx.drawImage(bgImg, x, y);
}

// =====================
// MAP
// =====================
function drawMap() {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      ctx.fillStyle = map[r][c] === 1 ? "#444" : "#1a1a1a";

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
// PLAYER DRAW
// =====================
function drawPlayer() {
  const col = frame;
  const row = player.moving ? player.dir : 4;

  ctx.drawImage(
    spiritImg,
    col * SW,
    row * SH,
    SW,
    SH,
    player.x - camera.x,
    player.y - camera.y,
    48,
    48
  );
}

// =====================
// HOLIDAY DRAW (SPRITE SHEET FIXED)
// =====================
function drawHoliday() {
  const fw = holidayImg.width / holiday.cols;
  const fh = holidayImg.height / holiday.rows;

  const col = holiday.frame;
  const row = 0;

  ctx.drawImage(
    holidayImg,
    col * fw,
    row * fh,
    fw,
    fh,
    holiday.x - camera.x,
    holiday.y - camera.y,
    48,
    48
  );
}

// =====================
// STITCH DRAW
// =====================
function drawStitch() {
  ctx.drawImage(
    stitchImg,
    stitch.x - camera.x,
    stitch.y - camera.y,
    48,
    48
  );
}

// =====================
// LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateHoliday();
  updateAnimation();
  updateCamera();

  drawBackground();
  drawMap();
  drawStitch();
  drawHoliday();
  drawPlayer();

  requestAnimationFrame(loop);
}
