const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tetrominoCanvas = document.getElementById("tetrominoCanvas");
const ctx2 = tetrominoCanvas.getContext("2d");
const div = document.getElementById("tetrominoshowed");
const gameOverDiv = document.getElementById("gameover")
const restart = document.getElementById("restart");

tetrominoCanvas.width = tetrominoCanvas.offsetWidth;
tetrominoCanvas.height = tetrominoCanvas.offsetHeight;

const gridSize = 25;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const fps = 60;
let tetrominoX = 125;
let tetrominoY = 0;
let tetrominoCounter = 0;
let gameOver = false;

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

const gameArea = [];
for (let y = 0; y < canvasHeight / gridSize; y++) {
  gameArea[y] = [];
  for (let x = 0; x < canvasWidth / gridSize; x++) {
    gameArea[y][x] = 0;
  }
}

const tetrominos = [
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFD700", // Gold
    borderColor: "#B8860B", // Dark golden
  },
  {
    shape: [[1, 1, 1, 1]],
    color: "#FF4081", // Pink
    borderColor: "#C2185B", // Dark pink
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#64FFDA", // Teal
    borderColor: "#00BFA5", // Dark teal
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#7C4DFF", // Purple
    borderColor: "#512DA8", // Dark purple
  },
];

function drawArea() {
  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#1a1a1a");
  gradient.addColorStop(1, "#2d2d2d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= canvasWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= canvasHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}

function drawTetromino(tetromino, x, y) {
  if(gameOver)return;
  for (let i = 0; i < tetromino.shape.length; i++) {
    for (let j = 0; j < tetromino.shape[i].length; j++) {
      if (tetromino.shape[i][j]) {
        // Create block gradient
        const blockGradient = ctx.createLinearGradient(
          x + j * gridSize,
          y + i * gridSize,
          x + j * gridSize,
          y + (i + 1) * gridSize
        );
        blockGradient.addColorStop(0, tetromino.color);
        blockGradient.addColorStop(1, tetromino.borderColor);
        
        // Draw block with gradient
        ctx.fillStyle = blockGradient;
        ctx.fillRect(
          x + j * gridSize,
          y + i * gridSize,
          gridSize,
          gridSize
        );

        // Add highlight effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(
          x + j * gridSize,
          y + i * gridSize,
          gridSize,
          2
        );

        // Add border
        ctx.strokeStyle = tetromino.borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          x + j * gridSize,
          y + i * gridSize,
          gridSize,
          gridSize
        );
      }
    }
  }
}

function checkIsGameOver(){
  for(let i =0; i<gameArea[0].length; i++ ){
    if(gameArea[0][i] === 1){
      gameOver=true;
      gameOverDiv.style.display = "block";
    }
  }
}

function moveTetrominoDown() {
  if (!checkCollision()) {
    tetrominoY += gridSize;
  } else {
    placeTetromino();
    tetrominoCounter = (tetrominoCounter + 1) % tetrominos.length;
    tetrominoX = 125;
    tetrominoY = 0;
  }
}

function placeTetromino() {
  const tetromino = tetrominos[tetrominoCounter];
  // Place the tetromino on the game area
  for (let i = 0; i < tetromino.shape.length; i++) {
    for (let j = 0; j < tetromino.shape[i].length; j++) {
      if (tetromino.shape[i][j]) {
        gameArea[(tetrominoY + i * gridSize) / gridSize][
          (tetrominoX + j * gridSize) / gridSize
        ] = 1; // Save the color of the tetromino instead of just 1
      }
    }
  }
  clearFullLines(); // Call the function to check and clear any full lines
}

function clearFullLines() {
  for (let y = gameArea.length - 1; y >= 0; y--) {
    // Check if the current row is completely filled
    if (gameArea[y].every((cell) => cell !== 0)) {
      // If the row is full, clear it and shift rows above it down
      gameArea.splice(y, 1); // Remove the filled row
      gameArea.unshift(Array(gameArea[0].length).fill(0)); // Add an empty row at the top
      y++; // Stay at the same row to check for more full lines after shifting
    }
  }
}

function drawGameArea() {
  for (let y = 0; y < gameArea.length; y++) {
    for (let x = 0; x < gameArea[y].length; x++) {
      if (gameArea[y][x] === 1) {
        // Create gradient for placed blocks
        const blockGradient = ctx.createLinearGradient(
          x * gridSize,
          y * gridSize,
          x * gridSize,
          (y + 1) * gridSize
        );
        blockGradient.addColorStop(0, "#4A90E2");
        blockGradient.addColorStop(1, "#357ABD");
        
        ctx.fillStyle = blockGradient;
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        
        // Add highlight effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, 2);
        
        // Add border
        ctx.strokeStyle = "#2C6BA0";
        ctx.lineWidth = 1;
        ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }
  }
}

function checkCollision() {
  const tetromino = tetrominos[tetrominoCounter];

  // Her hücreyi kontrol et
  for (let i = 0; i < tetromino.shape.length; i++) {
    for (let j = 0; j < tetromino.shape[i].length; j++) {
      if (tetromino.shape[i][j]) {
        // Tetromino'nun aşağısındaki hücrenin canvas dışında olup olmadığını kontrol et
        if (
          tetrominoY + (i + 1) * gridSize >= canvasHeight || // Eğer tetromino aşağıya doğru canvas dışına çıkarsa
          gameArea[(tetrominoY + (i + 1) * gridSize) / gridSize][
            (tetrominoX + j * gridSize) / gridSize
          ] === 1 // Ya da mevcut alanda başka bir blok varsa
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

document.addEventListener("keydown", (e) => {
  const tetromino = tetrominos[tetrominoCounter];

  if (
    e.key === "ArrowRight" &&
    tetrominoX + tetromino.shape[0].length * gridSize < canvasWidth
  ) {
    tetrominoX += gridSize;
  } else if (e.key === "ArrowLeft" && tetrominoX > 0) {
    tetrominoX -= gridSize;
  } else if (e.key === "ArrowUp") {
    rotateTetromino();
  } else if (e.key === "ArrowDown") {
    moveTetrominoDown();
  }
});

function rotateTetromino() {
  const tetromino = tetrominos[tetrominoCounter];

  // Yeni bir döndürülmüş matris oluştur
  const rotatedShape = tetromino.shape[0].map((_, i) =>
    tetromino.shape.map((row) => row[i]).reverse()
  );

  // Dönüşün sınırları aşıp aşmadığını kontrol et
  const tetrominoWidth = rotatedShape[0].length * gridSize;
  if (tetrominoX + tetrominoWidth <= canvasWidth) {
    tetromino.shape = rotatedShape;
  }
}

function showTetromino() {
  if(gameOver)return
  const nextTetrominoIndex = (tetrominoCounter + 1) % tetrominos.length;
  const tetromino = tetrominos[nextTetrominoIndex];

  const tetrominoWidth = tetromino.shape[0].length * gridSize;
  const tetrominoHeight = tetromino.shape.length * gridSize;

  const centerX = tetrominoCanvas.width / 2;
  const centerY = tetrominoCanvas.height / 2;

  const tetrominoXForCanvas2 = centerX - tetrominoWidth / 2;
  const tetrominoYForCanvas2 = centerY - tetrominoHeight / 2;

  // Draw background for next piece preview
  const previewGradient = ctx2.createLinearGradient(0, 0, 0, tetrominoCanvas.height);
  previewGradient.addColorStop(0, "#2d2d2d");
  previewGradient.addColorStop(1, "#1a1a1a");
  ctx2.fillStyle = previewGradient;
  ctx2.fillRect(0, 0, tetrominoCanvas.width, tetrominoCanvas.height);

  for (let i = 0; i < tetromino.shape.length; i++) {
    for (let j = 0; j < tetromino.shape[i].length; j++) {
      if (tetromino.shape[i][j]) {
        // Create gradient for preview piece
        const blockGradient = ctx2.createLinearGradient(
          tetrominoXForCanvas2 + j * gridSize,
          tetrominoYForCanvas2 + i * gridSize,
          tetrominoXForCanvas2 + j * gridSize,
          tetrominoYForCanvas2 + (i + 1) * gridSize
        );
        blockGradient.addColorStop(0, tetromino.color);
        blockGradient.addColorStop(1, tetromino.borderColor);
        
        ctx2.fillStyle = blockGradient;
        ctx2.fillRect(
          tetrominoXForCanvas2 + j * gridSize,
          tetrominoYForCanvas2 + i * gridSize,
          gridSize,
          gridSize
        );

        // Add highlight effect
        ctx2.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx2.fillRect(
          tetrominoXForCanvas2 + j * gridSize,
          tetrominoYForCanvas2 + i * gridSize,
          gridSize,
          2
        );

        // Add border
        ctx2.strokeStyle = tetromino.borderColor;
        ctx2.lineWidth = 1;
        ctx2.strokeRect(
          tetrominoXForCanvas2 + j * gridSize,
          tetrominoYForCanvas2 + i * gridSize,
          gridSize,
          gridSize
        );
      }
    }
  }
}

restart.addEventListener("click",()=>{
  gameOver=false;
  gameOverDiv.style.display = "none";
  gameArea.forEach((row) => row.fill(0));
})
setInterval(() => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx2.clearRect(0, 0, canvasWidth, canvasHeight);

  drawArea();
  showTetromino();
  drawGameArea();
  drawTetromino(tetrominos[tetrominoCounter], tetrominoX, tetrominoY);

  checkIsGameOver();
  console.log(gameOver);
  
  moveTetrominoDown();
}, 10000 / fps);
