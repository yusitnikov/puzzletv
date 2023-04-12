import {Constraint, normalizeConstraintCells} from "../../../../types/sudoku/Constraint";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {Position} from "../../../../types/layout/Position";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {PuzzleLineSet} from "../../../../types/sudoku/PuzzleLineSet";
import {KropkiDotTag} from "../kropki-dot/KropkiDot";

const BaseNeighborsConstraint = <CellType, ExType, ProcessedExType>(
    name: string,
    areValidNeighborDigits: (
        digit1: number,
        digit2: number,
        position1: Position,
        position2: Position,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ) => boolean,
    excludedTags: string[] = [],
): Constraint<CellType, undefined, ExType, ProcessedExType> => {
    return ({
        name,
        cells: [],
        props: undefined,
        isObvious: true,
        isValidCell(
            cell,
            digits,
            cells,
            context,
            constraints
        ) {
            const {top, left} = cell;
            const {puzzle, cellsIndex} = context;
            const {typeManager: {getDigitByCellData}} = puzzle;

            const digit = getDigitByCellData(digits[top][left]!, context, cell);

            let excludedCellsMap = new PuzzleLineSet(puzzle);
            if (excludedTags.length) {
                for (const {tags, cells} of constraints) {
                    if (!tags?.some((tag: string) => excludedTags.includes(tag))) {
                        continue;
                    }

                    const [cell1, cell2] = normalizeConstraintCells(cells, puzzle);
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
                    getDigitByCellData(digit2, context, cell2),
                    cell,
                    cell2,
                    context
                );
            });
        },
    });
};

const BaseConsecutiveNeighborsConstraint = <CellType, ExType, ProcessedExType>(
    invert: boolean,
    allowLoop = false,
    excludedTags: string[] = invert ? [KropkiDotTag] : []
): Constraint<CellType, undefined, ExType, ProcessedExType> =>
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

export const ConsecutiveNeighborsConstraint = <CellType, ExType, ProcessedExType>(allowLoop = false) =>
    BaseConsecutiveNeighborsConstraint<CellType, ExType, ProcessedExType>(false, allowLoop);

export const NonConsecutiveNeighborsConstraint = <CellType, ExType, ProcessedExType>(allowLoop = false, excludedTags: string[] = [KropkiDotTag]) =>
    BaseConsecutiveNeighborsConstraint<CellType, ExType, ProcessedExType>(true, allowLoop, excludedTags);

export const NonRatioNeighborsConstraint = <CellType, ExType, ProcessedExType>(
    excludedRatios: [number, number][] = [[1, 2]],
    excludedTags: string[] = [KropkiDotTag]
): Constraint<CellType, undefined, ExType, ProcessedExType> =>
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

export const NonRepeatingNeighborsConstraint = <CellType, ExType, ProcessedExType>()
    : Constraint<CellType, undefined, ExType, ProcessedExType> =>
    BaseNeighborsConstraint(
        "non-repeating neighbors",
        (digit1, digit2) => digit1 !== digit2,
    );
