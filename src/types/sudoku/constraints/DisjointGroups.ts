import {Constraint} from "../Constraint";
import {AnyPTM} from "../PuzzleTypeMap";

// TODO: support custom regions
// noinspection JSSuspiciousNameCombination
export const DisjointGroupsConstraint = <T extends AnyPTM>(
    intervalX: number, intervalY = intervalX
): Constraint<T> => ({
    name: "disjoint groups",
    cells: [],
    props: undefined,
    isObvious: true,
    isValidCell(
        {left, top},
        digits,
        _,
        context
    ) {
        const {
            fieldSize: {rowsCount, columnsCount},
            typeManager: {areSameCellData}
        } = context.puzzle;

        const digit = digits[top][left]!;

        for (let top2 = top % intervalY; top2 < rowsCount; top2 += intervalY) {
            for (let left2 = left % intervalX; left2 < columnsCount; left2 += intervalX) {
                if (top2 === top && left2 === left) {
                    continue;
                }

                const digit2 = digits[top2]?.[left2];
                if (digit2 !== undefined && areSameCellData(digit2, digit, context)) {
                    return false;
                }
            }
        }

        return true;
    },
});
