import {Constraint, normalizeConstraintCells} from "../../../../types/sudoku/Constraint";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {Position} from "../../../../types/layout/Position";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {PuzzleLineSet} from "../../../../types/sudoku/PuzzleLineSet";
import {KropkiDotTag} from "../kropki-dot/KropkiDot";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

const BaseNeighborsConstraint = <T extends AnyPTM>(
    name: string,
    areValidNeighborDigits: (
        digit1: number,
        digit2: number,
        position1: Position,
        position2: Position,
        context: PuzzleContext<T>
    ) => boolean,
    excludedTags: string[] = [],
): Constraint<T> => {
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

const BaseConsecutiveNeighborsConstraint = <T extends AnyPTM>(
    invert: boolean,
    allowLoop = false,
    excludedTags: string[] = invert ? [KropkiDotTag] : []
): Constraint<T> =>
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

export const ConsecutiveNeighborsConstraint = <T extends AnyPTM>(allowLoop = false) =>
    BaseConsecutiveNeighborsConstraint<T>(false, allowLoop);

export const NonConsecutiveNeighborsConstraint = <T extends AnyPTM>(allowLoop = false, excludedTags: string[] = [KropkiDotTag]) =>
    BaseConsecutiveNeighborsConstraint<T>(true, allowLoop, excludedTags);

export const NonRatioNeighborsConstraint = <T extends AnyPTM>(
    excludedRatios: [number, number][] = [[1, 2]],
    excludedTags: string[] = [KropkiDotTag]
) => BaseNeighborsConstraint<T>(
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

export const NonRepeatingNeighborsConstraint = <T extends AnyPTM>() =>
    BaseNeighborsConstraint<T>(
        "non-repeating neighbors",
        (digit1, digit2) => digit1 !== digit2,
    );
