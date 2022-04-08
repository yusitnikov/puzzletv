import {Position} from "../../../types/layout/Position";
import {ChessPiece} from "../types/ChessPiece";
import {FieldStateInitialDigitsMap} from "../../../types/sudoku/FieldState";

export const chessColumnNameToIndex = (column: string) => column.charCodeAt(0) - "a".charCodeAt(0);

export const chessRowNameToIndex = (row: number | string) => 8 - Number(row);

export const chessCellNameToCoords = (cell: string): Position => ({
    left: chessColumnNameToIndex(cell[0]),
    top: chessRowNameToIndex(cell[1]),
});

export const chessInitialPiecesByCellNames = (pieces: Record<string, ChessPiece>): FieldStateInitialDigitsMap<ChessPiece> => {
    const result: FieldStateInitialDigitsMap<ChessPiece> = {};

    for (const [cell, piece] of Object.entries(pieces)) {
        const {top, left} = chessCellNameToCoords(cell);

        result[top] = result[top] || {};
        result[top][left] = piece;
    }

    return result;
};
