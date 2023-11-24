import {
    getAveragePosition,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {CellColorValue, resolveCellColorValue} from "../../../types/sudoku/CellColor";
import {EllipseConstraint} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {blackColor} from "../../../components/app/globals";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Rect} from "../../../types/layout/Rect";

interface ScrewDigit<CellT> {
    position: Position;
    digit: CellT;
}

export interface Screw<CellT> {
    initialPosition: Rect;
    digits: ScrewDigit<CellT>[],
}

export interface ScrewsPuzzleExtension<CellT> {
    screws: Screw<CellT>[];
}

// export const createRotatableClue = (
//     pivotCells: PositionLiteral | PositionLiteral[],
//     radius: number,
//     color: CellColorValue | undefined,
//     clues: Constraint<AnyPTM, any>[],
//     coeff = 1,
//     dependentClues: Screw[] = [],
// ): Screw => {
//     if (!Array.isArray(pivotCells)) {
//         pivotCells = [pivotCells];
//     }
//
//     if (radius && color) {
//         clues = [
//             EllipseConstraint(
//                 pivotCells,
//                 radius * 2,
//                 resolveCellColorValue(color),
//                 blackColor,
//                 undefined,
//                 undefined,
//                 undefined,
//                 FieldLayer.beforeSelection,
//             ),
//             ...clues,
//         ];
//     }
//
//     return {
//         initialPosition: getAveragePosition(parsePositionLiterals(pivotCells)),
//         clues,
//         coeff,
//         dependentClues,
//     };
// };
