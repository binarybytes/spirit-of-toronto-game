const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function loop() {
  ctx.fillStyle = "lime";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("GAME IS RUNNING", 200, 300);

  requestAnimationFrame(loop);
}

loop();
