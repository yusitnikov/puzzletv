import {areCellStatesEqual, CellState, cloneCellState, emptyCellState} from "./CellState";
import {indexes08} from "../../utils/indexes";
import {Position} from "../layout/Position";

export interface FieldState {
    cells: CellState[][];
}

export const createEmptyFieldState = (): FieldState => ({
    cells: indexes08.map(() => indexes08.map(() => emptyCellState)),
});

export const cloneFieldState = ({cells}: FieldState): FieldState => ({
    cells: cells.map(row => row.map(cloneCellState)),
});

export const processFieldStateCells = (fieldState: FieldState, affectedCells: Position[], processor: (cellState: CellState) => CellState) => {
    for (const {left: columnIndex, top: rowIndex} of affectedCells) {
        fieldState.cells[rowIndex][columnIndex] = processor(fieldState.cells[rowIndex][columnIndex]);
    }

    return fieldState;
};

export const areAllFieldStateCells = (fieldState: FieldState, affectedCells: Position[], predicate: (cellState: CellState) => boolean) =>
    affectedCells.every(({left: columnIndex, top: rowIndex}) => predicate(fieldState.cells[rowIndex][columnIndex]));

export const areFieldStatesEqual = ({cells}: FieldState, {cells: cells2}: FieldState) => cells.every(
    (row, rowIndex) => row.every(
        (cell, columnIndex) => areCellStatesEqual(cell, cells2[rowIndex][columnIndex])
    )
);
