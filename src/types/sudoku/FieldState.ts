import {
    areCellStatesEqual,
    CellState,
    cloneCellState,
    createEmptyCellState,
    serializeCellState,
    unserializeCellState
} from "./CellState";
import {indexes} from "../../utils/indexes";
import {Position} from "../layout/Position";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {SetInterface} from "../struct/Set";
import {CellMark, CellMarkSet, CellMarkType} from "./CellMark";
import {PuzzleLineSet} from "./PuzzleLineSet";
import {LineWithColor} from "./LineWithColor";

export interface FieldState<CellType> {
    cells: CellState<CellType>[][];
    lines: SetInterface<LineWithColor>;
    marks: SetInterface<CellMark>;
}

export const createEmptyFieldState = <CellType>(
    puzzle: PuzzleDefinition<CellType, any, any>
): FieldState<CellType> => ({
    cells: indexes(puzzle.fieldSize.rowsCount).map(() => indexes(puzzle.fieldSize.columnsCount).map(() => createEmptyCellState(puzzle))),
    lines: new PuzzleLineSet(puzzle),
    marks: new CellMarkSet(puzzle),
});

export const serializeFieldState = <CellType>(
    {cells, lines, marks}: FieldState<CellType>,
    typeManager: SudokuTypeManager<CellType, any, any>
) => ({
    cells: cells.map(row => row.map(cell => serializeCellState(cell, typeManager))),
    lines: lines.serialize(),
    marks: marks.serialize(),
});

export const unserializeFieldState = <CellType>(
    {cells = [], lines = [], marks = []}: any,
    puzzle: PuzzleDefinition<CellType, any, any>
) => ({
    cells: (cells as any[][]).map(row => row.map(cell => unserializeCellState(cell, puzzle))),
    lines: PuzzleLineSet.unserialize(puzzle, lines),
    marks: CellMarkSet.unserialize(
        puzzle,
        marks.map(({type, isCircle, ...mark}: any) => ({
            ...mark,
            type: type ?? (isCircle ? CellMarkType.O : CellMarkType.X),
        }))
    ),
});

export const cloneFieldState = <CellType>(
    typeManager: SudokuTypeManager<CellType, any, any>,
    {cells, lines, marks}: FieldState<CellType>
): FieldState<CellType> => ({
    cells: cells.map(row => row.map(cellState => cloneCellState(typeManager, cellState))),
    lines: lines.clone(),
    marks: marks.clone(),
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

export const areAllFieldStateCells = <CellType>(
    fieldState: FieldState<CellType>,
    affectedCells: Position[],
    predicate: (cellState: CellState<CellType>, position: Position) => boolean
) =>
    affectedCells.every((position) => predicate(fieldState.cells[position.top][position.left], position));

export const isAnyFieldStateCell = <CellType>(
    fieldState: FieldState<CellType>,
    affectedCells: Position[],
    predicate: (cellState: CellState<CellType>, position: Position) => boolean
) =>
    affectedCells.some((position) => predicate(fieldState.cells[position.top][position.left], position));

export const areFieldStatesEqual = <CellType>(
    typeManager: SudokuTypeManager<CellType, any, any>,
    {cells, lines, marks}: FieldState<CellType>,
    {cells: cells2, lines: lines2, marks: marks2}: FieldState<CellType>
) =>
    cells.every(
        (row, rowIndex) => row.every(
            (cell, columnIndex) => areCellStatesEqual(typeManager, cell, cells2[rowIndex][columnIndex])
        )
    ) &&
    lines.equals(lines2) &&
    marks.equals(marks2);
