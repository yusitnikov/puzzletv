import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {createRegularRegions, FieldSize} from "../../../types/sudoku/FieldSize";
import {Position, PositionWithAngle} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";
import {darkGreyColor, getRegionBorderWidth} from "../../../components/app/globals";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";

export const MonumentValleyTypeManager: SudokuTypeManager<number> = {
    ...DigitSudokuTypeManager(),

    isValidCell({top, left}, {fieldSize}): boolean {
        const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);

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

    // processArrowDirection(
    //     cell,
    //     xDirection,
    //     yDirection,
    //     context
    // ) {
    //     const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(context.puzzle.fieldSize);
    //
    //     const realFieldSize = context.puzzle.fieldSize.fieldSize / 2;
    //
    //     cell = defaultProcessArrowDirection(cell, xDirection, yDirection, context)!;
    //
    //     if (cell.left >= realFieldSize && cell.top < realFieldSize) {
    //         if (xDirection) {
    //             cell.left -= realFieldSize;
    //         } else {
    //             cell.top += realFieldSize;
    //         }
    //     }
    //
    //     return cell;
    // },

    // processCellDataPosition(
    //     {fieldSize},
    //     basePosition,
    //     dataSet,
    //     dataIndex,
    //     positionFunction,
    //     cellPosition?
    // ): PositionWithAngle | undefined {
    //     const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);
    //
    //     const position = basePosition;
    //     if (!position || !cellPosition || cellPosition.top * 2 >= rowsCount) {
    //         return position;
    //     }
    //
    //     return {
    //         left: (position.left + position.top) * 0.6,
    //         top: (position.top - position.left) * 0.6,
    //         angle: position.angle - 45,
    //     };
    // },

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

    // getRegionsForRowsAndColumns({fieldSize: {fieldSize}}) {
    //     const realFieldSize = fieldSize / 2;
    //
    //     if (continuousRowColumnRegions) {
    //         return indexes(realFieldSize).flatMap(i => [
    //             RegionConstraint(
    //                 indexes(fieldSize).map(j => ({left: i, top: j})),
    //                 false,
    //                 "column"
    //             ),
    //             RegionConstraint(
    //                 indexes(realFieldSize).flatMap(j => [
    //                     {left: j, top: i},
    //                     {left: fieldSize - 1 - i, top: j + realFieldSize},
    //                 ]),
    //                 false,
    //                 "row"
    //             ),
    //             RegionConstraint(
    //                 indexes(fieldSize).map(j => ({left: j, top: i + realFieldSize})),
    //                 false,
    //                 "row"
    //             ),
    //         ]);
    //     } else {
    //         const cubeFaces: Position[] = [
    //             {left: 0, top: 0},
    //             {left: 0, top: realFieldSize},
    //             {left: realFieldSize, top: realFieldSize},
    //         ];
    //
    //         return cubeFaces.flatMap(({left, top}) => indexes(realFieldSize).flatMap(i => [
    //             RegionConstraint(indexes(realFieldSize).map(j => ({left: left + i, top: top + j})), false, "column"),
    //             RegionConstraint(indexes(realFieldSize).map(j => ({left: left + j, top: top + i})), false, "row"),
    //         ]));
    //     }
    // },

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

export const createMonumentValleyFieldSize = (
    gridSize: number,
    regionSize: number,
    intersectionSize = regionSize,
): FieldSize => {
    const columnsCount = gridSize * 3 - intersectionSize * 2;
    const regions = createRegularRegions(gridSize, gridSize, regionSize, regionSize);

    return {
        fieldSize: columnsCount,
        columnsCount,
        rowsCount: gridSize * 2 - intersectionSize,
        regions: [
            ...regions,
            ...regions.map((region) => region.map(({top, left}) => ({
                top: top + gridSize - intersectionSize,
                left: left + gridSize - intersectionSize,
            }))),
            ...regions.map((region) => region.map(({top, left}) => ({
                top,
                left: top < intersectionSize && left < intersectionSize
                    ? left + gridSize - intersectionSize
                    : left + columnsCount - gridSize,
            }))),
        ]
    };
};

export const parseMonumentValleyFieldSize = ({columnsCount, rowsCount}: FieldSize) => ({
    columnsCount,
    rowsCount,
    gridSize: rowsCount * 2 - columnsCount,
    intersectionSize: rowsCount * 3 - columnsCount * 2,
});
