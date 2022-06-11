import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";

export const GermanWhispersConstraint = <CellType,>(cellLiterals: PositionLiteral[], display = true): Constraint<CellType, LineProps> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return ({
        name: "german whispers",
        cells,
        color: "#0f0",
        component: display ? LineComponent : undefined,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            const index = cells.findIndex(constraintCell => isSamePosition(constraintCell, cell));
            const prevCell = cells[index - 1];
            const nextCell = cells[index + 1];
            const prevDigit = prevCell && digits[prevCell.top]?.[prevCell.left];
            const nextDigit = nextCell && digits[nextCell.top]?.[nextCell.left];

            return (prevDigit === undefined || Math.abs(getDigitByCellData(prevDigit, state) - digit) >= 5)
                && (nextDigit === undefined || Math.abs(getDigitByCellData(nextDigit, state) - digit) >= 5);
        },
    });
};
