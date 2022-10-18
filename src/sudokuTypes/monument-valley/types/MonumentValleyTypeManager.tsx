import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {createRegularRegions, FieldSize} from "../../../types/sudoku/FieldSize";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";
import {darkGreyColor, getRegionBorderWidth} from "../../../components/app/globals";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {indexes} from "../../../utils/indexes";
import {DigitCellDataComponentType} from "../../default/components/DigitCellData";
import {MonumentValleyDigitComponentType} from "../components/MonumentValleyDigit";
import {Constraint} from "../../../types/sudoku/Constraint";
import {GivenDigitsMap, processGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";

export const MonumentValleyTypeManager: SudokuTypeManager<number> = {
    ...DigitSudokuTypeManager(),

    disableDigitShortcuts: true,
    digitShortcuts: [
        ["0"],
        ["I"],
        ["8"],
        [{title: "-", codes: ["Minus", "NumpadSubtract"]}, "Q"],
        ["1"],
        ["Y"],
        ["6"],
        ["O"],
        ["9"],
    ],

    cellDataComponentType: DigitCellDataComponentType(
        MonumentValleyDigitComponentType.component,
        MonumentValleyDigitComponentType.widthCoeff
    ),

    isValidCell({top, left}, {fieldSize}): boolean {
        const {gridSize, intersectionSize, columnsCount} = parseMonumentValleyFieldSize(fieldSize);

        if (top >= gridSize && (left < gridSize - intersectionSize || left >= columnsCount - gridSize + intersectionSize)) {
            return false;
        }

        if (top < gridSize - intersectionSize && left >= gridSize && left < columnsCount - gridSize) {
            return false;
        }

        // noinspection RedundantIfStatementJS
        if (top < intersectionSize && left >= columnsCount - gridSize && left < columnsCount - gridSize + intersectionSize) {
            return false;
        }

        return true;
    },

    processArrowDirection(
        cell,
        xDirection,
        yDirection,
        context,
        ...args
    ) {
        const processedFieldSize = parseMonumentValleyFieldSize(context.puzzle.fieldSize);
        const {gridSize, intersectionSize, columnsCount, rowsCount} = processedFieldSize;

        const defaultPosition = defaultProcessArrowDirection(cell, xDirection, yDirection, context)!;

        const naive: Position = {
            left: cell.left + xDirection,
            top: cell.top + yDirection,
        };
        if (isSamePosition(naive, defaultPosition)) {
            return defaultPosition;
        }

        const naiveTransformed = processCellCoords(naive, processedFieldSize);
        if (!isSamePosition(naive, naiveTransformed)) {
            return naiveTransformed;
        }

        if (naive.top === rowsCount && naive.left >= columnsCount - gridSize) {
            return processCellCoords({
                left: naive.left,
                top: 0,
            }, processedFieldSize);
        }

        if (naive.left === columnsCount && naive.top < intersectionSize) {
            return processCellCoords({
                left: columnsCount - gridSize,
                top: naive.top,
            }, processedFieldSize);
        }

        if (naive.left === gridSize && naive.top < intersectionSize) {
            return context.puzzle.typeManager.processArrowDirection!(
                cell,
                0,
                -1,
                context,
                ...args
            );
        }

        if (naive.top === -1 && naive.left >= gridSize - intersectionSize && naive.left < gridSize) {
            return {
                left: columnsCount - gridSize + intersectionSize,
                top: naive.left - (gridSize - intersectionSize),
            };
        }

        return defaultPosition;
    },

    transformCoords({top, left}, {fieldSize}, state, cellSize) {
        const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);

        const centerX = columnsCount / 2;
        const centerY = rowsCount / 2;

        const borderWidth = getRegionBorderWidth(cellSize) / 2;

        if (left <= gridSize + borderWidth) {
            if (top < intersectionSize) {
                return {
                    left: centerX + (left - gridSize) + (intersectionSize - top),
                    top: centerY - (gridSize - intersectionSize * 2) + (top - intersectionSize) / 2 - (gridSize - left) / 2,
                };
            } else if (top < gridSize - intersectionSize) {
                return {
                    left: left + (gridSize - intersectionSize - top) / 2,
                    top: centerY + (top - (gridSize - intersectionSize)) - (gridSize - left) / 2,
                };
            } else {
                return {
                    left,
                    top: centerY + (top - (gridSize - intersectionSize)) - (gridSize - left) / 2,
                };
            }
        } else if (left < columnsCount - gridSize - borderWidth) {
            return {
                left,
                top: centerY + (top - (gridSize - intersectionSize)),
            };
        } else {
            const right = columnsCount - left;
            if (top < intersectionSize) {
                return {
                    left: centerX - (right - gridSize) - (intersectionSize - top),
                    top: centerY - (gridSize - intersectionSize * 2) + (top - intersectionSize) / 2 - (gridSize - right) / 2,
                };
            } else if (top < gridSize - intersectionSize) {
                return {
                    left: columnsCount - right - (gridSize - intersectionSize - top) / 2,
                    top: centerY + (top - (gridSize - intersectionSize)) - (gridSize - right) / 2,
                };
            } else {
                return {
                    left,
                    top: centerY + (top - (gridSize - intersectionSize)) - (gridSize - right) / 2,
                };
            }
        }
    },

    getRegionsWithSameCoordsTransformation({fieldSize, fieldMargin = 0, hideRegionBorders}, cellSize): Rect[] {
        const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);

        const fullMargin = fieldMargin + 1;
        const borderWidth = getRegionBorderWidth(cellSize) / 2;

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
                width: gridSize + fullMargin + borderWidth,
                height: gridSize - intersectionSize * 2,
            },
            {
                left: -fullMargin,
                top: rowsCount - gridSize,
                width: gridSize + fullMargin,
                height: gridSize + fullMargin,
            },
            {
                left: gridSize,
                top: rowsCount - gridSize,
                width: gridSize - intersectionSize * 2,
                height: gridSize + fullMargin,
            },
            ...(hideRegionBorders ? [] : [{
                left: gridSize + borderWidth + 0.001,
                top: rowsCount - gridSize - borderWidth,
                width: gridSize - intersectionSize * 2 - borderWidth * 2 - 0.002,
                height: borderWidth,
            }]),
            {
                left: columnsCount - gridSize + intersectionSize,
                top: -fullMargin,
                width: gridSize - intersectionSize + fullMargin,
                height: intersectionSize + fullMargin,
            },
            {
                left: columnsCount - gridSize - borderWidth,
                top: intersectionSize,
                width: gridSize + fullMargin + borderWidth,
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

    getRegionsForRowsAndColumns({fieldSize}) {
        const processedFieldSize = parseMonumentValleyFieldSize(fieldSize);
        const {gridSize, intersectionSize, columnsCount} = processedFieldSize;

        const cubeFaces = [
            {left: 0, top: 0},
            {left: gridSize - intersectionSize, top: gridSize - intersectionSize},
            {left: columnsCount - gridSize, top: 0},
        ];

        return cubeFaces.flatMap(({left, top}, index) => {
            const constraints: Constraint<number, any>[] = indexes(gridSize).flatMap(i => [
                RegionConstraint(
                    indexes(gridSize).map(j => processCellCoords({left: left + i, top: top + j}, processedFieldSize)),
                    false,
                    "column"
                ),
                RegionConstraint(
                    indexes(gridSize).map(j => processCellCoords({left: left + j, top: top + i}, processedFieldSize)),
                    false,
                    "row"
                ),
            ]);

            return index === 2 ? constraints.map(fixMonumentValleyDigitForConstraint) : constraints;
        });
    },

    getAdditionalNeighbors({top, left}, {fieldSize}) {
        const {gridSize, intersectionSize, columnsCount} = parseMonumentValleyFieldSize(fieldSize);

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

            if (left >= columnsCount - gridSize && left < columnsCount - (gridSize - intersectionSize) && top === intersectionSize) {
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

const processCellCoords = (position: Position, fieldSize: FieldSize | ReturnType<typeof parseMonumentValleyFieldSize>): Position => {
    const {top, left} = position;
    const {gridSize, intersectionSize, columnsCount} = "intersectionSize" in fieldSize
        ? fieldSize
        : parseMonumentValleyFieldSize(fieldSize);
    const leftOffset = left - (columnsCount - gridSize);

    return leftOffset >= 0 && leftOffset < intersectionSize && top < intersectionSize
        ? {
            top: intersectionSize - 1 - leftOffset,
            left: gridSize - intersectionSize + top,
        }
        : position;
};

const digitRotationMap = [
    1,
    3,
    2,
    5,
    4,
    9,
    6,
    7,
    8,
];
const rotateDigit = (digit: number) => digitRotationMap[digit - 1];
const rotateDigitByPosition = (digit: number, {top, left}: Position, fieldSize: FieldSize) => {
    const {gridSize, intersectionSize} = parseMonumentValleyFieldSize(fieldSize);
    return left >= gridSize - intersectionSize && left < gridSize && top < intersectionSize
        ? rotateDigit(digit)
        : digit;
};
const rotateDigitsMap = (map: GivenDigitsMap<number>, fieldSize: FieldSize) => processGivenDigitsMaps(
    ([digit], position) => rotateDigitByPosition(digit, position, fieldSize),
    [map]
);

export const fixMonumentValleyDigitForConstraint = <DataT,>(constraint: Constraint<number, DataT>): Constraint<number, DataT> => ({
    ...constraint,
    isValidCell(cell, digits, regionCells, context, ...args) {
        return constraint.isValidCell?.(
            cell,
            rotateDigitsMap(digits, context.puzzle.fieldSize),
            regionCells,
            context,
            ...args
        ) ?? true;
    },
    isValidPuzzle(lines, digits, regionCells, context) {
        return constraint.isValidPuzzle?.(
            lines,
            rotateDigitsMap(digits, context.puzzle.fieldSize),
            regionCells,
            context
        ) ?? true;
    },
});

export const createMonumentValleyFieldSize = (
    gridSize: number,
    regionSize: number,
    intersectionSize = regionSize,
    showBorders = true,
): FieldSize => {
    const columnsCount = gridSize * 3 - intersectionSize * 2;
    const regions = createRegularRegions(gridSize, gridSize, regionSize, regionSize);

    return {
        fieldSize: columnsCount,
        columnsCount,
        rowsCount: gridSize * 2 - intersectionSize,
        regions: regionSize === 1 ? [] : [
            ...regions.map((region) => RegionConstraint(region, showBorders)),
            ...regions.map((region) => RegionConstraint(
                region.map(({top, left}) => ({
                    top: top + gridSize - intersectionSize,
                    left: left + gridSize - intersectionSize,
                })),
                showBorders
            )),
            ...regions.map((region) => fixMonumentValleyDigitForConstraint(RegionConstraint<number>(
                region.map(({top, left}) => ({
                    top,
                    left: top < intersectionSize && left < intersectionSize
                        ? left + gridSize - intersectionSize
                        : left + columnsCount - gridSize,
                })),
                showBorders
            ))),
        ]
    };
};

export const parseMonumentValleyFieldSize = ({columnsCount, rowsCount}: FieldSize) => ({
    columnsCount,
    rowsCount,
    gridSize: rowsCount * 2 - columnsCount,
    intersectionSize: rowsCount * 3 - columnsCount * 2,
});
