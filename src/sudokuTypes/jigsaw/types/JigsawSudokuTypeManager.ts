import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {JigsawGameState, JigsawProcessedGameState} from "./JigsawGameState";
import {JigsawDigit} from "./JigsawDigit";
import {isSamePosition, Position, PositionWithAngle, rotateVectorClockwise} from "../../../types/layout/Position";
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
    normalizeJigsawDigit
} from "./helpers";
import {JigsawMoveCellWriteModeInfo, roundStep} from "./JigsawMoveCellWriteModeInfo";
import {GridRegion, transformCoordsByRegions} from "../../../types/sudoku/GridRegion";
import {lighterGreyColor} from "../../../components/app/globals";
import {JigsawPTM} from "./JigsawPTM";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {rotateNumber} from "../../../components/sudoku/digit/DigitComponentType";
import {mixColorsStr} from "../../../utils/color";
import {JigsawPieceHighlightHandlerControlButtonItem} from "../components/JigsawPieceHighlightHandler";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";

export const JigsawSudokuTypeManager: SudokuTypeManager<JigsawPTM> = {
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
        {cellsIndex, puzzle, state: {extension: {pieces}}},
        position,
    ): JigsawDigit {
        if (position) {
            const regionIndex = getJigsawPieceIndexByCell(cellsIndex, position);
            if (regionIndex !== undefined) {
                return normalizeJigsawDigit(puzzle, {
                    digit,
                    angle: -pieces[regionIndex].angle,
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
        {cellsIndex, puzzle, state: {extension: {pieces}}},
        cellPosition,
    ): number {
        const regionIndex = getJigsawPieceIndexByCell(cellsIndex, cellPosition);
        if (regionIndex) {
            // TODO: return NaN if it's not a valid digit
            data = normalizeJigsawDigit(puzzle, {
                digit: data.digit,
                angle: data.angle + pieces[regionIndex].angle,
            });
        }

        return data.digit;
    },

    transformNumber(
        num,
        {cellsIndex, puzzle, state: {extension: {pieces}}},
        cellPosition
    ): number {
        const regionIndex = getJigsawPieceIndexByCell(cellsIndex, cellPosition);
        if (regionIndex) {
            const {importOptions: {angleStep = 0} = {}} = puzzle;
            const angle = loop(roundToStep(pieces[regionIndex].angle, angleStep), 360);
            // TODO: return NaN if it's not a valid angle
            if (angle === 180) {
                return rotateNumber(puzzle, num);
            }
        }
        return num;
    },

    processCellDataPosition(context, basePosition): PositionWithAngle | undefined {
        // TODO
        return basePosition;
    },

    digitComponentType: RegularDigitComponentType(),

    cellDataComponentType: JigsawDigitCellDataComponentType,

    rotationallySymmetricDigits: true,

    // TODO: shuffle the pieces
    initialGameStateExtension: (puzzle) => {
        const centerTop = puzzle.fieldSize.rowsCount / 2;
        const centerLeft = puzzle.fieldSize.columnsCount / 2;
        return {
            pieces: getJigsawPieces(puzzle).map(({boundingRect}, index) => {
                const {top, left} = getRectCenter(boundingRect);
                return {
                    top: roundToStep((top - centerTop) * 0.4, roundStep),
                    left: roundToStep((left - centerLeft) * 0.4, roundStep),
                    angle: 0,
                    zIndex: index + 1,
                    animating: false,
                };
            }),
            highlightCurrentPiece: false,
        };
    },

    allowMove: true,

    allowScale: true,
    isFreeScale: true,
    // initial scale to contain the shuffled pieces
    initialScale: 0.7,

    useProcessedGameStateExtension({animationSpeed, extension: {pieces}}): JigsawProcessedGameState {
        return {
            pieces: pieces.map(({top, left, angle, animating}) => ({
                // eslint-disable-next-line react-hooks/rules-of-hooks
                top: useAnimatedValue(top, animating ? animationSpeed / 2 : 0),
                // eslint-disable-next-line react-hooks/rules-of-hooks
                left: useAnimatedValue(left, animating ? animationSpeed / 2 : 0),
                // eslint-disable-next-line react-hooks/rules-of-hooks
                angle: useAnimatedValue(angle, animating ? animationSpeed : 0),
            })),
        };
    },

    getProcessedGameStateExtension({extension: {pieces}}): JigsawProcessedGameState {
        return {pieces};
    },

    processArrowDirection(currentCell, xDirection, yDirection, context, ...args): { cell?: Position; state?: PartialGameStateEx<JigsawPTM> } {
        const {cellsIndex, puzzle, state: {extension: {pieces}}} = context;

        const regionIndex = getJigsawPieceIndexByCell(cellsIndex, currentCell);
        if (regionIndex === undefined) {
            return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, ...args);
        }

        const angle = loop(roundToStep(pieces[regionIndex].angle, 90), 360);
        const {cells} = getJigsawPiecesWithCache(cellsIndex)[regionIndex];

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
                        getCellTypeProps(cell) {
                            return {
                                isSelectable: cells.some((cell2) => isSamePosition(cell, cell2)),
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
                typeManager: {
                    gridBackgroundColor = "#fff",
                    regionBackgroundColor = "#fff",
                },
            },
            state: {
                extension: {pieces, highlightCurrentPiece},
                processedExtension: {pieces: animatedPieces},
            },
        }
    ): GridRegion[] {
        const activePieceIndex = getActiveJigsawPieceIndex(pieces);

        return getJigsawPiecesWithCache(cellsIndex).map(({cells, boundingRect}, index) => {
            const {zIndex} = pieces[index];
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
                    : mixColorsStr(regionBackgroundColor, gridBackgroundColor, 0.8),
            };
        });
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

    gridBackgroundColor: lighterGreyColor,
    regionBackgroundColor: "#fff",

    // TODO: support shared games
};

// TODO: make the jigsaw pieces a part of the history management system, and support undo/redo actions for them
