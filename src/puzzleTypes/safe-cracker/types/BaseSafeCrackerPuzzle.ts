import { SafeCrackerPuzzleParams } from "./SafeCrackerPuzzleParams";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { Position } from "../../../types/layout/Position";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { createCellsMapFromArray } from "../../../types/puzzle/CellsMap";
import { CustomCellBounds } from "../../../types/puzzle/CustomCellBounds";
import { SafeCrackerTypeManager } from "./SafeCrackerTypeManager";
import { AnyNumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { roundToStep } from "../../../utils/math";

export const BaseSafeCrackerPuzzle = <T extends AnyNumberPTM>(
    params: SafeCrackerPuzzleParams,
): Pick<
    PuzzleDefinition<T>,
    "gridSize" | "regions" | "maxDigit" | "customCellBounds" | "typeManager" | "allowDrawing"
> => {
    const { size, circleRegionsCount, codeCellsCount } = params;

    const round = (value: number) => roundToStep(value, 0.001);

    const circleCellsCount = circleRegionsCount * size;
    const cellAngle = (2 * Math.PI) / circleCellsCount;
    const circleCellSize = size * 0.9 * cellAngle;
    const circleUserAreaSize = circleCellSize * 0.8;
    const getCircleCellPosition = (cellIndex: number, top: number): Position => {
        const angle = cellAngle * cellIndex;
        const radius = size - circleCellSize * (1 - top);

        return {
            top: round(size - radius * Math.cos(angle)),
            left: round(size + radius * Math.sin(angle)),
        };
    };

    const centerCellSize = 2 - (5 * circleCellSize) / size;
    const getCenterCellPosition = (totalCellsCount: number, cellIndex: number, top: number): Position => ({
        top: round(size + centerCellSize * (top - 1.5)),
        left: round(size + centerCellSize * (cellIndex - totalCellsCount / 2)),
    });

    return {
        gridSize: {
            gridSize: size * 2,
            columnsCount: size,
            rowsCount: circleRegionsCount * 2 + 2,
        },
        regions: [
            RegionConstraint(
                indexes(size).map((index) => ({ top: circleRegionsCount * 2, left: index })),
                false,
            ),
        ],
        maxDigit: size,
        customCellBounds: createCellsMapFromArray<CustomCellBounds>([
            ...indexes(circleRegionsCount).flatMap((regionIndex) => [
                indexes(size).map((cellIndexInRegion) => {
                    const cellIndex = regionIndex * size + cellIndexInRegion;
                    const center = getCircleCellPosition(cellIndex, 0.75);

                    return {
                        borders: [
                            [
                                getCircleCellPosition(cellIndex - 0.5, 0.5),
                                getCircleCellPosition(cellIndex - 0.5, 1),
                                getCircleCellPosition(cellIndex + 0.5, 1),
                                getCircleCellPosition(cellIndex + 0.5, 0.5),
                            ],
                        ],
                        userArea: {
                            top: center.top - circleUserAreaSize / 4,
                            left: center.left - circleUserAreaSize / 4,
                            width: circleUserAreaSize / 2,
                            height: circleUserAreaSize / 2,
                        },
                    };
                }),
                indexes(size).map((cellIndexInRegion) => {
                    const cellIndex = regionIndex * size + cellIndexInRegion;
                    const center = getCircleCellPosition(cellIndex, 0);

                    return {
                        borders: [
                            [
                                getCircleCellPosition(cellIndex - 0.5, -0.5),
                                getCircleCellPosition(cellIndex - 0.5, 0.5),
                                getCircleCellPosition(cellIndex + 0.5, 0.5),
                                getCircleCellPosition(cellIndex + 0.5, -0.5),
                            ],
                        ],
                        userArea: {
                            top: center.top - circleUserAreaSize / 2,
                            left: center.left - circleUserAreaSize / 2,
                            width: circleUserAreaSize,
                            height: circleUserAreaSize,
                        },
                    };
                }),
            ]),
            indexes(size).map((index) => ({
                borders: [
                    [
                        getCenterCellPosition(9, index, 1),
                        getCenterCellPosition(9, index, 0),
                        getCenterCellPosition(9, index + 1, 0),
                        getCenterCellPosition(9, index + 1, 1),
                    ],
                ],
                userArea: {
                    ...getCenterCellPosition(9, index, 0),
                    width: centerCellSize,
                    height: centerCellSize,
                },
            })),
            indexes(size).map((index) => ({
                borders:
                    index >= codeCellsCount
                        ? []
                        : [
                              [
                                  getCenterCellPosition(codeCellsCount, index, 3),
                                  getCenterCellPosition(codeCellsCount, index, 2),
                                  getCenterCellPosition(codeCellsCount, index + 1, 2),
                                  getCenterCellPosition(codeCellsCount, index + 1, 3),
                              ],
                          ],
                userArea: {
                    ...getCenterCellPosition(codeCellsCount, index, 2),
                    width: centerCellSize,
                    height: centerCellSize,
                },
            })),
        ]),
        typeManager: SafeCrackerTypeManager(params),
        allowDrawing: ["center-mark", "border-mark"],
    };
};
