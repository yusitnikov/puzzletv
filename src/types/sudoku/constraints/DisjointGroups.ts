import { Constraint } from "../Constraint";
import { AnyPTM } from "../PuzzleTypeMap";

// TODO: support custom regions
// noinspection JSSuspiciousNameCombination
export const DisjointGroupsConstraint = <T extends AnyPTM>(
    intervalX: number,
    intervalY = intervalX,
): Constraint<T> => ({
    name: "disjoint groups",
    cells: [],
    props: undefined,
    isObvious: true,
    isValidCell(cell, digits, _, context) {
        const {
            gridSize: { rowsCount, columnsCount },
            typeManager: { areSameCellData },
        } = context.puzzle;

        const digit = digits[cell.top][cell.left]!;

        for (let top2 = cell.top % intervalY; top2 < rowsCount; top2 += intervalY) {
            for (let left2 = cell.left % intervalX; left2 < columnsCount; left2 += intervalX) {
                if (top2 === cell.top && left2 === cell.left) {
                    continue;
                }

                const digit2 = digits[top2]?.[left2];
                if (digit2 !== undefined && areSameCellData(digit2, digit, context, { top: top2, left: left2 }, cell)) {
                    return false;
                }
            }
        }

        return true;
    },
});
