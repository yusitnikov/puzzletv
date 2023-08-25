import {Constraint} from "../Constraint";
import {isSamePosition} from "../../layout/Position";
import {loop} from "../../../utils/math";
import {AnyPTM} from "../PuzzleTypeMap";

export const AntiBishopFromCenterConstraint = <T extends AnyPTM>(regionSize: number): Constraint<T> => ({
    name: "anti-bishop from center",
    cells: [],
    props: undefined,
    isObvious: true,
    isValidCell(
        cell,
        digits,
        _,
        context
    ) {
        const {
            typeManager: {areSameCellData},
            loopHorizontally,
            loopVertically,
            fieldSize: {rowsCount, columnsCount, fieldSize},
        } = context.puzzle;

        const digit = digits[cell.top][cell.left]!;

        const isCenterIndex = (index: number) => (index % regionSize) * 2 + 1 === regionSize;
        const isCurrentCellCenter = isCenterIndex(cell.top) && isCenterIndex(cell.left);

        for (let offset = -fieldSize; offset <= fieldSize; offset++) {
            if (offset === 0) {
                continue;
            }

            let x = cell.left + offset;
            if (loopHorizontally) {
                x = loop(x, columnsCount);
            }

            for (const coeff of [-1, 1]) {
                let y = cell.top + offset * coeff;
                if (loopVertically) {
                    y = loop(y, rowsCount);
                }

                if (!isCurrentCellCenter && !(isCenterIndex(x) && isCenterIndex(y))) {
                    continue;
                }

                const cell2 = {left: x, top: y};
                if (isSamePosition(cell, cell2)) {
                    continue;
                }

                const digit2 = digits[y]?.[x];
                if (digit2 !== undefined && areSameCellData(digit2, digit, context, cell2, cell)) {
                    return false;
                }
            }
        }

        return true;
    },
});
