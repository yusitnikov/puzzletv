import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";
import {lightGreyColor} from "../../../app/globals";

export const BasePalindromeConstraint = <CellType, ExType, ProcessedExType>(
    name: string,
    color: string,
    cellLiterals: PositionLiteral[],
    compareDigits = (digit1: number, digit2: number) => digit1 === digit2,
    width: number | undefined = undefined,
): Constraint<CellType, LineProps, ExType, ProcessedExType> => ({
    name,
    cells: splitMultiLine(parsePositionLiterals(cellLiterals)),
    color,
    props: {width},
    component: LineComponent,
    isObvious: true,
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

export const PalindromeConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[]) => BasePalindromeConstraint<CellType, ExType, ProcessedExType>(
    "palindrome",
    lightGreyColor,
    cellLiterals
);
