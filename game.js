const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tetrominoCanvas = document.getElementById("tetrominoCanvas");
const ctx2 = tetrominoCanvas.getContext("2d");
const div = document.getElementById("tetrominoshowed");

tetrominoCanvas.width = tetrominoCanvas.offsetWidth;
tetrominoCanvas.height = tetrominoCanvas.offsetHeight;

const gridSize = 25;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const fps = 60;
let tetrominoX = 125;
let tetrominoY = 0;
let tetrominoCounter = 0;

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
    color: "blue",
  },
  {
    shape: [[1, 1, 1, 1]],
    color: "red",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "green",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "orange",
  },
];

function drawArea() {
  ctx.strokeStyle = "black";

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
  for (let i = 0; i < tetromino.shape.length; i++) {
    // gives the row length
    for (let j = 0; j < tetromino.shape[i].length; j++) {
      // column length
      if (tetromino.shape[i][j]) {
        ctx.fillStyle = tetromino.color;
        ctx.fillRect(
          x + j * gridSize, // Use j for column
          y + i * gridSize, // Use i for row
          gridSize,
          gridSize
        );
        ctx.strokeStyle = "black";
        ctx.strokeRect(x + j * gridSize, y + i * gridSize, gridSize, gridSize);
      }
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
        // Draw tetrominos that have already been placed
        ctx.fillStyle = "blue"; // Choose a color, could be dynamic
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = "black";
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
  const nextTetrominoIndex = (tetrominoCounter + 1) % tetrominos.length; // Bu sayede dizi sonuna geldiğinde sıfırlama yapar
  const tetromino = tetrominos[nextTetrominoIndex];

  // Calculate the width and height of the tetromino
  const tetrominoWidth = tetromino.shape[0].length * gridSize;
  const tetrominoHeight = tetromino.shape.length * gridSize;

  // Calculate the center position of the canvas
  const centerX = tetrominoCanvas.width / 2;
  const centerY = tetrominoCanvas.height / 2;

  // Calculate the starting position to center the tetromino
  const tetrominoXForCanvas2 = centerX - tetrominoWidth / 2;
  const tetrominoYForCanvas2 = centerY - tetrominoHeight / 2;

  // Clear the canvas
  ctx2.clearRect(0, 0, tetrominoCanvas.width, tetrominoCanvas.height);

  // Draw the tetromino centered on the canvas
  for (let i = 0; i < tetromino.shape.length; i++) {
    for (let j = 0; j < tetromino.shape[i].length; j++) {
      if (tetromino.shape[i][j]) {
        ctx2.fillStyle = tetromino.color;
        ctx2.fillRect(
          tetrominoXForCanvas2 + j * gridSize, // x position (centered)
          tetrominoYForCanvas2 + i * gridSize, // y position (centered)
          gridSize,
          gridSize
        );

        ctx2.fillRect(
          tetrominoXForCanvas2 + j * gridSize, // x position (centered)
          tetrominoYForCanvas2 + i * gridSize,
          gridSize,
          gridSize
        );
        ctx2.strokeRect(
          tetrominoXForCanvas2 + j * gridSize, // x position (centered)
          tetrominoYForCanvas2 + i * gridSize,
          gridSize,
          gridSize
        );
      }
    }
  }
}

setInterval(() => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx2.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  drawArea();

  showTetromino();
  drawGameArea();
  drawTetromino(tetrominos[tetrominoCounter], tetrominoX, tetrominoY);
  console.log(tetrominoCounter);

  moveTetrominoDown();
  console.log(tetrominoX, tetrominoY);
}, 10000 / fps);
