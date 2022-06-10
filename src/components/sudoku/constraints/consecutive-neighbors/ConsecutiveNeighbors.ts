import {Constraint} from "../../../../types/sudoku/Constraint";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";

export const ConsecutiveNeighborsConstraint = <CellType>(allowLoop = false): Constraint<CellType> => {
    return ({
        name: "consecutive neighbors",
        cells: [],
        isValidCell(
            {top , left},
            digits,
            cells,
            {puzzle, cellsIndex, state}
        ) {
            const {
                typeManager: {getDigitByCellData},
                digitsCount = getDefaultDigitsCount(puzzle),
            } = puzzle;

            const digit = getDigitByCellData(digits[top][left]!, state);

            return cellsIndex.allCells[top][left].neighbors.items.every(({top: top2, left: left2}) => {
                const digit2 = digits[top2]?.[left2];

                if (digit2 === undefined) {
                    return true;
                }

                const diff = Math.abs(getDigitByCellData(digit2, state) - digit);
                return diff === 1 || (allowLoop && diff === digitsCount - 1);
            });
        },
    });
};
