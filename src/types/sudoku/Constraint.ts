import {ComponentType, ReactNode} from "react";
import {isSamePosition, Position} from "../layout/Position";
import {gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigitsByCells, ProcessedGameState} from "./GameState";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "./GivenDigitsMap";
import {FieldLinesConstraint} from "../../components/sudoku/field/FieldLines";
import {RegionConstraint} from "../../components/sudoku/constraints/region/Region";
import {indexes} from "../../utils/indexes";
import {CellState} from "./CellState";
import {UserLinesConstraint} from "../../components/sudoku/constraints/user-lines/UserLines";

export type Constraint<CellType, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any> = {
    name: string;
    cells: Position[];
    component?: ComponentType<ConstraintProps<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType>>;
    color?: string;
    isValidCell?(
        cell: Position,
        digits: GivenDigitsMap<CellType>,
        regionCells: Position[],
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): boolean;
} & DataT;

export type ConstraintProps<CellType = any, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any> =
    Omit<Constraint<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType>, "component"> & {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    cellSize: number;
}

export type ConstraintOrComponent<CellType, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any> =
    Constraint<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType> | ReactNode;

// region Helper methods
export const isConstraint = (item: ConstraintOrComponent<any, any>) => !!(item as Constraint<any>).name;

export const asConstraint = <CellType, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any>(
    item: ConstraintOrComponent<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType>
) => item as Constraint<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType>;

export const getAllPuzzleConstraintsAndComponents = <CellType, GameStateExtensionType = any, ProcessedGameStateExtensionType = any>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
): ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[] => {
    const {
        fieldSize,
        items: itemsOrFn = [],
        typeManager: {
            getRegionsForRowsAndColumns = () => [
                ...indexes(fieldSize.rowsCount).map(top => RegionConstraint(
                    indexes(fieldSize.columnsCount).map(left => ({left, top})),
                    false,
                    "row"
                )),
                ...indexes(fieldSize.columnsCount).map(left => RegionConstraint(
                    indexes(fieldSize.rowsCount).map(top => ({left, top})),
                    false,
                    "column"
                )),
            ],
        },
        customCellBounds,
    } = puzzle;

    return [
        customCellBounds ? undefined : FieldLinesConstraint,
        ...getRegionsForRowsAndColumns(puzzle, state),
        ...fieldSize.regions.map(region => RegionConstraint(region)),
        UserLinesConstraint,
        ...(
            typeof itemsOrFn === "function"
                ? itemsOrFn(state)
                : itemsOrFn as ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        ),
    ].filter(v => v);
};

export const prepareGivenDigitsMapForConstraints = <CellType>(
    {initialDigits = {}}: PuzzleDefinition<CellType, any, any>,
    cells: CellState<CellType>[][]
) => mergeGivenDigitsMaps(gameStateGetCurrentGivenDigitsByCells(cells), initialDigits);

export const normalizeConstraintCell = (
    {left, top}: Position,
    {fieldSize: {rowsCount, columnsCount}}: PuzzleDefinition<any, any, any>
): Position => ({
    left: (left + columnsCount) % columnsCount,
    top: (top + rowsCount) % rowsCount,
});

export const normalizeConstraintCells = (positions: Position[], puzzle: PuzzleDefinition<any, any, any>) =>
    positions.map(position => normalizeConstraintCell(position, puzzle));

export const isValidUserDigit = <CellType, GameStateExtensionType = any, ProcessedGameStateExtensionType = any>(
    cell: Position,
    userDigits: GivenDigitsMap<CellType>,
    constraints: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[],
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
) => {
    const userDigit = userDigits[cell.top]?.[cell.left];
    if (userDigit === undefined) {
        return true;
    }

    for (const item of constraints) {
        if (!isConstraint(item)) {
            continue;
        }

        const constraint = asConstraint(item);

        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, puzzle);
        if (normalizedConstraintCells.length && !normalizedConstraintCells.some((constraintCell: Position) => isSamePosition(constraintCell, cell))) {
            continue;
        }

        if (constraint.isValidCell && !constraint.isValidCell(cell, userDigits, normalizedConstraintCells, puzzle, state)) {
            return false;
        }
    }

    return true;
};

export const isValidFinishedPuzzleByConstraints = <CellType, GameStateExtensionType = any, ProcessedGameStateExtensionType = any>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
) => {
    const {typeManager: {isValidCell = () => true}} = puzzle;
    const constraints = getAllPuzzleConstraintsAndComponents(puzzle, state).filter(isConstraint).map(asConstraint);
    const {cells} = gameStateGetCurrentFieldState(state);
    const userDigits = prepareGivenDigitsMapForConstraints(puzzle, cells);

    return cells.every((row, top) => row.every((cell, left) => {
        const position: Position = {left, top};
        const digit = userDigits[top]?.[left];

        return !isValidCell(position, puzzle)
            || (digit !== undefined && isValidUserDigit(position, userDigits, constraints, puzzle, state));
    }));
};
// endregion
