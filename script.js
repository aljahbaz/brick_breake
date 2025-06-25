let canvas, ctx;
let paddle, ball, bricks = [], powerUps = [], currentLevel = 0;
let leftPressed = false, rightPressed = false;
let score = 0, highScore = localStorage.getItem("neonHighScore") || 0;
let lives = 3, isMuted = false, bgMusic, brickSound, powerUpSound;
let gameStarted = false, gameOver = false;

const levels = [
  [
    [1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,2,1],
    [1,0,3,0,0,3,0,1],
  ],
  [
    [2,1,2,1,2,1,2,1],
    [0,0,0,3,3,0,0,0],
    [1,3,1,3,1,3,1,3]
  ]
];

const brickWidth = 50;
const brickHeight = 20;

function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("ui").style.display = "block";
  canvas.width = 400;
  canvas.height = 500;
  initSounds();
  resetGame();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  paddle = { x: 160, y: 460, w: 80, h: 10, speed: 6 };
  ball = { x: 200, y: 300, r: 8, dx: 4, dy: -4 };
  bricks = [];
  powerUps = [];
  lives = 3;
  score = 0;
  gameOver = false;
  loadLevel(currentLevel);
}

function loadLevel(levelIndex) {
  const layout = levels[levelIndex];
  bricks = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      const type = layout[r][c];
      if (type !== 0) {
        bricks.push({ x: c * brickWidth, y: r * brickHeight + 40, w: brickWidth, h: brickHeight, type, hits: type });
      }
    }
  }
}

function drawPaddle() {
  ctx.fillStyle = "lime";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#00f6ff";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  bricks.forEach(brick => {
    ctx.fillStyle = brick.type === 1 ? "#ff3b3b" : brick.type === 2 ? "orange" : "gold";
    ctx.fillRect(brick.x, brick.y, brick.w - 2, brick.h - 2);
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`High Score: ${highScore}`, 260, 20);
  ctx.fillText(`Lives: ${lives}`, 10, 40);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  move();
  checkCollisions();
  drawPaddle();
  drawBall();
  drawBricks();
  drawScore();

  if (!gameOver) requestAnimationFrame(gameLoop);
  else showGameOver();
}

function move() {
  if (leftPressed) paddle.x -= paddle.speed;
  if (rightPressed) paddle.x += paddle.speed;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.dx *= -1;
  if (ball.y - ball.r < 0) ball.dy *= -1;

  if (ball.y + ball.r > canvas.height) {
    lives--;
    if (lives <= 0) gameOver = true;
    else {
      ball.x = 200;
      ball.y = 300;
      ball.dx = 4;
      ball.dy = -4;
    }
  }

  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.r > paddle.y &&
    ball.y - ball.r < paddle.y + paddle.h
  ) {
    ball.dy *= -1;
    ball.y = paddle.y - ball.r;
  }
}

function checkCollisions() {
  bricks.forEach((brick, i) => {
    if (
      ball.x > brick.x &&
      ball.x < brick.x + brick.w &&
      ball.y > brick.y &&
      ball.y < brick.y + brick.h
    ) {
      ball.dy *= -1;
      brick.hits--;
      if (!isMuted) brickSound.play();
      if (brick.hits <= 0) {
        bricks.splice(i, 1);
        score += 10;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("neonHighScore", highScore);
        }
        if (bricks.length === 0) {
          currentLevel++;
          if (currentLevel < levels.length) loadLevel(currentLevel);
          else {
            gameOver = true;
            alert("🎉 You Win!");
          }
        }
      }
    }
  });
}

function showGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 120, 250);
  document.getElementById("restartBtn").style.display = "block";
}

function restartGame() {
  currentLevel = 0;
  score = 0;
  document.getElementById("restartBtn").style.display = "none";
  resetGame();
  requestAnimationFrame(gameLoop);
}

function toggleMute() {
  isMuted = !isMuted;
  document.getElementById("muteBtn").textContent = isMuted ? "🔇" : "🔊";
  if (bgMusic) bgMusic.muted = isMuted;
}

function initSounds() {
  bgMusic = new Audio("assets/bg_music.mp3");
  brickSound = new Audio("assets/brick.mp3");
  powerUpSound = new Audio("assets/powerup.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.3;
  if (!isMuted) bgMusic.play();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowRight") rightPressed = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowRight") rightPressed = false;
});
