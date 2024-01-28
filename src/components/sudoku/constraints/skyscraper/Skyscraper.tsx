import {PositionLiteral} from "../../../../types/layout/Position";
import {FieldSize} from "../../../../types/sudoku/FieldSize";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {OutsideClueConstraint} from "../outside-clue/OutsideClue";

export const SkyscraperConstraint = <T extends AnyPTM>(
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: FieldSize | PositionLiteral[],
    value: number,
    color?: string,
) => OutsideClueConstraint<T>(
    "skyscraper",
    clueCellLiteral,
    cellLiteralsOrFieldSize,
    value,
    color,
    (currentDigit, cellDigits, context, isFinalCheck, cellIndex) => {
        let maxDigit = -1;
        let actualValue = 0;
        for (const [index, cellDigit] of cellDigits.entries()) {
            if (cellDigit === undefined) {
                return true;
            }

            if (cellDigit > maxDigit) {
                ++actualValue;
            } else if (cellIndex === index) {
                // Don't highlight cells that are "invisible" for skyscrapers as errors
                return true;
            }

            maxDigit = Math.max(maxDigit, cellDigit);
        }

        return actualValue === value;
    },
);
