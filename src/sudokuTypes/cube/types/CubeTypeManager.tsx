import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {createRegularRegions, FieldSize} from "../../../types/sudoku/FieldSize";
import {Position, PositionWithAngle} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";
import {darkGreyColor} from "../../../components/app/globals";
import {indexes} from "../../../utils/indexes";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {Constraint} from "../../../types/sudoku/Constraint";
import {NumberPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {CellTypeProps} from "../../../types/sudoku/CellTypeProps";

export const CubeTypeManager = (continuousRowColumnRegions: boolean): SudokuTypeManager<NumberPTM> => ({
    ...DigitSudokuTypeManager(),

    getCellTypeProps({top, left}, {fieldSize: {rowsCount, columnsCount}}): CellTypeProps<NumberPTM> {
        return {isVisible: left * 2 < columnsCount || top * 2 >= rowsCount};
    },

    processCellDataPosition(
        {puzzle: {fieldSize: {fieldSize}}},
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

    transformCoords({top, left}, {puzzle: {fieldSize: {fieldSize}}}) {
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

    getRegionsWithSameCoordsTransformation({puzzle: {fieldSize: {fieldSize}, fieldMargin = 0}}): Rect[] {
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

    getRegionsForRowsAndColumns({fieldSize: {fieldSize}}): Constraint<NumberPTM, any>[] {
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

export const createCubeFieldSize = (fieldSize: number): FieldSize => ({
    fieldSize: fieldSize * 2,
    rowsCount: fieldSize * 2,
    columnsCount: fieldSize * 2,
});

export const createCubeRegions = (fieldSize: number, regionWidth: number, regionHeight = fieldSize / regionWidth) =>
    createRegularRegions(fieldSize * 2, fieldSize * 2, regionWidth, regionHeight)
        .filter(([{left, top}]) => left < fieldSize || top >= fieldSize);
