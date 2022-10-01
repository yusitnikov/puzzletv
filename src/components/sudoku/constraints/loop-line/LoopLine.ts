import {Constraint} from "../../../../types/sudoku/Constraint";
import {Line} from "../../../../types/layout/Position";

export const LoopLineConstraint = <CellType>(): Constraint<CellType> => ({
    name: "loop line",
    cells: [],
    isValidPuzzle(lines, digits, cells, context) {
        const lineSegments = context.cellsIndexForState.getCenterLineSegments();

        return lineSegments.length === 1 && lineSegments[0].isLoop;
    },
    getInvalidUserLines(
        lines,
        digits,
        cells,
        context,
        isFinalCheck
    ): Line[] {
        const lineSegments = context.cellsIndexForState.getCenterLineSegments();

        const hasLoop = lineSegments.some(({isLoop}) => isLoop);

        return lineSegments
            .filter(({isBranching, isLoop}) => isBranching || (hasLoop && lineSegments.length > 1) || (isFinalCheck && !isLoop))
            .flatMap(({lines}) => lines);
    },
});
