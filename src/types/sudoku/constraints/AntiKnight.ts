import {Constraint} from "../Constraint";
import {normalizePuzzlePosition} from "../PuzzleDefinition";

export const AntiKnightConstraint = <CellType, ExType, ProcessedExType>(): Constraint<CellType, undefined, ExType, ProcessedExType> => ({
    name: "anti-knight",
    cells: [],
    props: undefined,
    isValidCell(
        {left, top},
        digits,
        _,
        {puzzle, state}
    ) {
        const digit = digits[top][left]!;

        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (Math.abs(dx * dy) === 2) {
                    const otherCell = normalizePuzzlePosition({top: top + dy, left: left + dx}, puzzle);
                    const digit2 = digits[otherCell.top]?.[otherCell.left];
                    if (digit2 !== undefined && puzzle.typeManager.areSameCellData(digit2, digit, state, true)) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
});
