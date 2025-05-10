import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { createRegularRegions, GridSize } from "../../../types/puzzle/GridSize";
import {
    getLineVector,
    Position,
    PositionWithAngle,
    rotateVectorClockwise,
    scaleVector,
} from "../../../types/layout/Position";
import { Rect } from "../../../types/layout/Rect";
import { darkGreyColor } from "../../../components/app/globals";
import { indexes } from "../../../utils/indexes";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { Constraint } from "../../../types/puzzle/Constraint";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";
import { FullCubePTM } from "./FullCubePTM";
import { gameStateHandleRotateFullCube } from "./FullCubeGameState";
import {
    getClosestAxis3D,
    initialCoordsBase3D,
    normalizeVector3D,
    Position3D,
    roundVector3D,
    scalarMultiplication3D,
    subtractVectors3D,
    vectorMultiplication3D,
} from "../../../types/layout/Position3D";
import { AnimatedValue } from "../../../types/struct/AnimatedValue";
import { settings } from "../../../types/layout/Settings";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { FullCubeControls } from "../components/FullCubeControls";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { FullCubeJssConstraint } from "../constraints/FullCubeJss";
import { transformFullCubeCoords3D } from "../helpers/fullCubeHelpers";
import { vector4 } from "xyzw";
import { addGameStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

/*
 * TODO:
 * - Fix rotation animation
 * - Support bigger JSS clues.
 */

export const FullCubeTypeManager = (): PuzzleTypeManager<FullCubePTM> => ({
    ...addGameStateExToPuzzleTypeManager(DigitPuzzleTypeManager<FullCubePTM>(), {
        initialGameStateExtension: {
            coordsBase: initialCoordsBase3D,
        },
    }),

    ignoreRowsColumnCountInTheWrapper: true,
    gridControlsComponent: FullCubeControls,

    getCellTypeProps({ top }, { gridSize: { columnsCount } }): CellTypeProps<FullCubePTM> {
        const realGridSize = columnsCount / 3;
        return { isSelectable: top < realGridSize * 2 };
    },

    processCellDataPosition(
        context,
        basePosition,
        _dataSet,
        _dataIndex,
        _positionFunction,
        cellPosition,
    ): PositionWithAngle | undefined {
        const {
            puzzle: {
                typeManager: { transformCoords },
            },
        } = context;

        if (!basePosition || !cellPosition) {
            return basePosition;
        }

        const [p0, p1, p2] = [
            { top: 0.5, left: 0.5 },
            { top: 0.5, left: 0.6 },
            { top: 0.6, left: 0.5 },
        ]
            .map(({ top, left }) => ({
                top: cellPosition.top + top,
                left: cellPosition.left + left,
            }))
            .map((point) => transformCoords?.(point, context) ?? point);
        const v1 = getLineVector({ start: p0, end: p1 });
        const v2 = getLineVector({ start: p0, end: p2 });

        const bestAngle = indexes(8)
            .map((index) => {
                const angle = index * 45;

                const { left: c1, top: c2 } = rotateVectorClockwise({ left: 0, top: 1 }, angle);

                return {
                    angle,
                    x: Math.abs(v1.left * c1 + v2.left * c2),
                    y: v1.top * c1 + v2.top * c2,
                };
            })
            .filter(({ y }) => y >= 0)
            .sort((a, b) => Math.sign(a.x - b.x))[0].angle;

        return {
            ...scaleVector(rotateVectorClockwise(basePosition, bestAngle), bestAngle % 90 === 0 ? 1 : 0.9),
            angle: basePosition.angle + bestAngle,
        };
    },

    transformCoords(position, context) {
        const {
            puzzle: {
                gridSize: { columnsCount },
            },
        } = context;
        const realGridSize = columnsCount / 3;

        const { x, y, z } = transformFullCubeCoords3D(position, context);

        return {
            left: realGridSize + x - z,
            top: realGridSize + y + x / 2 + z / 2,
        };
    },

    getRegionsWithSameCoordsTransformation(context): GridRegion[] {
        const {
            puzzle: {
                typeManager: { transformCoords },
                gridSize: { columnsCount },
            },
        } = context;

        const realGridSize = columnsCount / 3;

        return [0, 1, 2].flatMap((left) =>
            [0, 1, 2].map((top): GridRegion => {
                const rect: Rect = {
                    left: realGridSize * left,
                    top: realGridSize * top,
                    width: realGridSize,
                    height: realGridSize,
                };

                // Get projections of the rect points onto the screen
                // (use inner points of the rect because transformCoords may fail on exact region borders)
                const [p0, p1, p2] = [
                    { top: 0.1, left: 0.1 },
                    { top: 0.1, left: 0.9 },
                    { top: 0.9, left: 0.1 },
                ]
                    .map(({ top, left }) => ({
                        top: rect.top + rect.width * top,
                        left: rect.left + rect.height * left,
                    }))
                    .map((point) => transformCoords?.(point, context) ?? point);
                const v1 = getLineVector({ start: p0, end: p1 });
                const v2 = getLineVector({ start: p0, end: p2 });
                const isVisible =
                    vectorMultiplication3D(
                        {
                            x: v1.left,
                            y: v1.top,
                            z: 0,
                        },
                        {
                            x: v2.left,
                            y: v2.top,
                            z: 0,
                        },
                    ).z > 0;

                return {
                    ...rect,
                    opacity: isVisible ? 1 : 0.1,
                    zIndex: isVisible ? 2 : 1,
                    // noBorders: top === 2,
                    noInteraction: top === 2,
                };
            }),
        );
    },

    getRegionsForRowsAndColumns({
        puzzle: {
            gridSize: { columnsCount },
        },
    }): Constraint<FullCubePTM, any>[] {
        const realGridSize = columnsCount / 3;

        return [0, 1, 2].flatMap((left) =>
            [0, 1].flatMap((top) =>
                indexes(realGridSize).flatMap((i) => [
                    RegionConstraint(
                        indexes(realGridSize).map((j) => ({
                            left: left * realGridSize + i,
                            top: top * realGridSize + j,
                        })),
                        false,
                        "column",
                    ),
                    RegionConstraint(
                        indexes(realGridSize).map((j) => ({
                            left: left * realGridSize + j,
                            top: top * realGridSize + i,
                        })),
                        false,
                        "row",
                    ),
                ]),
            ),
        );
    },

    processArrowDirection({ top, left }, xDirection, yDirection, context) {
        const {
            puzzle: {
                gridSize: { columnsCount },
            },
        } = context;
        const realGridSize = columnsCount / 3;

        const cellCenter: Position = { top: top + 0.5, left: left + 0.5 };
        const cellCenter3D = transformFullCubeCoords3D(cellCenter, context, false);
        const dx = roundVector3D(
            normalizeVector3D(
                subtractVectors3D(
                    transformFullCubeCoords3D({ top: cellCenter.top, left: cellCenter.left + 0.1 }, context, false),
                    cellCenter3D,
                ),
            ),
        );
        const dy = roundVector3D(
            normalizeVector3D(
                subtractVectors3D(
                    transformFullCubeCoords3D({ top: cellCenter.top + 0.1, left: cellCenter.left }, context, false),
                    cellCenter3D,
                ),
            ),
        );

        const cellDirection3D = getClosestAxis3D(cellCenter3D);

        let direction3D: Position3D;
        if (cellDirection3D.x !== 0) {
            direction3D = { x: 0, y: yDirection, z: -xDirection };
        } else if (cellDirection3D.y !== 0) {
            direction3D = { x: xDirection, y: 0, z: yDirection };
        } else {
            direction3D = { x: xDirection, y: yDirection, z: 0 };
        }

        xDirection = Math.round(scalarMultiplication3D(direction3D, dx));
        yDirection = Math.round(scalarMultiplication3D(direction3D, dy));

        let newTop = top + yDirection;
        let newLeft = left + xDirection;

        const faceX = Math.floor(left / realGridSize);

        if (top < realGridSize) {
            if (newLeft < 0 || newLeft >= realGridSize * 3) {
                newTop += realGridSize;
                newLeft = (newLeft + realGridSize) % realGridSize;
            } else if (newTop < 0) {
                switch (faceX) {
                    case 0:
                        newTop = realGridSize * 2 - 1;
                        newLeft += realGridSize;
                        break;
                    case 1:
                        newTop = realGridSize * 3 - 1 - newLeft;
                        newLeft = realGridSize * 2 - 1;
                        break;
                    case 2:
                        newTop = realGridSize;
                        newLeft = realGridSize * 4 - 1 - newLeft;
                        break;
                }
            } else if (newTop >= realGridSize) {
                switch (faceX) {
                    case 0:
                        newLeft += realGridSize * 2;
                        break;
                    case 1:
                        // noinspection JSSuspiciousNameCombination
                        newTop = newLeft;
                        newLeft = realGridSize * 3 - 1;
                        break;
                    case 2:
                        newTop = realGridSize * 2 - 1;
                        newLeft = realGridSize * 5 - 1 - newLeft;
                        break;
                }
            }
        } else {
            switch (faceX) {
                case 0:
                    if (newLeft < 0) {
                        newTop -= realGridSize;
                        newLeft = realGridSize * 3 - 1;
                    } else if (newLeft >= realGridSize) {
                        newTop -= realGridSize;
                        newLeft = 0;
                    } else if (newTop < realGridSize) {
                        newTop = realGridSize + newLeft;
                        newLeft = realGridSize;
                    } else if (newTop >= realGridSize * 2) {
                        newTop = realGridSize * 2 - 1 - newLeft;
                        newLeft = realGridSize * 2;
                    }
                    break;
                case 1:
                    if (newLeft < realGridSize) {
                        newLeft = newTop - realGridSize;
                        newTop = realGridSize;
                    } else if (newLeft >= realGridSize * 2) {
                        newLeft = realGridSize * 3 - 1 - newTop;
                        newTop = 0;
                    } else if (newTop < realGridSize) {
                        newTop = 0;
                        newLeft = realGridSize * 4 - 1 - newLeft;
                    } else if (newTop >= realGridSize * 2) {
                        newTop = 0;
                        newLeft -= realGridSize;
                    }
                    break;
                case 2:
                    if (newLeft < realGridSize * 2) {
                        newLeft = realGridSize * 2 - 1 - newTop;
                        newTop = realGridSize * 2 - 1;
                    } else if (newLeft >= realGridSize * 3) {
                        // noinspection JSSuspiciousNameCombination
                        newLeft = newTop;
                        newTop = realGridSize - 1;
                    } else if (newTop < realGridSize) {
                        newTop = realGridSize - 1;
                        newLeft -= realGridSize * 2;
                    } else if (newTop >= realGridSize * 2) {
                        newTop = realGridSize - 1;
                        newLeft = realGridSize * 5 - 1 - newLeft;
                    }
                    break;
            }
        }

        const newCellDirection3D = getClosestAxis3D(
            transformFullCubeCoords3D({ top: newTop + 0.5, left: newLeft + 0.5 }, context, false),
        );

        // How good is the axis for the UI?
        const [axisRank, newAxisRank] = [cellDirection3D, newCellDirection3D].map(({ x, y, z }: Position3D) =>
            x < 0 || y > 0 || z < 0 ? 0 : y < 0 ? 1 : 2,
        );

        return {
            state:
                newAxisRank < axisRank
                    ? gameStateHandleRotateFullCube(
                          context,
                          vectorMultiplication3D(newCellDirection3D, cellDirection3D),
                          90,
                      )
                    : undefined,
            cell: { top: newTop, left: newLeft },
        };
    },

    borderColor: darkGreyColor,

    mapImportedColors: true,

    postProcessPuzzle(puzzle): PuzzleDefinition<FullCubePTM> {
        const {
            gridSize: { rowsCount, columnsCount },
            gridMargin = 0,
            allowDrawing,
            items,
        } = puzzle;

        const realGridSize = columnsCount / 3;

        const isJss = Array.isArray(items) && items.includes(FullCubeJssConstraint);

        return {
            ...puzzle,
            gridSize: {
                ...puzzle.gridSize,
                gridSize: realGridSize * 2,
                rowsCount: isJss ? columnsCount : rowsCount,
            },
            gridMargin: Math.max(gridMargin, realGridSize),
            allowDrawing: allowDrawing?.filter((item) => item === "center-mark"),
        };
    },

    saveStateKeySuffix: "v2",
});

export const createFullCubeGridSize = (gridSize: number, withJss = false): GridSize => ({
    gridSize: gridSize * 2,
    rowsCount: gridSize * (withJss ? 3 : 2),
    columnsCount: gridSize * 3,
});

export const createFullCubeRegions = (gridSize: number, regionWidth: number, regionHeight = gridSize / regionWidth) => {
    const regions = createRegularRegions(gridSize, gridSize, regionWidth, regionHeight);
    return [0, 1, 2].flatMap((leftQuad) =>
        [0, 1].flatMap((topQuad) =>
            regions.map((region) =>
                region.map(({ top, left }) => ({
                    top: topQuad * gridSize + top,
                    left: leftQuad * gridSize + left,
                })),
            ),
        ),
    );
};

export const getFullCubeAnimatedCoordsBase = (context: PuzzleContext<FullCubePTM>) =>
    context.getCachedItem(
        "animatedCoordsBase",
        () =>
            new AnimatedValue(
                () => context.stateExtension.coordsBase,
                () => settings.animationSpeed.get(),
                (a, b, coeff) => {
                    // See https://en.wikipedia.org/wiki/Slerp
                    const result = vector4.RotationSlerp(a, b, coeff);
                    // RotationSlerp() may fail on some edge cases, fallback to the end point in this case
                    return Number.isFinite(result.w) ? result : b;
                },
            ),
    ).animatedValue;
