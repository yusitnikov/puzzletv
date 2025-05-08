import { Line } from "../../../types/layout/Position";
import { ChessPiece } from "./ChessPiece";
import { ChessPieceType, ChessPieceTypeNotation } from "./ChessPieceType";
import { stringifyChessCell } from "./utils";

export interface ChessMove extends Line {
    piece: ChessPiece;
    capturedPiece?: ChessPiece;
    promotionPiece?: ChessPieceType;
}

export const getChessMoveDescription = (
    { piece: { type }, capturedPiece, promotionPiece, start, end }: ChessMove,
    short: boolean,
) =>
    type === ChessPieceType.king && Math.abs(start.left - end.left) === 2
        ? end.left > start.left
            ? "0-0"
            : "0-0-0"
        : [
              type !== ChessPieceType.pawn && ChessPieceTypeNotation[type],
              !short
                  ? stringifyChessCell(start)
                  : capturedPiece && type === ChessPieceType.pawn
                    ? stringifyChessCell(start)[0]
                    : "",
              capturedPiece && "x",
              stringifyChessCell(end),
              promotionPiece && ChessPieceTypeNotation[promotionPiece],
          ]
              .filter(Boolean)
              .join("");
