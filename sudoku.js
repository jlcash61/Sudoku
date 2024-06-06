document.addEventListener("DOMContentLoaded", function () {
    let board = loadBoard() || getRandomBoard();

    function createBoard(board) {
        const table = document.getElementById("sudoku-board");
        table.innerHTML = ""; // Clear the existing table

        for (let row = 0; row < 9; row++) {
            const tr = document.createElement("tr");

            for (let col = 0; col < 9; col++) {
                const td = document.createElement("td");

                if (row % 3 === 0) {
                    td.classList.add("bold-border-top");
                }
                if (col % 3 === 0) {
                    td.classList.add("bold-border-left");
                }
                if ((row + 1) % 3 === 0 && row !== 8) {
                    td.classList.add("bold-border-bottom");
                }
                if ((col + 1) % 3 === 0 && col !== 8) {
                    td.classList.add("bold-border-right");
                }

                const input = document.createElement("input");
                input.type = "number";
                input.max = 9;
                input.min = 1;
                input.inputMode = "numeric";

                if (board[row][col] !== 0) {
                    input.value = board[row][col];
                    input.disabled = true;
                } else {
                    input.addEventListener('input', function() {
                        validateInput(input, row, col);
                        saveBoard(board);
                        if (checkWinCondition()) {
                            alert('Congratulations! You have completed the Sudoku puzzle correctly.');
                            document.getElementById("new-game-button").style.display = "block";
                        }
                    });
                }

                td.appendChild(input);
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    }

    function validateInput(input, row, col) {
        const value = input.value;
        if (!value.match(/^[1-9]$/)) {
            input.value = '';
            alert('Please enter a number between 1 and 9.');
            return;
        }

        if (!isValidMove(board, row, col, parseInt(value))) {
            input.value = '';
            alert('Invalid move! This number is already present in the row, column, or 3x3 subgrid.');
        } else {
            board[row][col] = parseInt(value);
        }
    }

    function isValidMove(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num || board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
                return false;
            }
        }
        return true;
    }

    function checkWinCondition() {
        for (let row = 0; row < 9; row++) {
            if (!isValidGroup(board[row])) {
                return false;
            }
        }

        for (let col = 0; col < 9; col++) {
            const column = board.map(row => row[col]);
            if (!isValidGroup(column)) {
                return false;
            }
        }

        for (let row = 0; row < 9; row += 3) {
            for (let col = 0; col < 9; col += 3) {
                const subgrid = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        subgrid.push(board[row + r][col + c]);
                    }
                }
                if (!isValidGroup(subgrid)) {
                    return false;
                }
            }
        }

        return true;
    }

    function isValidGroup(group) {
        const seen = new Set();
        for (const num of group) {
            if (num === 0 || seen.has(num)) {
                return false;
            }
            seen.add(num);
        }
        return seen.size === 9;
    }

    function getRandomBoard() {
        const fullBoard = generateFullBoard();
        return removeNumbers(fullBoard, 40); // Remove 40 numbers for example
    }

    function generateFullBoard() {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        fillBoard(board);
        return board;
    }

    function fillBoard(board) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    shuffle(numbers);
                    for (const num of numbers) {
                        if (isValidMove(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function removeNumbers(board, numRemove) {
        for (let i = 0; i < numRemove; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * 9);
                col = Math.floor(Math.random() * 9);
            } while (board[row][col] === 0);
            board[row][col] = 0;
        }
        return board;
    }

    function solveBoard() {
        const boardCopy = board.map(row => row.slice());
        if (solve(boardCopy)) {
            board = boardCopy;
            createBoard(board);
        } else {
            alert('No solution exists for this Sudoku puzzle.');
        }
    }

    function solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValidMove(board, row, col, num)) {
                            board[row][col] = num;
                            if (solve(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function saveBoard(board) {
        localStorage.setItem('sudokuBoard', JSON.stringify(board));
    }

    function loadBoard() {
        const savedBoard = localStorage.getItem('sudokuBoard');
        return savedBoard ? JSON.parse(savedBoard) : null;
    }

    function clearBoard() {
        localStorage.removeItem('sudokuBoard');
    }

    document.getElementById("new-game-button").addEventListener("click", function() {
        clearBoard();
        board = getRandomBoard();
        createBoard(board);
        this.style.display = "none"; // Hide the button after starting a new game
    });

    document.getElementById("solve-button").addEventListener("click", function() {
        solveBoard();
    });

    createBoard(board);
});
