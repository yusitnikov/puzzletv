import { ComponentType, ReactElement } from "react";
import { arrayContainsPosition, Line, Position } from "../layout/Position";
import { normalizePuzzlePosition, PuzzleDefinition } from "./PuzzleDefinition";
import { CellsMap } from "./CellsMap";
import { PuzzleContext } from "./PuzzleContext";
import { SetInterface } from "../struct/Set";
import { LineWithColor } from "./LineWithColor";
import { GridLayer } from "./GridLayer";
import { AnyPTM } from "./PuzzleTypeMap";
import { isSelectableCell, isSolutionCheckCell } from "./CellTypeProps";
import { GridRegion } from "./GridRegion";
import { CellColorValue, resolveCellColorValue } from "./CellColor";
import { profiler } from "../../utils/profiler";
import { indexes } from "../../utils/indexes";
import {
    errorResultCheck,
    notFinishedResultCheck,
    PuzzleResultCheck,
    PuzzleResultChecker,
    successResultCheck,
} from "./PuzzleResultCheck";
import { settings } from "../layout/Settings";

export type Constraint<T extends AnyPTM, DataT = undefined> = {
    name: string;
    tags?: string[];
    cells: Position[];
    renderSingleCellInUserArea?: boolean;
    layer?: GridLayer;
    /**
     * Render the constraint only in the region with the specified index.
     */
    regionIndex?: number;
    component?: Partial<Record<GridLayer, ComponentType<ConstraintProps<T, DataT>>>>;
    color?: string;
    angle?: number;
    isObvious?: boolean;
    isCheckingFog?: boolean;
    noPencilmarkCheck?: boolean;
    isValidCell?(
        cell: Position,
        digits: CellsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>,
        constraints: Constraint<T, any>[],
        constraint: Constraint<T, DataT>,
        isFinalCheck?: boolean,
        onlyObvious?: boolean,
    ): boolean;
    isValidPuzzle?(
        lines: SetInterface<Line>,
        digits: CellsMap<T["cell"]>,
        regionCells: Position[],
        context: PuzzleContext<T>,
    ): PuzzleResultCheck;
    getInvalidUserLines?(
        lines: SetInterface<Line>,
        digits: CellsMap<T["cell"]>,
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
    Record<GridLayer, ConstraintPropsGenericFc<DataT, BaseT>>
>;

// region Helper methods
export const normalizeConstraintCells = <T extends AnyPTM>(positions: Position[], puzzle: PuzzleDefinition<T>) =>
    positions.map((position) => normalizePuzzlePosition(position, puzzle));

export const isValidUserDigit = <T extends AnyPTM>(
    cell: Position,
    userDigits: CellsMap<T["cell"]>,
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
            if (!arrayContainsPosition(normalizedConstraintCells, cell)) {
                continue;
            }
            if (
                !isFinalCheck &&
                normalizedConstraintCells.some(({ top, left }) => !context.isVisibleCellForState(top, left))
            ) {
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

export const isValidFinishedPuzzleByConstraints = <T extends AnyPTM>(context: PuzzleContext<T>): PuzzleResultCheck => {
    const timer = profiler.track("isValidFinishedPuzzleByConstraints");

    const { puzzleIndex, puzzle, lines, userDigits } = context;
    const {
        maxDigit,
        gridSize: { rowsCount, columnsCount },
        importOptions: { stickyRegion, noStickyRegionValidation } = {},
        allowEmptyCells,
    } = puzzle;
    const constraints = context.allItems;

    let result = successResultCheck(puzzle);

    for (const constraint of constraints) {
        const normalizedConstraintCells = normalizeConstraintCells(constraint.cells, context.puzzle);

        if (constraint.isValidPuzzle) {
            const constraintResult = constraint.isValidPuzzle(lines, userDigits, normalizedConstraintCells, context);
            if (!constraintResult.isCorrectResult) {
                if (!constraintResult.isPending) {
                    if (settings.debugSolutionChecker.get()) {
                        console.warn("Failed constraint", constraint);
                    }
                    timer.stop();
                    return constraintResult;
                }
                result = constraintResult;
            }
        }
    }

    if (maxDigit !== 0) {
        for (const top of indexes(rowsCount)) {
            for (const left of indexes(columnsCount)) {
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
                        continue;
                    }
                }

                const cellTypeProps = puzzleIndex.getCellTypeProps(position);
                if (!isSelectableCell(cellTypeProps)) {
                    continue;
                }

                if (digit === undefined) {
                    if (!allowEmptyCells && isSolutionCheckCell(context, cellTypeProps)) {
                        result = notFinishedResultCheck();
                    }
                    continue;
                }

                if (!isValidUserDigit(position, context.userDigits, context, true)) {
                    timer.stop();
                    return errorResultCheck();
                }
            }
        }
    }

    if (getInvalidUserLines(context, true).size !== 0) {
        const hasVisibleInvalidLines = getInvalidUserLines(context).size !== 0;
        timer.stop();
        return hasVisibleInvalidLines ? errorResultCheck() : notFinishedResultCheck();
    }

    timer.stop();
    return result;
};

export const withIsValidFinishedPuzzleByConstraints = <T extends AnyPTM>(
    resultChecker: PuzzleResultChecker<T> | undefined,
): PuzzleResultChecker<T> | undefined =>
    resultChecker && resultChecker !== isValidFinishedPuzzleByConstraints
        ? (context) => {
              const result = resultChecker(context);

              if (result.isCorrectResult) {
                  const result2 = isValidFinishedPuzzleByConstraints(context);
                  if (!result2.isCorrectResult) {
                      return result2;
                  }
              }

              return result;
          }
        : undefined;

export interface CloneConstraintOptions {
    processCellsCoords: (coords: Position[]) => Position[];
    processCellCoords: (coords: Position) => Position;
    processColor: (color: CellColorValue) => CellColorValue;
}
export const cloneConstraint = <T extends AnyPTM, DataT>(
    constraint: Constraint<T, DataT>,
    {
        processCellCoords = (coords) => coords,
        processCellsCoords = (coords) => coords.map(processCellCoords),
        processColor = (color) => color,
    }: Partial<CloneConstraintOptions> = {},
): Constraint<T, DataT> => {
    constraint = {
        ...constraint,
        cells: processCellsCoords(constraint.cells),
        color: constraint.color && resolveCellColorValue(processColor(constraint.color)),
    };
    return constraint.clone?.(constraint, { processCellsCoords, processCellCoords, processColor }) ?? constraint;
};

export const toDecorativeConstraint = <T extends AnyPTM, DataT>({
    clone,
    ...constraint
}: Constraint<T, DataT>): Constraint<T, DataT> => ({
    ...constraint,
    isValidCell: undefined,
    isValidPuzzle: undefined,
    getInvalidUserLines: undefined,
    clone: clone && ((...args) => toDecorativeConstraint(clone(...args))),
});

export const toInvisibleConstraint = <T extends AnyPTM, DataT>(
    constraint: Constraint<T, DataT>,
): Constraint<T, DataT> => ({
    ...constraint,
    component: undefined,
});
// endregion
