import { Constraint } from "../../../types/puzzle/Constraint";
import { JigsawPTM } from "../types/JigsawPTM";
import { getJigsawCellCenterAbsolutePositionsIndex, groupJigsawPiecesByZIndex } from "../types/helpers";
import { getRegionBoundingBox } from "../../../utils/regions";
import { PositionSet } from "../../../types/layout/Position";
import { profiler } from "../../../utils/profiler";
import { notFinishedResultCheck, PuzzleResultCheck, successResultCheck } from "../../../types/puzzle/PuzzleResultCheck";
import { roundToStep } from "../../../utils/math";
import { roundStep } from "../types/JigsawMovePuzzleInputModeInfo";

export const JigsawGluedPiecesConstraint: Constraint<JigsawPTM> = {
    name: "glued jigsaw pieces",
    cells: [],
    props: undefined,
    isValidPuzzle: profiler.wrapFunc(
        "JigsawGluedPiecesConstraint.isValidPuzzle",
        (_lines, _digits, _cells, context): PuzzleResultCheck => {
            const groups = groupJigsawPiecesByZIndex(context);
            const cells = getJigsawCellCenterAbsolutePositionsIndex(groups)
                .flatMap(({ cells }) => cells)
                .map(({ position: { top, left } }) => ({
                    top: roundToStep(top, roundStep),
                    left: roundToStep(left, roundStep),
                }));

            // Check that the cells don't overlap
            if (new PositionSet(cells).size !== cells.length) {
                return notFinishedResultCheck();
            }

            const optimalGridSize = Math.ceil(Math.sqrt(cells.length));
            const bounds = getRegionBoundingBox(cells, 1);
            if (bounds.width > optimalGridSize || bounds.height > optimalGridSize) {
                return notFinishedResultCheck();
            }

            for (const { top, left } of cells) {
                if ((top - bounds.top) % 1 !== 0 || (left - bounds.left) % 1 !== 0) {
                    return notFinishedResultCheck();
                }
            }

            return successResultCheck(context.puzzle);
        },
    ),
};
