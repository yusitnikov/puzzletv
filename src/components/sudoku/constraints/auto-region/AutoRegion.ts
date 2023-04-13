import {Constraint} from "../../../../types/sudoku/Constraint";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {isValidCellForRegion} from "../region/Region";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const AutoRegionConstraint = <T extends AnyPTM>(): Constraint<T> => {
    return {
        name: "auto-region",
        cells: [],
        props: undefined,
        isValidCell(cell, digits, cells, {puzzle, cellsIndex, state}, constraints, isFinalCheck) {
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
    };
};
