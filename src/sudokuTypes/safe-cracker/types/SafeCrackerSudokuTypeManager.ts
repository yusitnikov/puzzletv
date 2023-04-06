import {SafeCrackerPuzzleParams} from "./SafeCrackerPuzzleParams";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {parsePositionLiteral, PositionWithAngle} from "../../../types/layout/Position";
import {
    defaultProcessArrowDirection,
    defaultProcessArrowDirectionForRegularCellBounds,
    SudokuTypeManager
} from "../../../types/sudoku/SudokuTypeManager";
import {SafeCrackerStarConstraint} from "../constraints/SafeCrackerStarConstraint";
import {indexes} from "../../../utils/indexes";
import {safeCrackerArrowsCellWriteModeInfo} from "./LeftRightArrow";
import {BaseSafeCrackerPuzzle} from "./BaseSafeCrackerPuzzle";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {TextProps, textTag} from "../../../components/sudoku/constraints/text/Text";
import {CellMarkType} from "../../../types/sudoku/CellMark";
import {CellColor} from "../../../types/sudoku/CellColor";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";

export const SafeCrackerSudokuTypeManager = <ExType = {}, ProcessedExType = {}>(
    params: SafeCrackerPuzzleParams
): SudokuTypeManager<number, ExType, ProcessedExType> => {
    const {size, circleRegionsCount, codeCellsCount} = params;

    const baseTypeManager = DigitSudokuTypeManager<ExType, ProcessedExType>();

    const arrowsCellWriteModeInfo = safeCrackerArrowsCellWriteModeInfo<ExType, ProcessedExType>();

    return {
        ...baseTypeManager,
        hiddenSpecificCellWriteModes: [
            ...baseTypeManager.hiddenSpecificCellWriteModes ?? [],
            arrowsCellWriteModeInfo,
        ],
        getCellTypeProps({top, left}) {
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

            const originalItems = puzzle.items;
            if (Array.isArray(originalItems)) {
                const items: typeof originalItems = [];
                const initialCellMarks = [...(puzzle.initialCellMarks ?? [])];

                const cellsIndex = new SudokuCellsIndex(puzzle);

                for (const item of originalItems) {
                    if (!(item.tags?.includes(textTag) && item.cells.length === 1)) {
                        items.push(item);
                        continue;
                    }

                    const position = parsePositionLiteral(item.cells[0]);
                    const center = cellsIndex.allCells[position.top]?.[position.left]?.center;
                    switch ((item.props as TextProps).text.toLowerCase()) {
                        case ">":
                        case "->":
                        case "=>":
                        case CellMarkType.RightArrow:
                            if (center) {
                                initialCellMarks.push({
                                    type: CellMarkType.RightArrow,
                                    position: center,
                                    isCenter: true,
                                    color: CellColor.black,
                                })
                            }
                            break;
                        case "<":
                        case "<-":
                        case "<=":
                        case CellMarkType.LeftArrow:
                            if (center) {
                                initialCellMarks.push({
                                    type: CellMarkType.LeftArrow,
                                    position: center,
                                    isCenter: true,
                                    color: CellColor.black,
                                })
                            }
                            break;
                        case CellMarkType.X.toLowerCase():
                            if (center) {
                                initialCellMarks.push({
                                    type: CellMarkType.X,
                                    position: center,
                                    isCenter: true,
                                    color: CellColor.black,
                                })
                            }
                            break;
                        case "s":
                        case "star":
                            items.push(SafeCrackerStarConstraint(item.cells, item.layer));
                            break;
                        default:
                            items.push(item);
                            break;
                    }
                }

                puzzle = {
                    ...puzzle,
                    items,
                    initialCellMarks,
                };
            }

            return puzzle;
        }
    };
};
