import { SafeCrackerPuzzleParams } from "./SafeCrackerPuzzleParams";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { Position, PositionWithAngle } from "../../../types/layout/Position";
import {
    defaultProcessArrowDirection,
    defaultProcessArrowDirectionForRegularCellBounds,
    PuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManager";
import { SafeCrackerStarConstraint } from "../constraints/SafeCrackerStarConstraint";
import { indexes } from "../../../utils/indexes";
import { safeCrackerArrowsPuzzleInputModeInfo } from "./LeftRightArrow";
import { BaseSafeCrackerPuzzle } from "./BaseSafeCrackerPuzzle";
import { getDefaultMaxDigit, PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { isTextConstraint } from "../../../components/puzzle/constraints/text/Text";
import { CellMarkType, parseCellMark } from "../../../types/puzzle/CellMark";
import { CellColor } from "../../../types/puzzle/CellColor";
import { PuzzleCellsIndex } from "../../../types/puzzle/PuzzleCellsIndex";
import { Constraint } from "../../../types/puzzle/Constraint";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { AnyNumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";

export const SafeCrackerTypeManager = <T extends AnyNumberPTM>(
    params: SafeCrackerPuzzleParams,
): PuzzleTypeManager<T> => {
    const { size, circleRegionsCount, codeCellsCount } = params;

    const baseTypeManager = DigitPuzzleTypeManager<T>();

    const arrowsInputModeInfo = safeCrackerArrowsPuzzleInputModeInfo<T>();

    return {
        ...baseTypeManager,
        ignoreRowsColumnCountInTheWrapper: true,
        extraInputModes: [...(baseTypeManager.extraInputModes ?? []), arrowsInputModeInfo],
        getCellTypeProps({ top, left }, puzzle): CellTypeProps<T> {
            const { maxDigit = getDefaultMaxDigit(puzzle) } = puzzle;
            if (left >= maxDigit) {
                return { isVisible: false };
            }

            switch (top - circleRegionsCount * 2) {
                case 0:
                    return {};
                case 1:
                    return { isVisible: left < codeCellsCount };
                default:
                    return top % 2 === 1
                        ? {}
                        : {
                              isSelectable: false,
                              forcedPuzzleInputMode: arrowsInputModeInfo,
                          };
            }
        },
        processArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard) {
            if (currentCell.top < circleRegionsCount * 2) {
                return defaultProcessArrowDirection(
                    currentCell,
                    xDirection,
                    yDirection,
                    context,
                    isMainKeyboard,
                    false,
                );
            }

            if (yDirection) {
                return {
                    cell:
                        currentCell.top === circleRegionsCount * 2
                            ? {
                                  top: circleRegionsCount * 2 + 1,
                                  left: Math.min(currentCell.left, codeCellsCount - 1),
                              }
                            : {
                                  top: circleRegionsCount * 2,
                                  left: currentCell.left,
                              },
                };
            }

            return defaultProcessArrowDirectionForRegularCellBounds(currentCell, xDirection, yDirection, context);
        },
        processCellDataPosition(
            context,
            basePosition,
            dataSet,
            dataIndex,
            positionFunction,
            cellPosition,
        ): PositionWithAngle | undefined {
            if (cellPosition && cellPosition.top < circleRegionsCount * 2 && cellPosition.top % 2 === 0) {
                return {
                    ...basePosition,
                    angle: (360 * (cellPosition.top / 2 + cellPosition.left / size)) / circleRegionsCount,
                };
            }

            return basePosition;
        },
        items: indexes(codeCellsCount).map((left) =>
            SafeCrackerStarConstraint([{ top: circleRegionsCount * 2 + 1, left }]),
        ),
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            puzzle = {
                ...puzzle,
                ...BaseSafeCrackerPuzzle(params),
            };

            const items: Constraint<T, any>[] = [];
            const initialLetters = puzzle.initialLetters ?? {};
            const initialCellMarks = [...(puzzle.initialCellMarks ?? [])];
            const cellsIndex = new PuzzleCellsIndex(puzzle);

            const processText = (text: string, cells: Position[], layer?: GridLayer) => {
                const [{ top, left }] = cells;
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
                    if (processText(text, [{ top, left }])) {
                        delete initialLetters[top][left];
                    }
                }
            }

            const originalItems = puzzle.items;
            if (Array.isArray(originalItems)) {
                for (const item of originalItems) {
                    if (!(isTextConstraint(item) && item.cells.length === 1)) {
                        items.push(item);
                        continue;
                    }

                    if (!processText(item.props.text, item.cells, item.layer)) {
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
        },
    };
};
