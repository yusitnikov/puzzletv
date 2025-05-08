import { parsePositionLiterals, PositionLiteral } from "../../../types/layout/Position";
import { Constraint } from "../../../types/puzzle/Constraint";
import { Region } from "../../../components/puzzle/constraints/region/Region";
import { CellDataSet } from "../../../types/puzzle/CellDataSet";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const TenInOneRegionConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[]): Constraint<T> => ({
    name: "10-in-1 region",
    cells: parsePositionLiterals(cellLiterals),
    component: Region,
    props: undefined,
    isObvious: true,
    isValidCell(cell, digits, cells, { puzzle }) {
        const cellData = cells
            .map(({ top, left }) => digits[top]?.[left])
            .filter((data) => data !== undefined)
            .map((data) => data!);

        const uniqueCellData = new CellDataSet(puzzle, cellData);

        return uniqueCellData.size <= puzzle.gridSize.regionWidth!;
    },
});
