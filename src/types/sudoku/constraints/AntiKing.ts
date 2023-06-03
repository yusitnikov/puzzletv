import {Constraint} from "../Constraint";
import {normalizePuzzlePosition} from "../PuzzleDefinition";
import {AnyPTM} from "../PuzzleTypeMap";

export const AntiKingConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "anti-king",
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

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx || dy) {
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
