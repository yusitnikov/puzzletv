import { PositionLiteral } from "../../../../types/layout/Position";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { OutsideClueConstraint } from "../outside-clue/OutsideClue";

export const SandwichSumConstraint = <T extends AnyPTM>(
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: GridSize | PositionLiteral[],
    value: number,
    color?: string,
) =>
    OutsideClueConstraint<T>(
        "sandwich sum",
        clueCellLiteral,
        cellLiteralsOrFieldSize,
        value,
        color,
        (currentDigit, cellDigits, context, isFinalCheck, _cellIndex, value) => {
            const { digitsCount: maxDigit } = context;

            if (currentDigit !== 1 && currentDigit !== maxDigit) {
                // Highlight only the bread digits as conflicts if something's wrong
                return true;
            }

            const [minIndex, maxIndex] = [cellDigits.indexOf(1), cellDigits.indexOf(maxDigit)].sort();
            if (minIndex < 0) {
                // One of bread digits not filled in the row/column yet
                return !isFinalCheck;
            }

            let actualSum = 0;

            for (let index = minIndex + 1; index < maxIndex; index++) {
                const digit = cellDigits[index];

                if (digit === undefined) {
                    return true;
                }

                actualSum += digit;
            }

            return actualSum === value;
        },
    );
