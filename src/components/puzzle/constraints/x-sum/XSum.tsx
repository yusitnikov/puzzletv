import { PositionLiteral } from "../../../../types/layout/Position";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { OutsideClueConstraint } from "../outside-clue/OutsideClue";
import { sum } from "../../../../utils/math";

export const XSumConstraint = <T extends AnyPTM>(
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: GridSize | PositionLiteral[],
    value: number,
    color?: string,
) =>
    OutsideClueConstraint<T>(
        "x-sum",
        clueCellLiteral,
        cellLiteralsOrFieldSize,
        value,
        color,
        (_currentDigit, cellDigits, _context, _isFinalCheck, cellIndex, value) => {
            const firstDigit = cellDigits[0];
            if (firstDigit === undefined) {
                return true;
            }

            if (cellIndex >= firstDigit) {
                return true;
            }

            const relevantDigits = cellDigits.slice(0, firstDigit);

            return relevantDigits.some((digit) => digit === undefined) || sum(relevantDigits as number[]) === value;
        },
    );
