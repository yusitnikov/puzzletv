import {defaultSafeCrackerPuzzleParams, SafeCrackerPuzzleParams} from "./SafeCrackerPuzzleParams";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {Position, PositionWithAngle} from "../../../types/layout/Position";
import {
    defaultProcessArrowDirection,
    defaultProcessArrowDirectionForRegularCellBounds, SudokuTypeManager
} from "../../../types/sudoku/SudokuTypeManager";

export const SafeCrackerSudokuTypeManager = <ExType = {}, ProcessedExType = {}>(
    {
        size = defaultSafeCrackerPuzzleParams.size,
        circleRegionsCount = defaultSafeCrackerPuzzleParams.circleRegionsCount,
        codeCellsCount = defaultSafeCrackerPuzzleParams.codeCellsCount,
    }: Partial<SafeCrackerPuzzleParams> = {}
): SudokuTypeManager<number, ExType, ProcessedExType> => {
    const baseTypeManager = DigitSudokuTypeManager<ExType, ProcessedExType>();

    return {
        ...baseTypeManager,
        isValidCell({top, left}): boolean {
            switch (top - circleRegionsCount * 2) {
                case 0: return true;
                case 1: return left < codeCellsCount;
                default: return top % 2 === 1;
            }
        },
        processArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard): Position | undefined {
            if (currentCell.top < circleRegionsCount * 2) {
                return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard, false);
            }

            if (yDirection) {
                return currentCell.top === circleRegionsCount * 2
                    ? {
                        top: circleRegionsCount * 2 + 1,
                        left: Math.min(currentCell.left, codeCellsCount - 1),
                    }
                    : {
                        top: circleRegionsCount * 2,
                        left: currentCell.left,
                    };
            }

            return defaultProcessArrowDirectionForRegularCellBounds(currentCell, xDirection, yDirection, context);
        },
        processCellDataPosition(puzzle, basePosition, dataSet, dataIndex, positionFunction, cellPosition, state): PositionWithAngle | undefined {
            if (cellPosition && cellPosition.top < circleRegionsCount * 2 && cellPosition.top % 2 === 0) {
                return {
                    ...basePosition,
                    angle: 360 * (cellPosition.top / 2 + cellPosition.left / size) / circleRegionsCount,
                };
            }

            return basePosition;
        }
    };
};
