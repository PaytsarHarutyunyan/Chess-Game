const board = document.getElementById("board");
const pieces = ["&#9814;", "&#9816;", "&#9815;", "&#9813;", "&#9812;", "&#9815;", "&#9816;", "&#9814;"];

// create the board
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    const square = document.createElement("div");
    square.classList.add("square");
    if ((i + j) % 2 === 0) {
      square.classList.add("white");
    } else {
      square.classList.add("black");
    }
    board.appendChild(square);
    // add pieces to the board
    if (i === 0 || i === 7) {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      if (i === 0) {
        piece.innerHTML = pieces[j];
      } else {
        piece.innerHTML = pieces[7 - j];
      }
      square.appendChild(piece);
    }
    if (i === 1 || i === 6) {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.innerHTML = "&#9817;";
      square.appendChild(piece);
    }
  }
}

// add event listener for piece movement
let selectedPiece = null;
const squares = document.querySelectorAll(".square");
squares.forEach((square) => {
  square.addEventListener("click", () => {
    if (selectedPiece) {
      // move the selected piece to the new square
      square.appendChild(selectedPiece);
      selectedPiece = null;
    } else if (square.children.length > 0 && square.children[0].classList.contains("piece")) {
      // select the piece
      selectedPiece = square.children[0];
    }
  });
});

// add event listener for reset button
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
// reset the board to its original state
const squares = document.querySelectorAll(".square");
squares.forEach((square, index) => {
square.innerHTML = "";
if ((index < 16 || index > 47) && (index % 8 !== 0 && (index + 1) % 8 !== 0)) {
const piece = document.createElement("div");
piece.classList.add("piece");
if (index < 24) {
piece.innerHTML = "♙";
} else if (index > 39) {
piece.innerHTML = "♙";
} else {
piece.innerHTML = pieces[index % 8];
}
square.appendChild(piece);
}
});
});

// add event listener for capturing pieces
board.addEventListener("click", (e) => {
const square = e.target.closest(".square");
if (square && selectedPiece) {
if (square.children.length > 0 && square.children[0].classList.contains("piece")) {
// check if the piece being captured is an enemy piece
const pieceColor = selectedPiece.innerHTML.charCodeAt(0) < 9818 ? "white" : "black";
const squarePieceColor = square.children[0].innerHTML.charCodeAt(0) < 9818 ? "white" : "black";
if (pieceColor !== squarePieceColor) {
square.removeChild(square.children[0]);
square.appendChild(selectedPiece);
selectedPiece = null;
}
} else {
square.appendChild(selectedPiece);
selectedPiece = null;
}
}
});

// add event listener for highlighting possible moves
board.addEventListener("mousemove", (e) => {
if (selectedPiece) {
const squares = document.querySelectorAll(".square");
squares.forEach((square) => {
if (square.children.length === 0 || !square.children[0].classList.contains("piece")) {
square.classList.remove("highlight");
const origin = selectedPiece.parentElement;
const xDiff = Math.abs(parseInt(origin.dataset.x) - parseInt(square.dataset.x));
const yDiff = Math.abs(parseInt(origin.dataset.y) - parseInt(square.dataset.y));
const pieceType = selectedPiece.innerHTML.charCodeAt(0);
if ((pieceType === 9817 || pieceType === 9823) && yDiff === 1 && xDiff === 0) {
square.classList.add("highlight");
} else if ((pieceType === 9814 || pieceType === 9820) && ((yDiff === 0 && xDiff > 0) || (xDiff === 0 && yDiff > 0) || (xDiff === yDiff))) {
square.classList.add("highlight");
} else if ((pieceType === 9815 || pieceType === 9821) && ((yDiff === 0 && xDiff > 0) || (xDiff === 0 && yDiff > 0))) {
square.classList.add("highlight");
}

let diagonalMoves = true;
if (xDiff !== yDiff) {
diagonalMoves = false;
}
if ((pieceType === 9815 || pieceType === 9821) && diagonalMoves) {
square.classList.add("highlight");
}
// capturing moves
if (square.children.length > 0 && square.children[0].classList.contains("piece")) {
const pieceColor = selectedPiece.innerHTML.charCodeAt(0) < 9818 ? "white" : "black";
const squarePieceColor = square.children[0].innerHTML.charCodeAt(0) < 9818 ? "white" : "black";
if (pieceColor !== squarePieceColor) {
square.classList.add("highlight");
}
}
}
});
}
});

// add event listener for removing possible move highlights
board.addEventListener("mouseleave", () => {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.classList.remove("highlight");
  });
});

// add event listener for undoing moves
const undoButton = document.getElementById("undo-button");
const moveHistory = [];

undoButton.addEventListener("click", () => {
  if (moveHistory.length > 0) {
    const previousMove = moveHistory.pop();
    const { piece, origin, destination } = previousMove;
    const originSquare = document.querySelector(`.square[data-x='${origin.x}'][data-y='${origin.y}']`);
    const destinationSquare = document.querySelector(`.square[data-x='${destination.x}'][data-y='${destination.y}']`);
    destinationSquare.removeChild(destinationSquare.children[0]);
    originSquare.appendChild(piece);
  }
});

// add event listener for making moves
const makeMove = (piece, origin, destination) => {
  moveHistory.push({ piece, origin, destination });
};

// add event listener for checking for checkmate and stalemate
const checkForEndgame = () => {
  const pieces = document.querySelectorAll(".piece");
  let whiteKing = null;
  let blackKing = null;
  let whiteMoves = [];
  let blackMoves = [];

  pieces.forEach((piece) => {
    if (piece.innerHTML === "&#9812;") {
      whiteKing = piece.parentElement;
    } else if (piece.innerHTML === "&#9818;") {
      blackKing = piece.parentElement;
    }

    if (piece.innerHTML.charCodeAt(0) < 9818) {
      // white piece
      const possibleMoves = getMoves(piece.parentElement);
      whiteMoves = [...whiteMoves, ...possibleMoves];
    } else {
      // black piece
      const possibleMoves = getMoves(piece.parentElement);
      blackMoves = [...blackMoves, ...possibleMoves];
    }
  });

  const whiteInCheck = isSquareInCheck(whiteKing, blackMoves);
  const blackInCheck = isSquareInCheck(blackKing, whiteMoves);

  if (whiteInCheck && isCheckmate(whiteKing, blackMoves)) {
    console.log("Black wins");
  } else if (blackInCheck && isCheckmate(blackKing, whiteMoves)) {
    console.log("White wins");
  } else if (!whiteInCheck && isStalemate(whiteMoves, blackMoves)) {
    console.log("Stalemate");
  } else if (!blackInCheck && isStalemate(blackMoves, whiteMoves)) {
    console.log("Stalemate");
  }
};

// add event listener for determining if a square is in check
const isSquareInCheck = (square, moves) => {
  let inCheck = false;
  moves.forEach((move) => {
    if (move.x === parseInt(square.dataset.x) && move.y === parseInt(square.dataset.y)) {
      inCheck = true;
    }
  });
  return inCheck;
};

// add event listener for determining if a player is in checkmate
const isCheckmate = (king, moves) => {
  const possibleMoves = getMoves(king);
  let isCheckmate = true;
  possibleMoves.forEach((move) => {
    if (!isSquareInCheck(move, moves)) {
      isCheckmate = false;
    }
  });
  return isCheckmate;
};



