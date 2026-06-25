


let puzzle1 = [];
let puzzle2 = [];

let solution1 = [];
let solution2 = [];

let currentMode = "";

let score1 = 0;
let score2 = 0;

let lives1 = 3;
let lives2 = 3;

let timerInterval;
let secondsElapsed = 0;




async function fetchSudoku(difficulty = "easy") {

    const response = await fetch(
        `https://sugoku.onrender.com/board?difficulty=${difficulty}`
    );

    const data = await response.json();

    const puzzle = data.board.map(row =>
        row.map(cell => cell === 0 ? "" : cell)
    );

    const boardCopy = data.board.map(row => [...row]);
    solveSudoku(boardCopy);

    return {
        puzzle: puzzle,
        solution: boardCopy
    };
}




function solveSudoku(board) {

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {

                for (let num = 1; num <= 9; num++) {

                    if (isValid(board, row, col, num)) {

                        board[row][col] = num;

                        if (solveSudoku(board)) return true;

                        board[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}


function isValid(board, row, col, num) {

    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    const startRow = row - row % 3;
    const startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num)
                return false;
        }
    }

    return true;
}



function startTimer(displayId) {

    clearInterval(timerInterval);
    secondsElapsed = 0;

    const display = document.getElementById(displayId);

    timerInterval = setInterval(() => {

        secondsElapsed++;

        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;

        display.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}



async function startSingle() {

    currentMode = "single";

    document.getElementById("mode-screen").classList.add("hidden");
    document.getElementById("single-screen").classList.remove("hidden");

    const data = await fetchSudoku("easy");

    puzzle1 = data.puzzle;
    solution1 = data.solution;

    renderBoard(1, "single-board");

    startTimer("single-timer");
}



async function startCompetitive() {

    currentMode = "competitive";

    document.getElementById("mode-screen").classList.add("hidden");
    document.getElementById("competitive-screen").classList.remove("hidden");

    score1 = score2 = 0;
    lives1 = lives2 = 3;

    document.getElementById("score1").textContent = 0;
    document.getElementById("score2").textContent = 0;
    document.getElementById("lives1").textContent = "❤️❤️❤️";
    document.getElementById("lives2").textContent = "❤️❤️❤️";
    document.getElementById("winner-display").textContent = "";

    // FETCH TWO DIFFERENT PUZZLES
    const data1 = await fetchSudoku("medium");
    const data2 = await fetchSudoku("medium");

    puzzle1 = data1.puzzle;
    solution1 = data1.solution;

    puzzle2 = data2.puzzle;
    solution2 = data2.solution;

    renderBoard(1, "board1");
    renderBoard(2, "board2");

    startTimer("competitive-timer");
}





function renderBoard(player, containerId) {

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const puzzle = player === 1 ? puzzle1 : puzzle2;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {

            const input = document.createElement("input");
            input.maxLength = 1;

            if (puzzle[row][col] !== "") {
                input.value = puzzle[row][col];
                input.disabled = true;
                input.classList.add("prefilled");
            }

            input.addEventListener("input", (e) => {
                handleInput(e, row, col, player);
            });

            container.appendChild(input);
        }
    }
}





function handleInput(e, row, col, player) {

    const value = parseInt(e.target.value);

    if (isNaN(value) || value < 1 || value > 9) {
        e.target.value = "";
        return;
    }

    const solution = player === 1 ? solution1 : solution2;

    if (value === solution[row][col]) {

        e.target.style.backgroundColor = "#c8f7c5";

        if (currentMode === "competitive") {

            if (player === 1) {
                score1++;
                document.getElementById("score1").textContent = score1;
            } else {
                score2++;
                document.getElementById("score2").textContent = score2;
            }

            checkWinner();
        }

    } else {

        e.target.style.backgroundColor = "#f7c5c5";

        if (currentMode === "competitive") {

            if (player === 1) {
                lives1--;
                document.getElementById("lives1").textContent = "❤️".repeat(lives1);
                if (lives1 === 0) endGame(2);
            } else {
                lives2--;
                document.getElementById("lives2").textContent = "❤️".repeat(lives2);
                if (lives2 === 0) endGame(1);
            }
        }
    }
}




function checkWinner() {

    const totalFilled = score1 + score2;

    if (totalFilled === countEmptyCells()) {

        stopTimer();

        if (score1 > score2) endGame(1);
        else if (score2 > score1) endGame(2);
        else document.getElementById("winner-display").textContent = "It's a Draw!";
    }
}

function countEmptyCells() {

    let count = 0;

    for (let row of currentPuzzle) {
        for (let cell of row) {
            if (cell === "") count++;
        }
    }

    return count;
}



function endGame(winner) {

    stopTimer();

    document.getElementById("winner-display").textContent =
        `Player ${winner} Wins!`;

    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => input.disabled = true);
}



function goBack() {

    stopTimer();

    document.getElementById("single-screen").classList.add("hidden");
    document.getElementById("competitive-screen").classList.add("hidden");

    document.getElementById("mode-screen").classList.remove("hidden");
}
