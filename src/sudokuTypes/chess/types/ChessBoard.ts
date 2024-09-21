import {ChessPiece} from "./ChessPiece";
import {ChessPTM} from "./ChessPTM";
import {CellState} from "../../../types/sudoku/CellState";
import {Position} from "../../../types/layout/Position";
import {ChessPieceType, ChessPieceTypeNotation} from "./ChessPieceType";
import {ChessMove} from "./ChessMove";
import {ChessColor} from "./ChessColor";

export abstract class ChessBoardBase {
    abstract getPiece(cell: Position): ChessPiece | undefined;

    abstract setPiece(cell: Position, piece: ChessPiece | undefined): void;

    abstract getAllPieces(): (ChessPiece | undefined)[][];

    moveSimple(from: Position, to: Position, promotionPiece?: ChessPieceType): ChessMove {
        let piece = this.getPiece(from);
        if (piece?.type === ChessPieceType.pawn && promotionPiece) {
            piece = {
                ...piece,
                type: promotionPiece,
            };
        }

        const capturedPiece = this.getPiece(to);
        this.setPiece(to, piece);
        this.setPiece(from, undefined);
        return {
            start: from,
            end: to,
            piece: piece!,
            capturedPiece,
            promotionPiece,
        };
    }

    move(from: Position, to: Position, promotionPiece?: ChessPieceType): ChessMove {
        if (this.getPiece(from)?.type === ChessPieceType.pawn && !promotionPiece && [0, 7].includes(to.top)) {
            promotionPiece = ChessPieceType.queen;
        }

        const result = this.moveSimple(from, to, promotionPiece);

        if (result.piece?.type === ChessPieceType.king && from.top === to.top && Math.abs(from.left - to.left) === 2) {
            const rookFrom = {...from, left: to.left > from.left ? 7 : 0};
            const rook = this.getPiece(rookFrom);

            if (rook?.type === ChessPieceType.rook && rook.color === result.piece.color) {
                this.moveSimple(rookFrom, {...from, left: (from.left + to.left) / 2});
            }
        }

        return result;
    }

    getFen(halfMoves: number) {
        const isPiece = (cell: Position, piece: ChessPiece): boolean => {
            const actualPiece = this.getPiece(cell);
            return actualPiece?.type === piece.type && actualPiece?.color === piece.color;
        };
        const canCastle = (rookCell: Position) => {
            const color = rookCell.top === 0 ? ChessColor.black : ChessColor.white;

            return isPiece({...rookCell, left: 4}, {type: ChessPieceType.king, color})
                && isPiece(rookCell, {type: ChessPieceType.rook, color});
        };

        return [
            this.getAllPieces()
                .map(
                    (row) => row
                        .map((piece) => {
                            if (!piece) {
                                return " ";
                            }
                            const pieceStr = ChessPieceTypeNotation[piece.type];
                            return piece.color === ChessColor.black ? pieceStr.toLowerCase() : pieceStr.toUpperCase();
                        })
                        .join("")
                )
                .map((line) => {
                    for (let i = 8; i > 0; i--) {
                        line = line.replaceAll(" ".repeat(i), i.toString());
                    }
                    return line;
                })
                .join("/"),
            halfMoves % 2 === 0 ? "w" : "b",
            // castling rights
            [
                canCastle({top: 7, left: 7}) && "K",
                canCastle({top: 7, left: 0}) && "Q",
                canCastle({top: 0, left: 7}) && "k",
                canCastle({top: 0, left: 0}) && "q",
            ].filter(Boolean).join("") || "-",
            // en passant square
            "-",
            // half moves (for the 50 moves rule)
            0,
            // move number
            Math.floor(halfMoves / 2) + 1,
        ].join(" ");
    }
}

// noinspection JSUnusedGlobalSymbols
export class ChessBoard extends ChessBoardBase {
    public readonly pieces: (ChessPiece | undefined)[][];

    constructor(pieces: (ChessPiece | undefined)[][]) {
        super();

        // Clone the array to keep the original unchanged
        this.pieces = pieces.map((row) => [...row]);
    }

    getPiece({top, left}: Position): ChessPiece | undefined {
        return this.pieces[top][left];
    }

    setPiece({top, left}: Position, piece: ChessPiece | undefined) {
        this.pieces[top][left] = piece;
    }

    getAllPieces(): (ChessPiece | undefined)[][] {
        return this.pieces;
    }
}

export class FieldStateChessBoard extends ChessBoardBase {
    public readonly cells: CellState<ChessPTM>[][];

    constructor(cells: CellState<ChessPTM>[][]) {
        super();

        // Clone the array to keep the original unchanged
        this.cells = cells.map((row) => [...row]);
    }

    getPiece({top, left}: Position): ChessPiece | undefined {
        return this.cells[top][left].usersDigit;
    }

    setPiece({top, left}: Position, piece: ChessPiece | undefined) {
        this.cells[top][left] = {
            ...this.cells[top][left],
            usersDigit: piece,
        };
    }

    getAllPieces(): (ChessPiece | undefined)[][] {
        return this.cells.map((row) => row.map(({usersDigit}) => usersDigit));
    }
}

export class ReadOnlyChessBoard extends ChessBoardBase {
    constructor(private readonly board: ChessBoardBase) {
        super();
    }

    getPiece(cell: Position): ChessPiece | undefined {
        return this.board.getPiece(cell);
    }

    setPiece() {
        // NOOP
    }

    getAllPieces(): (ChessPiece | undefined)[][] {
        return this.board.getAllPieces();
    }
}
