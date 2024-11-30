import { Constraint } from "../../../../types/sudoku/Constraint";
import { Line } from "../../../../types/layout/Position";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";

export const LoopLineConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "loop line",
    cells: [],
    props: undefined,
    isValidPuzzle(lines, digits, cells, context) {
        const lineSegments = context.centerLineSegments;

        return lineSegments.length === 1 && lineSegments[0].isLoop;
    },
    getInvalidUserLines(lines, digits, cells, context, isFinalCheck): Line[] {
        const lineSegments = context.centerLineSegments;

        const hasLoop = lineSegments.some(({ isLoop }) => isLoop);

        return lineSegments
            .filter(
                ({ isBranching, isLoop }) =>
                    isBranching || (hasLoop && lineSegments.length > 1) || (isFinalCheck && !isLoop),
            )
            .flatMap(({ lines }) => lines);
    },
});
