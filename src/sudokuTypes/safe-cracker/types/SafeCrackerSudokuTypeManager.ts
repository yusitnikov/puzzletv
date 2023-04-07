import {SafeCrackerPuzzleParams} from "./SafeCrackerPuzzleParams";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {Position, PositionWithAngle} from "../../../types/layout/Position";
import {
    defaultProcessArrowDirection,
    defaultProcessArrowDirectionForRegularCellBounds,
    SudokuTypeManager
} from "../../../types/sudoku/SudokuTypeManager";
import {SafeCrackerStarConstraint} from "../constraints/SafeCrackerStarConstraint";
import {indexes} from "../../../utils/indexes";
import {safeCrackerArrowsCellWriteModeInfo} from "./LeftRightArrow";
import {BaseSafeCrackerPuzzle} from "./BaseSafeCrackerPuzzle";
import {getDefaultDigitsCount, PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {TextProps, textTag} from "../../../components/sudoku/constraints/text/Text";
import {CellMarkType, parseCellMark} from "../../../types/sudoku/CellMark";
import {CellColor} from "../../../types/sudoku/CellColor";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {Constraint} from "../../../types/sudoku/Constraint";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";

export const SafeCrackerSudokuTypeManager = <ExType = {}, ProcessedExType = {}>(
    params: SafeCrackerPuzzleParams
): SudokuTypeManager<number, ExType, ProcessedExType> => {
    const {size, circleRegionsCount, codeCellsCount} = params;

    const baseTypeManager = DigitSudokuTypeManager<ExType, ProcessedExType>();

    const arrowsCellWriteModeInfo = safeCrackerArrowsCellWriteModeInfo<ExType, ProcessedExType>();

    return {
        ...baseTypeManager,
        hiddenCellWriteModes: [
            ...baseTypeManager.hiddenCellWriteModes ?? [],
            arrowsCellWriteModeInfo,
        ],
        getCellTypeProps({top, left}, puzzle) {
            const {digitsCount = getDefaultDigitsCount(puzzle)} = puzzle;
            if (left >= digitsCount) {
                return {isVisible: false};
            }

            switch (top - circleRegionsCount * 2) {
                case 0: return {};
                case 1: return {isVisible: left < codeCellsCount};
                default: return top % 2 === 1 ? {} : {
                    isSelectable: false,
                    forceCellWriteMode: arrowsCellWriteModeInfo,
                };
            }
        },
        processArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard) {
            if (currentCell.top < circleRegionsCount * 2) {
                return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard, false);
            }

            if (yDirection) {
                return {
                    cell: currentCell.top === circleRegionsCount * 2
                        ? {
                            top: circleRegionsCount * 2 + 1,
                            left: Math.min(currentCell.left, codeCellsCount - 1),
                        }
                        : {
                            top: circleRegionsCount * 2,
                            left: currentCell.left,
                        }
                };
            }

            return defaultProcessArrowDirectionForRegularCellBounds(currentCell, xDirection, yDirection, context);
        },
        processCellDataPosition(puzzle, basePosition, dataSet, dataIndex, positionFunction, cellPosition): PositionWithAngle | undefined {
            if (cellPosition && cellPosition.top < circleRegionsCount * 2 && cellPosition.top % 2 === 0) {
                return {
                    ...basePosition,
                    angle: 360 * (cellPosition.top / 2 + cellPosition.left / size) / circleRegionsCount,
                };
            }

            return basePosition;
        },
        items: indexes(codeCellsCount).map(left => SafeCrackerStarConstraint([{top: circleRegionsCount * 2 + 1, left}])),
        postProcessPuzzle(puzzle: PuzzleDefinition<number, ExType, ProcessedExType>): typeof puzzle {
            puzzle = {
                ...puzzle,
                ...BaseSafeCrackerPuzzle(params),
            };

            const items: Constraint<number, any, ExType, ProcessedExType>[] = [];
            const initialLetters = puzzle.initialLetters ?? {};
            const initialCellMarks = [...(puzzle.initialCellMarks ?? [])];
            const cellsIndex = new SudokuCellsIndex(puzzle);

            const processText = (text: string, cells: Position[], layer?: FieldLayer) => {
                const [{top, left}] = cells;
                const center = cellsIndex.allCells[top]?.[left]?.center;
                const mark = parseCellMark(text);
                if (mark !== undefined && mark !== CellMarkType.O && center) {
                    initialCellMarks.push({
                        type: mark,
                        position: center,
                        isCenter: true,
                        color: CellColor.black,
                    });
                    return true;
                }

                if (["s", "star"].includes(text.toLowerCase())) {
                    items.push(SafeCrackerStarConstraint(cells, layer));
                    return true;
                }

                return false;
            };

            for (const [topStr, row] of Object.entries(initialLetters)) {
                const top = Number(topStr);
                for (const [leftStr, text] of Object.entries(row)) {
                    const left = Number(leftStr);
                    if (processText(text, [{top, left}])) {
                        delete initialLetters[top][left];
                    }
                }
            }

            const originalItems = puzzle.items;
            if (Array.isArray(originalItems)) {
                for (const item of originalItems) {
                    if (!(item.tags?.includes(textTag) && item.cells.length === 1)) {
                        items.push(item);
                        continue;
                    }

                    if (!processText((item.props as TextProps).text, item.cells, item.layer)) {
                        items.push(item);
                    }
                }
            }

            puzzle = {
                ...puzzle,
                items,
                initialLetters,
                initialCellMarks,
            };

            return puzzle;
        }
    };
};
