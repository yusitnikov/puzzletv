import { TextConstraint } from "../../../components/sudoku/constraints/text/Text";
import { PositionLiteral } from "../../../types/layout/Position";
import { GridLayer } from "../../../types/sudoku/GridLayer";
import { lightOrangeColor } from "../../../components/app/globals";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";

export const SafeCrackerStarConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    layer = GridLayer.afterLines,
) => TextConstraint<T>(cellLiterals, "☆", lightOrangeColor, 1, 0, layer);
