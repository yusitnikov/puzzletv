import { TextConstraint } from "../../../components/sudoku/constraints/text/Text";
import { PositionLiteral } from "../../../types/layout/Position";
import { FieldLayer } from "../../../types/sudoku/FieldLayer";
import { lightOrangeColor } from "../../../components/app/globals";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";

export const SafeCrackerStarConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    layer = FieldLayer.afterLines,
) => TextConstraint<T>(cellLiterals, "☆", lightOrangeColor, 1, 0, layer);
