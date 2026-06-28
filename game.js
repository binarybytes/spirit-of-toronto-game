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
  speed: 4
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
// SPRITE SHEET CONFIG (4x5)
// --------------------
const COLS = 4;
const ROWS = 5;

let FRAME_W = 0;
let FRAME_H = 0;

// animation
let frame = 0;
let tick = 0;
const MAX_FRAMES = 4; // adjust if your animation uses more frames

// --------------------
// WHEN IMAGE LOADS
// --------------------
spiritImg.onload = () => {
  console.log("Sprite loaded");

  FRAME_W = spiritImg.width / COLS;
  FRAME_H = spiritImg.height / ROWS;

  loaded = true;

  loop();
};

// --------------------
// UPDATE
// --------------------
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

// --------------------
// ANIMATION UPDATE
// --------------------
function updateAnimation() {
  tick++;

  if (tick % 10 === 0) {
    frame = (frame + 1) % MAX_FRAMES;
  }
}

// --------------------
// DRAW BACKGROUND
// --------------------
function drawBackground() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid for debugging movement
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
// DRAW PLAYER (SLICED SPRITE SHEET)
// --------------------
function drawPlayer() {
  if (!loaded) {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, 40, 40);
    return;
  }

  const col = frame % COLS;
  const row = Math.floor(frame / COLS); // assumes animation is row 0

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
