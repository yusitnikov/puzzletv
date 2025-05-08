import { defaultProcessArrowDirection, SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { DigitSudokuTypeManager } from "../../default/types/DigitSudokuTypeManager";
import { createRegularRegions, GridSize } from "../../../types/sudoku/GridSize";
import { isSamePosition, Position, PositionWithAngle } from "../../../types/layout/Position";
import { Rect } from "../../../types/layout/Rect";
import { darkGreyColor, getRegionBorderWidth } from "../../../components/app/globals";
import { RegionConstraint } from "../../../components/sudoku/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { DigitCellDataComponentType } from "../../default/components/DigitCellData";
import { MonumentValleyDigitComponentType } from "../components/MonumentValleyDigit";
import { Constraint } from "../../../types/sudoku/Constraint";
import { GivenDigitsMap, processGivenDigitsMaps } from "../../../types/sudoku/GivenDigitsMap";
import { RotatableDigitSudokuTypeManagerBase } from "../../rotatable/types/RotatableDigitSudokuTypeManager";
import { loop, roundToStep } from "../../../utils/math";
import { MonumentValleyPTM } from "./MonumentValleyPTM";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { rotateDigit } from "../../../components/sudoku/digit/DigitComponentType";
import { CellTypeProps } from "../../../types/sudoku/CellTypeProps";

export const MonumentValleyTypeManager: SudokuTypeManager<MonumentValleyPTM> = {
    ...RotatableDigitSudokuTypeManagerBase(DigitSudokuTypeManager(), 0, 120, true, false, false),

    disableDigitShortcuts: true,
    digitShortcuts: [
        ["0"],
        ["I"],
        ["8"],
        [{ title: "-", codes: ["Minus", "NumpadSubtract"] }, "Q"],
        ["1"],
        ["Y"],
        ["6"],
        ["O"],
        ["9"],
    ],

    digitComponentType: MonumentValleyDigitComponentType,
    cellDataComponentType: DigitCellDataComponentType(),

    createCellDataByTypedDigit(digit, { puzzle, angle }, position) {
        if (!position) {
            return digit;
        }

        const processedGridSize = parseMonumentValleyGridSize(puzzle.gridSize);
        const { gridSize, intersectionSize } = processedGridSize;
        const { top, left } = rotateCellCoords(position, processedGridSize, 120 - angle);
        const isTopLeftGrid =
            top < gridSize &&
            left < gridSize &&
            (top < gridSize - intersectionSize || left < gridSize - intersectionSize);

        switch (loop(angle, 360)) {
            case 120:
                return rotateDigit(puzzle, digit, isTopLeftGrid ? -180 : -90);
            case 240:
                return rotateDigit(puzzle, digit, isTopLeftGrid ? 180 : 90);
            default:
                return digit;
        }
    },

    getCellTypeProps({ top, left }, puzzle): CellTypeProps<MonumentValleyPTM> {
        const { gridSize, intersectionSize, columnsCount } = parseMonumentValleyGridSize(puzzle.gridSize);

        if (
            top >= gridSize &&
            (left < gridSize - intersectionSize || left >= columnsCount - gridSize + intersectionSize)
        ) {
            return { isVisible: false };
        }

        if (top < gridSize - intersectionSize && left >= gridSize && left < columnsCount - gridSize) {
            return { isVisible: false };
        }

        // noinspection RedundantIfStatementJS
        if (
            top < intersectionSize &&
            left >= columnsCount - gridSize &&
            left < columnsCount - gridSize + intersectionSize
        ) {
            return { isVisible: false };
        }

        return {};
    },

    processCellDataPosition(
        context,
        { left, top, angle },
        _dataSet,
        _dataIndex,
        _positionFunction,
        cellPosition,
    ): PositionWithAngle | undefined {
        const angleDelta = (roundToStep(cellPosition ? context.animatedAngle : 0, 90) * Math.PI) / 180;
        const sin = Math.sin(angleDelta);
        const cos = Math.cos(angleDelta);

        return {
            left: left * cos + top * sin,
            top: top * cos - left * sin,
            angle,
        };
    },

    processArrowDirection(cell, xDirection, yDirection, context) {
        const processedGridSize = parseMonumentValleyGridSize(context.puzzle.gridSize);
        const { gridSize, intersectionSize, columnsCount, rowsCount } = processedGridSize;

        const process = (xDirection: number, yDirection: number): Position => {
            const defaultPosition = defaultProcessArrowDirection(cell, xDirection, yDirection, context).cell!;

            const naive: Position = {
                left: cell.left + xDirection,
                top: cell.top + yDirection,
            };
            if (isSamePosition(naive, defaultPosition)) {
                return defaultPosition;
            }

            const naiveTransformed = processCellCoords(naive, processedGridSize);
            if (!isSamePosition(naive, naiveTransformed)) {
                return naiveTransformed;
            }

            if (naive.top === rowsCount && naive.left >= columnsCount - gridSize) {
                return processCellCoords(
                    {
                        left: naive.left,
                        top: 0,
                    },
                    processedGridSize,
                );
            }

            if (naive.left === columnsCount && naive.top < intersectionSize) {
                return processCellCoords(
                    {
                        left: columnsCount - gridSize,
                        top: naive.top,
                    },
                    processedGridSize,
                );
            }

            if (naive.left === gridSize && naive.top < intersectionSize) {
                return process(0, -1);
            }

            if (naive.top === -1 && naive.left >= gridSize - intersectionSize && naive.left < gridSize) {
                return {
                    left: columnsCount - gridSize + intersectionSize,
                    top: naive.left - (gridSize - intersectionSize),
                };
            }

            return defaultPosition;
        };

        cell = rotateCellCoords(cell, processedGridSize, context.angle);
        cell = process(xDirection, yDirection);
        cell = rotateCellCoords(cell, processedGridSize, -context.angle);

        return { cell };
    },

    transformCoords({ top, left }, { puzzle }) {
        const { gridSize, intersectionSize, columnsCount, rowsCount } = parseMonumentValleyGridSize(puzzle.gridSize);

        const coeff = Math.sqrt(0.75);
        const centerX = columnsCount / 2;
        const centerY = rowsCount / 2 + (gridSize / 2 - intersectionSize) / Math.sqrt(3);

        if (left <= gridSize) {
            if (top < intersectionSize) {
                return {
                    left: centerX + (left - gridSize) * coeff + (intersectionSize - top) * coeff,
                    top:
                        centerY -
                        (gridSize - intersectionSize * 2) * coeff +
                        (top - intersectionSize) / 2 -
                        (gridSize - left) / 2,
                };
            } else if (top < gridSize - intersectionSize) {
                return {
                    left: gridSize + (left - gridSize) * coeff + (gridSize - intersectionSize - top) / 2,
                    top: centerY + (top - (gridSize - intersectionSize)) * coeff - (gridSize - left) / 2,
                };
            } else {
                return {
                    left: gridSize + (left - gridSize) * coeff,
                    top: centerY + (top - (gridSize - intersectionSize)) - (gridSize - left) / 2,
                };
            }
        } else if (left < columnsCount - gridSize) {
            return {
                left,
                top: centerY + (top - (gridSize - intersectionSize)),
            };
        } else {
            const right = columnsCount - left;
            if (top < intersectionSize) {
                return {
                    left: centerX - (right - gridSize) * coeff - (intersectionSize - top) * coeff,
                    top:
                        centerY -
                        (gridSize - intersectionSize * 2) * coeff +
                        (top - intersectionSize) / 2 -
                        (gridSize - right) / 2,
                };
            } else if (top < gridSize - intersectionSize) {
                return {
                    left:
                        columnsCount - gridSize + (gridSize - right) * coeff - (gridSize - intersectionSize - top) / 2,
                    top: centerY + (top - (gridSize - intersectionSize)) * coeff - (gridSize - right) / 2,
                };
            } else {
                return {
                    left: columnsCount - gridSize + (gridSize - right) * coeff,
                    top: centerY + (top - (gridSize - intersectionSize)) - (gridSize - right) / 2,
                };
            }
        }
    },

    getRegionsWithSameCoordsTransformation({
        puzzle: { regions, gridSize: originalGridSize, gridMargin = 0 },
        cellSize,
    }): Rect[] {
        const { gridSize, intersectionSize, columnsCount, rowsCount } = parseMonumentValleyGridSize(originalGridSize);

        const fullMargin = gridMargin + 1;
        const borderWidth = regions?.length ? getRegionBorderWidth(cellSize) : 1 / cellSize;

        return [
            {
                left: -fullMargin,
                top: -fullMargin,
                width: gridSize + fullMargin,
                height: intersectionSize + fullMargin,
            },
            {
                left: -fullMargin,
                top: intersectionSize,
                width: gridSize + fullMargin,
                height: gridSize - intersectionSize * 2,
            },
            {
                left: -fullMargin,
                top: rowsCount - gridSize,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
            },
            {
                left: gridSize + borderWidth,
                top: 0,
                width: gridSize - intersectionSize * 2 - borderWidth * 2,
                height: rowsCount - gridSize,
            },
            {
                left: gridSize,
                top: rowsCount - gridSize,
                width: gridSize - intersectionSize * 2,
                height: gridSize + fullMargin,
            },
            {
                left: columnsCount - gridSize + intersectionSize,
                top: -fullMargin,
                width: gridSize - intersectionSize + fullMargin,
                height: intersectionSize + fullMargin,
            },
            {
                left: columnsCount - gridSize,
                top: intersectionSize,
                width: gridSize + fullMargin,
                height: gridSize - intersectionSize * 2,
            },
            {
                left: columnsCount - gridSize,
                top: rowsCount - gridSize,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
            },
        ];
    },

    getRegionsForRowsAndColumns({ puzzle }): Constraint<MonumentValleyPTM, any>[] {
        const processedGridSize = parseMonumentValleyGridSize(puzzle.gridSize);
        const { gridSize, intersectionSize, columnsCount } = processedGridSize;

        const cubeFaces = [
            { left: 0, top: 0 },
            { left: gridSize - intersectionSize, top: gridSize - intersectionSize },
            { left: columnsCount - gridSize, top: 0 },
        ];

        return cubeFaces.flatMap(({ left, top }, index) => {
            const constraints: Constraint<MonumentValleyPTM, any>[] = indexes(gridSize).flatMap((i) => [
                RegionConstraint(
                    indexes(gridSize).map((j) =>
                        processCellCoords({ left: left + i, top: top + j }, processedGridSize),
                    ),
                    false,
                    "column",
                ),
                RegionConstraint(
                    indexes(gridSize).map((j) =>
                        processCellCoords({ left: left + j, top: top + i }, processedGridSize),
                    ),
                    false,
                    "row",
                ),
            ]);

            return index === 2 ? constraints.map(fixMonumentValleyDigitForConstraint) : constraints;
        });
    },

    getAdditionalNeighbors({ top, left }, puzzle) {
        const { gridSize, intersectionSize, columnsCount } = parseMonumentValleyGridSize(puzzle.gridSize);

        const results: Position[] = [];

        if (top < intersectionSize) {
            if (left === gridSize - 1) {
                results.push({
                    top: intersectionSize,
                    left: columnsCount - gridSize + (intersectionSize - 1 - top),
                });
            }

            if (left === columnsCount - (gridSize - intersectionSize)) {
                results.push({
                    top: 0,
                    left: gridSize - intersectionSize + top,
                });
            }

            if (left >= gridSize - intersectionSize && left < gridSize && top === 0) {
                results.push({
                    top: left - (gridSize - intersectionSize),
                    left: columnsCount - (gridSize - intersectionSize),
                });
            }

            if (
                left >= columnsCount - gridSize &&
                left < columnsCount - (gridSize - intersectionSize) &&
                top === intersectionSize
            ) {
                results.push({
                    top: columnsCount - (gridSize - intersectionSize) - 1 - left,
                    left: gridSize - 1,
                });
            }
        }

        return results;
    },

    borderColor: darkGreyColor,
};

const processCellCoords = (
    position: Position,
    originalGridSize: GridSize | ReturnType<typeof parseMonumentValleyGridSize>,
): Position => {
    const { top, left } = position;
    const { gridSize, intersectionSize, columnsCount } =
        "intersectionSize" in originalGridSize ? originalGridSize : parseMonumentValleyGridSize(originalGridSize);
    const leftOffset = left - (columnsCount - gridSize);

    return leftOffset >= 0 && leftOffset < intersectionSize && top < intersectionSize
        ? {
              top: intersectionSize - 1 - leftOffset,
              left: gridSize - intersectionSize + top,
          }
        : position;
};

const rotateDigitsMap = (map: GivenDigitsMap<number>, puzzle: PuzzleDefinition<MonumentValleyPTM>) => {
    const { gridSize, intersectionSize } = parseMonumentValleyGridSize(puzzle.gridSize);

    return processGivenDigitsMaps(
        ([digit], { top, left }) =>
            left >= gridSize - intersectionSize && left < gridSize && top < intersectionSize
                ? rotateDigit(puzzle, digit, 90)
                : digit,
        [map],
    );
};

export const fixMonumentValleyDigitForConstraint = <DataT>({
    isValidPuzzle,
    ...constraint
}: Constraint<MonumentValleyPTM, DataT>): Constraint<MonumentValleyPTM, DataT> => ({
    ...constraint,
    isValidCell(cell, digits, regionCells, context, ...args) {
        return (
            constraint.isValidCell?.(cell, rotateDigitsMap(digits, context.puzzle), regionCells, context, ...args) ??
            true
        );
    },
    isValidPuzzle: isValidPuzzle
        ? (lines, digits, regionCells, context) =>
              isValidPuzzle(lines, rotateDigitsMap(digits, context.puzzle), regionCells, context)
        : undefined,
});

export const rotateCellCoords = (
    position: Position,
    { gridSize, intersectionSize, columnsCount }: ReturnType<typeof parseMonumentValleyGridSize>,
    angle: number,
) => {
    const times = loop(angle, 360) / 120;

    for (let i = 0; i < times; i++) {
        const { top, left } = position;

        position =
            top < gridSize &&
            left < gridSize &&
            (top < gridSize - intersectionSize || left < gridSize - intersectionSize)
                ? {
                      left: columnsCount - 1 - left,
                      top: gridSize - 1 - top,
                  }
                : {
                      left: columnsCount - gridSize + intersectionSize - 1 - top,
                      top: intersectionSize - gridSize + left,
                  };
    }

    return position;
};

export const createMonumentValleyGridSize = (
    gridSize: number,
    regionSize: number,
    intersectionSize = regionSize,
): GridSize => {
    const columnsCount = gridSize * 3 - intersectionSize * 2;

    return {
        gridSize: columnsCount,
        columnsCount,
        rowsCount: gridSize * 2 - intersectionSize,
    };
};

export const createMonumentValleyRegions = (
    gridSize: number,
    regionSize: number,
    intersectionSize = regionSize,
    showBorders = true,
): PuzzleDefinition<MonumentValleyPTM>["regions"] => {
    const columnsCount = gridSize * 3 - intersectionSize * 2;
    const regions = createRegularRegions(gridSize, gridSize, regionSize, regionSize);

    return regionSize === 1
        ? []
        : [
              ...regions.map((region) => RegionConstraint(region, showBorders)),
              ...regions.map((region) =>
                  RegionConstraint(
                      region.map(({ top, left }) => ({
                          top: top + gridSize - intersectionSize,
                          left: left + gridSize - intersectionSize,
                      })),
                      showBorders,
                  ),
              ),
              ...regions.map((region) =>
                  fixMonumentValleyDigitForConstraint(
                      RegionConstraint(
                          region.map(({ top, left }) => ({
                              top,
                              left:
                                  top < intersectionSize && left < intersectionSize
                                      ? left + gridSize - intersectionSize
                                      : left + columnsCount - gridSize,
                          })),
                          showBorders,
                      ),
                  ),
              ),
          ];
};

export const parseMonumentValleyGridSize = ({ columnsCount, rowsCount }: GridSize) => ({
    columnsCount,
    rowsCount,
    gridSize: rowsCount * 2 - columnsCount,
    intersectionSize: rowsCount * 3 - columnsCount * 2,
});

const digitLiteralsMap: Record<number, number> = {
    0: 1,
    8.5: 2,
    8: 3,
    1.5: 4,
    1: 5,
    6.5: 6,
    6: 7,
    9.5: 8,
    9: 9,
};
export const parseMonumentValleyDigitLiteral = (literal: number) => digitLiteralsMap[literal] ?? literal;
export const parseMonumentValleyDigitsMap = (map: GivenDigitsMap<number>) =>
    processGivenDigitsMaps(([digit]) => parseMonumentValleyDigitLiteral(digit), [map]);
