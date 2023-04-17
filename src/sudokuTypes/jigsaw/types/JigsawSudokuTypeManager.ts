import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {JigsawGameState, JigsawProcessedGameState} from "./JigsawGameState";
import {JigsawDigit} from "./JigsawDigit";
import {
    arrayContainsPosition,
    isSamePosition,
    Position,
    PositionWithAngle,
    rotateVectorClockwise
} from "../../../types/layout/Position";
import {loop, roundToStep} from "../../../utils/math";
import {JigsawDigitCellDataComponentType} from "../components/JigsawDigitCellData";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {getRectCenter} from "../../../types/layout/Rect";
import {ZoomInButtonItem, ZoomOutButtonItem} from "../../../components/sudoku/controls/ZoomButton";
import {AnimationSpeedControlButtonItem} from "../../../components/sudoku/controls/AnimationSpeedControlButton";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {
    getActiveJigsawPieceIndex,
    getJigsawPieceIndexByCell,
    getJigsawPieces,
    getJigsawPiecesWithCache,
    normalizeJigsawDigit,
    sortJigsawPiecesByPosition
} from "./helpers";
import {JigsawMoveCellWriteModeInfo} from "./JigsawMoveCellWriteModeInfo";
import {GridRegion, transformCoordsByRegions} from "../../../types/sudoku/GridRegion";
import {lightGreyColor} from "../../../components/app/globals";
import {JigsawPTM} from "./JigsawPTM";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {rotateNumber} from "../../../components/sudoku/digit/DigitComponentType";
import {mixColorsStr} from "../../../utils/color";
import {JigsawPieceHighlightHandlerControlButtonItem} from "../components/JigsawPieceHighlightHandler";
import {gameStateGetCurrentFieldState, PartialGameStateEx} from "../../../types/sudoku/GameState";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {JigsawFieldState} from "./JigsawFieldState";
import {createEmptyFieldState} from "../../../types/sudoku/FieldState";
import {getReverseIndexMap} from "../../../utils/array";
import {createRandomGenerator} from "../../../utils/random";
import {CellTypeProps} from "../../../types/sudoku/CellTypeProps";
import {PuzzleImportOptions} from "../../../types/sudoku/PuzzleImportOptions";

export const JigsawSudokuTypeManager = ({angleStep, stickyDigits, shuffle}: Omit<PuzzleImportOptions, "load">): SudokuTypeManager<JigsawPTM> => ({
    areSameCellData(
        {digit: digit1, angle: angle1},
        {digit: digit2, angle: angle2},
    ): boolean {
        return digit1 === digit2 && angle1 === angle2;
    },

    compareCellData(
        {digit: digit1, angle: angle1},
        {digit: digit2, angle: angle2},
    ): number {
        return angle1 - angle2 || digit1 - digit2;
    },

    getCellDataHash({digit, angle}): string {
        return `${digit}-${angle}`;
    },

    cloneCellData({digit, angle}): JigsawDigit {
        return {digit, angle};
    },

    serializeCellData({digit, angle}): any {
        return {digit, angle};
    },

    unserializeCellData({digit, angle}): JigsawDigit {
        return {digit, angle};
    },

    serializeGameState({pieces, highlightCurrentPiece}): any {
        return {pieces, highlightCurrentPiece};
    },

    unserializeGameState({pieces, highlightCurrentPiece = false}): Partial<JigsawGameState> {
        return {pieces, highlightCurrentPiece};
    },

    createCellDataByDisplayDigit(digit): JigsawDigit {
        return {digit, angle: 0};
    },

    createCellDataByTypedDigit(
        digit,
        {cellsIndex, puzzle, state},
        position,
    ): JigsawDigit {
        if (position) {
            const regionIndex = getJigsawPieceIndexByCell(cellsIndex, position);
            if (regionIndex !== undefined) {
                const {extension: {pieces}} = gameStateGetCurrentFieldState(state);

                return normalizeJigsawDigit(puzzle, {
                    digit,
                    angle: stickyDigits ? 0 : -pieces[regionIndex].angle,
                });
            }
        }

        return {digit, angle: 0};
    },

    createCellDataByImportedDigit(digit): JigsawDigit {
        return {digit, angle: 0};
    },

    getDigitByCellData(
        data,
        {cellsIndex, puzzle, state},
        cellPosition,
    ): number {
        const regionIndex = getJigsawPieceIndexByCell(cellsIndex, cellPosition);
        if (regionIndex) {
            const {extension: {pieces}} = gameStateGetCurrentFieldState(state);

            // TODO: return NaN if it's not a valid digit
            data = normalizeJigsawDigit(puzzle, {
                digit: data.digit,
                angle: stickyDigits ? 0 : data.angle + pieces[regionIndex].angle,
            });
        }

        return data.digit;
    },

    transformNumber(
        num,
        {cellsIndex, puzzle, state},
        cellPosition
    ): number {
        const regionIndex = getJigsawPieceIndexByCell(cellsIndex, cellPosition);
        if (regionIndex) {
            const {extension: {pieces}} = gameStateGetCurrentFieldState(state);
            const {importOptions: {angleStep = 0} = {}} = puzzle;
            const angle = loop(roundToStep(stickyDigits ? 0 : pieces[regionIndex].angle, angleStep), 360);
            // TODO: return NaN if it's not a valid angle
            if (angle === 180) {
                return rotateNumber(puzzle, num);
            }
        }
        return num;
    },

    processCellDataPosition(
        {cellsIndex, puzzle},
        basePosition,
        dataSet,
        dataIndex,
        positionFunction,
        cellPosition,
        state,
    ): PositionWithAngle | undefined {
        const {importOptions: {angleStep} = {}} = puzzle;

        if (!state || !angleStep) {
            return basePosition;
        }

        const regionIndex = cellPosition && getJigsawPieceIndexByCell(cellsIndex, cellPosition);
        if (regionIndex === undefined) {
            return basePosition;
        }

        const {angle: pieceAngle} = state.processedExtension.pieces[regionIndex];
        const roundedAngle = loop(roundToStep(pieceAngle, angleStep), 360);
        const processDigit = ({digit, angle}: JigsawDigit): JigsawDigit => normalizeJigsawDigit(
            puzzle,
            {digit, angle: stickyDigits ? 0 : angle + roundedAngle}
        );
        const rotatedIndexes = getCellDataSortIndexes<JigsawDigit>(
            dataSet,
            (a, b) => puzzle.typeManager.compareCellData(
                processDigit(a),
                processDigit(b),
                puzzle,
                undefined,
                false
            ),
            `sortRotatedIndexes-${roundedAngle}`
        );

        const rotatedPosition = positionFunction(rotatedIndexes[dataIndex]);
        if (!rotatedPosition) {
            return undefined;
        }

        return {
            ...rotateVectorClockwise(rotatedPosition, -pieceAngle),
            angle: rotatedPosition.angle - (stickyDigits ? pieceAngle : 0),
        };
    },

    digitComponentType: RegularDigitComponentType(),

    cellDataComponentType: JigsawDigitCellDataComponentType(angleStep === 90 && !stickyDigits),

    rotationallySymmetricDigits: true,

    initialGameStateExtension: (puzzle) => {
        const {pieces} = getJigsawPieces(puzzle)
        const {extension: {pieces: piecePositions}} = createEmptyFieldState(puzzle);
        const pieceSortIndexesByPosition = getReverseIndexMap(sortJigsawPiecesByPosition(pieces, piecePositions));

        return {
            pieces: pieceSortIndexesByPosition.map((index) => {
                return {
                    zIndex: pieces.length - index,
                    animating: false,
                };
            }),
            highlightCurrentPiece: false,
        };
    },
    initialFieldStateExtension: (puzzle) => {
        const {
            importOptions: {shuffle, angleStep} = {},
            typeManager: {initialScale = 1},
        } = puzzle;
        const randomizer = createRandomGenerator(0);
        const centerTop = puzzle.fieldSize.rowsCount / 2;
        const centerLeft = puzzle.fieldSize.columnsCount / 2;

        return {
            pieces: getJigsawPieces(puzzle).pieces.map(({boundingRect}) => {
                const {top, left} = getRectCenter(boundingRect);

                return {
                    top: shuffle
                        ? centerTop - top + (centerTop / initialScale - boundingRect.height / 2) * (randomizer() * 2 - 1)
                        : 0,
                    left: shuffle
                        ? centerLeft - left + (centerLeft / initialScale - boundingRect.width / 2) * (randomizer() * 2 - 1)
                        : 0,
                    angle: shuffle && angleStep
                        ? roundToStep(randomizer() * 360, angleStep)
                        : 0,
                };
            }),
        };
    },

    areFieldStateExtensionsEqual(a, b): boolean {
        return a.pieces.every((pieceA, index) => {
            const pieceB = b.pieces[index];
            return isSamePosition(pieceA, pieceB) && pieceA.angle === pieceB.angle;
        })
    },

    cloneFieldStateExtension({pieces}): JigsawFieldState {
        return {
            pieces: pieces.map((position) => ({...position})),
        };
    },

    allowMove: true,

    allowScale: true,
    isFreeScale: true,
    // initial scale to contain the shuffled pieces
    initialScale: shuffle ? 0.7 : 1,

    useProcessedGameStateExtension(state): JigsawProcessedGameState {
        const {animationSpeed, extension: {pieces: pieceAnimations}} = state;
        const {extension: {pieces: piecePositions}} = gameStateGetCurrentFieldState(state);

        return {
            pieces: piecePositions.map(({top, left, angle}, index) => {
                const {animating} = pieceAnimations[index];

                return {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    top: useAnimatedValue(top, animating ? animationSpeed / 2 : 0),
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    left: useAnimatedValue(left, animating ? animationSpeed / 2 : 0),
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    angle: useAnimatedValue(angle, animating ? animationSpeed : 0),
                };
            }),
        };
    },

    getProcessedGameStateExtension(state): JigsawProcessedGameState {
        const {extension: {pieces}} = gameStateGetCurrentFieldState(state);
        return {pieces};
    },

    processArrowDirection(currentCell, xDirection, yDirection, context, ...args): { cell?: Position; state?: PartialGameStateEx<JigsawPTM> } {
        const {cellsIndex, puzzle, state} = context;

        const regionIndex = getJigsawPieceIndexByCell(cellsIndex, currentCell);
        if (regionIndex === undefined) {
            return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, ...args);
        }

        const {extension: {pieces}} = gameStateGetCurrentFieldState(state);
        const angle = loop(roundToStep(pieces[regionIndex].angle, 90), 360);
        const {cells} = getJigsawPiecesWithCache(cellsIndex).pieces[regionIndex];

        if (angle >= 180) {
            xDirection = -xDirection;
            yDirection = -yDirection;
        }
        if (angle % 180 === 90) {
            const tmpXDirection = xDirection;
            xDirection = yDirection;
            yDirection = -tmpXDirection;
        }

        return defaultProcessArrowDirection(
            currentCell,
            xDirection,
            yDirection,
            // Substitute the context with a hacked type manager to treat only the cells of the active region as selectable
            {
                ...context,
                puzzle: {
                    ...puzzle,
                    typeManager: {
                        ...puzzle.typeManager,
                        getCellTypeProps(cell): CellTypeProps<JigsawPTM> {
                            return {
                                isSelectable: arrayContainsPosition(cells, cell),
                            };
                        },
                    },
                },
            },
            ...args
        );
    },

    transformCoords: transformCoordsByRegions,

    getRegionsWithSameCoordsTransformation(
        {
            cellsIndex,
            puzzle: {
                fieldSize: {rowsCount, columnsCount},
                typeManager: {
                    gridBackgroundColor = "#fff",
                    regionBackgroundColor = "#fff",
                },
            },
            state: {
                extension: {pieces: pieceIndexes, highlightCurrentPiece},
                processedExtension: {pieces: animatedPieces},
            },
        }
    ): GridRegion[] {
        const {pieces, otherCells} = getJigsawPiecesWithCache(cellsIndex);
        const activePieceIndex = getActiveJigsawPieceIndex(pieceIndexes);

        const regions: GridRegion[] = pieces.map(({cells, boundingRect}, index) => {
            const {zIndex} = pieceIndexes[index];
            const {top, left, angle} = animatedPieces[index];
            const center = getRectCenter(boundingRect);
            return {
                ...boundingRect,
                zIndex,
                cells: cells.length ? cells : undefined,
                transformCoords: (position) => {
                    const rotated = rotateVectorClockwise(position, angle, center);

                    return {
                        top: rotated.top + top,
                        left: rotated.left + left,
                    };
                },
                backgroundColor: highlightCurrentPiece && index === activePieceIndex
                    ? regionBackgroundColor
                    : mixColorsStr(regionBackgroundColor, gridBackgroundColor, 0.7),
            };
        });

        if (otherCells.length) {
            regions.push({
                top: 0,
                left: 0,
                width: columnsCount,
                height: rowsCount,
                cells: otherCells,
                transformCoords: (position) => position,
                backgroundColor: gridBackgroundColor,
                noInteraction: true,
                noBorders: true,
                noClip: true,
                zIndex: 0,
            });
        }

        return regions;
    },

    getRegionsForRowsAndColumns() {
        return [];
    },

    controlButtons: [
        ZoomInButtonItem(),
        ZoomOutButtonItem(),
        AnimationSpeedControlButtonItem(),
        JigsawPieceHighlightHandlerControlButtonItem,
    ],

    disabledCellWriteModes: [CellWriteMode.move],
    extraCellWriteModes: [JigsawMoveCellWriteModeInfo],

    gridBackgroundColor: lightGreyColor,
    regionBackgroundColor: "#fff",

    // TODO: support shared games
});
