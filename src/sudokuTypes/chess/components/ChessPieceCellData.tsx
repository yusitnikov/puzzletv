import {CellDataProps} from "../../../components/sudoku/cell/CellDataProps";
import {errorColor, textColor, userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {ChessPiece} from "../types/ChessPiece";
import {ChessGameState} from "../types/ChessGameState";
import {ChessColor} from "../types/ChessColor";
import {ChessPieceType} from "../types/ChessPieceType";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";

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
    {data: {type, color}, ...otherProps}: CellDataProps<ChessPiece, ChessGameState>
) => <>
    <ChessPieceCellDataBase
        data={{
            type,
            color: color === ChessColor.white ? ChessColor.black : ChessColor.white,
        }}
        inverted={true}
        {...otherProps}
    />
    <ChessPieceCellDataBase
        data={{type, color}}
        {...otherProps}
    />
</>;

export const ChessPieceCellDataBase = (
    {data: {type, color}, inverted, size, isInitial, isValid = true, left = 0, top = 0}: CellDataProps<ChessPiece, ChessGameState> & {inverted?: boolean}
) => <AutoSvg
    left={left}
    top={top}
    width={size}
    height={size}
    style={{
        color: inverted ? "#fff" : (!isValid ? errorColor : (isInitial ? textColor : userDigitColor)),
    }}
>
    <text
        textAnchor={"middle"}
        alignmentBaseline={"central"}
        style={{
            fontSize: `${size}px`,
            lineHeight: `${size}px`,
        }}
        fill={"currentColor"}
    >
        {map[color][type]}
    </text>
</AutoSvg>;

export const ChessPieceCellDataComponentType: CellDataComponentType<ChessPiece, ChessGameState> = {
    component: ChessPieceCellData,
    widthCoeff: 0.7,
};
