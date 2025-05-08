import { ChessColor } from "./ChessColor";
import { ChessPieceType } from "./ChessPieceType";

export interface ChessPiece {
    type: ChessPieceType;
    color: ChessColor;
}
