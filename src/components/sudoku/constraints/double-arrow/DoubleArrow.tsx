import {
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {LineProps} from "../line/Line";
import {BetweenLine} from "../between-line/BetweenLine";

export const DoubleArrowConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    lineColor?: string,
    width?: number,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "double arrow",
        cells,
        component: BetweenLine,
        color: lineColor,
        props: {width},
        isValidCell(cell, digits, cells, context) {
            let sum = 0;
            for (const [index, cell] of cells.entries()) {
                const data = digits[cell.top]?.[cell.left];
                if (data === undefined) {
                    return true;
                }
                const digit = context.puzzle.typeManager.getDigitByCellData(data, context, cell);
                if (index === 0 || index === cells.length - 1) {
                    sum += digit;
                } else {
                    sum -= digit;
                }
            }

            return sum === 0;
        },
    };
};
