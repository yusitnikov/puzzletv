import {parsePositionLiterals, PositionLiteral} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {Region} from "../../../components/sudoku/constraints/region/Region";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";

export const TenInOneRegionConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[]): Constraint<CellType, undefined, ExType, ProcessedExType> => ({
    name: "10-in-1 region",
    cells: parsePositionLiterals(cellLiterals),
    component: Region,
    props: undefined,
    isObvious: true,
    isValidCell(cell, digits, cells, {puzzle}) {
        const cellData = cells
            .map(({top, left}) => digits[top]?.[left])
            .filter(data => data !== undefined)
            .map(data => data!);

        const uniqueCellData = new CellDataSet(puzzle).toggleAll(cellData, true);

        return uniqueCellData.size <= puzzle.fieldSize.regionWidth!;
    },
});
