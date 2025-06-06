import { PositionLiteral } from "../../../../types/layout/Position";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { OutsideClueConstraint } from "../outside-clue/OutsideClue";

export const SkyscraperConstraint = <T extends AnyPTM>(
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: GridSize | PositionLiteral[],
    value: number,
    color?: string,
) =>
    OutsideClueConstraint<T>(
        "skyscraper",
        clueCellLiteral,
        cellLiteralsOrFieldSize,
        value,
        color,
        (_currentDigit, cellDigits, _context, _isFinalCheck, cellIndex, value) => {
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
