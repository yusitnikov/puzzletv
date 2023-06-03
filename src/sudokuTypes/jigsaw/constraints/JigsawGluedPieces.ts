import {Constraint} from "../../../types/sudoku/Constraint";
import {JigsawPTM} from "../types/JigsawPTM";
import {
    getJigsawCellCenterAbsolutePositionsIndex,
    groupJigsawPiecesByZIndex
} from "../types/helpers";
import {getRegionBoundingBox} from "../../../utils/regions";
import {PositionSet} from "../../../types/layout/Position";
import {profiler} from "../../../utils/profiler";

export const JigsawGluedPiecesConstraint: Constraint<JigsawPTM> = {
    name: "glued jigsaw pieces",
    cells: [],
    props: undefined,
    isValidPuzzle: profiler.wrapFunc("JigsawGluedPiecesConstraint.isValidPuzzle", (
        lines,
        digits,
        regionCells,
        context,
    ): boolean => {
        const groups = groupJigsawPiecesByZIndex(context);
        const cells = getJigsawCellCenterAbsolutePositionsIndex(groups)
            .flatMap(({cells}) => cells)
            .map(({position}) => position);

        // Check that the cells don't overlap
        if (new PositionSet(cells).size !== cells.length) {
            return false;
        }

        const optimalGridSize = Math.ceil(Math.sqrt(cells.length));
        const bounds = getRegionBoundingBox(cells, 1);
        if (bounds.width > optimalGridSize || bounds.height > optimalGridSize) {
            return false;
        }

        for (const {top, left} of cells) {
            if ((top - bounds.top) % 1 !== 0 || (left - bounds.left) % 1 !== 0) {
                return false;
            }
        }

        return true;
    }),
};
