import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ChessColor} from "./ChessColor";
import {ChessPTM} from "./ChessPTM";
import {ChessSudokuTypeManager} from "./ChessSudokuTypeManager";
import {FieldState} from "../../../types/sudoku/FieldState";
import {ChessPieceType} from "./ChessPieceType";

const initialHeavyPieces = [
    ChessPieceType.rook,
    ChessPieceType.knight,
    ChessPieceType.bishop,
    ChessPieceType.queen,
    ChessPieceType.king,
    ChessPieceType.bishop,
    ChessPieceType.knight,
    ChessPieceType.rook,
];
const initialPieces: Record<number, { color: ChessColor, pieces: ChessPieceType[] }> = {
    0: {
        color: ChessColor.black,
        pieces: initialHeavyPieces,
    },
    1: {
        color: ChessColor.black,
        pieces: Array(8).fill(ChessPieceType.pawn),
    },
    6: {
        color: ChessColor.white,
        pieces: Array(8).fill(ChessPieceType.pawn),
    },
    7: {
        color: ChessColor.white,
        pieces: initialHeavyPieces,
    },
}

export const ChessGameSudokuTypeManager: SudokuTypeManager<ChessPTM> = {
    ...ChessSudokuTypeManager,

    cosmeticRegions: true,
    getRegionsForRowsAndColumns() {
        return [];
    },

    modifyInitialFieldState({cells, ...state}: FieldState<ChessPTM>): FieldState<ChessPTM> {
        return {
            ...state,
            cells: cells.map((row, top) => row.map((cell, left) => {
                const rowPieces = initialPieces[top];

                return {
                    ...cell,
                    usersDigit: rowPieces && {
                        type: rowPieces.pieces[left],
                        color: rowPieces.color,
                    },
                };
            })),
        };
    },
};
