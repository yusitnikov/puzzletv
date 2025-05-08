import { PositionLiteral } from "../../../../types/layout/Position";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { OutsideClueConstraint } from "../outside-clue/OutsideClue";

export const NumberedRoomConstraint = <T extends AnyPTM>(
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: GridSize | PositionLiteral[],
    value: number,
    color?: string,
) =>
    OutsideClueConstraint<T>(
        "numbered room",
        clueCellLiteral,
        cellLiteralsOrFieldSize,
        value,
        color,
        (currentDigit, cellDigits, _context, _isFinalCheck, cellIndex, value) => {
            const firstDigit = cellDigits[0];

            return firstDigit === undefined || cellIndex !== firstDigit - 1 || currentDigit === value;
        },
    );
