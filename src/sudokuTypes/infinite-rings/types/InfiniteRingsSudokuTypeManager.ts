import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {CustomCellBounds} from "../../../types/sudoku/CustomCellBounds";
import {getRectPoints, Rect} from "../../../types/layout/Rect";
import {Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {indexes} from "../../../utils/indexes";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {InfiniteRingsGameState, InfiniteRingsProcessedGameState} from "./InfiniteRingsGameState";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {InfiniteRingsFieldWrapper} from "../components/InfiniteRingsFieldWrapper";
import {AnimationSpeedControlButton} from "../../../components/sudoku/controls/AnimationSpeedControlButton";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";
import {loop} from "../../../utils/math";
import {InfiniteRingsBorderLinesConstraint} from "../components/InfiniteRingsBorderLines";

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
    baseTypeManager: SudokuTypeManager<CellType, ExType, ProcessedExType>
): SudokuTypeManager<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState> => {
    return {
        ...baseTypeManager as unknown as SudokuTypeManager<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState>,
        initialGameStateExtension: {
            ...baseTypeManager.initialGameStateExtension!,
            ringOffset: 0,
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
        mainControlsComponent: AnimationSpeedControlButton({top: 2, left: 0}),
        getCellTypeProps({top, left}, {fieldSize: {rowsCount: fieldSize}}) {
            const quadSize = fieldSize / 2;
            const isCenterTop = top === quadSize - 1 || top === quadSize;
            const isCenterLeft = left === quadSize - 1 || left === quadSize;

            return {
                isVisible: (top === left || top + left === fieldSize - 1 || isCenterTop || isCenterLeft) && !(isCenterTop && isCenterLeft),
            };
        },
        processArrowDirection(
            {top, left},
            xDirection,
            yDirection,
            {
                puzzle: {fieldSize: {rowsCount: fieldSize}},
                state: {extension: {ringOffset}},
            },
        ) {
            const processRightArrow = (position: Position): {cell: Position, state?: PartialGameStateEx<CellType, ExType & InfiniteRingsGameState>} => {
                const ringsCount = fieldSize / 2 - 1;

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
                    if (ring >= 2) {
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
        transformCoords({top, left}, {fieldSize: {rowsCount: fieldSize}}, {processedExtension: {ringOffset}}): Position {
            const ringsCount = fieldSize / 2 - 1;
            const loopedRingOffset = loop(ringOffset, ringsCount);
            const unscaleCoeff = Math.pow(2, ringsCount);
            const scaleCoeff = Math.pow(2, loopedRingOffset) / unscaleCoeff;

            top -= 2;
            left -= 2;

            top *= scaleCoeff;
            left *= scaleCoeff;

            if (Math.abs(top) <= 0.5 && Math.abs(left) <= 0.5) {
                top *= unscaleCoeff;
                left *= unscaleCoeff;
            }

            top += 2;
            left += 2;

            return {top, left};
        },
        getRegionsWithSameCoordsTransformation({fieldSize: {rowsCount: fieldSize}}, cellSize, state): Rect[] {
            const ringsCount = fieldSize / 2 - 1;
            const ringOffset = state?.processedExtension.ringOffset ?? 0;
            const loopedRingOffset = loop(ringOffset, ringsCount);
            const regionBorder = 2 - 2 / Math.pow(2, loop(loopedRingOffset + 2.5, ringsCount));

            return [
                {
                    top: 0,
                    left: 0,
                    width: 4,
                    height: 4,
                },
                {
                    top: regionBorder,
                    left: regionBorder,
                    width: 4 - 2 * regionBorder,
                    height: 4 - 2 * regionBorder,
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
                digitsCount: 6,
                fieldSize: {
                    ...puzzle.fieldSize,
                    fieldSize: 4,
                    regions: [],
                },
                customCellBounds,
                ignoreRowsColumnCountInTheWrapper: true,
                fieldWrapperComponent: InfiniteRingsFieldWrapper,
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
                const innerRing = (outerRing + 1) % quadsCount;
                const createRegion = (cells: (Position & { inner?: boolean })[], name: string) => RegionConstraint<CellType, ExType & InfiniteRingsGameState, ProcessedExType & InfiniteRingsProcessedGameState>(
                    cells.map(({inner, top, left}) => ({
                        top: coordsRingToPlain(fieldSize, inner ? innerRing : outerRing, top),
                        left: coordsRingToPlain(fieldSize, inner ? innerRing : outerRing, left),
                    })),
                    false,
                    `ring ${outerRing + 1} - ${name}`,
                );
                const createRowColumnRegions = (cells: (Position & { inner?: boolean })[], name: string) => [
                    createRegion(cells, "row " + name),
                    createRegion(
                        cells.map(({top, left, inner}) => ({top: left, left: top, inner})),
                        "column " + name.replace("top", "left").replace("bottom", "right")
                    ),
                ];
                const createQuadRegion = (cells: Position[], name: string) => createRegion([
                    ...cells,
                    ...cells.map(cell => ({...cell, inner: true})),
                ], name);
                return [
                    ...createRowColumnRegions(indexes(4).map(left => ({top: 0, left})), "1"),
                    ...createRowColumnRegions([
                        {top: 1, left: 0},
                        ...indexes(4).map(left => ({top: 0, left, inner: true})),
                        {top: 1, left: 3},
                    ], "2 top"),
                    ...createRowColumnRegions([
                        {top: 1, left: 0},
                        {top: 1, left: 0, inner: true},
                        {top: 1, left: 3, inner: true},
                        {top: 1, left: 3},
                    ], "2 bottom"),
                    ...createRowColumnRegions([
                        {top: 2, left: 0},
                        {top: 2, left: 0, inner: true},
                        {top: 2, left: 3, inner: true},
                        {top: 2, left: 3},
                    ], "3 top"),
                    ...createRowColumnRegions([
                        {top: 2, left: 0},
                        ...indexes(4).map(left => ({top: 3, left, inner: true})),
                        {top: 2, left: 3},
                    ], "3 bottom"),
                    ...createRowColumnRegions(indexes(4).map(left => ({top: 3, left})), "4"),
                    createQuadRegion([
                        {top: 0, left: 0},
                        {top: 0, left: 1},
                        {top: 1, left: 0},
                    ], "quad 1"),
                    createQuadRegion([
                        {top: 0, left: 2},
                        {top: 0, left: 3},
                        {top: 1, left: 3},
                    ], "quad 2"),
                    createQuadRegion([
                        {top: 2, left: 0},
                        {top: 3, left: 0},
                        {top: 3, left: 1},
                    ], "quad 3"),
                    createQuadRegion([
                        {top: 2, left: 3},
                        {top: 3, left: 2},
                        {top: 3, left: 3},
                    ], "quad 4"),
                ];
            });
        },
        items: [InfiniteRingsBorderLinesConstraint()],
    };
};
