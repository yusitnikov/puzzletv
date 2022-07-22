import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {createRegularRegions, FieldSize} from "../../../types/sudoku/FieldSize";
import {Position, PositionWithAngle} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";
import {darkGreyColor} from "../../../components/app/globals";
import {indexes} from "../../../utils/indexes";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";

export const CubeTypeManager = (continuousRowColumnRegions: boolean): SudokuTypeManager<number> => ({
    ...DigitSudokuTypeManager(),

    isValidCell({top, left}, {fieldSize: {rowsCount, columnsCount}}): boolean {
        return left * 2 < columnsCount || top * 2 >= rowsCount;
    },

    processArrowDirection(
        cell,
        xDirection,
        yDirection,
        context
    ) {
        const realFieldSize = context.puzzle.fieldSize.fieldSize / 2;

        cell = defaultProcessArrowDirection(cell, xDirection, yDirection, context)!;

        if (cell.left >= realFieldSize && cell.top < realFieldSize) {
            if (xDirection) {
                cell.left -= realFieldSize;
            } else {
                cell.top += realFieldSize;
            }
        }

        return cell;
    },

    processCellDataPosition(
        {fieldSize: {fieldSize}},
        basePosition,
        dataSet,
        dataIndex,
        positionFunction,
        cellPosition?
    ): PositionWithAngle | undefined {
        const position = basePosition;
        if (!position || !cellPosition || cellPosition.top * 2 >= fieldSize) {
            return position;
        }

        return {
            left: (position.left + position.top) * 0.6,
            top: (position.top - position.left) * 0.6,
            angle: position.angle - 45,
        };
    },

    transformCoords({top, left}, {fieldSize: {fieldSize}}) {
        const realFieldSize = fieldSize / 2;

        if (top < realFieldSize) {
            return {
                left: realFieldSize + left - top,
                top: (left + top) / 2,
            };
        }

        return {
            left: left,
            top: top - Math.abs(left - realFieldSize) / 2,
        };
    },

    getRegionsWithSameCoordsTransformation({fieldSize: {fieldSize}, fieldMargin = 0}): Rect[] {
        const realFieldSize = fieldSize / 2;
        const fullMargin = fieldMargin + fieldSize;

        return [
            {
                left: -fullMargin,
                top: -fullMargin,
                width: realFieldSize + fullMargin,
                height: realFieldSize + fullMargin,
            },
            {
                left: -fullMargin,
                top: realFieldSize,
                width: realFieldSize + fullMargin,
                height: realFieldSize + fullMargin,
            },
            {
                left: realFieldSize,
                top: realFieldSize,
                width: realFieldSize + fullMargin,
                height: realFieldSize + fullMargin,
            },
        ];
    },

    getRegionsForRowsAndColumns({fieldSize: {fieldSize}}) {
        const realFieldSize = fieldSize / 2;

        if (continuousRowColumnRegions) {
            return indexes(realFieldSize).flatMap(i => [
                RegionConstraint(
                    indexes(fieldSize).map(j => ({left: i, top: j})),
                    false,
                    "column"
                ),
                RegionConstraint(
                    indexes(realFieldSize).flatMap(j => [
                        {left: j, top: i},
                        {left: fieldSize - 1 - i, top: j + realFieldSize},
                    ]),
                    false,
                    "row"
                ),
                RegionConstraint(
                    indexes(fieldSize).map(j => ({left: j, top: i + realFieldSize})),
                    false,
                    "row"
                ),
            ]);
        } else {
            const cubeFaces: Position[] = [
                {left: 0, top: 0},
                {left: 0, top: realFieldSize},
                {left: realFieldSize, top: realFieldSize},
            ];

            return cubeFaces.flatMap(({left, top}) => indexes(realFieldSize).flatMap(i => [
                RegionConstraint(indexes(realFieldSize).map(j => ({left: left + i, top: top + j})), false, "column"),
                RegionConstraint(indexes(realFieldSize).map(j => ({left: left + j, top: top + i})), false, "row"),
            ]));
        }
    },

    getAdditionalNeighbors({top, left}, {fieldSize: {fieldSize}}) {
        const realFieldSize = fieldSize / 2;

        if (continuousRowColumnRegions) {
            if (left === realFieldSize - 1 && top < realFieldSize) {
                return [{
                    top: realFieldSize,
                    left: fieldSize - 1 - top,
                }];
            }

            if (top === realFieldSize && left >= realFieldSize) {
                return [{
                    top: fieldSize - 1 - left,
                    left: realFieldSize - 1,
                }];
            }
        }

        return [];
    },

    borderColor: darkGreyColor,
});

export const createCubeFieldSize = (fieldSize: number, regionWidth: number, regionHeight = fieldSize / regionWidth): FieldSize => ({
    fieldSize: fieldSize * 2,
    rowsCount: fieldSize * 2,
    columnsCount: fieldSize * 2,
    regions: createRegularRegions(fieldSize * 2, fieldSize * 2, regionWidth, regionHeight)
        .filter(([{left, top}]) => left < fieldSize || top >= fieldSize)
});
