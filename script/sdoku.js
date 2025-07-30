//변수들
    const SIZE = 9; //전체 사이즈
    const BOX_SIZE = 3; //칸 사이즈 3*3
    const MAX_HINTS = 3; //최대 힌트 수
    const maxLives = 3; //최대 생명 수
    const difficultyLevels = { easy: 10, medium: 50, hard: 60 }; //레벨 난이도 설정
    let memoMode = false; //기본모드(메모 상태가 아니다.)
    let hintCount = 0; //힌트 사용횟수를 위한 초기변수값
    let lives = maxLives; //목숨
    let fullBoard = []; //보드 배열
    let sudokuBoard = []; //내부 배열
    let timerInterval;   // setInterval ID 저장용
    let elapsedSeconds = 0;  // 지난 초

    //html 호출
    const table = document.getElementById("sudokuBoard"); //스도쿠 보드 테이블입니다.
    const toggleBtn = document.getElementById("toggleModeBtn");//메모 버튼 입니다.
    const resetBtn = document.getElementById("resetBtn");//다시시작 버튼입니다.
    const hintBtn = document.getElementById("hintBtn");//힌트 버튼입니다.
    const darkModeBtn = document.getElementById("darkModeToggle"); //다크모드 버튼입니다.
    const lifeDisplay = document.getElementById("lifeDisplay");// 목숨 관련 화면입니다.

    //보드 생성
    function createEmptyBoard() { //createEmptyBoard 함수 생성
      return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); //length:SIZE = 행 SIZE.fill = 열로하고 값을 0으로 설정
    }
    //숫자 섞기
    function shuffle(array) { //array란 함수를 생성
      return array.sort(() => Math.random() - 0.5); //배열을 랜덤기준으로 정리해서 섞어주세요
    }
    //숫자 중복 방지
    function isSafe(board, row, col, num) { //전체 보드,가로,세로,숫자 매개변수 생성
      for (let i = 0; i < SIZE; i++) { //i를 보드의 행에 맞춰 반복
        if (board[row][i] === num || board[i][col] === num) return false; 
        //만약 가로의 i번째의 숫자와 세로의 i번째의 숫자가 같으면 값을 주지 마세요~
      }
      //3*3 박스 부분
      const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE; //가로 3(BOX_SIZE)칸 숫자채워주세요~
      const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE; //세로 3(BOX_SIZE)칸 숫자채워주세요~
      for (let r = 0; r < BOX_SIZE; r++) { //가로 부분 반복
        for (let c = 0; c < BOX_SIZE; c++) { // 그안에서 세로부분 검사
          if (board[boxRow + r][boxCol + c] === num) return false; //가로행과 세로행의 r/c번째의 숫자를 비교해서 중복이면 주지 마세요~
        }
      }
      return true; //위 조건이 아니라면 값을 주세요~
    }
    
    //숫자 생성 코드
    function fillBoard(board) {
      for (let row = 0; row < SIZE; row++) { //보드 행 만큼 반복
        for (let col = 0; col < SIZE; col++) { //보드 열 만큼 반복
          if (board[row][col] === 0) { //만약 행과 열에 0이 있다면
            const numbers = shuffle([1,2,3,4,5,6,7,8,9]); //1~9까지 숫자를 채워주세요~
            for (let num of numbers) { //numbers 만큼 반복해주세요~
              if (isSafe(board, row, col, num)) {//위의 중복방지 코드 가져와서 맞는것들만 해주세요~
                board[row][col] = num; //행과 열 만큼 반복해서 num을 해주세요
                if (fillBoard(board)) return true; //백트래킹입니다.
                board[row][col] = 0; //ㅈ댔으니 다시 처음부터~
              }//if (isSafe(board, row, col, num))
            }//for (let num of numbers)
            return false; //백트래킹입니다~
          }//if (board[row][col] === 0)
        }//(let col = 0; col < SIZE; col++)
      }// (let row = 0; row < SIZE; row++)
      return true;//다됬으면 주세용~
    }

    function generateSudoku() {
      const board = createEmptyBoard();
      fillBoard(board);
      return board;
    }
    //숫자 지우기
    function removeCells(board, emptyCount) {
      let removed = 0;
      while (removed < emptyCount) {
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);
        if (board[row][col] !== 0) {
          board[row][col] = 0;
          removed++;
        }
      }
    }

    function copyBoard(board) {
      return board.map(row => row.slice());
    }

    //생명 카운트
    function updateLifeDisplay() {
      lifeDisplay.textContent = "❤️".repeat(lives) + "X".repeat(maxLives - lives);
    }

    function updateInputColors() {
      const isDark = document.body.classList.contains("dark-mode");
      document.querySelectorAll("table textarea").forEach(input => {
        if (input.disabled) {
          input.style.color = isDark ? "white" : "black";
        } else {
          input.style.color = isDark ? "skyblue" : "blue";
        }
      });
    }

    // 보드 이벤트들
    function setupBoard(boardData) {
      const inputs = document.querySelectorAll("table textarea");
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          const index = row * SIZE + col;
          const input = inputs[index];
          input.disabled = false;
          input.value = "";
          input.dataset.memo = "";
          input.style.fontSize = memoMode ? "1.8rem" : "3rem";
          memoMode ? input.removeAttribute("maxlength") : input.setAttribute("maxlength", "9");

          const value = boardData[row][col];
          if (value !== 0) {
            input.value = value;
            input.disabled = true;
            input.style.fontSize = "3rem";
            input.style.color = document.body.classList.contains("dark-mode") ? "white" : "black";
          } else {
            input.style.color = "";
          }
        }
      }
      updateInputColors();
    }
    //실시간으로 체크하는 함수
    function attachInputEvents() {
      const inputs = document.querySelectorAll("table textarea");
      inputs.forEach((cell, idx) => {
        if (!cell.disabled) {
          cell.addEventListener("input", () => {
            let val = cell.value.replace(/[^1-9]/g, "");
            if (memoMode) {
              cell.removeAttribute("maxlength");
              const sorted = [...new Set(val)].sort();
              const lines = sorted.join("").match(/.{1,3}/g);
              cell.value = lines ? lines.join("\n") : "";
              cell.dataset.memo = "true";
              cell.style.fontSize = "1.8rem";
              updateInputColors();
              return;
            }
            if (cell.dataset.memo === "true") {
              cell.dataset.memo = "";
              cell.value = "";
              val = "";
            }
            val = val.slice(0, 1);
            if (!val) return cell.value = "";
            const answer = fullBoard[Math.floor(idx / SIZE)][idx % SIZE];
            if (parseInt(val, 10) !== answer) {
              alert("틀렸습니다.");
              cell.value = "";
              lives--;
              updateLifeDisplay();
              if (lives <= 0) {
                alert("게임 오버!");
                inputs.forEach(input => !input.disabled && (input.disabled = true));
              }
              return;
            }
            cell.setAttribute("maxlength", "9");
            cell.value = val;
            cell.style.fontSize = "3rem";
            cell.style.color = document.body.classList.contains("dark-mode") ? "skyblue" : "blue";
            checkMemoConflicts(Math.floor(idx / SIZE), idx % SIZE, parseInt(val));
            checkSudokuAnswer();
            updateInputColors();
            checkNumberCounts();
            attachKeypadEvents();
          });
        }
      });
    }

    function checkSudokuAnswer() {
      const inputs = document.querySelectorAll("table textarea");
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          const index = row * SIZE + col;
          const val = parseInt(inputs[index].value.trim(), 10);
          if (val !== fullBoard[row][col]) return;
        }
      }
      clearInterval(timerInterval);
      const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
      const seconds = String(elapsedSeconds % 60).padStart(2, "0");
      alert(`ㅊㅋㅊㅋ 걸린 시간: ${minutes}:${seconds}`);
    }

    function checkNumberCounts() {
      const countMap = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 0]));
      document.querySelectorAll("table textarea").forEach(input => {
        const val = input.value.trim();
        if (val >= 1 && val <= 9) countMap[val]++;
      });

      document.querySelectorAll(".key").forEach(key => {
        const num = key.dataset.value;
        key.style.visibility = countMap[num] >= 9 ? "hidden" : "visible";
      });
    }

    // 겜 시작화면
    function startGame(difficulty) {
      document.querySelector(".gamescreen").removeAttribute("hidden");
      document.getElementById("startScreen").style.display = "none";
      fullBoard = generateSudoku();
      sudokuBoard = copyBoard(fullBoard);
      removeCells(sudokuBoard, difficultyLevels[difficulty] || 40);
      setupBoard(sudokuBoard);
      attachInputEvents();
      attachKeypadEvents();
      lives = maxLives;
      hintCount = 0;
      updateLifeDisplay();
      startTimer();
      hintBtn.textContent = `힌트(${MAX_HINTS})`;
    }

    // 리셋 버튼
    resetBtn.addEventListener("click", () => {
      document.querySelector(".gamescreen").setAttribute("hidden", true);
      document.getElementById("startScreen").style.display = "flex";
      lives = maxLives;
      fullBoard = [];
      sudokuBoard = [];
      updateLifeDisplay();
      stopTimer();
      checkNumberCounts();
    });

    toggleBtn.addEventListener("click", () => {
      memoMode = !memoMode;
      toggleBtn.textContent = memoMode ? "정답" : "메모";
    });

    hintBtn.addEventListener("click", () => {
      if (hintCount >= MAX_HINTS) return alert("힌트가 없습니다.");
      const inputs = document.querySelectorAll("table textarea");
      const available = Array.from(inputs).filter((input, idx) => !input.disabled && input.value.trim() === "");
      if (available.length === 0) return alert("힌트를 줄 수 있는 칸이 없습니다!");
      const randomInput = available[Math.floor(Math.random() * available.length)];
      const index = Array.from(inputs).indexOf(randomInput);
      const row = Math.floor(index / SIZE);
      const col = index % SIZE;
      randomInput.value = fullBoard[row][col];
      randomInput.disabled = true;
      randomInput.style.color = "red";
      randomInput.style.fontSize = "3rem";
      randomInput.dataset.memo = "";
      hintCount++;
      hintBtn.textContent = `힌트(${MAX_HINTS - hintCount})`;
      checkSudokuAnswer();
    });

    darkModeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      document.getElementById("startScreen").classList.toggle("dark-mode");
      document.getElementById("keypad").classList.toggle("dark-mode");
      document.getElementById("timer").classList.toggle("dark-mode");
      document.querySelectorAll("textarea, button, h2, table").forEach(el => {
        el.classList.toggle("dark-mode");
      });
      darkModeBtn.textContent = document.body.classList.contains("dark-mode") ? "라이트모드" : "다크모드";
      updateInputColors();
    });


    (function generateBoardHTML() {
      let html = "<tbody>";
      for (let i = 0; i < SIZE; i++) {
        html += "<tr>";
        for (let j = 0; j < SIZE; j++) {
          html += `<td><textarea maxlength="9"></textarea></td>`;
        }
        html += "</tr>";
      }
      html += "</tbody>";
      table.innerHTML = html;
    })();
    function attachKeypadEvents() {
    document.querySelectorAll(".key").forEach(key => {
      const selectedNum = key.dataset.value;

      //홀드하면 표시
      key.addEventListener("mousedown", () => {
        document.querySelectorAll("table textarea").forEach(input => {
          if (input.value.trim() === selectedNum) {
            input.classList.add("highlight-same");
          }
        });
      });

      //홀드 해제하면 해제
        const clearHighlight = () => {
          document.querySelectorAll(".highlight-same").forEach(input => {
            input.classList.remove("highlight-same");
          });
        };
        key.addEventListener("mouseup", clearHighlight);
        key.addEventListener("mouseleave", clearHighlight);
      });
    }
      //시간 관련
    function startTimer() {
      elapsedSeconds = 0;  // 시작할 때 초기화
      updateTimerDisplay();  // 00:00 표시
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
      }, 1000);
    }
    function stopTimer() {
      clearInterval(timerInterval);
    }
    function updateTimerDisplay() {
      const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
      const seconds = String(elapsedSeconds % 60).padStart(2, "0");
      document.getElementById("timer").textContent = `${minutes}:${seconds}`;
    }
    //메모모드 지우는 함수
    function checkMemoConflicts(row, col, num) {
      const inputs = document.querySelectorAll("table textarea");

      for (let i = 0; i < SIZE; i++) {
        // 행 탐색
        const rowIdx = row * SIZE + i;
        const rowCell = inputs[rowIdx];
        if (!rowCell.disabled && rowCell.dataset.memo === "true") {
          updateMemoCell(rowCell, num);
        }

        // 열 탐색
        const colIdx = i * SIZE + col;
        const colCell = inputs[colIdx];
        if (!colCell.disabled && colCell.dataset.memo === "true") {
          updateMemoCell(colCell, num);
        }
      }
    }
    function updateMemoCell(cell, numToRemove) {
      const val = cell.value.replace(new RegExp(numToRemove, "g"), "");
      const sorted = [...new Set(val)].sort();
      const lines = sorted.join("").match(/.{1,3}/g);
      cell.value = lines ? lines.join("\n") : "";
    }