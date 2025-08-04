import { textColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { getAveragePosition, parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFc } from "../../../../types/puzzle/Constraint";
import { CenteredText } from "../../../svg/centered-text/CenteredText";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { ChessPieceType } from "../../../../puzzleTypes/chess/types/ChessPieceType";
import { ChessColor } from "../../../../puzzleTypes/chess/types/ChessColor";
import { ChessPiece } from "../../../../puzzleTypes/chess/components/ChessPiece";
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
    stroke?: string;
    strokeWidth?: number;
}

export const TextComponent: ConstraintPropsGenericFc<TextProps> = observer(function TextFc<T extends AnyPTM>({
    cells,
    angle = 0,
    color = textColor,
    props: { text, size = 0.5, stroke, strokeWidth = 0 },
    context,
}: ConstraintProps<T, TextProps>) {
    profiler.trace();

    const { top, left } = getAveragePosition(cells);

    const chessPiece = chessPiecesMap[text];

    const compensationAngle = useCompensationAngle(context);

    return (
        <AutoSvg top={top + 0.5} left={left + 0.5} angle={angle - compensationAngle}>
            {!chessPiece && (
                <CenteredText
                    size={size}
                    fill={color}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin={"round"}
                    paintOrder={"stroke"}
                >
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

export interface TextConstraintOptions extends Omit<TextProps, "text"> {
    color?: string;
    angle?: number;
    layer?: GridLayer;
}

export const TextConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    text: string,
    { color, angle, layer = GridLayer.afterLines, ...other }: TextConstraintOptions = {},
): Constraint<T, TextProps> => {
    return {
        name: `text: ${text}`,
        tags: [textTag, cosmeticTag],
        cells: parsePositionLiterals(cellLiterals),
        props: { text, ...other },
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
