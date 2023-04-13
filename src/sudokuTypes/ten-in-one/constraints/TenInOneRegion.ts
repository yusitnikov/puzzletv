import {parsePositionLiterals, PositionLiteral} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {Region} from "../../../components/sudoku/constraints/region/Region";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const TenInOneRegionConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[]): Constraint<T> => ({
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

        const uniqueCellData = new CellDataSet(puzzle, cellData);

        return uniqueCellData.size <= puzzle.fieldSize.regionWidth!;
    },
});
