import {PositionLiteral} from "../../../../types/layout/Position";
import {DominoLineConstraint} from "../domino-line/DominoLine";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";

export const GermanWhispersConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[], display = true, split = true) => {
    return DominoLineConstraint<CellType, ExType, ProcessedExType>(
        "german whispers",
        true,
        "#0f0",
        cellLiterals,
        (digit1, digit2, {puzzle}) => {
            const {digitsCount = getDefaultDigitsCount(puzzle)} = puzzle;
            return Math.abs(digit1 - digit2) >= Math.ceil(digitsCount / 2);
        },
        undefined,
        display,
        split,
    );
};
