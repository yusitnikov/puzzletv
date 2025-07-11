import { PositionLiteral } from "../../../../types/layout/Position";
import { DominoLineConstraint } from "../domino-line/DominoLine";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
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
        (digit1, digit2, { maxDigit }) => {
            return Math.abs(digit1 - digit2) >= (minDifference ?? Math.ceil(maxDigit / 2));
        },
        width,
        split,
    );
};
