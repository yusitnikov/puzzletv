import {Constraint} from "../../../../types/sudoku/Constraint";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {isValidCellForRegion} from "../region/Region";

export const AutoRegionConstraint = <CellType>(): Constraint<CellType> => {
    return ({
        name: "auto-region",
        cells: [],
        isValidCell(cell, digits, cells, {puzzle, cellsIndex, state}, isFinalCheck) {
            const region = cellsIndex.getCustomRegionByBorderLinesAt(state, cell);

            const expectedSize = puzzle.digitsCount ?? getDefaultDigitsCount(puzzle);

            if (region.length < expectedSize) {
                return false;
            }

            if (region.length > expectedSize) {
                return !isFinalCheck;
            }

            return isValidCellForRegion(region, cell, digits, puzzle, state);
        },
    });
};
