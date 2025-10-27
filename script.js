const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let boardState = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
let history = [];
const scores = { X:0, O:0, D:0 };

const boardEl = document.getElementById('board');
const turnDisplay = document.getElementById('turnDisplay');
const xScore = document.getElementById('xScore');
const oScore = document.getElementById('oScore');
const dScore = document.getElementById('dScore');
const lastResult = document.getElementById('lastResult');

function createBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => makeMove(i));
    boardEl.appendChild(cell);
  }
}

function makeMove(idx) {
  if (gameOver || boardState[idx]) return;

  history.push({ board: boardState.slice(), player: currentPlayer });
  boardState[idx] = currentPlayer;
  render();

  const result = checkResult();
  if (result) endGame(result);
  else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurn();

    if (getMode() === 'pvc' && currentPlayer === 'O') {
      setTimeout(() => computerMove(), 400);
    }
  }
}

function computerMove() {
  if (gameOver) return;
  const ai = 'O', human = 'X';
  
  // Try winning move
  for (let i=0; i<9; i++) {
    if (!boardState[i]) {
      boardState[i] = ai;
      if (checkResult()) { render(); return endGame(checkResult()); }
      boardState[i] = null;
    }
  }
  
  // Try blocking move
  for (let i=0; i<9; i++) {
    if (!boardState[i]) {
      boardState[i] = human;
      if (checkResult()) {
        boardState[i] = ai; render(); return endGame(checkResult());
      }
      boardState[i] = null;
    }
  }

  // Else random move
  const empty = boardState.map((v,i)=> v?null:i).filter(v=>v!==null);
  const move = empty[Math.floor(Math.random()*empty.length)];
  boardState[move] = ai;
  render();
  const result = checkResult();
  if (result) endGame(result);
  else { currentPlayer = 'X'; updateTurn(); }
}

function checkResult() {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (boardState[a] && boardState[a]===boardState[b] && boardState[a]===boardState[c])
      return { winner: boardState[a], line };
  }
  if (boardState.every(v => v !== null)) return { draw: true };
  return null;
}

function endGame(result) {
  gameOver = true;
  if (result.draw) {
    scores.D++; dScore.textContent = scores.D; lastResult.textContent = 'Draw';
  } else {
    const w = result.winner;
    scores[w]++; (w==='X'?xScore:oScore).textContent = scores[w];
    lastResult.textContent = w + ' won!';
    result.line.forEach(i => boardEl.children[i].classList.add('win'));
  }
}

function updateTurn() { turnDisplay.textContent = currentPlayer; }

function render() {
  for (let i=0; i<9; i++) {
    const el = boardEl.children[i];
    el.textContent = boardState[i] || '';
    el.classList.remove('x','o');
    if (boardState[i]) el.classList.add(boardState[i].toLowerCase());
  }
}

document.getElementById('resetBtn').addEventListener('click', () => resetBoard());
document.getElementById('newGameBtn').addEventListener('click', () => resetBoard(true));
document.getElementById('undoBtn').addEventListener('click', () => undoMove());
document.getElementById('hintBtn').addEventListener('click', () => showHint());
document.getElementById('aiMoveBtn').addEventListener('click', () => computerMove());
document.getElementById('modeSelect').addEventListener('change', () => resetBoard());

function resetBoard(full=false) {
  boardState = Array(9).fill(null);
  history = [];
  gameOver = false;
  if (full) {
    scores.X=scores.O=scores.D=0;
    xScore.textContent=oScore.textContent=dScore.textContent='0';
    lastResult.textContent='—';
  }
  currentPlayer='X';
  render();
  updateTurn();
}

function undoMove() {
  if (!history.length) return;
  const last = history.pop();
  boardState = last.board;
  currentPlayer = last.player;
  gameOver = false;
  render();
  updateTurn();
}

function showHint() {
  if (gameOver) return;
  for (let i=0; i<9; i++) if (!boardState[i]) {
    boardEl.children[i].animate([{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}], {duration:500});
    break;
  }
}

function getMode() {
  return document.getElementById('modeSelect').value;
}

createBoard();
updateTurn();
render();
