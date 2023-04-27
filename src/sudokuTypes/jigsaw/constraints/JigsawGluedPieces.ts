import {Constraint} from "../../../types/sudoku/Constraint";
import {JigsawPTM} from "../types/JigsawPTM";
import {
    getJigsawCellCenterAbsolutePositionsIndex,
    getJigsawPiecesWithCache,
    groupJigsawPiecesByZIndex
} from "../types/helpers";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";
import {getRegionBoundingBox} from "../../../utils/regions";
import {PositionSet} from "../../../types/layout/Position";
import {profiler} from "../../../utils/profiler";

export const JigsawGluedPiecesConstraint: Constraint<JigsawPTM> = {
    name: "glued jigsaw pieces",
    cells: [],
    props: undefined,
    isValidPuzzle: profiler.wrapFunc("JigsawGluedPiecesConstraint.isValidPuzzle", (
        lines, digits, regionCells, {cellsIndex, state}
    ): boolean => {
        const {pieces} = getJigsawPiecesWithCache(cellsIndex);
        const {extension: {pieces: piecePositions}} = gameStateGetCurrentFieldState(state);
        const groups = groupJigsawPiecesByZIndex(pieces, piecePositions);
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
