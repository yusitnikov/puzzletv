import { parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint } from "../../../../types/sudoku/Constraint";
import { splitMultiLine } from "../../../../utils/lines";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { BetweenLine, BetweenLineProps } from "../between-line/BetweenLine";

export const DoubleArrowConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    lineColor?: string,
    lineWidth?: number,
    bulbRadius?: number,
    bulbBackgroundColor?: string,
    bulbLineColor = lineColor,
    bulbLineWidth = lineWidth,
): Constraint<T, BetweenLineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "double arrow",
        cells,
        component: BetweenLine,
        color: lineColor,
        props: {
            lineColor,
            lineWidth,
            bulbRadius,
            bulbBackgroundColor,
            bulbLineColor,
            bulbLineWidth,
        },
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
