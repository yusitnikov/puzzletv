import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {isValidCellForRegion} from "../region/Region";
import {LineComponent, LineProps} from "../line/Line";

export const RenbanConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[], display = true): Constraint<CellType, LineProps, ExType, ProcessedExType> => ({
    name: "renban line",
    cells: splitMultiLine(parsePositionLiterals(cellLiterals)),
    color: "#f0f",
    component: display ? LineComponent : undefined,
    props: {},
    isObvious: true,
    isValidCell(
        cell,
        digits,
        cells,
        {puzzle, state},
        constraints,
        isFinalCheck,
        onlyObvious
    ) {
        if (!isValidCellForRegion(cells, cell, digits, puzzle, state)) {
            return false;
        }

        if (onlyObvious) {
            return true;
        }

        const actualDigits = cells
            .map(({top, left}) => digits[top]?.[left])
            .filter(data => data !== undefined)
            .map(data => puzzle.typeManager.getDigitByCellData(data, state));

        return !actualDigits.length || Math.max(...actualDigits) - Math.min(...actualDigits) < cells.length;
    },
});
