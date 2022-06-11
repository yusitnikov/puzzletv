import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";
import {lightGreyColor} from "../../../app/globals";

export const PalindromeConstraint = <CellType, >(cellLiterals: PositionLiteral[]): Constraint<CellType, LineProps> => ({
    name: "palindrome",
    cells: splitMultiLine(parsePositionLiterals(cellLiterals)),
    color: lightGreyColor,
    component: LineComponent,
    isValidCell(cell, digits, cells, {puzzle: {typeManager: {areSameCellData}}, state}) {
        const index = cells.findIndex(position => isSamePosition(cell, position));
        if (index < 0) {
            return false;
        }

        const digit = digits[cell.top][cell.left]!;
        const mirrorCell = cells[cells.length - 1 - index];
        const mirrorDigit = digits[mirrorCell.top]?.[mirrorCell.left];

        return mirrorDigit === undefined || areSameCellData(digit, mirrorDigit, state, true);
    },
});
