const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD IMAGE
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

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
// UPDATE
// --------------------
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

// --------------------
// DRAW BACKGROUND (TEMP DEBUG)
// --------------------
function drawBackground() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid so you SEE movement
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
  // fallback if image fails
  if (!spiritImg.complete || spiritImg.naturalWidth === 0) {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, 40, 40);
    return;
  }

  ctx.drawImage(
    spiritImg,
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
  update();

  drawBackground();
  drawPlayer();

  requestAnimationFrame(loop);
}

// --------------------
// START GAME
// --------------------
spiritImg.onload = () => {
  console.log("Spirit loaded");
  loop();
};

// fallback if image fails to load
setTimeout(() => {
  if (!spiritImg.complete) {
    console.log("Image not loaded — using fallback rendering");
    loop();
  }
}, 1000);
