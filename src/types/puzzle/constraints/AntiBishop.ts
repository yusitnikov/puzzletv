import { Constraint } from "../Constraint";
import { AnyPTM } from "../PuzzleTypeMap";

export const AntiBishopConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "anti-bishop",
    cells: [],
    props: undefined,
    isObvious: true,
    isValidCell(cell, digits, _, context) {
        const { top, left } = cell;
        const digit = digits[top][left]!;

        for (let left2 = 0; left2 < context.puzzle.gridSize.rowsCount; left2++) {
            const dx = left2 - left;
            if (dx === 0) {
                continue;
            }

            for (const top2 of [top + dx, top - dx]) {
                const digit2 = digits[top2]?.[left2];
                if (
                    digit2 !== undefined &&
                    context.puzzle.typeManager.areSameCellData(digit2, digit, context, { top: top2, left: left2 }, cell)
                ) {
                    return false;
                }
            }
        }

        return true;
    },
});
