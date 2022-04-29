import {areCellStatesEqual, CellState, cloneCellState, createEmptyCellState} from "./CellState";
import {indexes} from "../../utils/indexes";
import {Position} from "../layout/Position";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {PuzzleDefinition} from "./PuzzleDefinition";

export interface FieldState<CellType> {
    cells: CellState<CellType>[][];
}

export const createEmptyFieldState = <CellType>(
    {typeManager, fieldSize: {rowsCount, columnsCount}}: PuzzleDefinition<CellType, any, any>
): FieldState<CellType> => ({
    cells: indexes(rowsCount).map(() => indexes(columnsCount).map(() => createEmptyCellState(typeManager))),
});

export const cloneFieldState = <CellType>(
    typeManager: SudokuTypeManager<CellType>,
    {cells}: FieldState<CellType>
): FieldState<CellType> => ({
    cells: cells.map(row => row.map(cellState => cloneCellState(typeManager, cellState))),
});

export const processFieldStateCells = <CellType>(
    fieldState: FieldState<CellType>,
    affectedCells: Position[],
    processor: (cellState: CellState<CellType>) => CellState<CellType>
) => {
    for (const {left: columnIndex, top: rowIndex} of affectedCells) {
        fieldState.cells[rowIndex][columnIndex] = processor(fieldState.cells[rowIndex][columnIndex]);
    }

    return fieldState;
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
    typeManager: SudokuTypeManager<CellType>,
    {cells}: FieldState<CellType>,
    {cells: cells2}: FieldState<CellType>
) => cells.every(
    (row, rowIndex) => row.every(
        (cell, columnIndex) => areCellStatesEqual(typeManager, cell, cells2[rowIndex][columnIndex])
    )
);
