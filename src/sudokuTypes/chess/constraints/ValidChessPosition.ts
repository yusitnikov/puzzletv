import {Constraint} from "../../../types/sudoku/Constraint";
import {ChessPiece} from "../types/ChessPiece";
import {ChessGameState} from "../types/ChessGameState";
import {ChessPieceType} from "../types/ChessPieceType";
import {isSamePosition, Position} from "../../../types/layout/Position";

export const ValidChessPositionConstraint: Constraint<ChessPiece, undefined, ChessGameState, {}> = {
    name: "valid chess position",
    cells: [],
    props: undefined,
    isObvious: true,
    isValidCell(cell, pieces): boolean {
        const {left, top} = cell;
        const {color, type} = pieces[top][left]!;

        let samePiecesCount = 1;
        let lastSamePiece: Position | undefined = undefined;

        for (const [otherTopStr, rowPieces] of Object.entries(pieces)) {
            for (const [otherLeftStr, otherPiece] of Object.entries(rowPieces)) {
                if (!otherPiece || otherPiece.type !== type || otherPiece.color !== color) {
                    continue;
                }

                const otherCell: Position = {
                    left: Number(otherLeftStr),
                    top: Number(otherTopStr),
                };
                if (isSamePosition(cell, otherCell)) {
                    continue;
                }

                samePiecesCount++;
                lastSamePiece = otherCell;
            }
        }

        switch (type) {
            case ChessPieceType.pawn:
                // Pawn can't be on line 1 or 8
                return samePiecesCount <= 8 && ![0, 7].includes(top);
            case ChessPieceType.knight:
                return samePiecesCount <= 2;
            case ChessPieceType.bishop:
                // There can't be 2 white-square or 2 black-square bishops of the same color
                return samePiecesCount <= 2 && (!lastSamePiece || (lastSamePiece.left + lastSamePiece.top + left + top) % 2 !== 0);
            case ChessPieceType.rook:
                return samePiecesCount <= 2;
            case ChessPieceType.queen:
                return samePiecesCount <= 1;
            case ChessPieceType.king:
                return samePiecesCount <= 1;
        }
    },
}