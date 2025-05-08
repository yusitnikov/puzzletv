import { textColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/sudoku/GridLayer";
import { getAveragePosition, parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFc } from "../../../../types/sudoku/Constraint";
import { CenteredText } from "../../../svg/centered-text/CenteredText";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { profiler } from "../../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { ChessPieceType } from "../../../../sudokuTypes/chess/types/ChessPieceType";
import { ChessColor } from "../../../../sudokuTypes/chess/types/ChessColor";
import { ChessPiece } from "../../../../sudokuTypes/chess/components/ChessPiece";
import { cosmeticTag } from "../decorative-shape/DecorativeShape";
import { useCompensationAngle } from "../../../../contexts/TransformContext";

const chessPiecesMap: Record<string, { type: ChessPieceType; color: ChessColor }> = {
    "♙": {
        type: ChessPieceType.pawn,
        color: ChessColor.white,
    },
    "♘": {
        type: ChessPieceType.knight,
        color: ChessColor.white,
    },
    "♗": {
        type: ChessPieceType.bishop,
        color: ChessColor.white,
    },
    "♖": {
        type: ChessPieceType.rook,
        color: ChessColor.white,
    },
    "♕": {
        type: ChessPieceType.queen,
        color: ChessColor.white,
    },
    "♔": {
        type: ChessPieceType.king,
        color: ChessColor.white,
    },
    "♟": {
        type: ChessPieceType.pawn,
        color: ChessColor.white,
    },
    "♞": {
        type: ChessPieceType.knight,
        color: ChessColor.white,
    },
    "♝": {
        type: ChessPieceType.bishop,
        color: ChessColor.white,
    },
    "♜": {
        type: ChessPieceType.rook,
        color: ChessColor.white,
    },
    "♛": {
        type: ChessPieceType.queen,
        color: ChessColor.white,
    },
    "♚": {
        type: ChessPieceType.king,
        color: ChessColor.white,
    },
};

export interface TextProps {
    text: string;
    size?: number;
}

export const TextComponent: ConstraintPropsGenericFc<TextProps> = observer(function TextFc<T extends AnyPTM>({
    cells,
    angle = 0,
    color = textColor,
    props: { text, size = 0.5 },
    context,
}: ConstraintProps<T, TextProps>) {
    profiler.trace();

    const { top, left } = getAveragePosition(cells);

    const chessPiece = chessPiecesMap[text];

    const compensationAngle = useCompensationAngle(context);

    return (
        <AutoSvg top={top + 0.5} left={left + 0.5} angle={angle - compensationAngle}>
            {!chessPiece && (
                <CenteredText size={size} fill={color}>
                    {text}
                </CenteredText>
            )}

            {chessPiece && (
                <ChessPiece type={chessPiece.type} pieceColor={chessPiece.color} size={size * 0.8} fontColor={color} />
            )}
        </AutoSvg>
    );
});

export const textTag = "text";

export const TextConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    text: string,
    color?: string,
    size?: number,
    angle?: number,
    layer = GridLayer.afterLines,
): Constraint<T, TextProps> => {
    return {
        name: `text: ${text}`,
        tags: [textTag, cosmeticTag],
        cells: parsePositionLiterals(cellLiterals),
        props: { text, size },
        color,
        angle,
        layer,
        component: { [layer]: TextComponent },
        renderSingleCellInUserArea: true,
    };
};

export const isTextConstraint = <T extends AnyPTM>(
    constraint: Constraint<T, any>,
): constraint is Constraint<T, TextProps> => (constraint.tags ?? []).includes(textTag);
