import {Constraint} from "../Constraint";
import {normalizePuzzlePosition} from "../PuzzleDefinition";
import {AnyPTM} from "../PuzzleTypeMap";

export const AntiKnightConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "anti-knight",
    cells: [],
    props: undefined,
    isObvious: true,
    isValidCell(
        {left, top},
        digits,
        _,
        context
    ) {
        const digit = digits[top][left]!;

        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (Math.abs(dx * dy) === 2) {
                    const otherCell = normalizePuzzlePosition({top: top + dy, left: left + dx}, context.puzzle);
                    const digit2 = digits[otherCell.top]?.[otherCell.left];
                    if (digit2 !== undefined && context.puzzle.typeManager.areSameCellData(digit2, digit, context)) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
});
