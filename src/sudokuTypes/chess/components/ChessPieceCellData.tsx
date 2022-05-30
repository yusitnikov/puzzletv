import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
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
    {inverted, ...props}: CellDataProps<ChessPiece, ChessGameState> & {inverted?: boolean}
) => {
    const {data: {type, color}, size, left = 0, top = 0} = props;

    return <AutoSvg
        left={left}
        top={top}
        width={size}
        height={size}
        style={{
            color: inverted ? "#fff" : getDefaultCellDataColor(props),
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
};

export const ChessPieceCellDataComponentType: CellDataComponentType<ChessPiece, ChessGameState> = {
    component: ChessPieceCellData,
    widthCoeff: 0.7,
};
