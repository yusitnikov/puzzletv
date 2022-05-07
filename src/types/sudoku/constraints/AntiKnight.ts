import {Constraint} from "../Constraint";

export const AntiKnightConstraint: Constraint<any> = {
    name: "anti-knight",
    cells: [],
    isValidCell(
        {left, top},
        digits,
        _,
        {typeManager: {areSameCellData}, loopHorizontally, loopVertically, fieldSize: {rowsCount, columnsCount}},
        state
    ) {
        const digit = digits[top][left]!;

        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (Math.abs(dx * dy) === 2) {
                    let x = left + dx;
                    if (loopHorizontally) {
                        x = (x + columnsCount) % columnsCount;
                    }

                    let y = top + dy;
                    if (loopVertically) {
                        y = (y + rowsCount) % rowsCount;
                    }

                    const digit2 = digits[y]?.[x];
                    if (digit2 !== undefined && areSameCellData(digit2, digit, state, true)) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
}