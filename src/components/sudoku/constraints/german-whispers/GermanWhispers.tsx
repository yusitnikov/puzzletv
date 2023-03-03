import {PositionLiteral} from "../../../../types/layout/Position";
import {DominoLineConstraint} from "../domino-line/DominoLine";

export const GermanWhispersConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[], display = true, split = true) => {
    return DominoLineConstraint<CellType, ExType, ProcessedExType>(
        "german whispers",
        true,
        "#0f0",
        cellLiterals,
        (digit1, digit2) => Math.abs(digit1 - digit2) >= 5,
        undefined,
        display,
        split,
    );
};
