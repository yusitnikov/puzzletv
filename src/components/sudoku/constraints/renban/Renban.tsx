import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {isValidCellForRegion} from "../region/Region";
import {LineComponent, LineProps} from "../line/Line";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const RenbanConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    display = true,
    split = true,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "renban line",
        cells,
        color: "#f0f",
        component: display ? LineComponent : undefined,
        props: {},
        isObvious: true,
        isValidCell(
            cell,
            digits,
            cells,
            context,
            constraints,
            isFinalCheck,
            onlyObvious
        ) {
            const {puzzle, state} = context;

            if (!isValidCellForRegion(cells, cell, digits, puzzle, state)) {
                return false;
            }

            if (onlyObvious) {
                return true;
            }

            const actualDigits = cells
                .map((cell) => ({cell, data: digits[cell.top]?.[cell.left]}))
                .filter(({data}) => data !== undefined)
                .map(({cell, data}) => puzzle.typeManager.getDigitByCellData(data!, context, cell));

            return !actualDigits.length || Math.max(...actualDigits) - Math.min(...actualDigits) < cells.length;
        },
    };
};
