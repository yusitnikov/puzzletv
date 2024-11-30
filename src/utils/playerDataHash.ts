import { Position } from "../types/layout/Position";
import { PuzzleContext } from "../types/sudoku/PuzzleContext";
import { AnyPTM } from "../types/sudoku/PuzzleTypeMap";

export const getMainDigitDataHash = ({ top, left }: Position) => `main-digit-${top}-${left}`;

const getDigitOptionDataHash = <T extends AnyPTM>(
    type: string,
    { top, left }: Position,
    data: T["cell"],
    {
        puzzle: {
            typeManager: { serializeCellData },
        },
    }: PuzzleContext<T>,
) => `digit-${type}-${top}-${left}-${serializeCellData(data)}`;

export const getExcludedDigitDataHash = <T extends AnyPTM>(
    position: Position,
    data: T["cell"],
    context: PuzzleContext<T>,
) => getDigitOptionDataHash("excluded", position, data, context);
