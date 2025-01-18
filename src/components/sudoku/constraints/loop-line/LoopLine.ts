import { Constraint } from "../../../../types/sudoku/Constraint";
import { Line } from "../../../../types/layout/Position";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { CellPart } from "../../../../types/sudoku/CellPart";

export const LoopLineConstraint = <T extends AnyPTM>(type: CellPart): Constraint<T> => ({
    name: `${type} loop line`,
    cells: [],
    props: undefined,
    isValidPuzzle(_lines, _digits, _cells, context) {
        const lineSegments = context[`${type}LineSegments`];

        return lineSegments.length === 1 && lineSegments[0].isLoop;
    },
    getInvalidUserLines(_lines, _digits, _cells, context, isFinalCheck): Line[] {
        const lineSegments = context[`${type}LineSegments`];

        const hasLoop = lineSegments.some(({ isLoop }) => isLoop);

        return lineSegments
            .filter(
                ({ isBranching, isLoop }) =>
                    isBranching || (hasLoop && lineSegments.length > 1) || (isFinalCheck && !isLoop),
            )
            .flatMap(({ lines }) => lines);
    },
});
