import { defaultProcessArrowDirection, PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { createRegularRegions, GridSize } from "../../../types/puzzle/GridSize";
import { Position } from "../../../types/layout/Position";
import { Rect } from "../../../types/layout/Rect";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { Constraint } from "../../../types/puzzle/Constraint";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";
import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { GridRegion, transformCoordsByRegions } from "../../../types/puzzle/GridRegion";

export const SparkTypeManager: PuzzleTypeManager<NumberPTM> = {
    ...DigitPuzzleTypeManager(),

    getCellTypeProps({ top, left }, puzzle): CellTypeProps<NumberPTM> {
        const { gridSize, realRowsCount } = parseSparkGridSize(puzzle.gridSize);

        return {
            isVisible:
                top < realRowsCount
                    ? left !== gridSize * 2 && (top < gridSize || left < gridSize || left >= gridSize * 2)
                    : top > realRowsCount && left < realRowsCount,
            isCheckingSolution: top < realRowsCount,
        };
    },

    processArrowDirection(cell, xDirection, yDirection, context, ...args) {
        const { gridSize, columnsCount, realRowsCount } = parseSparkGridSize(context.puzzle.gridSize);
        const { top, left } = cell;

        if (top < realRowsCount) {
            if (top >= gridSize) {
                if (left === 0 && xDirection === -1) {
                    return {
                        cell: {
                            top,
                            left: columnsCount - 1,
                        },
                    };
                }
                if (left === columnsCount - 1 && xDirection === 1) {
                    return {
                        cell: {
                            top,
                            left: 0,
                        },
                    };
                }
                if (left === columnsCount - gridSize && xDirection === -1) {
                    return {
                        cell: {
                            top,
                            left: gridSize - 1,
                        },
                    };
                }
                if (left === gridSize - 1 && xDirection === 1) {
                    return {
                        cell: {
                            top,
                            left: columnsCount - gridSize,
                        },
                    };
                }
            } else {
                if (left === columnsCount - 1 && xDirection === 1) {
                    return {
                        cell: {
                            top: 0,
                            left: gridSize * 2 - 1 - top,
                        },
                    };
                }
                if (left === columnsCount - gridSize && xDirection === -1) {
                    return {
                        cell: {
                            top: gridSize - 1,
                            left: gridSize * 2 - 1 - top,
                        },
                    };
                }

                if (left >= gridSize && left < gridSize * 2) {
                    if (top === 0 && yDirection === -1) {
                        return {
                            cell: {
                                top: gridSize * 2 - 1 - left,
                                left: columnsCount - 1,
                            },
                        };
                    }
                    if (top === gridSize - 1 && yDirection === 1) {
                        return {
                            cell: {
                                top: gridSize * 2 - 1 - left,
                                left: columnsCount - gridSize,
                            },
                        };
                    }
                }
            }
        }

        return defaultProcessArrowDirection(cell, xDirection, yDirection, context, ...args);
    },

    transformCoords: transformCoordsByRegions,

    getRegionsWithSameCoordsTransformation({ puzzle, isReadonlyContext: isPreview }): Rect[] {
        const { gridSize, realRowsCount, extraRowsCount } = parseSparkGridSize(puzzle.gridSize);

        const fullMargin = (puzzle.gridMargin ?? 0) + 1;

        const a10 = Math.PI / 10;
        const s10 = Math.sin(a10);
        const c10 = Math.cos(a10);
        const a5 = Math.PI / 5;
        const s5 = Math.sin(a5);
        const c5 = Math.cos(a5);

        const cx = gridSize * 1.5 + 0.5;
        const cy = gridSize + 0.5 + (isPreview ? extraRowsCount / 2 : 0);

        const result: GridRegion[] = [
            {
                left: -fullMargin,
                top: -fullMargin,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
                transformCoords: ({ top, left }) => {
                    left -= gridSize;
                    top -= gridSize;

                    return {
                        left: cx + left * c10 + top * s5,
                        top: cy + top * c5 - left * s10,
                    };
                },
            },
            {
                left: -fullMargin,
                top: gridSize,
                width: gridSize + fullMargin,
                height: gridSize + 0.5,
                transformCoords: ({ top, left }) => {
                    left -= gridSize;
                    top -= gridSize;

                    return {
                        left: cx + left * c10,
                        top: cy + top - left * s10,
                    };
                },
            },
            {
                left: gridSize,
                top: -fullMargin,
                width: gridSize + 0.5,
                height: gridSize + fullMargin,
                transformCoords: ({ top, left }) => {
                    left -= gridSize;
                    top -= gridSize;

                    return {
                        left: cx + left * s5 + top * s5,
                        top: cy + top * c5 - left * c5,
                    };
                },
            },
            {
                left: gridSize * 2 + 1,
                top: -fullMargin,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
                transformCoords: ({ top, left }) => {
                    left -= gridSize * 2 + 1;
                    top -= gridSize;

                    return {
                        left: cx + left * c10 - top * s5,
                        top: cy + top * c5 + left * s10,
                    };
                },
            },
            {
                left: gridSize * 2 + 1,
                top: gridSize,
                width: gridSize + fullMargin,
                height: gridSize + 0.5,
                transformCoords: ({ top, left }) => {
                    left -= gridSize * 2 + 1;
                    top -= gridSize;

                    return {
                        left: cx + left * c10,
                        top: cy + top + left * s10,
                    };
                },
            },
        ];

        if (extraRowsCount && !isPreview) {
            result.push({
                left: -fullMargin,
                top: realRowsCount + 0.5,
                width: gridSize * 2 + fullMargin * 2,
                height: extraRowsCount + fullMargin,
                transformCoords: ({ top, left }) => {
                    left -= gridSize;
                    top -= gridSize;

                    return {
                        left: cx + left,
                        top: cy + top + 1,
                    };
                },
            });
        }

        return result;
    },

    getRegionsForRowsAndColumns({ puzzle }): Constraint<NumberPTM, any>[] {
        const { gridSize, realRowsCount, columnsCount } = parseSparkGridSize(puzzle.gridSize);

        return [
            ...indexes(gridSize).map((i) =>
                RegionConstraint(
                    indexes(realRowsCount).map((j) => ({ left: i, top: j })),
                    false,
                    "column",
                ),
            ),
            ...indexes(gridSize).map((i) =>
                RegionConstraint(
                    indexes(realRowsCount).map((j) => ({ left: columnsCount - gridSize + i, top: j })),
                    false,
                    "column",
                ),
            ),
            ...indexes(gridSize).map((i) =>
                RegionConstraint(
                    indexes(realRowsCount).map((j) => ({ left: j, top: i })),
                    false,
                    "row",
                ),
            ),
            ...indexes(gridSize).map((i) =>
                RegionConstraint(
                    indexes(realRowsCount).map((j) => ({
                        left: j < gridSize ? j : gridSize + 1 + j,
                        top: gridSize + i,
                    })),
                    false,
                    "row",
                ),
            ),
            ...indexes(gridSize).map((i) =>
                RegionConstraint(
                    indexes(realRowsCount).map((j) => ({
                        left: j < gridSize ? gridSize + i : gridSize + 1 + j,
                        top: j < gridSize ? j : gridSize - 1 - i,
                    })),
                    false,
                    "row",
                ),
            ),
        ];
    },
};

export const createSparkGridSize = (
    gridSize: number,
    regionWidth: number,
    regionHeight = (gridSize * 2) / regionWidth,
    withNotes = false,
): Required<GridSize> => {
    const columnsCount = gridSize * 3 + 1;
    const notesHeight = withNotes ? 2 : 0;

    return {
        gridSize: columnsCount + notesHeight,
        columnsCount,
        rowsCount: gridSize * 2 + notesHeight,
        regionWidth,
        regionHeight,
    };
};

export const parseSparkGridSize = ({ columnsCount, rowsCount }: GridSize) => {
    const gridSize = (columnsCount - 1) / 3;
    const realRowsCount = gridSize * 2;

    return {
        columnsCount,
        rowsCount,
        realRowsCount,
        extraRowsCount: rowsCount - realRowsCount,
        gridSize,
    };
};

export const createSparkRegions = (originalGridSize: Required<GridSize>): Position[][] => {
    const { gridSize } = parseSparkGridSize(originalGridSize);
    const regions = createRegularRegions({
        ...originalGridSize,
        gridSize,
        rowsCount: gridSize,
        columnsCount: gridSize,
    });

    // noinspection JSSuspiciousNameCombination
    return [
        ...regions,
        ...regions.map((region) => region.map(({ top, left }) => ({ top: left, left: top + gridSize }))),
        ...regions.map((region) => region.map(({ top, left }) => ({ top: left, left: top + gridSize * 2 + 1 }))),
        ...regions.map((region) => region.map(({ top, left }) => ({ top: left + gridSize, left: top }))),
        ...regions.map((region) =>
            region.map(({ top, left }) => ({ top: top + gridSize, left: left + gridSize * 2 + 1 })),
        ),
    ];
};
