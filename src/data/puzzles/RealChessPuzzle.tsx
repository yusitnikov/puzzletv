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

export default {
    title: "Real Chess Puzzle",
    slug: "real-chess-puzzle",
    author: "Chameleon",
    rules: <>
        <RulesParagraph>Normal sudoku rules apply.</RulesParagraph>
        <RulesParagraph>TODO</RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
    initialDigits: chessInitialPiecesByCellNames({
        "h8": {color: ChessColor.black, type: ChessPieceType.rook},
        "h7": {color: ChessColor.black, type: ChessPieceType.king},
        "h6": {color: ChessColor.black, type: ChessPieceType.queen},
        "d7": {color: ChessColor.black, type: ChessPieceType.knight},
        "e5": {color: ChessColor.white, type: ChessPieceType.knight},
        "e4": {color: ChessColor.white, type: ChessPieceType.rook},
        "e3": {color: ChessColor.white, type: ChessPieceType.bishop},
    }),
    veryBackgroundItems: <>
        <ChessBoardCellsBackground/>
    </>,
} as PuzzleDefinition<ChessPiece, ChessGameState, ChessGameState>;
