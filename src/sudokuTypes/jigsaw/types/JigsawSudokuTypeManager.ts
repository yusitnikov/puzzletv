import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {JigsawGameState, JigsawJssCluesVisibility, JigsawProcessedGameState} from "./JigsawGameState";
import {JigsawDigit} from "./JigsawDigit";
import {
    arrayContainsPosition,
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
    getActiveJigsawPieceIndex,
    getJigsawPieceIndexByCell,
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
import {JigsawPieceHighlightHandlerControlButtonItem} from "../components/JigsawPieceHighlightHandler";
import {gameStateGetCurrentFieldState, PartialGameStateEx} from "../../../types/sudoku/GameState";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {JigsawFieldState} from "./JigsawFieldState";
import {createEmptyFieldState} from "../../../types/sudoku/FieldState";
import {getReverseIndexMap} from "../../../utils/array";
import {createRandomGenerator} from "../../../utils/random";
import {PuzzleImportOptions} from "../../../types/sudoku/PuzzleImportOptions";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {Constraint} from "../../../types/sudoku/Constraint";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {jssTag} from "../../jss/constraints/Jss";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {JigsawJss} from "../constraints/JigsawJss";

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

        return {
            pieces: getJigsawPiecesWithCache(new SudokuCellsIndex(puzzle)).pieces.map(({boundingRect}) => {
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
            pieces: piecePositions.map((position, index) => {
                const {animating} = pieceAnimations[index];

                // eslint-disable-next-line react-hooks/rules-of-hooks
                return useAnimatedValue(
                    position,
                    animating ? animationSpeed : 0,
                    (a, b, coeff) => ({
                        top: mixAnimatedValue(a.top, b.top, coeff * 2),
                        left: mixAnimatedValue(a.left, b.left, coeff * 2),
                        angle: mixAnimatedValue(a.angle, b.angle, coeff),
                    })
                );
            }),
        };
    },

    getProcessedGameStateExtension(state): JigsawProcessedGameState {
        const {extension: {pieces}} = gameStateGetCurrentFieldState(state);
        return {pieces};
    },

    processArrowDirection(
        currentCell, xDirection, yDirection, context, ...args
    ): { cell?: Position; state?: PartialGameStateEx<JigsawPTM> } {
        const {puzzle: {typeManager: {getRegionsWithSameCoordsTransformation}}} = context;

        const regions = getRegionsWithSameCoordsTransformation!(context)
            .filter(({noInteraction}) => !noInteraction)
            .sort((a, b) => (a.zIndex ?? -1) - (b.zIndex ?? -1));
        const currentRegion = regions.find(({cells}) => cells && arrayContainsPosition(cells, currentCell));
        if (!currentRegion) {
            return defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, ...args);
        }

        const transformCellCoords = (region: GridRegion, {top, left}: Position) => {
            const center: Position = {top: top + 0.5, left: left + 0.5};
            return region.transformCoords?.(center) ?? center;
        };
        const currentTransformedCell = transformCellCoords(currentRegion, currentCell);

        const regionCells = regions.flatMap((region) => region.cells?.map((cell) => ({
            cell,
            vector: getLineVector({
                start: currentTransformedCell,
                end: transformCellCoords(region, cell)
            }),
        })) ?? []);

        // Index all cells by how many arrow moves it will take to get to them
        const regionCellsIndex: Record<number, Position> = {};
        const round = (value: number) => roundToStep(value, 0.1);
        for (const {cell, vector: {left: dx, top: dy}} of regionCells) {
            const x = xDirection === 0 ? 0 : round(dx / xDirection);
            const y = yDirection === 0 ? 0 : round(dy / yDirection);
            let position: number;
            if (xDirection === 0) {
                if (round(dx) !== 0) {
                    continue;
                }
                position = y;
            } else if (yDirection === 0) {
                if (round(dy) !== 0) {
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
                extension: {pieces: pieceIndexes, highlightCurrentPiece},
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
                highlighted: highlightCurrentPiece && index === activePieceIndex,
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
                top: Number(stickyRegion.top),
                left: Number(stickyRegion.left),
                width: Number(stickyRegion.width),
                height: Number(stickyRegion.height),
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
        JigsawPieceHighlightHandlerControlButtonItem,
    ],

    disabledCellWriteModes: [CellWriteMode.move],
    extraCellWriteModes: [JigsawMoveCellWriteModeInfo],

    gridBackgroundColor: lightGreyColor,
    regionBackgroundColor: "#fff",

    postProcessPuzzle({items, ...puzzle}): PuzzleDefinition<JigsawPTM> {
        const processJss = (items: Constraint<JigsawPTM, any>[]) => items.map(
            (constraint) => constraint.tags?.includes(jssTag)
                ? {...constraint, component: {[FieldLayer.noClip]: JigsawJss}}
                : constraint
        );

        switch (typeof items) {
            case "function": return {...puzzle, items: (...args) => processJss(items(...args))};
            case "object": return {...puzzle, items: processJss(items)};
        }

        return puzzle;
    },

    // TODO: support shared games
});
