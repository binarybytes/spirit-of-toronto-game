const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD IMAGES
// --------------------
function loadImage(src) {
  const img = new Image();
  img.src = src;

  img.onerror = () => {
    console.log("Missing:", src);
  };

  return img;
}

const spiritImg = loadImage("assets/spirit.png");
const holidayImg = loadImage("assets/holiday.png");
const bgImg = loadImage("assets/background.png");

// --------------------
// PLAYER
// --------------------
const player = {
  x: 300,
  y: 300,
  speed: 4
};

// --------------------
// COMPANION (HOLIDAY)
// --------------------
const companion = {
  x: 200,
  y: 200
};

// --------------------
// INPUT
// --------------------
const keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// --------------------
// UPDATE
// --------------------
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // simple follow AI (Holiday)
  companion.x += (player.x - companion.x) * 0.05;
  companion.y += (player.y - companion.y) * 0.05;
}

// --------------------
// SAFE DRAW FUNCTION
// --------------------
function safeDraw(img, x, y, w, h, fallbackColor = "red") {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, w, h);
  }
}

// --------------------
// DRAW WORLD
// --------------------
function drawWorld() {
  safeDraw(bgImg, 0, 0, canvas.width, canvas.height, "#222");

  // grid so you always see movement
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
// DRAW ENTITIES
// --------------------
function drawEntities() {
  // player (Spirit)
  safeDraw(spiritImg, player.x, player.y, 48, 48, "cyan");

  // companion (Holiday)
  safeDraw(holidayImg, companion.x, companion.y, 40, 40, "yellow");
}

// --------------------
// LOOP
// --------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  drawWorld();
  drawEntities();

  requestAnimationFrame(loop);
}

loop();
