import {Position} from "../types/layout/Position";
import {PuzzleContext} from "../types/sudoku/PuzzleContext";

export const getMainDigitDataHash = ({top, left}: Position) => `main-digit-${top}-${left}`;

const getDigitOptionDataHash = <CellType>(
    type: string,
    {top, left}: Position,
    data: CellType,
    {puzzle: {typeManager: {serializeCellData}}}: PuzzleContext<CellType, any, any>
) => `digit-${type}-${top}-${left}-${serializeCellData(data)}`;

export const getExcludedDigitDataHash = <CellType>(
    position: Position,
    data: CellType,
    context: PuzzleContext<CellType, any, any>
) => getDigitOptionDataHash("excluded", position, data, context);
