const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// SPRITE SHEET
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

const holidayImg = new Image();
holidayImg.src = "assets/holiday.png";

let loadedSpirit = false;
let loadedHoliday = false;

// --------------------
// WORLD / TILE SYSTEM
// --------------------
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

// --------------------
// CAMERA
// --------------------
const camera = { x: 0, y: 0 };

// --------------------
// PLAYER (SPIRIT)
// --------------------
const player = {
  x: 120,
  y: 120,
  speed: 4,
  moving: false,
  dir: 0
};

// --------------------
// HOLIDAY NPC
// --------------------
const holiday = {
  x: 300,
  y: 300,
  speed: 2
};

// --------------------
// INPUT
// --------------------
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// --------------------
// SPRITE CONFIG
// --------------------
const COLS = 4;
const ROWS = 5;

let FRAME_W = 0;
let FRAME_H = 0;

let frame = 0;
let tick = 0;
const MAX_FRAMES = 4;

// --------------------
// LOAD SPRITES
// --------------------
spiritImg.onload = () => {
  loadedSpirit = true;
  FRAME_W = spiritImg.width / COLS;
  FRAME_H = spiritImg.height / ROWS;
  maybeStart();
};

holidayImg.onload = () => {
  loadedHoliday = true;
  maybeStart();
};

function maybeStart() {
  if (loadedSpirit && loadedHoliday) {
    loop();
  }
}

// --------------------
// COLLISION
// --------------------
function isBlocked(x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);

  if (!map[row] || map[row][col] === undefined) return true;
  return map[row][col] === 1;
}

// --------------------
// UPDATE PLAYER
// --------------------
function updatePlayer() {
  player.moving = false;

  let newX = player.x;
  let newY = player.y;

  if (keys["ArrowUp"]) {
    newY -= player.speed;
    player.dir = 1;
    player.moving = true;
  } else if (keys["ArrowDown"]) {
    newY += player.speed;
    player.dir = 0;
    player.moving = true;
  } else if (keys["ArrowLeft"]) {
    newX -= player.speed;
    player.dir = 2;
    player.moving = true;
  } else if (keys["ArrowRight"]) {
    newX += player.speed;
    player.dir = 3;
    player.moving = true;
  }

  if (!isBlocked(newX, player.y)) player.x = newX;
  if (!isBlocked(player.x, newY)) player.y = newY;
}

// --------------------
// HOLIDAY AI (FOLLOW PLAYER)
// --------------------
function updateHoliday() {
  const dx = player.x - holiday.x;
  const dy = player.y - holiday.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 2) {
    holiday.x += (dx / dist) * holiday.speed;
    holiday.y += (dy / dist) * holiday.speed;
  }
}

// --------------------
// CAMERA
// --------------------
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(0, Math.min(world.width - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(world.height - canvas.height, camera.y));
}

// --------------------
// ANIMATION
// --------------------
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

// --------------------
// DRAW MAP
// --------------------
function drawMap() {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const tile = map[r][c];

      const x = c * TILE_SIZE - camera.x;
      const y = r * TILE_SIZE - camera.y;

      ctx.fillStyle = tile === 1 ? "#444" : "#1a1a1a";
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }
}

// --------------------
// DRAW PLAYER
// --------------------
function drawPlayer() {
  const col = frame;
  const row = player.moving ? player.dir : 4;

  ctx.drawImage(
    spiritImg,
    col * FRAME_W,
    row * FRAME_H,
    FRAME_W,
    FRAME_H,
    player.x - camera.x,
    player.y - camera.y,
    48,
    48
  );
}

// --------------------
// DRAW HOLIDAY
// --------------------
function drawHoliday() {
  ctx.drawImage(
    holidayImg,
    holiday.x - camera.x,
    holiday.y - camera.y,
    40,
    40
  );
}

// --------------------
// LOOP
// --------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateHoliday();
  updateAnimation();
  updateCamera();

  drawMap();
  drawHoliday();
  drawPlayer();

  requestAnimationFrame(loop);
}
