const boardElement = document.getElementById("board");
const timerElement = document.getElementById("timer");
const mineCountElement = document.getElementById("mine-counter");

let cellData = [];
let revealedCount = 0;
let totalSafeCells = 0;
let gameOver = false;
let timerInterval = null;
let elapsedSeconds = 0;
let firstClickDone = false;
let remainingMines = 0;

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0],  [1, 1]
];
function getColFromClick(e) {
  const cell = e.target;
  return parseInt(cell.dataset.col);
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function startGame(difficulty) {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("board-container").style.display = "block";

  let rows, cols, mines;
  let useExMode = false;
  if (difficulty === "easy") {
    rows = cols = 9; mines = 10;
  } else if (difficulty === "medium") {
    rows = cols = 16; mines = 40;
  } else if(difficulty === "hard"){
    rows = 16; cols = 30; mines = 99;
  } else if(difficulty === "Ex"){
    rows = 16; cols = 30; mines = 230;
    useExMode = true;
  } else {
    alert("버그입니다.");
  }

  Timer();
  generateBoard(rows, cols, mines,useExMode);
  
}

function restartGame() {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  timerElement.textContent = "00:00";
  boardElement.innerHTML = "";
  document.getElementById("startScreen").style.display = "flex";
  document.getElementById("board-container").style.display = "none";
}

function Timer() {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  timerElement.textContent = "00:00";
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    timerElement.textContent = `${formatTime(elapsedSeconds)}`;
  }, 1000);
}

function generateBoard(rows, cols, mineCount,useExMode) {
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 45px)`;
  boardElement.style.gridTemplateRows = `repeat(${rows}, 45px)`;

  revealedCount = 0;
  totalSafeCells = rows * cols - mineCount;
  gameOver = false;
  firstClickDone = false;
  remainingMines = mineCount;
  updateMineCounter();

  cellData = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: 0, number: 0 }))
  );

  // 셀 생성
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r; 
      cell.dataset.col = c;
      cell.addEventListener("click", () => {
        if (gameOver || cell.classList.contains("revealed") || cell.dataset.flagged === "true") return;
        if (!firstClickDone) {
          do {
            clearMines();
            if (useExMode) {
              generateEXMines(rows, cols, mineCount, r, c);
            } else {
              generateMines(rows, cols, mineCount, r, c);
            }
            calculateNumbers(rows, cols);
          } while (cellData[r][c].number !== 0);
          firstClickDone = true;
        }
        revealCell(r, c);
      });

      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (gameOver || cell.classList.contains("revealed")) return;

        const flagged = cell.dataset.flagged === "true";

        if (flagged) {
          cell.textContent = "";
          cell.dataset.flagged = "false";
          remainingMines++;
        } else {
          if (remainingMines === 0) return;
          cell.textContent = "🚩";
          cell.dataset.flagged = "true";
          remainingMines--;
        }
        updateMineCounter();
      });

      boardElement.appendChild(cell);
    }
  }
}

function clearMines() {
  for (let r = 0; r < cellData.length; r++) {
    for (let c = 0; c < cellData[0].length; c++) {
      cellData[r][c].mine = false;
      cellData[r][c].number = 0;
    }
  }
}

function generateMines(rows, cols, mineCount, safeRow, safeCol) {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if ((r === safeRow && c === safeCol) || cellData[r][c].mine) continue;
    cellData[r][c].mine = true;
    placed++;
  }
}
function generateEXMines(rows, cols, mineCount, safeRow, safeCol) {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if ((r === safeRow && c === safeCol) || cellData[r][c].mine >= 4) continue;
    cellData[r][c].mine++;
    placed++;
  }
}

function calculateNumbers(rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let count = 0;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          count += cellData[nr][nc].mine;
        }
      }
      cellData[r][c].number = count;
    }
  }
}



function revealCell(r, c) {
  if (gameOver) return;

  const index = r * cellData[0].length + c;
  const cell = boardElement.children[index];
  if (!cell || cell.classList.contains("revealed") || cell.dataset.flagged === "true") return;

  cell.classList.add("revealed");
  revealedCount++;

  if (cellData[r][c].mine >0) {
    cell.textContent = `💣`;
    cell.style.backgroundColor = "red";
    gameOver = true;
    clearInterval(timerInterval);
    const gameover = [
      "이게 지뢰냐",
      "아니 쓰레기게임",
      "이거 코드 잘못짠거아님?",
      "아니 2분의 1이였잖아"
    ];
    const 게임오버 = gameover[Math.floor(Math.random() * gameover.length)];
    alert(게임오버);
    return;
  }

  const num = cellData[r][c].number;
  if (num > 0) {
    cell.textContent = num;
    cell.classList.add(`number-${num}`);
  } else {
    cell.classList.add("empty");
    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < cellData.length && nc >= 0 && nc < cellData[0].length) {
        revealCell(nr, nc);
      }
    }
  }
  
  let 중복방지 = false;
  if (revealedCount === totalSafeCells) {
    gameOver = true;
    clearInterval(timerInterval);
    alert("개추");
    중복방지 = true;
  }
}

function updateMineCounter() {
  if (mineCountElement) {
    mineCountElement.textContent = `지뢰수 : ${remainingMines}`;
  }
}
