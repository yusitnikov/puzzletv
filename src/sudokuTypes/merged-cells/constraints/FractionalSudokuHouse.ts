import { Constraint } from "../../../types/sudoku/Constraint";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { MergedCellShape } from "../types/MergedCellShape";

export const FractionalSudokuHouseConstraint = <T extends AnyPTM>(cellShapes: MergedCellShape[]): Constraint<T> => ({
    name: "house",
    cells: cellShapes.map((region) => region.mainCell),
    props: undefined,
    isValidCell: (position, digits, _cells, context): boolean => {
        const digit = context.puzzle.typeManager.getDigitByCellData(
            digits[position.top][position.left],
            context,
            position,
        );

        let sum = 0;
        for (const { mainCell, cellsCount } of cellShapes) {
            const cellData2 = digits[mainCell.top]?.[mainCell.left];
            if (cellData2 === undefined) {
                continue;
            }
            const digit2 = context.puzzle.typeManager.getDigitByCellData(cellData2, context, mainCell);
            if (digit2 === digit) {
                sum += cellsCount;
            }
        }

        return sum <= 4;
    },
});
