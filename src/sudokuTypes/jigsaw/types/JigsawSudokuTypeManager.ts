import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {JigsawGameState, JigsawJssCluesVisibility, JigsawProcessedGameState} from "./JigsawGameState";
import {JigsawDigit} from "./JigsawDigit";
import {
    getLineVector,
    isSamePosition,
    Position,
    PositionWithAngle,
    rotateVectorClockwise
} from "../../../types/layout/Position";
import {loop, roundToStep} from "../../../utils/math";
import {JigsawDigitCellDataComponentType} from "../components/JigsawDigitCellData";
import {mixAnimatedValue, useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {getRectCenter} from "../../../types/layout/Rect";
import {ZoomInButtonItem, ZoomOutButtonItem} from "../../../components/sudoku/controls/ZoomButton";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {
    getActiveJigsawPieceZIndex,
    getJigsawCellCenterAbsolutePosition,
    getJigsawPieceIndexByCell,
    getJigsawPieceRegion,
    getJigsawPiecesWithCache,
    groupJigsawPiecesByZIndex,
    moveJigsawPieceByGroupGesture,
    normalizeJigsawDigit,
    sortJigsawPiecesByPosition
} from "./helpers";
import {JigsawMoveCellWriteModeInfo} from "./JigsawMoveCellWriteModeInfo";
import {
    doesGridRegionContainCell,
    getGridRegionCells,
    GridRegion,
    transformCoordsByRegions
} from "../../../types/sudoku/GridRegion";
import {lightGreyColor} from "../../../components/app/globals";
import {JigsawPTM} from "./JigsawPTM";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {rotateNumber} from "../../../components/sudoku/digit/DigitComponentType";
import {JigsawPieceHighlightHandlerControlButtonItem} from "../components/JigsawPieceHighlightHandler";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {JigsawFieldPieceState, JigsawFieldState} from "./JigsawFieldState";
import {getReverseIndexMap} from "../../../utils/array";
import {createRandomGenerator} from "../../../utils/random";
import {PuzzleImportOptions} from "../../../types/sudoku/PuzzleImportOptions";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {jssTag} from "../../jss/constraints/Jss";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {JigsawJss} from "../constraints/JigsawJss";
import {ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {JigsawGluePiecesButton} from "../components/JigsawGluePiecesButton";
import {useMemo} from "react";
import {emptyGestureMetrics, GestureMetrics} from "../../../utils/gestures";
import {fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {JigsawGluedPiecesConstraint} from "../constraints/JigsawGluedPieces";
import {jigsawPieceStateChangeAction} from "./JigsawGamePieceState";
import {myClientId} from "../../../hooks/useMultiPlayer";

export const JigsawSudokuTypeManager = ({angleStep, stickyDigits, shuffle}: PuzzleImportOptions): SudokuTypeManager<JigsawPTM> => ({
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

    serializeGameState({pieces, highlightCurrentPiece, jssCluesVisibility}): any {
        return {pieces, highlightCurrentPiece, jssCluesVisibility};
    },

    unserializeGameState({pieces, highlightCurrentPiece = false, jssCluesVisibility = JigsawJssCluesVisibility.All}): Partial<JigsawGameState> {
        return {pieces, highlightCurrentPiece, jssCluesVisibility};
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
        region,
    ): PositionWithAngle | undefined {
        const {importOptions: {angleStep} = {}} = puzzle;

        if (!state || !angleStep) {
            return basePosition;
        }

        const regionCellPosition = region?.cells?.[0] ?? cellPosition;
        const regionIndex = regionCellPosition && getJigsawPieceIndexByCell(cellsIndex, regionCellPosition);
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
        const {pieces} = getJigsawPiecesWithCache(new SudokuCellsIndex(puzzle));

        return {
            pieces: pieces.map(() => ({animating: false})),
            highlightCurrentPiece: false,
            jssCluesVisibility: JigsawJssCluesVisibility.All,
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
        const {pieces} = getJigsawPiecesWithCache(new SudokuCellsIndex(puzzle));

        const piecePositions = pieces.map(({boundingRect}): PositionWithAngle => {
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
        });
        const pieceSortIndexesByPosition = getReverseIndexMap(sortJigsawPiecesByPosition(pieces, piecePositions));

        return {
            pieces: piecePositions.map((position, index) => {
                return {
                    ...position,
                    zIndex: pieces.length - pieceSortIndexesByPosition[index],
                };
            }),
        };
    },

    areFieldStateExtensionsEqual(a, b): boolean {
        return a.pieces.every((pieceA, index) => {
            const pieceB = b.pieces[index];
            return isSamePosition(pieceA, pieceB) && pieceA.angle === pieceB.angle && pieceA.zIndex === pieceB.zIndex;
        })
    },

    cloneFieldStateExtension({pieces}): JigsawFieldState {
        return {
            pieces: pieces.map((position) => ({...position})),
        };
    },

    unserializeFieldStateExtension({pieces}: any): Partial<JigsawFieldState> {
        return {
            pieces: pieces?.map(({top, left, angle, zIndex}: any, index: number): JigsawFieldPieceState => ({
                top,
                left,
                angle,
                zIndex: zIndex ?? pieces.length - index,
            })),
        };
    },

    allowMove: true,

    allowScale: true,
    isFreeScale: true,
    // initial scale to contain the shuffled pieces
    initialScale: shuffle ? 0.7 : 1,

    useProcessedGameStateExtension(state, cellsIndex): JigsawProcessedGameState {
        const {pieces} = getJigsawPiecesWithCache(cellsIndex);
        const {animationSpeed, extension: {pieces: pieceAnimations}} = state;
        const {extension: {pieces: piecePositions}} = gameStateGetCurrentFieldState(state);
        const groups = useMemo(
            () => groupJigsawPiecesByZIndex(pieces, piecePositions),
            [pieces, piecePositions]
        );

        return {
            pieces: useAnimatedValue<PositionWithAngle[]>(
                piecePositions,
                animationSpeed / 2,
                (as, bs, coeff) => as.map((a, index) => {
                    const b = bs[index];
                    const c = pieceAnimations[index].animating ? coeff : 1;
                    const group = groups.find(({indexes}) => indexes.includes(index))!;
                    const piece = pieces[index];

                    const angleDiff = b.angle - a.angle;
                    const {top: topDiff, left: leftDiff} = getLineVector({
                        start: b,
                        end: moveJigsawPieceByGroupGesture(
                            group,
                            {
                                ...emptyGestureMetrics,
                                rotation: angleDiff,
                            },
                            piece,
                            a
                        ),
                    });

                    return moveJigsawPieceByGroupGesture(
                        group,
                        {
                            x: mixAnimatedValue(0, -leftDiff, c),
                            y: mixAnimatedValue(0, -topDiff, c),
                            rotation: mixAnimatedValue(0, angleDiff, c),
                            scale: 1,
                        },
                        piece,
                        a
                    );
                })
            ),
        };
    },

    getProcessedGameStateExtension(state): JigsawProcessedGameState {
        const {extension: {pieces}} = gameStateGetCurrentFieldState(state);
        return {pieces};
    },

    processArrowDirection(
        currentCell, xDirection, yDirection, context, ...args
    ): {cell?: Position} {
        const {puzzle: {typeManager: {getRegionsWithSameCoordsTransformation}}} = context;

        const regions = getRegionsWithSameCoordsTransformation!(context)
            .filter(({noInteraction}) => !noInteraction)
            .sort((a, b) => (a.zIndex ?? -1) - (b.zIndex ?? -1));
        // Find the last matching region - it's the one that is visible by z-index
        const currentRegion = [...regions].reverse()
            .find((region) => doesGridRegionContainCell(region, currentCell));
        if (!currentRegion) {
            return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, ...args);
        }

        const currentCellCenter = getJigsawCellCenterAbsolutePosition(currentRegion, currentCell, true);

        const regionCells = regions.flatMap((region) => getGridRegionCells(region).map((cell) => ({
            cell,
            vector: getLineVector({
                start: currentCellCenter,
                end: getJigsawCellCenterAbsolutePosition(region, cell, true)
            }),
        })));

        // Index all cells by how many arrow moves it will take to get to them
        const regionCellsIndex: Record<number, Position> = {};
        for (const {cell, vector: {left: dx, top: dy}} of regionCells) {
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
            return {cell: regionCellsIndex[1]};
        }

        // Otherwise, go in the opposite direction while it's possible
        let newPosition = 0;
        while (regionCellsIndex[newPosition - 1]) {
            newPosition -= 1;
        }

        return {cell: regionCellsIndex[newPosition]};
    },

    transformCoords: transformCoordsByRegions,

    getRegionsWithSameCoordsTransformation(
        {
            cellsIndex,
            puzzle: {
                fieldSize: {rowsCount, columnsCount},
                importOptions: {stickyRegion} = {},
            },
            state: {
                fieldStateHistory,
                extension: {highlightCurrentPiece},
                processedExtension: {pieces: animatedPieces},
            },
        },
        isImportingPuzzle
    ): GridRegion[] {
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

        const {pieces, otherCells} = getJigsawPiecesWithCache(cellsIndex);
        const {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);
        const activePieceZIndex = getActiveJigsawPieceZIndex(piecePositions);

        const regions: GridRegion[] = pieces.map((piece, index) => {
            const {zIndex} = piecePositions[index];

            return {
                ...getJigsawPieceRegion(piece, animatedPieces[index]),
                zIndex,
                highlighted: highlightCurrentPiece && zIndex === activePieceZIndex,
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
        const regions = context.puzzle.typeManager.getRegionsWithSameCoordsTransformation!(context)
            .filter(({noInteraction}) => !noInteraction)
            .sort((a, b) => (a.zIndex ?? -1) - (b.zIndex ?? -1));

        const cellsMap: GivenDigitsMap<Position> = {};
        const flippedCellsMap: GivenDigitsMap<Position> = {};
        for (const region of regions) {
            for (const cell of getGridRegionCells(region)) {
                const {top, left} = getJigsawCellCenterAbsolutePosition(region, cell, true);

                cellsMap[top] = cellsMap[top] ?? {};
                cellsMap[top][left] = cell;

                flippedCellsMap[left] = flippedCellsMap[left] ?? {};
                flippedCellsMap[left][top] = cell;
            }
        }

        return [cellsMap, flippedCellsMap].flatMap(
            (cellsMap) => Object.values(cellsMap).flatMap((rowMap) => {
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
            })
        );
    },

    controlButtons: [
        ZoomInButtonItem(),
        ZoomOutButtonItem(),
        {
            key: "glue-jigsaw-pieces",
            region: ControlButtonRegion.custom,
            Component: JigsawGluePiecesButton,
        },
        JigsawPieceHighlightHandlerControlButtonItem,
    ],

    disabledCellWriteModes: [CellWriteMode.move],
    extraCellWriteModes: [JigsawMoveCellWriteModeInfo],

    gridBackgroundColor: lightGreyColor,
    regionBackgroundColor: "#fff",

    postProcessPuzzle(puzzle): PuzzleDefinition<JigsawPTM> {
        const processJss = (items: Constraint<JigsawPTM, any>[]) => [
            ...items.map(
                (constraint) => constraint.tags?.includes(jssTag)
                    ? {...constraint, component: {[FieldLayer.noClip]: JigsawJss}}
                    : constraint
            ),
            JigsawGluedPiecesConstraint,
        ];

        const {items, resultChecker} = puzzle;

        switch (typeof items) {
            case "function":
                puzzle = {...puzzle, items: (...args) => processJss(items(...args))};
                break;
            case "object":
                puzzle = {...puzzle, items: processJss(items)};
                break;
        }

        if (resultChecker) {
            puzzle = {
                ...puzzle,
                resultChecker: (context) => {
                    if (resultChecker !== isValidFinishedPuzzleByConstraints && !isValidFinishedPuzzleByConstraints(context)) {
                        return false;
                    }

                    return resultChecker(context);
                },
            };
        }

        return puzzle;
    },

    onCloseCorrectResultPopup({cellsIndex, puzzle, onStateChange}) {
        const stickyPiece = puzzle.importOptions?.stickyJigsawPiece;
        if (!stickyPiece) {
            return;
        }

        onStateChange([
            jigsawPieceStateChangeAction(
                puzzle,
                undefined,
                myClientId,
                "finalize-jigsaw",
                undefined,
                {position: {zIndex: 1}},
                false
            ),
            (state) => {
                const {pieces} = getJigsawPiecesWithCache(cellsIndex);
                const {extension: {pieces: piecePositions}} = gameStateGetCurrentFieldState(state);
                const [group] = groupJigsawPiecesByZIndex(pieces, piecePositions);
                const groupGesture: GestureMetrics = {
                    ...emptyGestureMetrics,
                    rotation: loop(-piecePositions[stickyPiece - 1].angle + 180, 360) - 180,
                };

                return jigsawPieceStateChangeAction(
                    puzzle,
                    undefined,
                    myClientId,
                    "finalize-jigsaw",
                    group.indexes,
                    ({position}, pieceIndex) => ({
                        position: moveJigsawPieceByGroupGesture(
                            group,
                            groupGesture,
                            pieces[pieceIndex],
                            position
                        ),
                        state: {animating: true},
                    }),
                    false
                )(state);
            },
        ]);
    },

    compensateKillerCageSumAngle: stickyDigits,

    // TODO: support shared games
});
