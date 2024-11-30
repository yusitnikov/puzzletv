import { ComponentType, ReactElement } from "react";
import { arrayContainsPosition, Line, Position } from "../layout/Position";
import { normalizePuzzlePosition, PuzzleDefinition } from "./PuzzleDefinition";
import { GivenDigitsMap } from "./GivenDigitsMap";
import { PuzzleContext } from "./PuzzleContext";
import { SetInterface } from "../struct/Set";
import { LineWithColor } from "./LineWithColor";
import { FieldLayer } from "./FieldLayer";
import { AnyPTM } from "./PuzzleTypeMap";
import { isSelectableCell } from "./CellTypeProps";
import { GridRegion } from "./GridRegion";
import { CellColorValue, resolveCellColorValue } from "./CellColor";
import { profiler } from "../../utils/profiler";
import { indexes } from "../../utils/indexes";

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
        constraint: Constraint<T, DataT>,
        isFinalCheck?: boolean,
        onlyObvious?: boolean,
    ): boolean;
    isValidPuzzle?(
        lines: SetInterface<Line>,
        digits: GivenDigitsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>,
    ): boolean;
    getInvalidUserLines?(
        lines: SetInterface<Line>,
        digits: GivenDigitsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>,
        isFinalCheck?: boolean,
    ): Line[];
    clone?(constraint: Constraint<T, DataT>, options: CloneConstraintOptions): Constraint<T, DataT>;
    props: DataT;
};

export type ConstraintProps<T extends AnyPTM, DataT = undefined> = Omit<Constraint<T, DataT>, "component"> & {
    context: PuzzleContext<T>;
    region?: GridRegion;
    regionIndex?: number;
};

export type ConstraintPropsGenericFc<DataT = undefined, BaseT extends AnyPTM = AnyPTM> = <T extends BaseT>(
    props: ConstraintProps<T, DataT>,
) => ReactElement | null;

export type ConstraintPropsGenericFcMap<DataT = undefined, BaseT extends AnyPTM = AnyPTM> = Partial<
    Record<FieldLayer, ConstraintPropsGenericFc<DataT, BaseT>>
>;

// region Helper methods
export const normalizeConstraintCells = <T extends AnyPTM>(positions: Position[], puzzle: PuzzleDefinition<T>) =>
    positions.map((position) => normalizePuzzlePosition(position, puzzle));

export const isValidUserDigit = <T extends AnyPTM>(
    cell: Position,
    userDigits: GivenDigitsMap<T["cell"]>,
    context: PuzzleContext<T>,
    isFinalCheck = false,
    isPencilmark = false,
    onlyObvious = false,
) => {
    const userDigit = userDigits[cell.top]?.[cell.left];
    if (userDigit === undefined) {
        return true;
    }

    const constraints = context.allItems;
    const isFogPuzzle = !!context.fogProps;

    for (const constraint of constraints) {
        const { cells, isValidCell, isObvious, isCheckingFog, noPencilmarkCheck } = constraint;

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
            if (
                !isFinalCheck &&
                normalizedConstraintCells.some(({ top, left }) => !context.isVisibleCellForState(top, left))
            ) {
                continue;
            }
            if (!arrayContainsPosition(normalizedConstraintCells, cell)) {
                continue;
            }
        }

        if (
            isValidCell &&
            !isValidCell(
                cell,
                userDigits,
                normalizedConstraintCells,
                context,
                constraints,
                constraint,
                isFinalCheck,
                onlyObvious,
            )
        ) {
            return false;
        }
    }

    return true;
};

export const getInvalidUserLines = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    isFinalCheck = false,
): SetInterface<LineWithColor> => {
    const { lines, userDigits, allItems: constraints } = context;

    let result = lines.clear();

    for (const constraint of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, context.puzzle);

        if (constraint.getInvalidUserLines) {
            result = result.bulkAdd(
                constraint.getInvalidUserLines(lines, userDigits, normalizedConstraintCells, context, isFinalCheck),
            );
        }
    }

    return result;
};

export const isValidFinishedPuzzleByConstraints = <T extends AnyPTM>(context: PuzzleContext<T>) => {
    const timer = profiler.track("isValidFinishedPuzzleByConstraints");

    const { puzzleIndex, puzzle, lines, userDigits } = context;
    const {
        digitsCount,
        fieldSize: { rowsCount, columnsCount },
        importOptions: { stickyRegion, noStickyRegionValidation } = {},
    } = puzzle;
    const constraints = context.allItems;

    for (const constraint of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, context.puzzle);

        if (
            constraint.isValidPuzzle &&
            !constraint.isValidPuzzle(lines, userDigits, normalizedConstraintCells, context)
        ) {
            timer.stop();
            return false;
        }
    }

    const result =
        (digitsCount === 0 ||
            indexes(rowsCount).every((top) =>
                indexes(columnsCount).every((left) => {
                    const position: Position = { left, top };
                    const digit = userDigits[top]?.[left];

                    if (stickyRegion && noStickyRegionValidation) {
                        const stickyTop = top - stickyRegion.top;
                        const stickyLeft = left - stickyRegion.left;
                        if (
                            stickyTop >= 0 &&
                            stickyLeft >= 0 &&
                            stickyTop < stickyRegion.height &&
                            stickyLeft < stickyRegion.width
                        ) {
                            return true;
                        }
                    }

                    return (
                        !isSelectableCell(puzzleIndex.getCellTypeProps(position)) ||
                        (digit !== undefined && isValidUserDigit(position, context.userDigits, context, true))
                    );
                }),
            )) &&
        getInvalidUserLines(context, true).size === 0;
    timer.stop();
    return result;
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
    return constraint.clone?.(constraint, { processCellCoords, processColor }) ?? constraint;
};

export const toDecorativeConstraint = <T extends AnyPTM, DataT>(
    constraint: Constraint<T, DataT>,
): Constraint<T, DataT> => ({
    ...constraint,
    isValidCell: undefined,
    isValidPuzzle: undefined,
    getInvalidUserLines: undefined,
});

export const toInvisibleConstraint = <T extends AnyPTM, DataT>(
    constraint: Constraint<T, DataT>,
): Constraint<T, DataT> => ({
    ...constraint,
    component: undefined,
});
// endregion
