import { Constraint } from "../../../types/sudoku/Constraint";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { MergedCellShape } from "../types/MergedCellShape";

export const FractionalSudokuHouseConstraint = <T extends AnyPTM>(cellShapes: MergedCellShape[]): Constraint<T> => ({
    name: "house",
    cells: cellShapes.map((region) => region.mainCell),
    props: undefined,
    isObvious: true,
    isValidCell: (position, digits, _cells, context): boolean => {
        const {
            puzzle: { typeManager, importOptions: { cellPieceWidth = 2, cellPieceHeight = 2 } = {} },
        } = context;

        const digit = typeManager.getDigitByCellData(digits[position.top][position.left], context, position);

        let sum = 0;
        for (const { mainCell, cellsCount } of cellShapes) {
            const cellData2 = digits[mainCell.top]?.[mainCell.left];
            if (cellData2 === undefined) {
                continue;
            }
            const digit2 = typeManager.getDigitByCellData(cellData2, context, mainCell);
            if (digit2 === digit) {
                sum += cellsCount;
            }
        }

        return sum <= cellPieceWidth * cellPieceHeight;
    },
});
