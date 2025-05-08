import { TextConstraint, TextProps, textTag } from "../../../components/sudoku/constraints/text/Text";
import { PositionLiteral } from "../../../types/layout/Position";
import { GridLayer } from "../../../types/sudoku/GridLayer";
import { textColor } from "../../../components/app/globals";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { Constraint } from "../../../types/sudoku/Constraint";

export const fogStarTag = "fog-star";

export const FogStarConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    color = textColor,
): Constraint<T, TextProps> => ({
    ...TextConstraint(cellLiterals, "★", color, 1, 0, GridLayer.regular),
    tags: [textTag, fogStarTag],
});
