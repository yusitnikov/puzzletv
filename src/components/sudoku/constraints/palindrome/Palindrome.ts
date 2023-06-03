import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";
import {lightGreyColor} from "../../../app/globals";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const BasePalindromeConstraint = <T extends AnyPTM>(
    name: string,
    color: string,
    cellLiterals: PositionLiteral[],
    compareDigits = (digit1: number, digit2: number) => digit1 === digit2,
    width: number | undefined = undefined,
    split = true,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name,
        cells,
        color,
        props: {width},
        component: LineComponent,
        isObvious: true,
        isValidCell(cell, digits, cells, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const index = cells.findIndex(position => isSamePosition(cell, position));
            if (index < 0) {
                return false;
            }

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);
            const mirrorCell = cells[cells.length - 1 - index];
            const mirrorCellData = digits[mirrorCell.top]?.[mirrorCell.left];
            const mirrorDigit = mirrorCellData && getDigitByCellData(mirrorCellData, context, mirrorCell);

            return mirrorCellData === undefined || digit === mirrorDigit;
        },
    };
};

export const PalindromeConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[], split = true) => BasePalindromeConstraint<T>(
    "palindrome",
    lightGreyColor,
    cellLiterals,
    undefined,
    undefined,
    split,
);
