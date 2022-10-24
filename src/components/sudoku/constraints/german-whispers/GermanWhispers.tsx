import {PositionLiteral} from "../../../../types/layout/Position";
import {DominoLineConstraint} from "../domino-line/DominoLine";

export const GermanWhispersConstraint = <CellType,>(cellLiterals: PositionLiteral[], display = true) => {
    return DominoLineConstraint<CellType>(
        "german whispers",
        "#0f0",
        cellLiterals,
        (digit1, digit2) => Math.abs(digit1 - digit2) >= 5,
        undefined,
        display
    );
};
