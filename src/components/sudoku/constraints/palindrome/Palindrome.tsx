import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";
import {lightGreyColor} from "../../../app/globals";

export const BasePalindromeConstraint = <CellType,>(
    name: string,
    color: string,
    cellLiterals: PositionLiteral[],
    compareDigits = (digit1: number, digit2: number) => digit1 === digit2,
    width: number | undefined = undefined,
): Constraint<CellType, LineProps> => ({
    name,
    cells: splitMultiLine(parsePositionLiterals(cellLiterals)),
    color,
    width,
    component: LineComponent,
    isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
        const index = cells.findIndex(position => isSamePosition(cell, position));
        if (index < 0) {
            return false;
        }

        const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);
        const mirrorCell = cells[cells.length - 1 - index];
        const mirrorCellData = digits[mirrorCell.top]?.[mirrorCell.left];
        const mirrorDigit = mirrorCellData && getDigitByCellData(mirrorCellData, state);

        return mirrorCellData === undefined || digit === mirrorDigit;
    },
});

export const PalindromeConstraint = <CellType,>(cellLiterals: PositionLiteral[]) => BasePalindromeConstraint<CellType>(
    "palindrome",
    lightGreyColor,
    cellLiterals
);
