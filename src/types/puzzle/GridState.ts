import {
    areCellStatesEqual,
    CellState,
    cloneCellState,
    createEmptyCellState,
    serializeCellState,
    unserializeCellState,
} from "./CellState";
import { indexes } from "../../utils/indexes";
import { Position } from "../layout/Position";
import { PuzzleTypeManager } from "./PuzzleTypeManager";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { SetInterface } from "../struct/Set";
import { CellMark, CellMarkSet, CellMarkType } from "./CellMark";
import { PuzzleLineSet } from "./PuzzleLineSet";
import { AnyPTM } from "./PuzzleTypeMap";
import { myClientId } from "../../hooks/useMultiPlayer";
import { PuzzleLine } from "./PuzzleLine";
import { PuzzleContext } from "./PuzzleContext";

export interface GridState<T extends AnyPTM> {
    cells: CellState<T>[][];
    lines: SetInterface<PuzzleLine>;
    marks: SetInterface<CellMark>;
    extension: T["gridStateEx"];
    clientId: string;
    actionId: string;
}

export const createEmptyGridState = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>): GridState<T> => {
    const {
        typeManager: { initialGridStateExtension },
    } = puzzle;

    const result: GridState<T> = {
        cells: indexes(puzzle.gridSize.rowsCount).map(() =>
            indexes(puzzle.gridSize.columnsCount).map(() => createEmptyCellState(puzzle)),
        ),
        lines: new PuzzleLineSet(puzzle),
        marks: new CellMarkSet(puzzle).bulkAdd(puzzle.initialCellMarks ?? []),
        extension:
            typeof initialGridStateExtension === "function"
                ? (initialGridStateExtension as (puzzle: PuzzleDefinition<T>) => T["gridStateEx"])(puzzle)
                : (initialGridStateExtension ?? ({} as T["gridStateEx"])),
        clientId: myClientId,
        actionId: "",
    };

    return puzzle.typeManager.modifyInitialGridState?.(result) ?? result;
};

export const serializeGridState = <T extends AnyPTM>(
    { cells, lines, marks, extension, clientId, actionId }: GridState<T>,
    puzzle: PuzzleDefinition<T>,
): any => ({
    cells: cells.map((row) => row.map((cell) => serializeCellState(cell, puzzle.typeManager))),
    lines: lines.serialize(),
    marks: marks.bulkRemove(puzzle.initialCellMarks ?? []).serialize(),
    extension: puzzle.typeManager.serializeGridStateExtension?.(extension) ?? extension,
    clientId,
    actionId,
});

export const unserializeGridState = <T extends AnyPTM>(
    { cells = [], lines = [], marks = [], extension = {}, clientId = myClientId, actionId = "" }: any,
    puzzle: PuzzleDefinition<T>,
): GridState<T> => ({
    cells: (cells as any[][]).map((row) => row.map((cell) => unserializeCellState(cell, puzzle))),
    lines: PuzzleLineSet.unserialize(puzzle, lines),
    marks: CellMarkSet.unserialize(
        puzzle,
        marks.map(({ type, isCircle, ...mark }: any) => ({
            ...mark,
            type: type ?? (isCircle ? CellMarkType.O : CellMarkType.X),
        })),
    ).bulkAdd(puzzle.initialCellMarks ?? []),
    extension: puzzle.typeManager.unserializeGridStateExtension?.(extension) ?? (extension as T["gridStateEx"]),
    clientId,
    actionId,
});

export const cloneGridState = <T extends AnyPTM>(
    typeManager: PuzzleTypeManager<T>,
    { cells, lines, marks, extension }: GridState<T>,
    clientId: string,
    actionId: string,
): GridState<T> => ({
    cells: cells.map((row) => row.map((cellState) => cloneCellState(typeManager, cellState))),
    lines: lines.clone(),
    marks: marks.clone(),
    extension: typeManager.cloneGridStateExtension?.(extension) ?? JSON.parse(JSON.stringify(extension)),
    clientId,
    actionId,
});

export const processGridStateCells = <T extends AnyPTM>(
    gridState: GridState<T>,
    affectedCells: Position[],
    processor: (cellState: CellState<T>, position: Position) => CellState<T>,
) => {
    for (const position of affectedCells) {
        const { left: columnIndex, top: rowIndex } = position;
        gridState.cells[rowIndex][columnIndex] = processor(gridState.cells[rowIndex][columnIndex], position);
    }

    return gridState;
};

export const areAllGridStateCells = <T extends AnyPTM>(
    gridState: GridState<T>,
    affectedCells: Position[],
    predicate: (cellState: CellState<T>, position: Position) => boolean,
) => affectedCells.every((position) => predicate(gridState.cells[position.top][position.left], position));

export const isAnyGridStateCell = <T extends AnyPTM>(
    gridState: GridState<T>,
    affectedCells: Position[],
    predicate: (cellState: CellState<T>, position: Position) => boolean,
) => affectedCells.some((position) => predicate(gridState.cells[position.top][position.left], position));

export const areGridStatesEqual = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { cells, lines, marks, extension }: GridState<T>,
    { cells: cells2, lines: lines2, marks: marks2, extension: extension2 }: GridState<T>,
) => {
    const {
        typeManager: { areGridStateExtensionsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    } = context.puzzle;

    return (
        cells.every((row, rowIndex) =>
            row.every((cell, columnIndex) => areCellStatesEqual(context, cell, cells2[rowIndex][columnIndex])),
        ) &&
        lines.equals(lines2) &&
        marks.equals(marks2) &&
        areGridStateExtensionsEqual(extension, extension2)
    );
};
