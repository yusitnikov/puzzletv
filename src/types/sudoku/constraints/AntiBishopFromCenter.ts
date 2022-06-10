import {Constraint} from "../Constraint";
import {isSamePosition} from "../../layout/Position";

export const AntiBishopFromCenterConstraint = (regionSize: number): Constraint<any> => ({
    name: "anti-bishop from center",
    cells: [],
    isValidCell(
        {left, top},
        digits,
        _,
        {
            puzzle: {
                typeManager: {areSameCellData},
                loopHorizontally,
                loopVertically,
                fieldSize: {rowsCount, columnsCount, fieldSize},
            },
            state,
        }
    ) {
        const digit = digits[top][left]!;

        const isCenterIndex = (index: number) => (index % regionSize) * 2 + 1 === regionSize;
        const isCurrentCellCenter = isCenterIndex(top) && isCenterIndex(left);

        for (let offset = -fieldSize; offset <= fieldSize; offset++) {
            if (offset === 0) {
                continue;
            }

            let x = left + offset;
            if (loopHorizontally) {
                x = (x + columnsCount) % columnsCount;
            }

            for (const coeff of [-1, 1]) {
                let y = top + offset * coeff;
                if (loopVertically) {
                    y = (y + rowsCount) % rowsCount;
                }

                if (!isCurrentCellCenter && !(isCenterIndex(x) && isCenterIndex(y))) {
                    continue;
                }

                if (isSamePosition({left, top}, {left: x, top: y})) {
                    continue;
                }

                const digit2 = digits[y]?.[x];
                if (digit2 !== undefined && areSameCellData(digit2, digit, state, true)) {
                    return false;
                }
            }
        }

        return true;
    },
});
