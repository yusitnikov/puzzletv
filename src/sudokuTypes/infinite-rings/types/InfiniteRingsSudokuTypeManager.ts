import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {CustomCellBounds} from "../../../types/sudoku/CustomCellBounds";
import {getRectPoints, Rect, RectWithTransformation} from "../../../types/layout/Rect";
import {Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {indexes} from "../../../utils/indexes";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {InfiniteRingsGameState, InfiniteRingsProcessedGameState} from "./InfiniteRingsGameState";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {InfiniteRingsFieldWrapper} from "../components/InfiniteRingsFieldWrapper";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";
import {loop} from "../../../utils/math";
import {InfiniteRingsBorderLinesConstraint} from "../components/InfiniteRingsBorderLines";
import {isShowingAllInfiniteRings} from "./InfiniteRingsLayout";
import {InfiniteRingControls} from "../components/InfiniteRingControls";
import {InfiniteRingsSettings} from "../components/InfiniteRingsSettings";

/*
 * TODO:
 * - make the white dots white again!
 * - remove the "all rings" mode for 1-9 puzzles
 * - support killer cages
 * - highlight seen cells
 */

const coordsRingToPlain = (fieldSize: number, ring: number, index: number) => [ring, fieldSize / 2 - 1, fieldSize / 2, fieldSize - 1 - ring][index];
const coordsPlainToRing = (fieldSize: number, {top, left}: Position) => {
    const quadSize = fieldSize / 2;
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
        ring: Math.min(top, left, fieldSize - 1 - top, fieldSize - 1 - left),
        top: getIndex(top),
        left: getIndex(left),
    };
}

export const InfiniteSudokuTypeManager = <CellType, ExType, ProcessedExType>(
    baseTypeManager: SudokuTypeManager<CellType, ExType, ProcessedExType>,
    visibleRingsCountArg = 2,
    startRingOffset = 0,
): SudokuTypeManager<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState> => {
    return {
        ...baseTypeManager as unknown as SudokuTypeManager<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState>,
        initialGameStateExtension: {
            ...baseTypeManager.initialGameStateExtension!,
            ringOffset: startRingOffset,
            animationSpeed: AnimationSpeed.regular,
        },
        serializeGameState({ringOffset, animationSpeed, ...data}: Partial<ExType & InfiniteRingsGameState>): any {
            return {
                ...baseTypeManager.serializeGameState(data as Partial<ExType>),
                ringOffset,
                animationSpeed,
            };
        },
        unserializeGameState({ringOffset = 0, animationSpeed = AnimationSpeed.regular, ...data}: any): Partial<ExType & InfiniteRingsGameState> {
            return {
                ...baseTypeManager.unserializeGameState(data),
                ringOffset,
                animationSpeed,
            } as Partial<ExType & InfiniteRingsGameState>;
        },
        useProcessedGameStateExtension(state): ProcessedExType & InfiniteRingsProcessedGameState {
            const ringOffset = useAnimatedValue(state.extension.ringOffset, state.extension.animationSpeed * 0.5);

            return {
                ...baseTypeManager.useProcessedGameStateExtension?.(state) as ProcessedExType,
                ringOffset,
            };
        },
        mainControlsComponent: InfiniteRingControls,
        getCellTypeProps({top, left}, {fieldSize: {rowsCount: fieldSize}}) {
            const quadSize = fieldSize / 2;
            const ringsCount = quadSize - 1;
            const {ring} = coordsPlainToRing(fieldSize, {top, left});
            const isCenterTop = top === quadSize - 1 || top === quadSize;
            const isCenterLeft = left === quadSize - 1 || left === quadSize;

            return {
                isVisible: (top === left || top + left === fieldSize - 1 || isCenterTop || isCenterLeft) && !(isCenterTop && isCenterLeft),
                isVisibleForState: (context) => {
                    const {state: {processedExtension: {ringOffset}}} = context;
                    return isShowingAllInfiniteRings(context) || loop(ring + 0.5 - ringOffset, ringsCount) < visibleRingsCountArg;
                },
            };
        },
        processArrowDirection({top, left}, xDirection, yDirection, context) {
            const {
                puzzle: {fieldSize: {rowsCount: fieldSize}},
                state: {extension: {ringOffset}},
            } = context;

            const processRightArrow = (position: Position): {cell: Position, state?: PartialGameStateEx<CellType, ExType & InfiniteRingsGameState>} => {
                const ringsCount = fieldSize / 2 - 1;
                const visibleRingsCount = isShowingAllInfiniteRings(context) ? ringsCount : visibleRingsCountArg;

                let {ring, top, left} = coordsPlainToRing(fieldSize, position);

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
                        top: coordsRingToPlain(fieldSize, ring, top),
                        left: coordsRingToPlain(fieldSize, ring, left),
                    },
                    state: {extension: {ringOffset: newRingOffset} as Partial<ExType & InfiniteRingsGameState>}
                };
            }

            if (xDirection) {
                if (xDirection > 0) {
                    // right
                    return processRightArrow({top, left});
                } else {
                    // left
                    const {cell: {top: newTop, left: newLeft}, state} = processRightArrow({top, left: fieldSize - 1 - left});
                    return {cell: {top: newTop, left: fieldSize - 1 - newLeft}, state};
                }
            } else {
                const processDownArrow = ({top, left}: Position) => {
                    const {cell: {top: newTop, left: newLeft}, state} = processRightArrow({top: left, left: top});
                    return {cell: {top: newLeft, left: newTop}, state};
                };

                if (yDirection > 0) {
                    // down
                    return processDownArrow({top, left});
                } else {
                    // up
                    const {cell: {top: newTop, left: newLeft}, state} = processDownArrow({top: fieldSize - 1 - top, left});
                    return {cell: {top: fieldSize - 1 - newTop, left: newLeft}, state};
                }
            }
        },
        transformCoords({top, left}, context): Position {
            const {
                puzzle: {fieldSize: {rowsCount: fieldSize}},
                state: {processedExtension: {ringOffset}},
            } = context;
            const ringsCount = fieldSize / 2 - 1;
            const visibleRingsCount = isShowingAllInfiniteRings(context) ? ringsCount : visibleRingsCountArg;
            const loopedRingOffset = loop(ringOffset, ringsCount);
            const unscaleCoeff = Math.pow(2, ringsCount);
            const scaleCoeff = Math.pow(2, loopedRingOffset) / unscaleCoeff;

            top -= 2;
            left -= 2;

            top *= scaleCoeff;
            left *= scaleCoeff;

            const blackRectSize = 2 / Math.pow(2, visibleRingsCount);
            if (Math.abs(top) <= blackRectSize && Math.abs(left) <= blackRectSize) {
                top *= unscaleCoeff;
                left *= unscaleCoeff;
            }

            top += 2;
            left += 2;

            return {top, left};
        },
        getRegionsWithSameCoordsTransformation({fieldSize: {rowsCount: fieldSize}}, cellSize, state): RectWithTransformation[] {
            const ringsCount = fieldSize / 2 - 1;
            const ringOffset = state?.processedExtension.ringOffset ?? 0;
            const loopedRingOffset = loop(ringOffset, ringsCount);
            const scaleCoeff = Math.pow(2, loopedRingOffset);
            const unscaleCoeff = Math.pow(2, ringsCount);

            return [
                {
                    top: 2 - 2 / scaleCoeff,
                    left: 2 - 2 / scaleCoeff,
                    width: 4 / scaleCoeff,
                    height: 4 / scaleCoeff,
                    transformCoords: ({top, left}) => ({
                        top: (top - 2) * scaleCoeff + 2,
                        left: (left - 2) * scaleCoeff + 2,
                    }),
                },
                {
                    top: 0,
                    left: 0,
                    width: 4,
                    height: 4,
                    transformCoords: ({top, left}) => ({
                        top: (top - 2) * scaleCoeff / unscaleCoeff + 2,
                        left: (left - 2) * scaleCoeff / unscaleCoeff + 2,
                    }),
                },
            ];
        },
        postProcessPuzzle(puzzle: PuzzleDefinition<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState>): typeof puzzle {
            const fieldSize = puzzle.fieldSize.rowsCount;
            const quadSize = fieldSize / 2;
            const ringsCount = quadSize - 1;
            const customCellBounds: GivenDigitsMap<CustomCellBounds> = {};
            for (let ring = 0; ring < ringsCount; ring++) {
                const scale = Math.pow(0.5, ring);
                const offset = 2 * (1 - scale);
                for (let top = 0; top < 4; top++) {
                    const topIndex = coordsRingToPlain(fieldSize, ring, top);
                    for (let left = 0; left < 4; left++) {
                        const leftIndex = coordsRingToPlain(fieldSize, ring, left);
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
                digitsCount: visibleRingsCountArg * 3,
                fieldSize: {
                    ...puzzle.fieldSize,
                    fieldSize: 4,
                    regions: [],
                },
                customCellBounds,
                ignoreRowsColumnCountInTheWrapper: true,
                fieldWrapperComponent: InfiniteRingsFieldWrapper(visibleRingsCountArg),
                allowDrawing: puzzle.allowDrawing?.filter(type => ["center-mark"].includes(type)),
            };
        },
        fixCellPosition(position, {fieldSize: {rowsCount: fieldSize}}): Position | undefined {
            const {ring, top, left} = coordsPlainToRing(fieldSize, position);
            return {
                top: coordsRingToPlain(fieldSize, ring, top),
                left: coordsRingToPlain(fieldSize, ring, left),
            };
        },
        getRegionsForRowsAndColumns({fieldSize: {rowsCount: fieldSize}}): Constraint<CellType, any, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState>[] {
            const quadsCount = fieldSize / 2 - 1;
            return indexes(quadsCount).flatMap(outerRing => {
                const createRegion = (cells: (Position & { ring: number })[]) => RegionConstraint<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState>(
                    cells.map(({ring: ringOffset, top, left}) => {
                        const ring = loop(outerRing + ringOffset, quadsCount);
                        return {
                            top: coordsRingToPlain(fieldSize, ring, top),
                            left: coordsRingToPlain(fieldSize, ring, left),
                        };
                    }),
                    false,
                );
                const createRowColumnRegions = (cells: (Position & { ring: number })[]) => [
                    createRegion(cells),
                    createRegion(cells.map(({top, left, ring}) => ({
                        top: left,
                        left: top,
                        ring,
                    }))),
                    createRegion(cells.map(({top, left, ring}) => ({
                        top: 3 - top,
                        left,
                        ring,
                    }))),
                    createRegion(cells.map(({top, left, ring}) => ({
                        top: left,
                        left: 3 - top,
                        ring,
                    }))),
                ];
                const createQuadRegion = (cells: Position[]) => createRegion(indexes(visibleRingsCountArg).flatMap(
                    ring => cells.map(cell => ({...cell, ring}))
                ));
                return [
                    ...indexes(visibleRingsCountArg, true).flatMap(ring => createRowColumnRegions([
                        ...indexes(ring === visibleRingsCountArg ? 0 : 4).map(left => ({top: 0, left, ring})),
                        ...indexes(ring).flatMap(ring2 => [0, 3].map(left => ({top: 1, left, ring: ring2}))),
                    ])),
                    createQuadRegion([
                        {top: 0, left: 0},
                        {top: 0, left: 1},
                        {top: 1, left: 0},
                    ]),
                    createQuadRegion([
                        {top: 0, left: 2},
                        {top: 0, left: 3},
                        {top: 1, left: 3},
                    ]),
                    createQuadRegion([
                        {top: 2, left: 0},
                        {top: 3, left: 0},
                        {top: 3, left: 1},
                    ]),
                    createQuadRegion([
                        {top: 2, left: 3},
                        {top: 3, left: 2},
                        {top: 3, left: 3},
                    ]),
                ];
            });
        },
        items: [InfiniteRingsBorderLinesConstraint(visibleRingsCountArg)],
        settingsComponents: [InfiniteRingsSettings],
    };
};
