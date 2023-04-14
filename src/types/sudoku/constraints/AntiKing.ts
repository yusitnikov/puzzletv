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
        {puzzle, state}
    ) {
        const digit = digits[top][left]!;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx || dy) {
                    const otherCell = normalizePuzzlePosition({top: top + dy, left: left + dx}, puzzle);
                    const digit2 = digits[otherCell.top]?.[otherCell.left];
                    if (digit2 !== undefined && puzzle.typeManager.areSameCellData(digit2, digit, puzzle, state, true)) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
});
