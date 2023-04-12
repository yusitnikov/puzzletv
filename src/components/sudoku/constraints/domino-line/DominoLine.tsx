import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";

export const DominoLineConstraint = <CellType, ExType, ProcessedExType>(
    name: string,
    isObvious: boolean,
    color: string,
    cellLiterals: PositionLiteral[],
    isValidDomino: (digit1: number, digit2: number, context: PuzzleContext<CellType, ExType, ProcessedExType>) => boolean,
    width: number | undefined = undefined,
    display = true,
    split = true,
): Constraint<CellType, LineProps, ExType, ProcessedExType> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name,
        cells,
        color,
        props: {width},
        component: display ? LineComponent : undefined,
        isObvious,
        isValidCell(cell, digits, cells, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            const index = cells.findIndex(constraintCell => isSamePosition(constraintCell, cell));
            const prevCell = cells[index - 1];
            const nextCell = cells[index + 1];
            const prevDigit = prevCell && digits[prevCell.top]?.[prevCell.left];
            const nextDigit = nextCell && digits[nextCell.top]?.[nextCell.left];

            return (prevDigit === undefined || isValidDomino(getDigitByCellData(prevDigit, context, prevCell), digit, context))
                && (nextDigit === undefined || isValidDomino(getDigitByCellData(nextDigit, context, nextCell), digit, context));
        },
    };
};
