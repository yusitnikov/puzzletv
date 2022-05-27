import {
    areCellStatesEqual,
    CellState,
    cloneCellState,
    createEmptyCellState,
    serializeCellState,
    unserializeCellState
} from "./CellState";
import {indexes} from "../../utils/indexes";
import {
    getLineVector,
    invertLine,
    invertPosition,
    isSamePosition,
    Line,
    Position
} from "../layout/Position";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {Set} from "../struct/Set";

export interface FieldState<CellType> {
    cells: CellState<CellType>[][];
    lines: Set<Line>;
}

const getLineComparer = (
    {fieldSize: {rowsCount, columnsCount}, loopHorizontally, loopVertically}: PuzzleDefinition<any, any, any>
) => (line1: Line, line2: Line) => {
    const vector1 = getLineVector(line1);
    const vector2 = getLineVector(line2);

    if (!isSamePosition(vector1, vector2)) {
        if (!isSamePosition(vector1, invertPosition(vector2))) {
            return false;
        }

        line2 = invertLine(line2);
    }

    let {left, top} = getLineVector({start: line1.start, end: line2.start});

    if (loopVertically) {
        top %= rowsCount;
    }

    if (loopHorizontally) {
        left %= columnsCount;
    }

    return !left && !top;
};

export const createEmptyFieldState = <CellType>(
    puzzle: PuzzleDefinition<CellType, any, any>
): FieldState<CellType> => ({
    cells: indexes(puzzle.fieldSize.rowsCount).map(() => indexes(puzzle.fieldSize.columnsCount).map(() => createEmptyCellState(puzzle.typeManager))),
    lines: new Set<Line>([], getLineComparer(puzzle)),
});

export const serializeFieldState = <CellType>(
    {cells, lines}: FieldState<CellType>,
    typeManager: SudokuTypeManager<CellType, any, any>
) => ({
    cells: cells.map(row => row.map(cell => serializeCellState(cell, typeManager))),
    lines: lines.serialize(),
});

export const unserializeFieldState = <CellType>(
    {cells, lines}: any,
    puzzle: PuzzleDefinition<CellType, any, any>
) => ({
    cells: (cells as any[][]).map(row => row.map(cell => unserializeCellState(cell, puzzle.typeManager))),
    lines: Set.unserialize(lines, getLineComparer(puzzle)),
});

export const cloneFieldState = <CellType>(
    typeManager: SudokuTypeManager<CellType, any, any>,
    {cells, lines}: FieldState<CellType>
): FieldState<CellType> => ({
    cells: cells.map(row => row.map(cellState => cloneCellState(typeManager, cellState))),
    lines: lines.clone(),
});

export const processFieldStateCells = <CellType>(
    fieldState: FieldState<CellType>,
    affectedCells: Position[],
    processor: (cellState: CellState<CellType>, position: Position) => CellState<CellType>
) => {
    for (const position of affectedCells) {
        const {left: columnIndex, top: rowIndex} = position;
        fieldState.cells[rowIndex][columnIndex] = processor(fieldState.cells[rowIndex][columnIndex], position);
    }

    return fieldState;
};

export const processFieldStateLines = <CellType>(
    fieldState: FieldState<CellType>,
    processor: (lines: Set<Line>) => Set<Line>
) => {
    return {
        ...fieldState,
        lines: processor(fieldState.lines),
    };
};

export const areAllFieldStateCells = <CellType>(
    fieldState: FieldState<CellType>,
    affectedCells: Position[],
    predicate: (cellState: CellState<CellType>) => boolean
) =>
    affectedCells.every(({left: columnIndex, top: rowIndex}) => predicate(fieldState.cells[rowIndex][columnIndex]));

export const isAnyFieldStateCell = <CellType>(
    fieldState: FieldState<CellType>,
    affectedCells: Position[],
    predicate: (cellState: CellState<CellType>) => boolean
) =>
    affectedCells.some(({left: columnIndex, top: rowIndex}) => predicate(fieldState.cells[rowIndex][columnIndex]));

export const areFieldStatesEqual = <CellType>(
    typeManager: SudokuTypeManager<CellType, any, any>,
    {cells, lines}: FieldState<CellType>,
    {cells: cells2, lines: lines2}: FieldState<CellType>
) =>
    cells.every(
        (row, rowIndex) => row.every(
            (cell, columnIndex) => areCellStatesEqual(typeManager, cell, cells2[rowIndex][columnIndex])
        )
    ) &&
    lines.equals(lines2);
