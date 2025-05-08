import { TextConstraint } from "../../../components/puzzle/constraints/text/Text";
import { PositionLiteral } from "../../../types/layout/Position";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { lightOrangeColor } from "../../../components/app/globals";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const SafeCrackerStarConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    layer = GridLayer.afterLines,
) => TextConstraint<T>(cellLiterals, "☆", lightOrangeColor, 1, 0, layer);
