import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";

export const DominoLineConstraint = <CellType, ExType, ProcessedExType>(
    name: string,
    color: string,
    cellLiterals: PositionLiteral[],
    isValidDomino: (digit1: number, digit2: number) => boolean,
    width: number | undefined = undefined,
    display = true
): Constraint<CellType, LineProps, ExType, ProcessedExType> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return {
        name,
        cells,
        color,
        props: {width},
        component: display ? LineComponent : undefined,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            const index = cells.findIndex(constraintCell => isSamePosition(constraintCell, cell));
            const prevCell = cells[index - 1];
            const nextCell = cells[index + 1];
            const prevDigit = prevCell && digits[prevCell.top]?.[prevCell.left];
            const nextDigit = nextCell && digits[nextCell.top]?.[nextCell.left];

            return (prevDigit === undefined || isValidDomino(getDigitByCellData(prevDigit, state), digit))
                && (nextDigit === undefined || isValidDomino(getDigitByCellData(nextDigit, state), digit));
        },
    };
};
