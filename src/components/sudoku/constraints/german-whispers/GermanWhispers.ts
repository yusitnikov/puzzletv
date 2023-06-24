import {PositionLiteral} from "../../../../types/layout/Position";
import {DominoLineConstraint} from "../domino-line/DominoLine";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {greenColor} from "../../../app/globals";

export const GermanWhispersConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[], display = true, split = true) => {
    return DominoLineConstraint<T>(
        "german whispers",
        true,
        greenColor,
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