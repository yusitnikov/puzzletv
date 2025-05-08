import { TextConstraint, TextProps, textTag } from "../../../components/puzzle/constraints/text/Text";
import { PositionLiteral } from "../../../types/layout/Position";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { textColor } from "../../../components/app/globals";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { Constraint } from "../../../types/puzzle/Constraint";

export const fogStarTag = "fog-star";

export const FogStarConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    color = textColor,
): Constraint<T, TextProps> => ({
    ...TextConstraint(cellLiterals, "★", color, 1, 0, GridLayer.regular),
    tags: [textTag, fogStarTag],
});
