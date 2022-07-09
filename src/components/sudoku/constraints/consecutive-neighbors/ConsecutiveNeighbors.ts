import {asConstraint, Constraint, isConstraint, normalizeConstraintCells} from "../../../../types/sudoku/Constraint";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {Position} from "../../../../types/layout/Position";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {PuzzleLineSet} from "../../../../types/sudoku/PuzzleLineSet";
import {KropkiDotTag} from "../kropki-dot/KropkiDot";

const BaseNeighborsConstraint = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>(
    name: string,
    areValidNeighborDigits: (
        digit1: number,
        digit2: number,
        position1: Position,
        position2: Position,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ) => boolean,
    excludedTags: string[] = [],
): Constraint<CellType> => {
    return ({
        name,
        cells: [],
        isValidCell(
            cell,
            digits,
            cells,
            context,
            constraints
        ) {
            const {top, left} = cell;
            const {puzzle, cellsIndex, state} = context;
            const {typeManager: {getDigitByCellData}} = puzzle;

            const digit = getDigitByCellData(digits[top][left]!, state);

            let excludedCellsMap = new PuzzleLineSet(puzzle);
            if (excludedTags.length) {
                for (const item of constraints) {
                    if (!isConstraint(item)) {
                        continue;
                    }

                    const constraint = asConstraint(item);
                    if (!constraint.tags?.some((tag: string) => excludedTags.includes(tag))) {
                        continue;
                    }

                    const [cell1, cell2] = normalizeConstraintCells(constraint.cells, puzzle);
                    excludedCellsMap = excludedCellsMap.add({start: cell1, end: cell2});
                }
            }

            return cellsIndex.allCells[top][left].neighbors.items.every((cell2) => {
                if (excludedCellsMap.contains({start: cell, end: cell2})) {
                    return true;
                }

                const digit2 = digits[cell2.top]?.[cell2.left];

                return digit2 === undefined || areValidNeighborDigits(
                    digit,
                    getDigitByCellData(digit2, state),
                    cell,
                    cell2,
                    context
                );
            });
        },
    });
};

const BaseConsecutiveNeighborsConstraint = <CellType>(
    invert: boolean,
    allowLoop = false,
    excludedTags: string[] = invert ? [KropkiDotTag] : []
): Constraint<CellType> =>
    BaseNeighborsConstraint(
        invert ? "non-consecutive neighbors" : "consecutive neighbors",
        (digit1, digit2, position1, position2, {puzzle}) => {
            const {
                digitsCount = getDefaultDigitsCount(puzzle),
            } = puzzle;

            const diff = Math.abs(digit2 - digit1);
            const isConsecutive = diff === 1 || (allowLoop && diff === digitsCount - 1);
            return invert ? !isConsecutive : isConsecutive;
        },
        excludedTags
    );

export const ConsecutiveNeighborsConstraint = <CellType>(allowLoop = false) =>
    BaseConsecutiveNeighborsConstraint<CellType>(false, allowLoop);

export const NonConsecutiveNeighborsConstraint = <CellType>(allowLoop = false, excludedTags: string[] = [KropkiDotTag]) =>
    BaseConsecutiveNeighborsConstraint<CellType>(true, allowLoop, excludedTags);

export const NonRatioNeighborsConstraint = <CellType>(
    excludedRatios: [number, number][] = [[1, 2]],
    excludedTags: string[] = [KropkiDotTag]
): Constraint<CellType> =>
    BaseNeighborsConstraint(
        "negative ratio neighbors",
        (digit1, digit2) => {
            for (const [ratio1, ratio2] of excludedRatios) {
                if (digit1 * ratio1 === digit2 * ratio2 || digit2 * ratio1 === digit1 * ratio2) {
                    return false;
                }
            }

            return true;
        },
        excludedTags
    );
