import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { CustomCellBounds } from "../../../types/puzzle/CustomCellBounds";
import { getRectPoints, Rect } from "../../../types/layout/Rect";
import { GridRegion, transformCoordsByRegions } from "../../../types/puzzle/GridRegion";
import { Position } from "../../../types/layout/Position";
import { Constraint } from "../../../types/puzzle/Constraint";
import { indexes } from "../../../utils/indexes";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { InfiniteRingsGridControls } from "../components/InfiniteRingsGridControls";
import { gameStateSetScaleLog, PartialGameStateEx } from "../../../types/puzzle/GameState";
import { loop } from "../../../utils/math";
import { InfiniteRingsBorderLinesConstraint } from "../components/InfiniteRingsBorderLines";
import { isShowingAllInfiniteRings } from "./InfiniteRingsLayout";
import { ZoomInButtonItem, ZoomOutButtonItem } from "../../../components/puzzle/controls/ZoomButton";
import { InfiniteRingsSettings } from "../components/InfiniteRingsSettings";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";

/*
 * TODO:
 * - make the white dots white again!
 * - support killer cages
 */

const coordsRingToPlain = (gridSize: number, ring: number, index: number) =>
    [ring, gridSize / 2 - 1, gridSize / 2, gridSize - 1 - ring][index];
const coordsPlainToRing = (gridSize: number, { top, left }: Position) => {
    const quadSize = gridSize / 2;
    const getIndex = (x: number) => {
        if (x === quadSize - 1) {
            return 1;
        }
        if (x === quadSize) {
            return 2;
        }
        return x < quadSize ? 0 : 3;
    };
    return {
        ring: Math.min(top, left, gridSize - 1 - top, gridSize - 1 - left),
        top: getIndex(top),
        left: getIndex(left),
    };
};

export const InfiniteRingsTypeManager = <T extends AnyPTM>(
    baseTypeManager: PuzzleTypeManager<T>,
    visibleRingsCountArg = 2,
    startRingOffset = 0,
): PuzzleTypeManager<T> => {
    return {
        ...baseTypeManager,
        scaleStep: 2,
        initialScale: Math.pow(2, startRingOffset),
        allowScale: true,
        isFreeScale: false,
        ignoreRowsColumnCountInTheWrapper: true,
        gridWrapperHandlesScale: true,
        gridControlsComponent: InfiniteRingsGridControls(visibleRingsCountArg),
        controlButtons: [ZoomInButtonItem(), ZoomOutButtonItem()],
        getCellTypeProps({ top, left }, { gridSize: { rowsCount: gridSize } }): CellTypeProps<T> {
            const quadSize = gridSize / 2;
            const ringsCount = quadSize - 1;
            const { ring } = coordsPlainToRing(gridSize, { top, left });
            const isCenterTop = top === quadSize - 1 || top === quadSize;
            const isCenterLeft = left === quadSize - 1 || left === quadSize;

            return {
                isVisible:
                    (top === left || top + left === gridSize - 1 || isCenterTop || isCenterLeft) &&
                    !(isCenterTop && isCenterLeft),
                isVisibleForState: (context) => {
                    const { animatedScaleLog: ringOffset } = context;
                    return (
                        isShowingAllInfiniteRings(context, visibleRingsCountArg) ||
                        loop(ring + 0.5 - ringOffset, ringsCount) < visibleRingsCountArg
                    );
                },
            };
        },
        processArrowDirection({ top, left }, xDirection, yDirection, context) {
            const {
                puzzle: {
                    gridSize: { rowsCount: gridSize },
                },
                scaleLog,
            } = context;

            const ringOffset = Math.round(scaleLog);

            const processRightArrow = (position: Position): { cell: Position; state?: PartialGameStateEx<T> } => {
                const ringsCount = gridSize / 2 - 1;
                const visibleRingsCount = isShowingAllInfiniteRings(context, visibleRingsCountArg)
                    ? ringsCount
                    : visibleRingsCountArg;

                let { ring, top, left } = coordsPlainToRing(gridSize, position);

                let newRingOffset = ringOffset;
                ring = loop(ring - ringOffset, ringsCount);

                if (left === 3) {
                    ring--;
                    if (ring < 0) {
                        newRingOffset--;
                    }
                    top = top < 2 ? 1 : 2;
                } else if ([0, 3].includes(top)) {
                    left++;
                } else {
                    ring++;
                    if (ring >= visibleRingsCount) {
                        newRingOffset++;
                    }
                    top = top < 2 ? 0 : 3;
                }

                ring = loop(ring + ringOffset, ringsCount);

                return {
                    cell: {
                        top: coordsRingToPlain(gridSize, ring, top),
                        left: coordsRingToPlain(gridSize, ring, left),
                    },
                    state: gameStateSetScaleLog<T>(newRingOffset, false)(context),
                };
            };

            if (xDirection) {
                if (xDirection > 0) {
                    // right
                    return processRightArrow({ top, left });
                } else {
                    // left
                    const {
                        cell: { top: newTop, left: newLeft },
                        state,
                    } = processRightArrow({ top, left: gridSize - 1 - left });
                    return { cell: { top: newTop, left: gridSize - 1 - newLeft }, state };
                }
            } else {
                const processDownArrow = ({ top, left }: Position) => {
                    // noinspection JSSuspiciousNameCombination
                    const {
                        cell: { top: newTop, left: newLeft },
                        state,
                    } = processRightArrow({ top: left, left: top });
                    // noinspection JSSuspiciousNameCombination
                    return { cell: { top: newLeft, left: newTop }, state };
                };

                if (yDirection > 0) {
                    // down
                    return processDownArrow({ top, left });
                } else {
                    // up
                    const {
                        cell: { top: newTop, left: newLeft },
                        state,
                    } = processDownArrow({ top: gridSize - 1 - top, left });
                    return { cell: { top: gridSize - 1 - newTop, left: newLeft }, state };
                }
            }
        },
        transformCoords: transformCoordsByRegions,
        getRegionsWithSameCoordsTransformation({
            puzzle: {
                gridSize: { rowsCount: gridSize },
            },
            animatedScaleLog: ringOffset,
        }): GridRegion[] {
            const ringsCount = gridSize / 2 - 1;
            const loopedRingOffset = loop(ringOffset, ringsCount);
            const scaleCoeff = Math.pow(2, loopedRingOffset);
            const unscaleCoeff = Math.pow(2, ringsCount);

            return [
                {
                    top: 2 - 2 / scaleCoeff,
                    left: 2 - 2 / scaleCoeff,
                    width: 4 / scaleCoeff,
                    height: 4 / scaleCoeff,
                    transformCoords: ({ top, left }) => ({
                        top: (top - 2) * scaleCoeff + 2,
                        left: (left - 2) * scaleCoeff + 2,
                    }),
                },
                {
                    top: 0,
                    left: 0,
                    width: 4,
                    height: 4,
                    transformCoords: ({ top, left }) => ({
                        top: ((top - 2) * scaleCoeff) / unscaleCoeff + 2,
                        left: ((left - 2) * scaleCoeff) / unscaleCoeff + 2,
                    }),
                },
            ];
        },
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            const gridSize = puzzle.gridSize.rowsCount;
            const quadSize = gridSize / 2;
            const ringsCount = quadSize - 1;
            const customCellBounds: CellsMap<CustomCellBounds> = {};
            for (let ring = 0; ring < ringsCount; ring++) {
                const scale = Math.pow(0.5, ring);
                const offset = 2 * (1 - scale);
                for (let top = 0; top < 4; top++) {
                    const topIndex = coordsRingToPlain(gridSize, ring, top);
                    for (let left = 0; left < 4; left++) {
                        const leftIndex = coordsRingToPlain(gridSize, ring, left);
                        if ([0, 3].includes(top) || [0, 3].includes(left)) {
                            const cellRect: Rect = {
                                top: offset + top * scale,
                                left: offset + left * scale,
                                width: scale,
                                height: scale,
                            };

                            customCellBounds[topIndex] = customCellBounds[topIndex] || {};
                            customCellBounds[topIndex][leftIndex] = {
                                borders: [getRectPoints(cellRect)],
                                userArea: cellRect,
                            };
                        }
                    }
                }
            }
            return {
                ...puzzle,
                maxDigit: visibleRingsCountArg * 3,
                gridSize: {
                    ...puzzle.gridSize,
                    gridSize: 4,
                },
                regions: [],
                customCellBounds,
                allowDrawing: puzzle.allowDrawing?.filter((type) => ["center-mark"].includes(type)),
            };
        },
        fixCellPosition(position, { gridSize: { rowsCount: gridSize } }): Position | undefined {
            const { ring, top, left } = coordsPlainToRing(gridSize, position);
            return {
                top: coordsRingToPlain(gridSize, ring, top),
                left: coordsRingToPlain(gridSize, ring, left),
            };
        },
        getRegionsForRowsAndColumns({
            puzzle: {
                gridSize: { rowsCount: gridSize },
            },
        }): Constraint<T, any>[] {
            const quadsCount = gridSize / 2 - 1;
            return indexes(quadsCount).flatMap((outerRing) => {
                const createRegion = (cells: (Position & { ring: number })[]) =>
                    RegionConstraint<T>(
                        cells.map(({ ring: ringOffset, top, left }) => {
                            const ring = loop(outerRing + ringOffset, quadsCount);
                            return {
                                top: coordsRingToPlain(gridSize, ring, top),
                                left: coordsRingToPlain(gridSize, ring, left),
                            };
                        }),
                        false,
                    );
                // noinspection JSSuspiciousNameCombination
                const createRowColumnRegions = (cells: (Position & { ring: number })[]) => [
                    createRegion(cells),
                    createRegion(
                        cells.map(({ top, left, ring }) => ({
                            top: left,
                            left: top,
                            ring,
                        })),
                    ),
                    createRegion(
                        cells.map(({ top, left, ring }) => ({
                            top: 3 - top,
                            left,
                            ring,
                        })),
                    ),
                    createRegion(
                        cells.map(({ top, left, ring }) => ({
                            top: left,
                            left: 3 - top,
                            ring,
                        })),
                    ),
                ];
                const createQuadRegion = (cells: Position[]) =>
                    createRegion(
                        indexes(visibleRingsCountArg).flatMap((ring) => cells.map((cell) => ({ ...cell, ring }))),
                    );
                return [
                    ...indexes(visibleRingsCountArg, true).flatMap((ring) =>
                        createRowColumnRegions([
                            ...indexes(ring === visibleRingsCountArg ? 0 : 4).map((left) => ({ top: 0, left, ring })),
                            ...indexes(ring).flatMap((ring2) => [0, 3].map((left) => ({ top: 1, left, ring: ring2 }))),
                        ]),
                    ),
                    createQuadRegion([
                        { top: 0, left: 0 },
                        { top: 0, left: 1 },
                        { top: 1, left: 0 },
                    ]),
                    createQuadRegion([
                        { top: 0, left: 2 },
                        { top: 0, left: 3 },
                        { top: 1, left: 3 },
                    ]),
                    createQuadRegion([
                        { top: 2, left: 0 },
                        { top: 3, left: 0 },
                        { top: 3, left: 1 },
                    ]),
                    createQuadRegion([
                        { top: 2, left: 3 },
                        { top: 3, left: 2 },
                        { top: 3, left: 3 },
                    ]),
                ];
            });
        },
        items: [InfiniteRingsBorderLinesConstraint(visibleRingsCountArg)],
        settingsComponents: [InfiniteRingsSettings(visibleRingsCountArg)],
    };
};
