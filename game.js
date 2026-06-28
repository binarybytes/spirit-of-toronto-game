const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD SPRITE SHEET
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

let loaded = false;

// --------------------
// PLAYER
// --------------------
const player = {
  x: 300,
  y: 300,
  speed: 4,
  moving: false,
  dir: 0 // default = down
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
// UPDATE MOVEMENT + DIRECTION
// --------------------
function update() {
  player.moving = false;

  // priority-based movement (prevents diagonal direction flicker)
  if (keys["ArrowUp"]) {
    player.y -= player.speed;
    player.dir = 1; // UP
    player.moving = true;
  } else if (keys["ArrowDown"]) {
    player.y += player.speed;
    player.dir = 0; // DOWN
    player.moving = true;
  } else if (keys["ArrowLeft"]) {
    player.x -= player.speed;
    player.dir = 2; // LEFT
    player.moving = true;
  } else if (keys["ArrowRight"]) {
    player.x += player.speed;
    player.dir = 3; // RIGHT
    player.moving = true;
  }
}

// --------------------
// ANIMATION
// --------------------
function updateAnimation() {
  if (!player.moving) {
    frame = 0; // idle frame column reset
    return;
  }

  tick++;

  if (tick % 10 === 0) {
    frame = (frame + 1) % MAX_FRAMES;
  }
}

// --------------------
// BACKGROUND
// --------------------
function drawBackground() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#333";

  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// --------------------
// DRAW PLAYER
// --------------------
function drawPlayer() {
  if (!loaded) {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, 40, 40);
    return;
  }

  const col = frame;

  // MAP YOUR SHEET ORDER:
  // down, up, left, right, idle
  const row = player.moving ? player.dir : 4;

  ctx.drawImage(
    spiritImg,

    col * FRAME_W,
    row * FRAME_H,

    FRAME_W,
    FRAME_H,

    player.x,
    player.y,

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

  drawBackground();
  drawPlayer();

  requestAnimationFrame(loop);
}
