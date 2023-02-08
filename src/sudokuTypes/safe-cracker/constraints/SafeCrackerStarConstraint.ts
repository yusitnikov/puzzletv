import {TextConstraint} from "../../../components/sudoku/constraints/text/Text";
import {PositionLiteral} from "../../../types/layout/Position";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {yellowColor} from "../../../components/app/globals";

export const SafeCrackerStarConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[],
    layer = FieldLayer.lines,
) => TextConstraint<CellType, ExType, ProcessedExType>(
    cellLiterals,
    "☆",
    yellowColor,
    1,
    0,
    layer,
);