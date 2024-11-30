import { parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint } from "../../../../types/sudoku/Constraint";
import { splitMultiLine } from "../../../../utils/lines";
import { isValidCellForRegion } from "../region/Region";
import { LineComponent, LineProps } from "../line/Line";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { purpleColor } from "../../../app/globals";

export const RenbanConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    color = purpleColor,
    width: number | undefined = undefined,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "renban line",
        cells,
        color,
        component: LineComponent,
        props: { width },
        isObvious: true,
        isValidCell(cell, digits, cells, context, constraints, constraint, isFinalCheck, onlyObvious) {
            const { puzzle } = context;

            if (!isValidCellForRegion(cells, cell, digits, context)) {
                return false;
            }

            if (onlyObvious) {
                return true;
            }

            const actualDigits = cells
                .map((cell) => ({ cell, data: digits[cell.top]?.[cell.left] }))
                .filter(({ data }) => data !== undefined)
                .map(({ cell, data }) => puzzle.typeManager.getDigitByCellData(data!, context, cell));

            return !actualDigits.length || Math.max(...actualDigits) - Math.min(...actualDigits) < cells.length;
        },
    };
};
