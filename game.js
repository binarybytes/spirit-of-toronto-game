const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD SPRITE SHEET
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

let loaded = false;

// --------------------
// WORLD SIZE (NEW)
// --------------------
const world = {
  width: 2000,
  height: 2000
};

// --------------------
// CAMERA (NEW)
// --------------------
const camera = {
  x: 0,
  y: 0
};

// --------------------
// PLAYER
// --------------------
const player = {
  x: 300,
  y: 300,
  speed: 4,
  moving: false,
  dir: 0 // 0 down, 1 up, 2 left, 3 right
};

// --------------------
// INPUT
// --------------------
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// --------------------
// SPRITE SHEET CONFIG
// --------------------
const COLS = 4;
const ROWS = 5;

let FRAME_W = 0;
let FRAME_H = 0;

// animation
let frame = 0;
let tick = 0;
const MAX_FRAMES = 4;

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
// UPDATE PLAYER
// --------------------
function update() {
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

  // keep player inside world bounds
  player.x = Math.max(0, Math.min(world.width, player.x));
  player.y = Math.max(0, Math.min(world.height, player.y));
}

// --------------------
// CAMERA FOLLOW (NEW)
// --------------------
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  // clamp camera to world bounds
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
// BACKGROUND (WORLD SPACE)
// --------------------
function drawBackground() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid
  ctx.strokeStyle = "#333";

  const startX = Math.floor(camera.x / 40) * 40;
  const startY = Math.floor(camera.y / 40) * 40;

  for (let x = startX; x < camera.x + canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x - camera.x, 0);
    ctx.lineTo(x - camera.x, canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y < camera.y + canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y - camera.y);
    ctx.lineTo(canvas.width, y - camera.y);
    ctx.stroke();
  }
}

// --------------------
// DRAW PLAYER (WORLD → SCREEN SPACE)
// --------------------
function drawPlayer() {
  if (!loaded) {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x - camera.x, player.y - camera.y, 40, 40);
    return;
  }

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

  drawBackground();
  drawPlayer();

  requestAnimationFrame(loop);
}
