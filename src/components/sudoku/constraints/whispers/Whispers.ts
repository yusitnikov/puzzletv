import { PositionLiteral } from "../../../../types/layout/Position";
import { DominoLineConstraint } from "../domino-line/DominoLine";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { greenColor } from "../../../app/globals";

export const WhispersConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    minDifference: number | undefined = undefined,
    color = greenColor,
    width: number | undefined = undefined,
) => {
    return DominoLineConstraint<T>(
        "whispers",
        true,
        color,
        cellLiterals,
        (digit1, digit2, { digitsCount }) => {
            return Math.abs(digit1 - digit2) >= (minDifference ?? Math.ceil(digitsCount / 2));
        },
        width,
        split,
    );
};
