import { defaultProcessArrowDirection, PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { JigsawGameState, JigsawJssCluesVisibility } from "./JigsawGameState";
import { JigsawDigit } from "./JigsawDigit";
import {
    emptyPositionWithAngle,
    getLineVector,
    Position,
    PositionSet,
    PositionWithAngle,
    rotateVectorClockwise,
} from "../../../types/layout/Position";
import { loop, roundToStep } from "../../../utils/math";
import { JigsawDigitCellDataComponentType } from "../components/JigsawDigitCellData";
import { AnimatedValue, mixAnimatedPosition, mixAnimatedValue } from "../../../types/struct/AnimatedValue";
import { getRectCenter } from "../../../types/layout/Rect";
import { ZoomInButtonItem, ZoomOutButtonItem } from "../../../components/puzzle/controls/ZoomButton";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import {
    getJigsawCellCenterAbsolutePosition,
    getJigsawPieceIndexByCell,
    getJigsawPieces,
    getJigsawRegionWithCache,
    groupJigsawPiecesByZIndex,
    moveJigsawPieceByGroupGesture,
    normalizeJigsawDigit,
    rotateJigsawDigitByPiece,
    sortJigsawPiecesByPosition,
} from "./helpers";
import { JigsawMoveCellWriteModeInfo } from "./JigsawMoveCellWriteModeInfo";
import {
    doesGridRegionContainCell,
    getGridRegionCells,
    GridRegion,
    transformCoordsByRegions,
} from "../../../types/puzzle/GridRegion";
import { lightGreyColor } from "../../../components/app/globals";
import { JigsawPTM } from "./JigsawPTM";
import { RegularDigitComponentType } from "../../../components/puzzle/digit/RegularDigit";
import { rotateNumber } from "../../../components/puzzle/digit/DigitComponentType";
import { JigsawPieceHighlightHandlerControlButtonItem } from "../components/JigsawPieceHighlightHandler";
import { getCellDataSortIndexes } from "../../../components/puzzle/cell/CellDigits";
import { JigsawGridPieceState, JigsawGridState } from "./JigsawGridState";
import { getReverseIndexMap } from "../../../utils/array";
import { PuzzleImportOptions } from "../../../types/puzzle/PuzzleImportOptions";
import { Constraint, isValidFinishedPuzzleByConstraints } from "../../../types/puzzle/Constraint";
import {
    getRegionCells,
    isStickyRegionCell,
    processPuzzleItems,
    PuzzleDefinition,
} from "../../../types/puzzle/PuzzleDefinition";
import { jssTag } from "../../jss/constraints/Jss";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { JigsawJss } from "../constraints/JigsawJss";
import { ControlButtonRegion } from "../../../components/puzzle/controls/ControlButtonsManager";
import { JigsawGluePiecesButton } from "../components/JigsawGluePiecesButton";
import { emptyGestureMetrics, GestureMetrics } from "../../../utils/gestures";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { JigsawGluedPiecesConstraint } from "../constraints/JigsawGluedPieces";
import { jigsawPieceStateChangeAction } from "./JigsawGamePieceState";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { settings } from "../../../types/layout/Settings";
import { indexes } from "../../../utils/indexes";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { JigsawPuzzlePhrases } from "./JigsawPuzzlePhrases";
import { JigsawPieceInfo } from "./JigsawPieceInfo";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { createEmptyContextForPuzzle, PuzzleContext } from "../../../types/puzzle/PuzzleContext";

interface JigsawTypeManagerOptions {
    supportGluePieces?: boolean;
    phrases?: JigsawPuzzlePhrases;
    getPieceCenter?: (piece: Omit<JigsawPieceInfo, "center">) => Position;
}

export const JigsawTypeManager = (
    { angleStep, stickyDigits, hideZeroRegion }: PuzzleImportOptions,
    {
        supportGluePieces = true,
        phrases = {
            forActivePiece: {
                [LanguageCode.en]: "For active jigsaw piece",
                [LanguageCode.ru]: "Для активного куска пазла",
                [LanguageCode.de]: "Für aktives Puzzleteil",
            },
            dragPieceToMove: (rotatable) => ({
                [LanguageCode.en]:
                    "Drag the jigsaw piece to move it, click it to focus" +
                    (rotatable ? ", click again to rotate" : ""),
                [LanguageCode.ru]:
                    "Перетащите кусок пазла, чтобы двигать его. Щелкните по нему, чтобы выделить" +
                    (rotatable ? " и повернуть" : ""),
                [LanguageCode.de]:
                    "Ziehen Sie das Puzzleteil, um es zu verschieben, klicken Sie darauf, um es zu fokussieren" +
                    (rotatable ? ", und zu drehen" : ""),
            }),
            dragModeTitle: {
                [LanguageCode.en]: "Move the grid and the jigsaw pieces",
                [LanguageCode.ru]: "Двигать поле и куски пазла",
                [LanguageCode.de]: "Bewegen Sie das Gitter und die Puzzleteile",
            },
        } as JigsawPuzzlePhrases,
        getPieceCenter = ({ boundingRect }) => getRectCenter(boundingRect),
    }: JigsawTypeManagerOptions = {},
): PuzzleTypeManager<JigsawPTM> =>
    addGameStateExToPuzzleTypeManager<JigsawPTM, JigsawGameState>(
        addGridStateExToPuzzleTypeManager<JigsawPTM, JigsawGridState>(
            {
                areSameCellData(data1, data2, context, cell1, cell2): boolean {
                    if (!stickyDigits && cell1 !== undefined && cell2 !== undefined) {
                        data1 = rotateJigsawDigitByPiece(context, data1, cell1);
                        data2 = rotateJigsawDigitByPiece(context, data2, cell2);
                    }

                    const { digit: digit1, angle: angle1 } = data1;
                    const { digit: digit2, angle: angle2 } = data2;

                    return digit1 === digit2 && angle1 === angle2;
                },

                compareCellData({ digit: digit1, angle: angle1 }, { digit: digit2, angle: angle2 }): number {
                    return angle1 - angle2 || digit1 - digit2;
                },

                getCellDataHash({ digit, angle }): string {
                    return `${digit}-${angle}`;
                },

                cloneCellData({ digit, angle }): JigsawDigit {
                    return { digit, angle };
                },

                serializeCellData({ digit, angle }): any {
                    return { digit, angle };
                },

                unserializeCellData({ digit, angle }): JigsawDigit {
                    return { digit, angle };
                },

                createCellDataByDisplayDigit(digit): JigsawDigit {
                    return { digit, angle: 0 };
                },

                createCellDataByTypedDigit(digit, { puzzle, gridExtension: { pieces } }, position): JigsawDigit {
                    if (position) {
                        const regionIndex = getJigsawPieceIndexByCell(puzzle, position);
                        if (regionIndex !== undefined) {
                            return normalizeJigsawDigit(puzzle, {
                                digit,
                                angle: stickyDigits ? 0 : -pieces[regionIndex].angle,
                            });
                        }
                    }

                    return { digit, angle: 0 };
                },

                createCellDataByImportedDigit(digit): JigsawDigit {
                    return { digit, angle: 0 };
                },

                getDigitByCellData(data, { puzzle, gridExtension: { pieces } }, cellPosition): number {
                    const regionIndex = getJigsawPieceIndexByCell(puzzle, cellPosition);
                    if (regionIndex) {
                        // TODO: return NaN if it's not a valid digit
                        data = normalizeJigsawDigit(puzzle, {
                            digit: data.digit,
                            angle: stickyDigits ? 0 : data.angle + pieces[regionIndex].angle,
                        });
                    }

                    return data.digit;
                },

                transformNumber(num, { puzzle, gridExtension: { pieces } }, cellPosition): number {
                    const regionIndex = getJigsawPieceIndexByCell(puzzle, cellPosition);
                    if (regionIndex) {
                        const { importOptions: { angleStep = 0 } = {} } = puzzle;
                        const angle = loop(roundToStep(stickyDigits ? 0 : pieces[regionIndex].angle, angleStep), 360);
                        // TODO: return NaN if it's not a valid angle
                        if (angle === 180) {
                            return rotateNumber(puzzle, num);
                        }
                    }
                    return num;
                },

                processCellDataPosition(
                    context,
                    basePosition,
                    dataSet,
                    dataIndex,
                    positionFunction,
                    cellPosition,
                    region,
                ): PositionWithAngle | undefined {
                    const { puzzle } = context;
                    const { importOptions: { angleStep } = {} } = puzzle;

                    if (!cellPosition || !angleStep) {
                        return basePosition;
                    }

                    const regionCellPosition = region?.cells?.[0] ?? cellPosition;
                    const regionIndex = regionCellPosition && getJigsawPieceIndexByCell(puzzle, regionCellPosition);
                    if (regionIndex === undefined) {
                        return basePosition;
                    }

                    const { angle: pieceAngle } = getAnimatedJigsawPiecePosition(context, regionIndex);
                    const roundedAngle = loop(roundToStep(pieceAngle, angleStep), 360);
                    const processDigit = ({ digit, angle }: JigsawDigit): JigsawDigit =>
                        normalizeJigsawDigit(puzzle, { digit, angle: stickyDigits ? 0 : angle + roundedAngle });
                    const rotatedIndexes = getCellDataSortIndexes<JigsawDigit>(
                        dataSet,
                        (a, b) =>
                            puzzle.typeManager.compareCellData(processDigit(a), processDigit(b), context, false, false),
                        `sortRotatedIndexes-${roundedAngle}`,
                    );

                    const rotatedPosition = positionFunction(rotatedIndexes[dataIndex] ?? 0);
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

                allowMove: true,

                allowScale: true,
                isFreeScale: true,

                processArrowDirection(currentCell, xDirection, yDirection, context, ...args): { cell?: Position } {
                    const regions = context
                        .regions!.filter(({ noInteraction }) => !noInteraction)
                        .sort((a, b) => (a.zIndex ?? -1) - (b.zIndex ?? -1));
                    // Find the last matching region - it's the one that is visible by z-index
                    const currentRegion = [...regions]
                        .reverse()
                        .find((region) => doesGridRegionContainCell(region, currentCell));
                    if (!currentRegion) {
                        return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, ...args);
                    }

                    const currentCellCenter = getJigsawCellCenterAbsolutePosition(currentRegion, currentCell, true);

                    const regionCells = regions.flatMap((region) =>
                        getGridRegionCells(region).map((cell) => ({
                            cell,
                            vector: getLineVector({
                                start: currentCellCenter,
                                end: getJigsawCellCenterAbsolutePosition(region, cell, true),
                            }),
                        })),
                    );

                    // Index all cells by how many arrow moves it will take to get to them
                    const regionCellsIndex: Record<number, Position> = {};
                    for (const {
                        cell,
                        vector: { left: dx, top: dy },
                    } of regionCells) {
                        const x = xDirection === 0 ? 0 : dx / xDirection;
                        const y = yDirection === 0 ? 0 : dy / yDirection;
                        let position: number;
                        if (xDirection === 0) {
                            if (dx !== 0) {
                                continue;
                            }
                            position = y;
                        } else if (yDirection === 0) {
                            if (dy !== 0) {
                                continue;
                            }
                            position = x;
                        } else {
                            if (x !== y) {
                                continue;
                            }
                            position = x;
                        }

                        if (position % 1 === 0) {
                            // It's intentional to overwrite previous cells with the same position - the biggest zIndex will win
                            regionCellsIndex[position] = cell;
                        }
                    }

                    // If the next cell according to the arrow direction belongs to any region, then return it
                    if (regionCellsIndex[1]) {
                        return { cell: regionCellsIndex[1] };
                    }

                    // Otherwise, go in the opposite direction while it's possible
                    let newPosition = 0;
                    while (regionCellsIndex[newPosition - 1]) {
                        newPosition -= 1;
                    }

                    return { cell: regionCellsIndex[newPosition] };
                },

                transformCoords: transformCoordsByRegions,

                getRegionsWithSameCoordsTransformation(context, isImportingPuzzle): GridRegion[] {
                    const { rowsCount, columnsCount } = context.puzzle.gridSize;

                    if (isImportingPuzzle) {
                        return [
                            {
                                top: 0,
                                left: 0,
                                width: columnsCount,
                                height: rowsCount,
                            },
                        ];
                    }

                    const {
                        puzzle: {
                            extension: { pieces, otherCells },
                            importOptions: { stickyRegion } = {},
                        },
                    } = context;

                    const regions: GridRegion[] = indexes(pieces.length).map((index) => {
                        return getJigsawRegionWithCache(context, index);
                    });

                    if (!hideZeroRegion && otherCells.length) {
                        regions.push({
                            top: 0,
                            left: 0,
                            width: columnsCount,
                            height: rowsCount,
                            cells: otherCells,
                            transformCoords: (position) => position,
                            backgroundColor: "transparent",
                            noInteraction: true,
                            noBorders: true,
                            noClip: true,
                            zIndex: -1,
                        });
                    }

                    if (stickyRegion) {
                        regions.push({
                            ...stickyRegion,
                            zIndex: 0,
                        });
                    }

                    return regions;
                },

                regionSpecificUserMarks: true,

                getRegionsForRowsAndColumns(context): Constraint<JigsawPTM, any>[] {
                    if (context.puzzle.importOptions?.noSudoku) {
                        return [];
                    }

                    const regions = context
                        .regions!.filter(({ noInteraction }) => !noInteraction)
                        .sort((a, b) => (a.zIndex ?? -1) - (b.zIndex ?? -1));

                    const cellsMap: CellsMap<Position> = {};
                    const flippedCellsMap: CellsMap<Position> = {};
                    for (const region of regions) {
                        for (const cell of getGridRegionCells(region)) {
                            const { top, left } = getJigsawCellCenterAbsolutePosition(region, cell, true);

                            cellsMap[top] = cellsMap[top] ?? {};
                            cellsMap[top][left] = cell;

                            flippedCellsMap[left] = flippedCellsMap[left] ?? {};
                            flippedCellsMap[left][top] = cell;
                        }
                    }

                    return [cellsMap, flippedCellsMap].flatMap((cellsMap) =>
                        Object.values(cellsMap).flatMap((rowMap) => {
                            const results: Constraint<JigsawPTM, any>[] = [];

                            while (true) {
                                const keys = Object.keys(rowMap);
                                if (keys.length === 0) {
                                    break;
                                }

                                const cells: Position[] = [];
                                for (let index = Math.min(...keys.map(Number)); rowMap[index]; index += 1) {
                                    cells.push(rowMap[index]);
                                    delete rowMap[index];
                                }
                                results.push(RegionConstraint(cells, false, "row/column"));
                            }

                            return results;
                        }),
                    );
                },

                controlButtons: [
                    ZoomInButtonItem(),
                    ZoomOutButtonItem(),
                    ...(supportGluePieces
                        ? [
                              {
                                  key: "glue-jigsaw-pieces",
                                  region: ControlButtonRegion.custom,
                                  Component: JigsawGluePiecesButton,
                              },
                          ]
                        : []),
                    JigsawPieceHighlightHandlerControlButtonItem,
                ],

                disabledCellWriteModes: [CellWriteMode.move],
                extraCellWriteModes: [JigsawMoveCellWriteModeInfo(phrases)],

                gridBackgroundColor: lightGreyColor,
                regionBackgroundColor: "#fff",

                postProcessPuzzle(puzzle): PuzzleDefinition<JigsawPTM> {
                    puzzle = {
                        ...puzzle,
                        extension: getJigsawPieces(puzzle, getPieceCenter),
                    };

                    if (puzzle.importOptions?.noPieceRegions) {
                        puzzle = {
                            ...puzzle,
                            regions: puzzle.regions?.filter((region) =>
                                isStickyRegionCell(puzzle, getRegionCells(region)[0]),
                            ),
                        };
                    }

                    const { inactiveCells, resultChecker } = puzzle;

                    // Mark all cells that don't belong to a region as inactive
                    let newInactiveCells = new PositionSet(inactiveCells);
                    const contextDraft = createEmptyContextForPuzzle(puzzle);
                    for (let top = 0; top < puzzle.gridSize.rowsCount; top++) {
                        for (let left = 0; left < puzzle.gridSize.columnsCount; left++) {
                            const region = contextDraft.getCellRegion(top, left);
                            if (!region || region.noInteraction) {
                                newInactiveCells = newInactiveCells.add({ top, left });
                            }
                        }
                    }
                    contextDraft.dispose();

                    puzzle = {
                        ...puzzle,
                        inactiveCells: newInactiveCells.items,
                        items: processPuzzleItems(
                            (items) => [
                                ...items.map((constraint) =>
                                    constraint.tags?.includes(jssTag)
                                        ? { ...constraint, component: { [GridLayer.noClip]: JigsawJss } }
                                        : constraint,
                                ),
                                JigsawGluedPiecesConstraint,
                            ],
                            puzzle.items,
                        ),
                    };

                    if (resultChecker) {
                        puzzle = {
                            ...puzzle,
                            resultChecker: (context) => {
                                const result = resultChecker(context);

                                if (result.isCorrectResult && resultChecker !== isValidFinishedPuzzleByConstraints) {
                                    const result2 = isValidFinishedPuzzleByConstraints(context);
                                    if (!result2.isCorrectResult) {
                                        return result2;
                                    }
                                }

                                return result;
                            },
                        };
                    }

                    return puzzle;
                },

                onCloseCorrectResultPopup(context) {
                    const { puzzle } = context;
                    const stickyPiece = puzzle.importOptions?.stickyJigsawPiece;
                    if (!stickyPiece) {
                        return;
                    }

                    context.onStateChange([
                        jigsawPieceStateChangeAction(
                            undefined,
                            myClientId,
                            "finalize-jigsaw",
                            undefined,
                            { position: { zIndex: 1 } },
                            false,
                        ),
                        (context) => {
                            const {
                                puzzle,
                                gridExtension: { pieces: piecePositions },
                            } = context;
                            const { pieces } = puzzle.extension;
                            const [group] = groupJigsawPiecesByZIndex(context);
                            const groupGesture: GestureMetrics = {
                                ...emptyGestureMetrics,
                                rotation: loop(-piecePositions[stickyPiece - 1].angle + 180, 360) - 180,
                            };

                            return jigsawPieceStateChangeAction(
                                undefined,
                                myClientId,
                                "finalize-jigsaw",
                                group.indexes,
                                ({ position }, pieceIndex) => ({
                                    position: moveJigsawPieceByGroupGesture(
                                        group.center,
                                        groupGesture,
                                        pieces[pieceIndex],
                                        position,
                                    ),
                                    state: { animating: true },
                                }),
                                false,
                            )(context);
                        },
                    ]);
                },

                compensateConstraintDigitAngle: stickyDigits,

                saveStateKeySuffix: "v2",

                // TODO: support shared games
            },
            {
                initialGridStateExtension(puzzle): JigsawGridState {
                    if (!puzzle) {
                        return { pieces: [] };
                    }

                    const pieces = puzzle.extension.pieces ?? [];

                    const pieceSortIndexesByPosition = getReverseIndexMap(
                        sortJigsawPiecesByPosition(
                            pieces,
                            pieces.map(() => emptyPositionWithAngle),
                        ),
                    );

                    return {
                        pieces: pieces.map((piece, index) => {
                            return {
                                ...emptyPositionWithAngle,
                                zIndex: pieces.length - pieceSortIndexesByPosition[index],
                                rotationAxis: piece.center,
                            };
                        }),
                    };
                },
                unserializeGridStateExtension({ pieces }: any): Partial<JigsawGridState> {
                    return {
                        pieces: pieces?.map(
                            ({ top, left, angle, zIndex, rotationAxis }: any, index: number): JigsawGridPieceState => ({
                                top,
                                left,
                                angle,
                                zIndex: zIndex ?? pieces.length - index,
                                rotationAxis,
                            }),
                        ),
                    };
                },
            },
        ),
        {
            initialGameStateExtension(puzzle): JigsawGameState {
                return {
                    pieces: puzzle?.extension?.pieces?.map(() => ({ animating: false })) ?? [],
                    highlightCurrentPiece: false,
                    jssCluesVisibility: JigsawJssCluesVisibility.All,
                };
            },
        },
    );

export const getAnimatedJigsawPiecePosition = (context: PuzzleContext<JigsawPTM>, index: number): PositionWithAngle => {
    const piece = context.puzzle.extension.pieces?.[index];
    if (!piece) {
        return emptyPositionWithAngle;
    }

    return context.getCachedItem(
        `animatedJigsawPiecePosition[${index}]`,
        () =>
            new AnimatedValue<Omit<JigsawGridPieceState, "zIndex">>(
                () => context.gridExtension.pieces[index],
                () => (context.stateExtension.pieces[index].animating ? settings.animationSpeed.get() / 2 : 1),
                (a, b, coeff) => {
                    const angleDiff = b.angle - a.angle;
                    const { top: topDiff, left: leftDiff } = getLineVector({
                        start: b,
                        end: moveJigsawPieceByGroupGesture(
                            a.rotationAxis,
                            {
                                ...emptyGestureMetrics,
                                rotation: angleDiff,
                            },
                            piece,
                            a,
                        ),
                    });

                    return {
                        ...moveJigsawPieceByGroupGesture(
                            a.rotationAxis,
                            {
                                x: mixAnimatedValue(0, -leftDiff, coeff),
                                y: mixAnimatedValue(0, -topDiff, coeff),
                                rotation: mixAnimatedValue(0, angleDiff, coeff),
                                scale: 1,
                            },
                            piece,
                            a,
                        ),
                        rotationAxis: mixAnimatedPosition(a.rotationAxis, b.rotationAxis, coeff),
                    };
                },
            ),
    ).animatedValue;
};
