import {CellDataProps} from "../../../components/sudoku/cell/CellDataProps";
import {textColor, userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {ChessPiece} from "../types/ChessPiece";
import {ChessGameState} from "../types/ChessGameState";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {ChessColor} from "../types/ChessColor";
import {ChessPieceType} from "../types/ChessPieceType";

const map: Record<ChessColor, Record<ChessPieceType, string>> = {
    [ChessColor.white]: {
        [ChessPieceType.pawn]: "♙",
        [ChessPieceType.knight]: "♘",
        [ChessPieceType.bishop]: "♗",
        [ChessPieceType.rook]: "♖",
        [ChessPieceType.queen]: "♕",
        [ChessPieceType.king]: "♔",
    },
    [ChessColor.black]: {
        [ChessPieceType.pawn]: "♟",
        [ChessPieceType.knight]: "♞",
        [ChessPieceType.bishop]: "♝",
        [ChessPieceType.rook]: "♜",
        [ChessPieceType.queen]: "♛",
        [ChessPieceType.king]: "♚",
    },
};

export const ChessPieceCellData = (
    {data: {type, color}, size, isInitial, left = 0, top = 0}: CellDataProps<ChessPiece, ChessGameState>
) => <Absolute
    left={left - size / 2}
    top={top - size/ 2}
    width={size}
    height={size}
    style={{
        fontSize: size,
        lineHeight: `${size}px`,
        textAlign: "center",
        color: isInitial ? textColor : userDigitColor,
    }}
>
    {map[color][type]}
</Absolute>;

export const ChessPieceCellDataComponentType: CellDataComponentType<ChessPiece, ChessGameState> = {
    component: ChessPieceCellData,
    widthCoeff: 0.7,
};
