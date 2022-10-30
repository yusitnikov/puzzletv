import {Constraint} from "../Constraint";
import {normalizePuzzlePosition} from "../PuzzleDefinition";

export const AntiKingConstraint = <CellType, ExType, ProcessedExType>(): Constraint<CellType, undefined, ExType, ProcessedExType> => ({
    name: "anti-king",
    cells: [],
    props: undefined,
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
                    if (digit2 !== undefined && puzzle.typeManager.areSameCellData(digit2, digit, state, true)) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
});
