import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize8} from "../../types/sudoku/FieldSize";
import {ChessPiece} from "../../sudokuTypes/chess/types/ChessPiece";
import {ChessGameState} from "../../sudokuTypes/chess/types/ChessGameState";
import {ChessSudokuTypeManager} from "../../sudokuTypes/chess/types/ChessSudokuTypeManager";
import {chessInitialPiecesByCellNames} from "../../sudokuTypes/chess/utils/chessCoords";
import {ChessPieceType} from "../../sudokuTypes/chess/types/ChessPieceType";
import {ChessColor} from "../../sudokuTypes/chess/types/ChessColor";
import {ChessBoardCellsBackground} from "../../sudokuTypes/chess/components/ChessBoardCellsBackground";
import {ChessBoardIndexes, chessBoardIndexesMargin} from "../../sudokuTypes/chess/components/ChessBoardIndexes";

export const RealChessPuzzle: PuzzleDefinition<ChessPiece, ChessGameState, ChessGameState> = {
    title: "Real Chess Puzzle",
    slug: "real-chess-puzzle",
    author: "Chameleon",
    rules: <>
        <RulesParagraph>
            <strong>Normal chess rules apply</strong>:
            put chess pieces to the board so that they will form a valid chess position
            (that is result of some chess game).
        </RulesParagraph>
        <RulesParagraph>
            <strong>Normal sudoku rules apply</strong>:
            chess pieces cannot repeat in rows, columns and boxes
            (e.g. there could be no other knights in the top-left box, on column <strong>d</strong> and on row <strong>7</strong>).
        </RulesParagraph>
        <RulesParagraph>
            There were no pawn promotions in the game that led to the current position on the board.
        </RulesParagraph>
        <RulesParagraph>
            Both white and black have a mate in 1 move in case it's their turn.
        </RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
    fieldMargin: chessBoardIndexesMargin,
    initialDigits: chessInitialPiecesByCellNames({
        "h8": {color: ChessColor.black, type: ChessPieceType.rook},
        "b1": {color: ChessColor.black, type: ChessPieceType.rook},
        "h7": {color: ChessColor.black, type: ChessPieceType.king},
        "h6": {color: ChessColor.black, type: ChessPieceType.queen},
        "f8": {color: ChessColor.black, type: ChessPieceType.bishop},
        "h5": {color: ChessColor.black, type: ChessPieceType.bishop},
        "d7": {color: ChessColor.black, type: ChessPieceType.knight},
        "e6": {color: ChessColor.black, type: ChessPieceType.pawn},
        "b5": {color: ChessColor.black, type: ChessPieceType.pawn},
        "g4": {color: ChessColor.black, type: ChessPieceType.pawn},
        "e5": {color: ChessColor.white, type: ChessPieceType.knight},
        "d3": {color: ChessColor.white, type: ChessPieceType.rook},
        "e3": {color: ChessColor.white, type: ChessPieceType.bishop},
        "g2": {color: ChessColor.white, type: ChessPieceType.bishop},
        "c2": {color: ChessColor.white, type: ChessPieceType.pawn},
        "a3": {color: ChessColor.white, type: ChessPieceType.pawn},
        // Solution:
        // "g8": {color: ChessColor.black, type: ChessPieceType.knight},
        // "d4": {color: ChessColor.white, type: ChessPieceType.king},
        // "e4": {color: ChessColor.white, type: ChessPieceType.queen},
        // "f5": {color: ChessColor.white, type: ChessPieceType.rook},
        // "c3": {color: ChessColor.white, type: ChessPieceType.knight},
    }),
    veryBackgroundItems: <ChessBoardCellsBackground/>,
    backgroundItems: <ChessBoardIndexes/>,
};

export const RealChessPuzzleRu: PuzzleDefinition<ChessPiece, ChessGameState, ChessGameState> = {
    ...RealChessPuzzle,
    title: "Шахматный судоку",
    slug: "real-chess-puzzle-ru",
    author: "Хамелеон",
    rules: <>
        <RulesParagraph>
            <strong>Обычные правила шахмат</strong>:
            поставьте шахматные фигуры на доску так, чтоб они образовали позицию,
            которая может получиться в результате игры в шахматы.
        </RulesParagraph>
        <RulesParagraph>
            <strong>Обычные правила судоку</strong>:
            шахматные фигуры не могут повторяться на каждой линии и в каждом регионе, огражденном жирными линиями
            (например, в верхне-левом регионе, на линии <strong>d</strong> и на линии <strong>7</strong> не может быть других коней).
        </RulesParagraph>
        <RulesParagraph>
            В игре, результат которой мы видим на доске, не было превращений пешек.
        </RulesParagraph>
        <RulesParagraph>
            И белые, и черные могут поставить мат в 1 ход, если это их ход.
        </RulesParagraph>
    </>,
    noIndex: true,
};
