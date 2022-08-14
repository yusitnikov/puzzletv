import {parsePositionLiterals, PositionLiteral} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {Region} from "../../../components/sudoku/constraints/region/Region";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";

export const TenInOneRegionConstraint = <CellType, >(cellLiterals: PositionLiteral[]): Constraint<CellType> => ({
    name: "10-in-1 region",
    cells: parsePositionLiterals(cellLiterals),
    component: Region,
    isValidCell(cell, digits, cells, {puzzle}) {
        const cellData = cells
            .map(({top, left}) => digits[top]?.[left])
            .filter(data => data !== undefined)
            .map(data => data!);

        const uniqueCellData = new CellDataSet(puzzle).toggleAll(cellData, true);

        return uniqueCellData.size <= puzzle.fieldSize.regionWidth!;
    },
});
