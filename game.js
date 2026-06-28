const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// SPRITE SHEET
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

let loaded = false;

// --------------------
// WORLD / TILE SYSTEM
// --------------------
const TILE_SIZE = 40;

// simple map:
// 0 = ground (walkable)
// 1 = building (collision)
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
// PLAYER
// --------------------
const player = {
  x: 100,
  y: 100,
  speed: 4,
  moving: false,
  dir: 0
};

// --------------------
// INPUT
// --------------------
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// --------------------
// SPRITE SHEET CONFIG (4x5)
// --------------------
const COLS = 4;
const ROWS = 5;

let FRAME_W = 0;
let FRAME_H = 0;

let frame = 0;
let tick = 0;
const MAX_FRAMES = 4;

// --------------------
// COLLISION CHECK
// --------------------
function isBlocked(x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);

  if (!map[row] || map[row][col] === undefined) return true;
  return map[row][col] === 1;
}

// --------------------
// LOAD
// --------------------
spiritImg.onload = () => {
  FRAME_W = spiritImg.width / COLS;
  FRAME_H = spiritImg.height / ROWS;

  loaded = true;
  loop();
};

// --------------------
// UPDATE (WITH COLLISION)
// --------------------
function update() {
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

  // collision check
  if (!isBlocked(newX, player.y)) player.x = newX;
  if (!isBlocked(player.x, newY)) player.y = newY;
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
// DRAW TILE MAP
// --------------------
function drawMap() {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const tile = map[r][c];

      const x = c * TILE_SIZE - camera.x;
      const y = r * TILE_SIZE - camera.y;

      if (tile === 1) {
        ctx.fillStyle = "#444"; // building
      } else {
        ctx.fillStyle = "#1a1a1a"; // ground
      }

      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }
}

// --------------------
// DRAW PLAYER
// --------------------
function drawPlayer() {
  if (!loaded) return;

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
// LOOP
// --------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  updateAnimation();
  updateCamera();

  drawMap();
  drawPlayer();

  requestAnimationFrame(loop);
}
