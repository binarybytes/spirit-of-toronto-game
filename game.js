const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD IMAGE
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

let loaded = false;

// only start when image is ready
spiritImg.onload = () => {
  console.log("Spirit loaded");
  loaded = true;
  requestAnimationFrame(loop);
};

spiritImg.onerror = () => {
  console.log("FAILED to load spirit.png");
};

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
// UPDATE LOGIC
// --------------------
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

// --------------------
// DRAW BACKGROUND (always visible)
// --------------------
function drawBackground() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid so you can see movement
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
  if (loaded) {
    ctx.drawImage(spiritImg, player.x, player.y, 48, 48);
  } else {
    // fallback so you ALWAYS see something
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, 40, 40);
  }
}

// --------------------
// MAIN LOOP
// --------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawBackground();
  drawPlayer();

  requestAnimationFrame(loop);
}
