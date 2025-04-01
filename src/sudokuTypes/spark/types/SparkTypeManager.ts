import { defaultProcessArrowDirection, SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { DigitSudokuTypeManager } from "../../default/types/DigitSudokuTypeManager";
import { createRegularRegions, FieldSize } from "../../../types/sudoku/FieldSize";
import { Position } from "../../../types/layout/Position";
import { Rect } from "../../../types/layout/Rect";
import { RegionConstraint } from "../../../components/sudoku/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { Constraint } from "../../../types/sudoku/Constraint";
import { CellTypeProps } from "../../../types/sudoku/CellTypeProps";
import { NumberPTM } from "../../../types/sudoku/PuzzleTypeMap";

export const SparkTypeManager: SudokuTypeManager<NumberPTM> = {
    ...DigitSudokuTypeManager(),

    getCellTypeProps({ top, left }, { fieldSize }): CellTypeProps<NumberPTM> {
        const { gridSize, realRowsCount } = parseSparkFieldSize(fieldSize);

        return {
            isVisible:
                top < realRowsCount
                    ? left !== gridSize * 2 && (top < gridSize || left < gridSize || left >= gridSize * 2)
                    : top > realRowsCount && left < realRowsCount,
            isCheckingSolution: top < realRowsCount,
        };
    },

    processArrowDirection(cell, xDirection, yDirection, context, ...args) {
        const { gridSize, columnsCount, realRowsCount } = parseSparkFieldSize(context.puzzle.fieldSize);
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

    transformCoords({ top, left }, { puzzle: { fieldSize }, isReadonlyContext: isPreview }) {
        const { gridSize, realRowsCount, extraRowsCount } = parseSparkFieldSize(fieldSize);

        const a10 = Math.PI / 10;
        const s10 = Math.sin(a10);
        const c10 = Math.cos(a10);
        const a5 = Math.PI / 5;
        const s5 = Math.sin(a5);
        const c5 = Math.cos(a5);

        const cx = gridSize * 1.5 + 0.5;
        const cy = gridSize + 0.5 + (isPreview ? extraRowsCount / 2 : 0);

        let dx = left - gridSize;
        const dy = top - gridSize;

        if (top >= realRowsCount) {
            return { left: cx + dx, top: cy + dy + 1 };
        }

        if (dx >= gridSize + 0.75) {
            dx -= gridSize + 1;

            if (dy < 0) {
                return { left: cx + dx * c10 - dy * s5, top: cy + dy * c5 + dx * s10 };
            } else {
                return { left: cx + dx * c10, top: cy + dy + dx * s10 };
            }
        } else {
            if (dy < 0) {
                if (dx < 0) {
                    return { left: cx + dx * c10 + dy * s5, top: cy + dy * c5 - dx * s10 };
                } else {
                    return { left: cx + dx * s5 + dy * s5, top: cy + dy * c5 - dx * c5 };
                }
            } else {
                return { left: cx + dx * c10, top: cy + dy - dx * s10 };
            }
        }
    },

    getRegionsWithSameCoordsTransformation({
        puzzle: { fieldSize, fieldMargin = 0 },
        isReadonlyContext: isPreview,
    }): Rect[] {
        const { gridSize, realRowsCount, extraRowsCount } = parseSparkFieldSize(fieldSize);

        const fullMargin = fieldMargin + 1;

        const result: Rect[] = [
            {
                left: -fullMargin,
                top: -fullMargin,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
            },
            {
                left: -fullMargin,
                top: gridSize,
                width: gridSize + fullMargin,
                height: gridSize + 0.5,
            },
            {
                left: gridSize,
                top: -fullMargin,
                width: gridSize + 0.5,
                height: gridSize + fullMargin,
            },
            {
                left: gridSize * 2 + 1,
                top: -fullMargin,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
            },
            {
                left: gridSize * 2 + 1,
                top: gridSize,
                width: gridSize + fullMargin,
                height: gridSize + 0.5,
            },
        ];

        if (extraRowsCount && !isPreview) {
            result.push({
                left: -fullMargin,
                top: realRowsCount + 0.5,
                width: gridSize * 2 + fullMargin * 2,
                height: extraRowsCount + fullMargin,
            });
        }

        return result;
    },

    getRegionsForRowsAndColumns({ puzzle: { fieldSize } }): Constraint<NumberPTM, any>[] {
        const { gridSize, realRowsCount, columnsCount } = parseSparkFieldSize(fieldSize);

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

export const createSparkFieldSize = (
    gridSize: number,
    regionWidth: number,
    regionHeight = (gridSize * 2) / regionWidth,
    withNotes = false,
): Required<FieldSize> => {
    const columnsCount = gridSize * 3 + 1;
    const notesHeight = withNotes ? 2 : 0;

    return {
        fieldSize: columnsCount + notesHeight,
        columnsCount,
        rowsCount: gridSize * 2 + notesHeight,
        regionWidth,
        regionHeight,
    };
};

export const parseSparkFieldSize = ({ columnsCount, rowsCount }: FieldSize) => {
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

export const createSparkRegions = (fieldSize: Required<FieldSize>): Position[][] => {
    const { gridSize } = parseSparkFieldSize(fieldSize);
    const regions = createRegularRegions({
        ...fieldSize,
        fieldSize: gridSize,
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
