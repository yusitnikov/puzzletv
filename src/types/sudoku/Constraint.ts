import {ComponentType, ReactElement} from "react";
import {isSamePosition, Line, Position} from "../layout/Position";
import {gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigitsByCells} from "./GameState";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "./GivenDigitsMap";
import {FieldLinesConstraint} from "../../components/sudoku/field/FieldLines";
import {RegionConstraint} from "../../components/sudoku/constraints/region/Region";
import {CellState} from "./CellState";
import {UserLinesConstraint} from "../../components/sudoku/constraints/user-lines/UserLines";
import {PuzzleContext} from "./PuzzleContext";
import {SetInterface} from "../struct/Set";
import {getDefaultRegionsForRowsAndColumns} from "./FieldSize";
import {LineWithColor} from "./LineWithColor";

export type Constraint<CellType, DataT = undefined, ExType = {}, ProcessedExType = {}> = {
    name: string;
    tags?: string[];
    cells: Position[];
    component?: ComponentType<ConstraintProps<CellType, DataT, ExType, ProcessedExType>>;
    color?: string;
    angle?: number;
    isValidCell?(
        cell: Position,
        digits: GivenDigitsMap<CellType>,
        regionCells: Position[],
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        constraints: Constraint<CellType, any, ExType, ProcessedExType>[],
        isFinalCheck?: boolean,
    ): boolean;
    isValidPuzzle?(
        lines: SetInterface<Line>,
        digits: GivenDigitsMap<CellType>,
        regionCells: Position[],
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ): boolean;
    getInvalidUserLines?(
        lines: SetInterface<Line>,
        digits: GivenDigitsMap<CellType>,
        regionCells: Position[],
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        isFinalCheck?: boolean
    ): Line[];
    props: DataT;
};

export type ConstraintProps<CellType = unknown, DataT = undefined, ExType = {}, ProcessedExType = {}> =
    Omit<Constraint<CellType, DataT, ExType, ProcessedExType>, "component"> & {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export type ConstraintPropsGenericFc<DataT = undefined> = <CellType, ExType, ProcessedExType>(
    props: ConstraintProps<CellType, DataT, ExType, ProcessedExType>
) => ReactElement;

// region Helper methods
export const getAllPuzzleConstraints = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
): Constraint<CellType, any, ExType, ProcessedExType>[] => {
    const {puzzle, state} = context;

    const {
        fieldSize,
        items: puzzleItemsOrFn = [],
        typeManager: {
            items: stateItemsOrFn = [],
            getRegionsForRowsAndColumns = getDefaultRegionsForRowsAndColumns,
        },
    } = puzzle;

    return [
        FieldLinesConstraint,
        ...getRegionsForRowsAndColumns(puzzle, state),
        ...fieldSize.regions.map(
            (region): Constraint<CellType, any, ExType, ProcessedExType> => Array.isArray(region)
                ? RegionConstraint(region)
                : region
        ),
        UserLinesConstraint,
        ...(
            typeof puzzleItemsOrFn === "function"
                ? puzzleItemsOrFn(state)
                : puzzleItemsOrFn as Constraint<CellType, any, ExType, ProcessedExType>[]
        ),
        ...(
            typeof stateItemsOrFn === "function"
                ? stateItemsOrFn(context)
                : stateItemsOrFn as Constraint<CellType, any, ExType, ProcessedExType>[]
        ),
    ].filter(v => v);
};

export const prepareGivenDigitsMapForConstraints = <CellType>(
    {puzzle: {initialDigits = {}}, state: {initialDigits: stateInitialDigits = {}}}: PuzzleContext<CellType, any, any>,
    cells: CellState<CellType>[][]
) => mergeGivenDigitsMaps(gameStateGetCurrentGivenDigitsByCells(cells), initialDigits, stateInitialDigits);

export const normalizeConstraintCell = (
    {left, top}: Position,
    {fieldSize: {rowsCount, columnsCount}}: PuzzleDefinition<any, any, any>
): Position => ({
    left: (left + columnsCount) % columnsCount,
    top: (top + rowsCount) % rowsCount,
});

export const normalizeConstraintCells = (positions: Position[], puzzle: PuzzleDefinition<any, any, any>) =>
    positions.map(position => normalizeConstraintCell(position, puzzle));

export const isValidUserDigit = <CellType, ExType, ProcessedExType>(
    cell: Position,
    userDigits: GivenDigitsMap<CellType>,
    constraints: Constraint<CellType, any, ExType, ProcessedExType>[],
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    isFinalCheck = false
) => {
    const userDigit = userDigits[cell.top]?.[cell.left];
    if (userDigit === undefined) {
        return true;
    }

    for (const {cells, isValidCell} of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(cells, context.puzzle);
        if (normalizedConstraintCells.length && !normalizedConstraintCells.some((constraintCell: Position) => isSamePosition(constraintCell, cell))) {
            continue;
        }

        if (isValidCell && !isValidCell(cell, userDigits, normalizedConstraintCells, context, constraints, isFinalCheck)) {
            return false;
        }
    }

    return true;
};

export const getInvalidUserLines = <CellType, ExType, ProcessedExType>(
    lines: SetInterface<LineWithColor>,
    userDigits: GivenDigitsMap<CellType>,
    constraints: Constraint<CellType, any, ExType, ProcessedExType>[],
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    isFinalCheck = false
): SetInterface<LineWithColor> => {
    let result = lines.clear();

    for (const constraint of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, context.puzzle);

        if (constraint.getInvalidUserLines) {
            result = result.toggleAll(
                constraint.getInvalidUserLines(lines, userDigits, normalizedConstraintCells, context, isFinalCheck),
                true
            )
        }
    }

    return result;
};

export const isValidFinishedPuzzleByConstraints = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
) => {
    const {puzzle, state} = context;
    const {typeManager: {isValidCell = () => true}, digitsCount} = puzzle;
    const constraints = getAllPuzzleConstraints(context);
    const {cells, lines} = gameStateGetCurrentFieldState(state);
    const userDigits = prepareGivenDigitsMapForConstraints(context, cells);

    for (const constraint of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, context.puzzle);

        if (constraint.isValidPuzzle && !constraint.isValidPuzzle(lines, userDigits, normalizedConstraintCells, context)) {
            return false;
        }
    }

    return (
        digitsCount === 0 ||
        cells.every((row, top) => row.every((cell, left) => {
            const position: Position = {left, top};
            const digit = userDigits[top]?.[left];

            return !isValidCell(position, puzzle)
                || (digit !== undefined && isValidUserDigit(position, userDigits, constraints, context, true));
        }))
    ) && getInvalidUserLines(lines, userDigits, constraints, context, true).size === 0;
};
// endregion
