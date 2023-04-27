import {ComponentType, ReactElement} from "react";
import {arrayContainsPosition, Line, Position} from "../layout/Position";
import {gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigitsByCells} from "./GameState";
import {normalizePuzzlePosition, PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "./GivenDigitsMap";
import {FieldLinesConstraint} from "../../components/sudoku/field/FieldLines";
import {RegionConstraint} from "../../components/sudoku/constraints/region/Region";
import {CellState} from "./CellState";
import {UserLinesConstraint} from "../../components/sudoku/constraints/user-lines/UserLines";
import {PuzzleContext} from "./PuzzleContext";
import {SetInterface} from "../struct/Set";
import {getDefaultRegionsForRowsAndColumns} from "./FieldSize";
import {LineWithColor} from "./LineWithColor";
import {getFogPropsByConstraintsList} from "../../components/sudoku/constraints/fog/Fog";
import {FieldLayer} from "./FieldLayer";
import {AnyPTM} from "./PuzzleTypeMap";
import {isSelectableCell} from "./CellTypeProps";
import {GridRegion} from "./GridRegion";
import {CellColorValue, resolveCellColorValue} from "./CellColor";

export type Constraint<T extends AnyPTM, DataT = undefined> = {
    name: string;
    tags?: string[];
    cells: Position[];
    renderSingleCellInUserArea?: boolean;
    layer?: FieldLayer;
    component?: Partial<Record<FieldLayer, ComponentType<ConstraintProps<T, DataT>>>>;
    color?: string;
    angle?: number;
    isObvious?: boolean;
    isCheckingFog?: boolean;
    noPencilmarkCheck?: boolean;
    isValidCell?(
        cell: Position,
        digits: GivenDigitsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>,
        constraints: Constraint<T, any>[],
        isFinalCheck?: boolean,
        onlyObvious?: boolean,
    ): boolean;
    isValidPuzzle?(
        lines: SetInterface<Line>,
        digits: GivenDigitsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>
    ): boolean;
    getInvalidUserLines?(
        lines: SetInterface<Line>,
        digits: GivenDigitsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>,
        isFinalCheck?: boolean
    ): Line[];
    clone?(constraint: Constraint<T, DataT>, options: CloneConstraintOptions): Constraint<T, DataT>;
    props: DataT;
};

export type ConstraintProps<T extends AnyPTM, DataT = undefined> =
    Omit<Constraint<T, DataT>, "component"> & {
    context: PuzzleContext<T>;
    region?: GridRegion;
    regionIndex?: number;
}

export type ConstraintPropsGenericFc<DataT = undefined> = <T extends AnyPTM>(
    props: ConstraintProps<T, DataT>
) => ReactElement;

// region Helper methods
export const getAllPuzzleConstraints = <T extends AnyPTM>(
    context: PuzzleContext<T>
): Constraint<T, any>[] => {
    const {puzzle, state} = context;

    const {
        regions = [],
        items: puzzleItemsOrFn = [],
        typeManager: {
            items: stateItemsOrFn = [],
            getRegionsForRowsAndColumns = getDefaultRegionsForRowsAndColumns,
        },
    } = puzzle;

    return [
        FieldLinesConstraint<T>(),
        ...getRegionsForRowsAndColumns(context),
        ...regions.map(
            (region): Constraint<T, any> => Array.isArray(region)
                ? RegionConstraint(region)
                : region
        ),
        UserLinesConstraint<T>(),
        ...(
            typeof puzzleItemsOrFn === "function"
                ? puzzleItemsOrFn(state)
                : puzzleItemsOrFn as Constraint<T, any>[]
        ),
        ...(
            typeof stateItemsOrFn === "function"
                ? stateItemsOrFn(context)
                : stateItemsOrFn as Constraint<T, any>[]
        ),
    ].filter(Boolean);
};

export const prepareGivenDigitsMapForConstraints = <T extends AnyPTM>(
    {puzzle: {initialDigits = {}}, state: {initialDigits: stateInitialDigits = {}}}: PuzzleContext<T>,
    cells: CellState<T>[][]
) => mergeGivenDigitsMaps(initialDigits, stateInitialDigits, gameStateGetCurrentGivenDigitsByCells(cells));

export const normalizeConstraintCells = <T extends AnyPTM>(positions: Position[], puzzle: PuzzleDefinition<T>) =>
    positions.map(position => normalizePuzzlePosition(position, puzzle));

export const isValidUserDigit = <T extends AnyPTM>(
    cell: Position,
    userDigits: GivenDigitsMap<T["cell"]>,
    constraints: Constraint<T, any>[],
    context: PuzzleContext<T>,
    isFinalCheck = false,
    isPencilmark = false,
    onlyObvious = false
) => {
    const userDigit = userDigits[cell.top]?.[cell.left];
    if (userDigit === undefined) {
        return true;
    }

    const isFogPuzzle = !!getFogPropsByConstraintsList(constraints);

    for (const {cells, isValidCell, isObvious, isCheckingFog, noPencilmarkCheck} of constraints) {
        if (onlyObvious && !isObvious) {
            continue;
        }

        if (isPencilmark && noPencilmarkCheck) {
            continue;
        }

        if (isFogPuzzle && !isCheckingFog) {
            continue;
        }

        const normalizedConstraintCells = normalizeConstraintCells(cells, context.puzzle);
        if (normalizedConstraintCells.length) {
            if (!isFinalCheck && normalizedConstraintCells.some(({top, left}) => !context.cellsIndexForState.getAllCells()[top]?.[left]?.isVisible)) {
                continue;
            }
            if (!arrayContainsPosition(normalizedConstraintCells, cell)) {
                continue;
            }
        }

        if (isValidCell && !isValidCell(cell, userDigits, normalizedConstraintCells, context, constraints, isFinalCheck, onlyObvious)) {
            return false;
        }
    }

    return true;
};

export const getInvalidUserLines = <T extends AnyPTM>(
    lines: SetInterface<LineWithColor>,
    userDigits: GivenDigitsMap<T["cell"]>,
    constraints: Constraint<T, any>[],
    context: PuzzleContext<T>,
    isFinalCheck = false
): SetInterface<LineWithColor> => {
    let result = lines.clear();

    for (const constraint of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, context.puzzle);

        if (constraint.getInvalidUserLines) {
            result = result.bulkAdd(
                constraint.getInvalidUserLines(lines, userDigits, normalizedConstraintCells, context, isFinalCheck)
            )
        }
    }

    return result;
};

export const isValidFinishedPuzzleByConstraints = <T extends AnyPTM>(context: PuzzleContext<T>) => {
    const {cellsIndex, puzzle, state} = context;
    const {digitsCount} = puzzle;
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

            return !isSelectableCell(cellsIndex.getCellTypeProps(position))
                || (digit !== undefined && isValidUserDigit(position, userDigits, constraints, context, true));
        }))
    ) && getInvalidUserLines(lines, userDigits, constraints, context, true).size === 0;
};

export interface CloneConstraintOptions {
    processCellCoords: (coords: Position) => Position;
    processColor: (color: CellColorValue) => CellColorValue;
}
export const cloneConstraint = <T extends AnyPTM, DataT>(
    constraint: Constraint<T, DataT>,
    {
        processCellCoords = (coords: Position) => coords,
        processColor = (color: CellColorValue) => color,
    }: Partial<CloneConstraintOptions> = {},
): Constraint<T, DataT> => {
    constraint = {
        ...constraint,
        cells: constraint.cells.map(processCellCoords),
        color: constraint.color && resolveCellColorValue(processColor(constraint.color)),
    };
    return constraint.clone?.(constraint, {processCellCoords, processColor}) ?? constraint;
};
// endregion
