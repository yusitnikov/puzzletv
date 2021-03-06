import {Constraint} from "../Constraint";

// TODO: support custom regions
export const DisjointGroupsConstraint = (intervalX: number, intervalY = intervalX): Constraint<any> => ({
    name: "disjoint groups",
    cells: [],
    isValidCell(
        {left, top},
        digits,
        _,
        {puzzle, state}
    ) {
        const {
            fieldSize: {rowsCount, columnsCount},
            typeManager: {areSameCellData}
        } = puzzle;

        const digit = digits[top][left]!;

        for (let top2 = top % intervalY; top2 < rowsCount; top2 += intervalY) {
            for (let left2 = left % intervalX; left2 < columnsCount; left2 += intervalX) {
                if (top2 === top && left2 === left) {
                    continue;
                }

                const digit2 = digits[top2]?.[left2];
                if (digit2 !== undefined && areSameCellData(digit2, digit, state, true)) {
                    return false;
                }
            }
        }

        return true;
    },
});
