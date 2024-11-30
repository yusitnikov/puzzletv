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
import { SudokuTypeManager } from "./SudokuTypeManager";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { SetInterface } from "../struct/Set";
import { CellMark, CellMarkSet, CellMarkType } from "./CellMark";
import { PuzzleLineSet } from "./PuzzleLineSet";
import { AnyPTM } from "./PuzzleTypeMap";
import { myClientId } from "../../hooks/useMultiPlayer";
import { PuzzleLine } from "./PuzzleLine";
import { PuzzleContext } from "./PuzzleContext";

export interface FieldState<T extends AnyPTM> {
    cells: CellState<T>[][];
    lines: SetInterface<PuzzleLine>;
    marks: SetInterface<CellMark>;
    extension: T["fieldStateEx"];
    clientId: string;
    actionId: string;
}

export const createEmptyFieldState = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>): FieldState<T> => {
    const {
        typeManager: { initialFieldStateExtension },
    } = puzzle;

    const result: FieldState<T> = {
        cells: indexes(puzzle.fieldSize.rowsCount).map(() =>
            indexes(puzzle.fieldSize.columnsCount).map(() => createEmptyCellState(puzzle)),
        ),
        lines: new PuzzleLineSet(puzzle),
        marks: new CellMarkSet(puzzle).bulkAdd(puzzle.initialCellMarks ?? []),
        extension:
            typeof initialFieldStateExtension === "function"
                ? (initialFieldStateExtension as (puzzle: PuzzleDefinition<T>) => T["fieldStateEx"])(puzzle)
                : (initialFieldStateExtension ?? ({} as T["fieldStateEx"])),
        clientId: myClientId,
        actionId: "",
    };

    return puzzle.typeManager.modifyInitialFieldState?.(result) ?? result;
};

export const serializeFieldState = <T extends AnyPTM>(
    { cells, lines, marks, extension, clientId, actionId }: FieldState<T>,
    puzzle: PuzzleDefinition<T>,
): any => ({
    cells: cells.map((row) => row.map((cell) => serializeCellState(cell, puzzle.typeManager))),
    lines: lines.serialize(),
    marks: marks.bulkRemove(puzzle.initialCellMarks ?? []).serialize(),
    extension: puzzle.typeManager.serializeFieldStateExtension?.(extension) ?? extension,
    clientId,
    actionId,
});

export const unserializeFieldState = <T extends AnyPTM>(
    { cells = [], lines = [], marks = [], extension = {}, clientId = myClientId, actionId = "" }: any,
    puzzle: PuzzleDefinition<T>,
): FieldState<T> => ({
    cells: (cells as any[][]).map((row) => row.map((cell) => unserializeCellState(cell, puzzle))),
    lines: PuzzleLineSet.unserialize(puzzle, lines),
    marks: CellMarkSet.unserialize(
        puzzle,
        marks.map(({ type, isCircle, ...mark }: any) => ({
            ...mark,
            type: type ?? (isCircle ? CellMarkType.O : CellMarkType.X),
        })),
    ).bulkAdd(puzzle.initialCellMarks ?? []),
    extension: puzzle.typeManager.unserializeFieldStateExtension?.(extension) ?? (extension as T["fieldStateEx"]),
    clientId,
    actionId,
});

export const cloneFieldState = <T extends AnyPTM>(
    typeManager: SudokuTypeManager<T>,
    { cells, lines, marks, extension }: FieldState<T>,
    clientId: string,
    actionId: string,
): FieldState<T> => ({
    cells: cells.map((row) => row.map((cellState) => cloneCellState(typeManager, cellState))),
    lines: lines.clone(),
    marks: marks.clone(),
    extension: typeManager.cloneFieldStateExtension?.(extension) ?? JSON.parse(JSON.stringify(extension)),
    clientId,
    actionId,
});

export const processFieldStateCells = <T extends AnyPTM>(
    fieldState: FieldState<T>,
    affectedCells: Position[],
    processor: (cellState: CellState<T>, position: Position) => CellState<T>,
) => {
    for (const position of affectedCells) {
        const { left: columnIndex, top: rowIndex } = position;
        fieldState.cells[rowIndex][columnIndex] = processor(fieldState.cells[rowIndex][columnIndex], position);
    }

    return fieldState;
};

export const areAllFieldStateCells = <T extends AnyPTM>(
    fieldState: FieldState<T>,
    affectedCells: Position[],
    predicate: (cellState: CellState<T>, position: Position) => boolean,
) => affectedCells.every((position) => predicate(fieldState.cells[position.top][position.left], position));

export const isAnyFieldStateCell = <T extends AnyPTM>(
    fieldState: FieldState<T>,
    affectedCells: Position[],
    predicate: (cellState: CellState<T>, position: Position) => boolean,
) => affectedCells.some((position) => predicate(fieldState.cells[position.top][position.left], position));

export const areFieldStatesEqual = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { cells, lines, marks, extension }: FieldState<T>,
    { cells: cells2, lines: lines2, marks: marks2, extension: extension2 }: FieldState<T>,
) => {
    const {
        typeManager: { areFieldStateExtensionsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    } = context.puzzle;

    return (
        cells.every((row, rowIndex) =>
            row.every((cell, columnIndex) => areCellStatesEqual(context, cell, cells2[rowIndex][columnIndex])),
        ) &&
        lines.equals(lines2) &&
        marks.equals(marks2) &&
        areFieldStateExtensionsEqual(extension, extension2)
    );
};
