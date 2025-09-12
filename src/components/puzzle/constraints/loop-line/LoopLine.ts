import { Constraint } from "../../../../types/puzzle/Constraint";
import { Line } from "../../../../types/layout/Position";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { CellPart } from "../../../../types/puzzle/CellPart";
import {
    errorResultCheck,
    notFinishedResultCheck,
    successResultCheck,
} from "../../../../types/puzzle/PuzzleResultCheck";

export const LoopLineConstraint = <T extends AnyPTM>(type: CellPart): Constraint<T> => ({
    name: `${type} loop line`,
    cells: [],
    props: undefined,
    isValidPuzzle(_lines, _digits, _cells, context) {
        const lineSegments = context[`${type}LineSegments`];

        return lineSegments.length > 1
            ? errorResultCheck()
            : lineSegments.length === 1 && lineSegments[0].isLoop
              ? successResultCheck(context)
              : notFinishedResultCheck();
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
