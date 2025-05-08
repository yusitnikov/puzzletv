import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { createRegularRegions, GridSize } from "../../../types/puzzle/GridSize";
import { Position, PositionWithAngle } from "../../../types/layout/Position";
import { Rect } from "../../../types/layout/Rect";
import { darkGreyColor } from "../../../components/app/globals";
import { indexes } from "../../../utils/indexes";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { Constraint } from "../../../types/puzzle/Constraint";
import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";

export const CubeTypeManager = (continuousRowColumnRegions: boolean): PuzzleTypeManager<NumberPTM> => ({
    ...DigitPuzzleTypeManager(),

    getCellTypeProps({ top, left }, { gridSize: { rowsCount, columnsCount } }): CellTypeProps<NumberPTM> {
        return { isVisible: left * 2 < columnsCount || top * 2 >= rowsCount };
    },

    processCellDataPosition(
        {
            puzzle: {
                gridSize: { gridSize },
            },
        },
        basePosition,
        dataSet,
        dataIndex,
        positionFunction,
        cellPosition,
    ): PositionWithAngle | undefined {
        const position = basePosition;
        if (!position || !cellPosition || cellPosition.top * 2 >= gridSize) {
            return position;
        }

        return {
            left: (position.left + position.top) * 0.6,
            top: (position.top - position.left) * 0.6,
            angle: position.angle - 45,
        };
    },

    transformCoords(
        { top, left },
        {
            puzzle: {
                gridSize: { gridSize },
            },
        },
    ) {
        const realGridSize = gridSize / 2;

        if (top < realGridSize) {
            return {
                left: realGridSize + left - top,
                top: (left + top) / 2,
            };
        }

        return {
            left: left,
            top: top - Math.abs(left - realGridSize) / 2,
        };
    },

    getRegionsWithSameCoordsTransformation({
        puzzle: {
            gridSize: { gridSize },
            gridMargin = 0,
        },
    }): Rect[] {
        const realGridSize = gridSize / 2;
        const fullMargin = gridMargin + gridSize;

        return [
            {
                left: -fullMargin,
                top: -fullMargin,
                width: realGridSize + fullMargin,
                height: realGridSize + fullMargin,
            },
            {
                left: -fullMargin,
                top: realGridSize,
                width: realGridSize + fullMargin,
                height: realGridSize + fullMargin,
            },
            {
                left: realGridSize,
                top: realGridSize,
                width: realGridSize + fullMargin,
                height: realGridSize + fullMargin,
            },
        ];
    },

    getRegionsForRowsAndColumns({
        puzzle: {
            gridSize: { gridSize },
        },
    }): Constraint<NumberPTM, any>[] {
        const realGridSize = gridSize / 2;

        if (continuousRowColumnRegions) {
            return indexes(realGridSize).flatMap((i) => [
                RegionConstraint(
                    indexes(gridSize).map((j) => ({ left: i, top: j })),
                    false,
                    "column",
                ),
                RegionConstraint(
                    indexes(realGridSize).flatMap((j) => [
                        { left: j, top: i },
                        { left: gridSize - 1 - i, top: j + realGridSize },
                    ]),
                    false,
                    "row",
                ),
                RegionConstraint(
                    indexes(gridSize).map((j) => ({ left: j, top: i + realGridSize })),
                    false,
                    "row",
                ),
            ]);
        } else {
            const cubeFaces: Position[] = [
                { left: 0, top: 0 },
                { left: 0, top: realGridSize },
                { left: realGridSize, top: realGridSize },
            ];

            return cubeFaces.flatMap(({ left, top }) =>
                indexes(realGridSize).flatMap((i) => [
                    RegionConstraint(
                        indexes(realGridSize).map((j) => ({ left: left + i, top: top + j })),
                        false,
                        "column",
                    ),
                    RegionConstraint(
                        indexes(realGridSize).map((j) => ({ left: left + j, top: top + i })),
                        false,
                        "row",
                    ),
                ]),
            );
        }
    },

    getAdditionalNeighbors({ top, left }, { gridSize: { gridSize } }) {
        const realGridSize = gridSize / 2;

        if (continuousRowColumnRegions) {
            if (left === realGridSize - 1 && top < realGridSize) {
                return [
                    {
                        top: realGridSize,
                        left: gridSize - 1 - top,
                    },
                ];
            }

            if (top === realGridSize && left >= realGridSize) {
                return [
                    {
                        top: gridSize - 1 - left,
                        left: realGridSize - 1,
                    },
                ];
            }
        }

        return [];
    },

    borderColor: darkGreyColor,
});

export const createCubeGridSize = (gridSize: number): GridSize => ({
    gridSize: gridSize * 2,
    rowsCount: gridSize * 2,
    columnsCount: gridSize * 2,
});

export const createCubeRegions = (gridSize: number, regionWidth: number, regionHeight = gridSize / regionWidth) =>
    createRegularRegions(gridSize * 2, gridSize * 2, regionWidth, regionHeight).filter(
        ([{ left, top }]) => left < gridSize || top >= gridSize,
    );
