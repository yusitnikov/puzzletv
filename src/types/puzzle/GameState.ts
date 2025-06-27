import { GridStateHistory, gridStateHistoryAddState } from "./GridStateHistory";
import { PuzzleInputMode } from "./PuzzleInputMode";
import { getAllowedPuzzleInputModeInfos } from "./PuzzleInputModeInfo";
import { CellState, CellStateEx } from "./CellState";
import {
    areAllGridStateCells,
    createEmptyGridState,
    isAnyGridStateCell,
    processGridStateCells,
    serializeGridState,
    unserializeGridState,
} from "./GridState";
import { indexes } from "../../utils/indexes";
import { emptyPosition, isSameLine, isSamePosition, Position, PositionSet } from "../layout/Position";
import { defaultProcessArrowDirection } from "./PuzzleTypeManager";
import { normalizePuzzlePosition, PuzzleDefinition } from "./PuzzleDefinition";
import {
    areSameCellsMaps,
    areSameCellsMapsByContext,
    CellsMap,
    cellsMapToArray,
    createCellsMapFromArray,
    processCellsMaps,
    serializeCellsMap,
    unserializeCellsMap,
} from "./CellsMap";
import { PuzzleContext } from "./PuzzleContext";
import { SetInterface } from "../struct/Set";
import { getExcludedDigitDataHash, getMainDigitDataHash } from "../../utils/playerDataHash";
import { PlayerObjectInfo } from "./PlayerObjectInfo";
import { serializeToLocalStorage, unserializeFromLocalStorage } from "../../utils/localStorage";
import { CellMark, CellMarkType } from "./CellMark";
import { CellExactPosition } from "./CellExactPosition";
import { CellDataSet } from "./CellDataSet";
import { isValidUserDigit } from "./Constraint";
import { DragAction } from "./DragAction";
import { incrementArrayItem } from "../../utils/array";
import { CellColor, CellColorValue } from "./CellColor";
import { CellPart } from "./CellPart";
import { loop } from "../../utils/math";
import {
    applyMetricsDiff,
    emptyGestureMetrics,
    GestureMetrics,
    transformPointCoordsMetricsBaseToAbsolute,
} from "../../utils/gestures";
import { AnyPTM } from "./PuzzleTypeMap";
import { isSelectableCell } from "./CellTypeProps";
import { PuzzleLine } from "./PuzzleLine";
import { CellGestureExtraData } from "./CellGestureExtraData";
import { GameStateActionCallback, GameStateActionOrCallback } from "./GameStateAction";
import { getRectCenter, Rect } from "../layout/Rect";

export interface GameState<T extends AnyPTM> {
    gridStateHistory: GridStateHistory<T>;
    persistentInputMode: PuzzleInputMode;
    gestureInputMode?: PuzzleInputMode;

    initialDigits: CellsMap<T["cell"]>;
    excludedDigits: CellsMap<SetInterface<T["cell"]>>;

    isMultiSelection: boolean;
    selectedCells: SetInterface<Position>;
    selectedColor: CellColor;

    currentMultiLine: PuzzleLine[];
    currentMultiLineEnd?: Position;
    isCurrentMultiLineCenters?: boolean;
    dragStartPoint?: CellExactPosition;
    dragAction: DragAction;

    animating: boolean;
    loopOffset: Position;
    angle: number;
    scale: number;

    openedLmdOnce?: boolean;

    lives: number;

    fogDemoGridStateHistory?: GridStateHistory<T>;

    currentPlayer?: string;
    playerObjects: Record<string, PlayerObjectInfo>;
}

export interface GameStateEx<T extends AnyPTM> extends GameState<T> {
    extension: T["stateEx"];
}

export type PartialGameStateEx<T extends AnyPTM> = Partial<GameState<T>> & {
    extension?: Partial<T["stateEx"]>;
};

export const mergeGameStateUpdates = <T extends AnyPTM>(...updatesArray: PartialGameStateEx<T>[]) =>
    updatesArray.reduce(({ extension: ex1, ...state1 }, { extension: ex2, ...state2 }) => ({
        ...state1,
        ...state2,
        extension: { ...ex1, ...ex2 } as typeof ex1,
    }));

// TODO: merge the state inline
export const mergeGameStateWithUpdates = <T extends AnyPTM>(
    state: GameStateEx<T>,
    ...updatesArray: PartialGameStateEx<T>[]
) =>
    updatesArray.reduce<GameStateEx<T>>(
        (state, updates) => ({
            ...state,
            ...updates,
            extension: {
                ...state.extension,
                ...updates.extension,
            },
        }),
        state,
    );

// region Serialization & empty state
type SavedGameStates = [
    key: string,
    grid: any,
    state: any,
    initialDigits: any,
    excludedDigits: any,
    inputMode: any,
    currentPlayer: any,
    ignore1: any, // ignore previous format for compatibility
    playerObjects: any,
    lives: any,
    color: CellColor,
    loopOffset: Position,
    angle: number,
    scale: number,
][];
const gameStateStorageKey = "savedGameState";
const gameStateSerializerVersion = 4;
const maxSavedPuzzles = 10;

const getSavedGameStates = (): SavedGameStates =>
    unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];

const getPuzzleFullSaveStateKey = <T extends AnyPTM>({
    slug,
    params = {},
    saveStateKey = slug,
    typeManager: { saveStateKeySuffix },
}: PuzzleDefinition<T>): string =>
    `${saveStateKey}-${params.host || ""}-${params.room || ""}${saveStateKeySuffix ? "-" + saveStateKeySuffix : ""}`;

export const getEmptyGameState = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    useLocalStorage: boolean,
    readOnly = false,
): GameStateEx<T> => {
    const { puzzle } = context;
    const { params = {}, typeManager, saveState = true, initialLives = 1 } = puzzle;

    const {
        initialGameStateExtension,
        unserializeGameState,
        initialInputMode,
        initialAngle = 0,
        initialScale = 1,
        initialPosition,
    } = typeManager;

    const fullSaveStateKey = getPuzzleFullSaveStateKey(puzzle);

    const savedGameState =
        readOnly || !saveState || !useLocalStorage
            ? undefined
            : getSavedGameStates().find(([key]) => key === fullSaveStateKey);

    return {
        gridStateHistory: new GridStateHistory(
            context,
            [
                JSON.stringify(
                    serializeGridState(
                        savedGameState
                            ? { ...unserializeGridState(savedGameState[1], context), actionId: "" }
                            : createEmptyGridState(context),
                        puzzle,
                    ),
                ),
            ],
            0,
        ),
        persistentInputMode: savedGameState?.[5] ?? initialInputMode ?? getAllowedPuzzleInputModeInfos(puzzle)[0].mode,
        gestureInputMode: undefined,
        selectedCells: new PositionSet(),
        isMultiSelection: false,
        selectedColor: savedGameState?.[10] ?? CellColor.green,
        initialDigits: unserializeCellsMap(savedGameState?.[3] || {}, puzzle.typeManager.unserializeCellData),
        excludedDigits: savedGameState?.[4]
            ? unserializeCellsMap(savedGameState[4], (excludedDigits: any) =>
                  CellDataSet.unserialize(context, excludedDigits),
              )
            : indexes(puzzle.gridSize.rowsCount).map(() =>
                  indexes(puzzle.gridSize.columnsCount).map(() => new CellDataSet(context)),
              ),

        currentMultiLine: [],
        currentMultiLineEnd: undefined,
        isCurrentMultiLineCenters: false,
        dragStartPoint: undefined,
        dragAction: DragAction.SetUndefined,

        animating: false,
        loopOffset: savedGameState?.[11] ?? initialPosition ?? emptyPosition,
        angle: savedGameState?.[12] ?? initialAngle,
        scale: savedGameState?.[13] ?? initialScale,

        lives: savedGameState?.[9] ?? initialLives,

        fogDemoGridStateHistory: undefined,

        currentPlayer: savedGameState?.[6] || params.host,
        playerObjects: savedGameState?.[8] || {},

        extension: {
            ...(typeof initialGameStateExtension === "function"
                ? (initialGameStateExtension as (puz: typeof puzzle) => T["stateEx"])(puzzle)
                : initialGameStateExtension),
            ...(savedGameState && (unserializeGameState?.(savedGameState[2]) ?? savedGameState[2])),
        } as T["stateEx"],
    };
};

export const saveGameState = <T extends AnyPTM>(context: PuzzleContext<T>): void => {
    if (context.puzzle.saveState === false) {
        return;
    }

    const {
        puzzle,
        currentGridStateWithFogDemo,
        stateExtension,
        stateInitialDigits,
        excludedDigits,
        persistentInputMode,
        currentPlayer,
        playerObjects,
        lives,
        selectedColor,
        loopOffset,
        angle,
        scale,
    } = context;

    const fullSaveStateKey = getPuzzleFullSaveStateKey(puzzle);

    serializeToLocalStorage(
        gameStateStorageKey,
        (
            [
                [
                    fullSaveStateKey,
                    serializeGridState(currentGridStateWithFogDemo, puzzle),
                    puzzle.typeManager.serializeGameState?.(stateExtension) ?? stateExtension,
                    serializeCellsMap(stateInitialDigits, puzzle.typeManager.serializeCellData),
                    serializeCellsMap(excludedDigits, (excludedDigits) => excludedDigits.serialize()),
                    persistentInputMode,
                    currentPlayer || "",
                    "",
                    playerObjects,
                    lives,
                    selectedColor,
                    loopOffset,
                    angle,
                    scale,
                ],
                ...getSavedGameStates().filter(([key]) => key !== fullSaveStateKey),
            ] as SavedGameStates
        ).slice(0, maxSavedPuzzles),
        gameStateSerializerVersion,
    );
};

export const getAllShareState = <T extends AnyPTM>({ puzzle, myGameState }: PuzzleContext<T>): any => {
    const { typeManager } = puzzle;
    const { getSharedState, serializeCellData } = typeManager;
    const { gridStateHistory, initialDigits, excludedDigits, lives, extension } = myGameState;

    return {
        grid: serializeGridState(gridStateHistory.current, puzzle),
        extension: typeManager.serializeGameState?.(extension) ?? extension,
        initialDigits: serializeCellsMap(initialDigits, serializeCellData),
        excludedDigits: serializeCellsMap(excludedDigits, (item) => item.serialize()),
        lives,
        ...getSharedState?.(puzzle, myGameState),
    };
};
export const setAllShareState = <T extends AnyPTM>(context: PuzzleContext<T>, newState: any): GameStateEx<T> => {
    const { typeManager } = context.puzzle;
    const { setSharedState, unserializeGameState, unserializeCellData } = typeManager;
    const { grid, extension, initialDigits, excludedDigits, lives } = newState;
    const unserializedGridState = unserializeGridState(grid, context);

    const result: GameStateEx<T> = mergeGameStateWithUpdates(context.state, {
        gridStateHistory: gridStateHistoryAddState(
            context,
            unserializedGridState.clientId,
            unserializedGridState.actionId,
            unserializedGridState,
        ),
        initialDigits: unserializeCellsMap(initialDigits, unserializeCellData),
        excludedDigits: unserializeCellsMap(excludedDigits, (item) => CellDataSet.unserialize(context, item)),
        lives,
        extension: unserializeGameState?.(extension) ?? extension,
    });

    return setSharedState?.(context, newState) ?? result;
};

// noinspection JSUnusedGlobalSymbols
export const areSameGameStates = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    state1: GameStateEx<T>,
    state2: GameStateEx<T>,
) => {
    if (!state1.gridStateHistory.equals(state2.gridStateHistory)) {
        return false;
    }

    if (
        state1.fogDemoGridStateHistory
            ? !state2.fogDemoGridStateHistory || !state1.fogDemoGridStateHistory.equals(state2.fogDemoGridStateHistory)
            : state2.fogDemoGridStateHistory
    ) {
        return false;
    }

    if (state1.persistentInputMode !== state2.persistentInputMode) {
        return false;
    }

    if (state1.gestureInputMode !== state2.gestureInputMode) {
        return false;
    }

    if (!areSameCellsMapsByContext(context, state1.initialDigits, state2.initialDigits)) {
        return false;
    }

    if (!areSameCellsMaps(state1.excludedDigits ?? {}, state2.excludedDigits ?? {}, (a, b) => a.equals(b))) {
        return false;
    }

    if (state1.isMultiSelection !== state2.isMultiSelection) {
        return false;
    }

    if (!state1.selectedCells.equals(state2.selectedCells)) {
        return false;
    }

    if (state1.selectedColor !== state2.selectedColor) {
        return false;
    }

    if (
        state1.currentMultiLine.length !== state2.currentMultiLine.length ||
        !state1.currentMultiLine.every((value, index) => isSameLine(value, state2.currentMultiLine[index]))
    ) {
        return false;
    }

    if (
        state1.currentMultiLineEnd?.top !== state2.currentMultiLineEnd?.top ||
        state1.currentMultiLineEnd?.left !== state2.currentMultiLineEnd?.left
    ) {
        return false;
    }

    if (state1.isCurrentMultiLineCenters !== state2.isCurrentMultiLineCenters) {
        return false;
    }

    if (
        state1.dragStartPoint?.type !== state2.dragStartPoint?.type ||
        state1.dragStartPoint?.center.top !== state2.dragStartPoint?.center.top ||
        state1.dragStartPoint?.center.left !== state2.dragStartPoint?.center.left ||
        state1.dragStartPoint?.corner.top !== state2.dragStartPoint?.corner.top ||
        state1.dragStartPoint?.corner.left !== state2.dragStartPoint?.corner.left ||
        state1.dragStartPoint?.round.top !== state2.dragStartPoint?.round.top ||
        state1.dragStartPoint?.round.left !== state2.dragStartPoint?.round.left
    ) {
        return false;
    }

    if (state1.dragAction !== state2.dragAction) {
        return false;
    }

    if (state1.animating !== state2.animating) {
        return false;
    }

    if (!isSamePosition(state1.loopOffset, state2.loopOffset)) {
        return false;
    }

    if (state1.angle !== state2.angle) {
        return false;
    }

    if (state1.scale !== state2.scale) {
        return false;
    }

    if (!!state1.openedLmdOnce !== !!state2.openedLmdOnce) {
        return false;
    }

    if (state1.lives !== state2.lives) {
        return false;
    }

    if (state1.currentPlayer !== state2.currentPlayer) {
        return false;
    }

    // noinspection RedundantIfStatementJS
    if (JSON.stringify(state1.playerObjects) !== JSON.stringify(state2.playerObjects)) {
        return false;
    }

    return true;
};
// endregion

// region History
export const gameStateGetCurrentGivenDigitsByCells = <T extends AnyPTM>(cells: CellState<T>[][]) => {
    return createCellsMapFromArray(cells.map((row) => row.map(({ usersDigit }) => usersDigit)));
};

export const gameStateUndo = <T extends AnyPTM>({ gridStateHistory }: PuzzleContext<T>): PartialGameStateEx<T> => ({
    gridStateHistory: gridStateHistory.undo(),
});

export const gameStateRedo = <T extends AnyPTM>({ gridStateHistory }: PuzzleContext<T>): PartialGameStateEx<T> => ({
    gridStateHistory: gridStateHistory.redo(),
});

export const gameStateSeekHistory = <T extends AnyPTM>(
    { gridStateHistory }: PuzzleContext<T>,
    index: number,
): PartialGameStateEx<T> => ({
    gridStateHistory: gridStateHistory.seek(index),
});
// endregion

// region Selected cells
export const gameStateAreAllSelectedCells = <T extends AnyPTM>(
    { allSelectedCells, currentGridState }: PuzzleContext<T>,
    predicate: (cellState: CellState<T>, position: Position) => boolean,
) => areAllGridStateCells(currentGridState, allSelectedCells.items, predicate);

export const gameStateIsAnySelectedCell = <T extends AnyPTM>(
    { allSelectedCells, currentGridState }: PuzzleContext<T>,
    predicate: (cellState: CellState<T>, position: Position) => boolean,
) => isAnyGridStateCell(currentGridState, allSelectedCells.items, predicate);

export const gameStateAddSelectedCell = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    cellPosition: Position,
): PartialGameStateEx<T> =>
    context.inputModeInfo.isNoSelectionMode
        ? {}
        : {
              selectedCells: context.allSelectedCells.add(cellPosition),
          };

export const gameStateSetSelectedCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    cellPositions: Position[],
): PartialGameStateEx<T> =>
    context.inputModeInfo.isNoSelectionMode
        ? {}
        : {
              selectedCells: context.allSelectedCells.set(cellPositions),
          };

export const gameStateToggleSelectedCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    cellPositions: Position[],
    forcedEnable?: boolean,
): PartialGameStateEx<T> =>
    context.inputModeInfo.isNoSelectionMode
        ? {}
        : {
              selectedCells: context.allSelectedCells.toggleAll(cellPositions, forcedEnable),
          };

export const gameStateHandleCellDoubleClick = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    cellPosition: Position,
    isAnyKeyDown: boolean,
): GameStateActionOrCallback<any, T> => {
    const { puzzle, allInitialDigits } = context;
    const {
        gridSize: { rowsCount, columnsCount },
        typeManager: { areSameCellData },
    } = puzzle;

    const { usersDigit, colors, centerDigits, cornerDigits } = context.getCell(cellPosition.top, cellPosition.left);

    const mainDigit = allInitialDigits[cellPosition.top]?.[cellPosition.left] ?? usersDigit;

    let filter: (cell: CellState<T>, cellPosition: Position, initialDigit?: T["cell"]) => boolean;
    if (mainDigit) {
        filter = ({ usersDigit }, cellPosition2, initialDigit) => {
            const otherMainDigit = initialDigit || usersDigit;
            return (
                otherMainDigit !== undefined &&
                areSameCellData(mainDigit, otherMainDigit, context, cellPosition, cellPosition2)
            );
        };
    } else if (colors.size) {
        filter = ({ colors: otherColors }) => otherColors.containsOneOf(colors.items);
    } else if (centerDigits.size) {
        filter = ({ centerDigits: otherCenterDigits }) => otherCenterDigits.containsOneOf(centerDigits.items);
    } else if (cornerDigits.size) {
        filter = ({ cornerDigits: otherCornerDigits }) => otherCornerDigits.containsOneOf(cornerDigits.items);
    } else {
        return {};
    }

    const matchingPositions: Position[] = indexes(rowsCount)
        .flatMap((top) => indexes(columnsCount).map((left) => ({ top, left })))
        .filter((cell) => filter(context.getCell(cell.top, cell.left), cell, allInitialDigits[cell.top]?.[cell.left]));

    return (context) =>
        isAnyKeyDown || context.isMultiSelection
            ? gameStateToggleSelectedCells(context, matchingPositions, true)
            : gameStateSetSelectedCells(context, matchingPositions);
};

export const gameStateSelectAllCells = <T extends AnyPTM>(context: PuzzleContext<T>) => {
    const {
        puzzleIndex,
        puzzle: {
            gridSize: { rowsCount, columnsCount },
            typeManager: { disableSelectAllCells },
        },
    } = context;

    return disableSelectAllCells
        ? {}
        : gameStateSetSelectedCells(
              context,
              indexes(rowsCount)
                  .flatMap((top) => indexes(columnsCount).map((left) => ({ left, top })))
                  .filter((cell) => isSelectableCell(puzzleIndex.getCellTypeProps(cell))),
          );
};

export const gameStateClearSelectedCells = <T extends AnyPTM>(context: PuzzleContext<T>): PartialGameStateEx<T> =>
    context.selectedCellsCount && !context.puzzle.typeManager.disableMouseHandlers
        ? {
              selectedCells: context.allSelectedCells.clear(),
          }
        : {};

export const gameStateApplyArrowToSelectedCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    xDirection: number,
    yDirection: number,
    isMultiSelection: boolean,
    isMainKeyboard: boolean,
): PartialGameStateEx<T> => {
    const { puzzle } = context;

    const currentCell = context.lastSelectedCell;

    const {
        typeManager: { processArrowDirection = defaultProcessArrowDirection, applyArrowProcessorToNoCell },
        gridSize,
        loopHorizontally,
        loopVertically,
    } = puzzle;

    let { cell: newCell, state: newState = {} } = processArrowDirection(
        currentCell ?? emptyPosition,
        xDirection,
        yDirection,
        context,
        isMainKeyboard,
    );

    // Nothing to do when there's no selection
    if (context.inputModeInfo.isNoSelectionMode || !currentCell) {
        if (!applyArrowProcessorToNoCell) {
            return {};
        }

        newCell = undefined;
    }

    if (!newCell) {
        return newState;
    }

    const result: PartialGameStateEx<T> =
        isMultiSelection || context.isMultiSelection
            ? gameStateAddSelectedCell(context, newCell)
            : gameStateSetSelectedCells(context, [newCell]);
    let loopOffset = context.loopOffset;

    // TODO: support moving and scaling for non-looping puzzles
    if (loopHorizontally) {
        const left = loop(newCell.left + loopOffset.left + 0.5, gridSize.columnsCount) - 0.5;
        const min = 1;
        const max = gridSize.columnsCount - 1 - min;
        if (left < min) {
            loopOffset = {
                ...loopOffset,
                left: loopOffset.left + (min - left),
            };
        } else if (left > max) {
            loopOffset = {
                ...loopOffset,
                left: loopOffset.left - (left - max),
            };
        }
    }

    if (loopVertically) {
        const top = loop(newCell.top + loopOffset.top + 0.5, gridSize.rowsCount) - 0.5;
        const min = 1;
        const max = gridSize.rowsCount - 1 - min;
        if (top < min) {
            loopOffset = {
                ...loopOffset,
                top: loopOffset.top + (min - top),
            };
        } else if (top > max) {
            loopOffset = {
                ...loopOffset,
                top: loopOffset.top - (top - max),
            };
        }
    }

    return {
        ...result,
        ...newState,
        loopOffset,
        animating: true,
    };
};

export const gameStateProcessSelectedCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    actionId: string,
    gridStateProcessor: (cellState: CellStateEx<T>, position: Position) => Partial<CellStateEx<T>>,
): PartialGameStateEx<T> => {
    const selectedCells = context.selectedCells.items;

    let { gridStateHistory, stateInitialDigits = {}, excludedDigits = {}, playerObjects } = context;

    for (const position of selectedCells) {
        const { top, left } = position;

        const newState = gridStateProcessor(
            {
                ...context.getCell(top, left),
                initialDigit: stateInitialDigits?.[top]?.[left],
                excludedDigits: excludedDigits[top][left],
            },
            position,
        );

        if (newState.initialDigit && !stateInitialDigits?.[top]?.[left]) {
            stateInitialDigits = {
                ...stateInitialDigits,
                [top]: {
                    ...stateInitialDigits?.[top],
                    [left]: newState.initialDigit,
                },
            };

            playerObjects = {
                ...playerObjects,
                [getMainDigitDataHash({ top, left })]: {
                    clientId,
                    isValid: !newState.isInvalid,
                    index: Object.keys(playerObjects).length,
                },
            };
        } else if ("initialDigit" in newState && stateInitialDigits?.[top]?.[left]) {
            // The key is present, but the value is undefined - remove the value
            delete stateInitialDigits[top][left];
        }

        if (newState.excludedDigits) {
            excludedDigits = {
                ...excludedDigits,
                [top]: {
                    ...excludedDigits[top],
                    [left]: newState.excludedDigits,
                },
            };

            const newDigits = newState.excludedDigits.bulkRemove(context.excludedDigits[top]?.[left]?.items || []);
            for (const digit of newDigits.items) {
                playerObjects = {
                    ...playerObjects,
                    [getExcludedDigitDataHash({ top, left }, digit, context)]: {
                        clientId,
                        isValid: !newState.isInvalid,
                        index: Object.keys(playerObjects).length,
                    },
                };
            }
        }
    }

    if (!context.inputModeInfo.isNoSelectionMode) {
        gridStateHistory = gridStateHistoryAddState(context, clientId, actionId, (gridState) =>
            processGridStateCells(gridState, selectedCells, (cellState, position) => {
                const { initialDigit, excludedDigits, ...cellStateUpdates } = gridStateProcessor(
                    {
                        ...cellState,
                        initialDigit: context.stateInitialDigits?.[position.top]?.[position.left],
                        excludedDigits: context.excludedDigits[position.top][position.left],
                    },
                    position,
                );

                return {
                    ...cellState,
                    ...cellStateUpdates,
                };
            }),
        );
    }

    return {
        gridStateHistory: gridStateHistory,
        initialDigits: stateInitialDigits,
        excludedDigits,
        playerObjects,
    };
};

const getDefaultDigitHandler = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    digit: number,
    isGlobal: boolean,
    cellData: (position: Position) => T["cell"],
): ((cellState: CellStateEx<T>, position: Position) => Partial<CellStateEx<T>>) => {
    if (isGlobal) {
        const { allInitialDigits } = context;

        const isInitialDigit = ({ top, left }: Position): boolean => allInitialDigits[top]?.[left] !== undefined;

        switch (context.inputMode) {
            case PuzzleInputMode.mainDigit:
                return ({ centerDigits, cornerDigits }, position) =>
                    isInitialDigit(position) || context.puzzleIndex.getCellTypeProps(position).noMainDigit?.(context)
                        ? {}
                        : {
                              usersDigit: cellData(position),
                              centerDigits: centerDigits.clear(),
                              cornerDigits: cornerDigits.clear(),
                          };

            case PuzzleInputMode.centerDigit:
                const areAllCentersEnabled = gameStateAreAllSelectedCells(
                    context,
                    ({ usersDigit, centerDigits }, position) =>
                        isInitialDigit(position) ||
                        usersDigit !== undefined ||
                        centerDigits.contains(cellData(position)),
                );

                return ({ usersDigit, centerDigits }, position) =>
                    isInitialDigit(position) || usersDigit !== undefined
                        ? {}
                        : {
                              centerDigits: centerDigits.toggle(cellData(position), !areAllCentersEnabled),
                          };

            case PuzzleInputMode.cornerDigit:
                const areAllCornersEnabled = gameStateAreAllSelectedCells(
                    context,
                    ({ usersDigit, cornerDigits }, position) =>
                        isInitialDigit(position) ||
                        usersDigit !== undefined ||
                        cornerDigits.contains(cellData(position)),
                );

                return ({ usersDigit, cornerDigits }, position) =>
                    isInitialDigit(position) || usersDigit !== undefined
                        ? {}
                        : {
                              cornerDigits: cornerDigits.toggle(cellData(position), !areAllCornersEnabled),
                          };

            case PuzzleInputMode.color:
                const areAllColorsEnabled = gameStateAreAllSelectedCells(context, ({ colors }) =>
                    colors.contains(digit - 1),
                );

                return ({ colors }) => ({
                    colors: colors.toggle(digit - 1, !areAllColorsEnabled),
                });
        }
    }

    return () => ({});
};

export const gameStateHandleDigit = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    digit: number,
    clientId: string,
    actionId: string,
    isGlobal: boolean,
) => {
    const { puzzle } = context;
    const { typeManager, initialLives, decreaseOnlyOneLive } = puzzle;

    const cellData = (position?: Position) => typeManager.createCellDataByTypedDigit(digit, context, position);

    const {
        handleDigitGlobally,
        handleDigitInCell = (_isGlobal, _clientId, _inputMode, _cell, _data, _position, _context, defaultValue) =>
            defaultValue,
        areSameCellData,
    } = typeManager;

    const defaultHandler = getDefaultDigitHandler(context, digit, isGlobal, cellData);

    const cache: any = {};
    let result = gameStateProcessSelectedCells(context, clientId, actionId, (cell, position) =>
        handleDigitInCell(
            isGlobal,
            clientId,
            context.inputMode,
            cell,
            cellData(position),
            position,
            context,
            defaultHandler(cell, position),
            cache,
        ),
    );

    if (handleDigitGlobally) {
        result = handleDigitGlobally(isGlobal, clientId, context, cellData(undefined), result);
    }

    if (isGlobal && initialLives) {
        const newContext = context.cloneWith({
            applyPendingMessages: false,
            myGameState: mergeGameStateWithUpdates(context.state, result),
        });
        const digits = context.userDigits;
        const newDigits = newContext.userDigits;

        const failedDigits = cellsMapToArray(
            processCellsMaps(
                (digits, position) => {
                    const digit = digits[digits.length - 2];
                    const newDigit = digits[digits.length - 1];
                    return (
                        newDigit !== undefined &&
                        (digit === undefined || !areSameCellData(digit, newDigit, newContext, position, position)) &&
                        !isValidUserDigit(position, newDigits, context)
                    );
                },
                [digits, newDigits],
            ),
        ).filter(({ data }) => data);

        if (failedDigits.length) {
            result = mergeGameStateUpdates(result, {
                lives: Math.max(0, newContext.lives - (decreaseOnlyOneLive ? 1 : failedDigits.length)),
            });
            if (!result.lives) {
                result.selectedCells = newContext.allSelectedCells.clear();
            }
        }
    }

    return result;
};

export const gameStateClearSelectedCellsContent = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    actionId: string,
): PartialGameStateEx<T> => {
    const { puzzle } = context;
    const { typeManager, hideDeleteButton } = puzzle;

    if (hideDeleteButton) {
        return {};
    }

    const clearCenter = () =>
        gameStateProcessSelectedCells(context, clientId, actionId, (cell) => ({
            centerDigits: cell.centerDigits.clear(),
        }));
    const clearCorner = () =>
        gameStateProcessSelectedCells(context, clientId, actionId, (cell) => ({
            cornerDigits: cell.cornerDigits.clear(),
        }));
    const clearColor = () =>
        gameStateProcessSelectedCells(context, clientId, actionId, (cell) => ({
            colors: cell.colors.clear(),
        }));
    const clearLines = () => gameStateDeleteAllLines(context, clientId, actionId);

    const handlers: { mode: PuzzleInputMode; check: () => boolean; process: () => PartialGameStateEx<T> }[] = [
        {
            mode: PuzzleInputMode.mainDigit,
            check: () =>
                gameStateIsAnySelectedCell(
                    context,
                    (cell, { top, left }) =>
                        context.allInitialDigits[top]?.[left] === undefined && cell.usersDigit !== undefined,
                ),
            process: () =>
                gameStateProcessSelectedCells(context, clientId, actionId, (_, { top, left }) =>
                    context.allInitialDigits[top]?.[left] === undefined ? { usersDigit: undefined } : {},
                ),
        },
        {
            mode: PuzzleInputMode.centerDigit,
            check: () => gameStateIsAnySelectedCell(context, (cell) => !!cell.centerDigits.size),
            process: clearCenter,
        },
        {
            mode: PuzzleInputMode.cornerDigit,
            check: () => gameStateIsAnySelectedCell(context, (cell) => !!cell.cornerDigits.size),
            process: clearCorner,
        },
        {
            mode: PuzzleInputMode.color,
            check: () => gameStateIsAnySelectedCell(context, (cell) => !!cell.colors.size),
            process: clearColor,
        },
        {
            mode: PuzzleInputMode.lines,
            check: () => true,
            process: clearLines,
        },
    ];

    const currentModeHandler = handlers.find((handler) => handler.mode === context.inputMode);
    if (currentModeHandler?.check()) {
        return currentModeHandler.process();
    }

    for (const handler of handlers) {
        if (handler.check()) {
            return handler.process();
        }
    }

    return typeManager.handleClearAction?.(context, clientId) || {};
};

// endregion

// region Drawing
export const gameStateNormalizeLoopOffset = <T extends AnyPTM>(
    { gridSize: { rowsCount, columnsCount }, gridMargin = 0, loopHorizontally, loopVertically }: PuzzleDefinition<T>,
    { left, top }: Position,
): Position => ({
    left: loopHorizontally ? loop(left + gridMargin, columnsCount) - gridMargin : left,
    top: loopVertically ? loop(top + gridMargin, rowsCount) - gridMargin : top,
});

export const gameStateResetCurrentMultiLine = <T extends AnyPTM>(): PartialGameStateEx<T> => ({
    currentMultiLine: [],
    currentMultiLineEnd: undefined,
    dragStartPoint: undefined,
});

export const gameStateApplyCurrentMultiLine = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    regionIndex: number | undefined,
    isClick: boolean,
    isRightButton: boolean,
    isGlobal: boolean,
    actionId: string,
): PartialGameStateEx<T> => {
    // TODO: move all parameters from state to action params

    const { puzzle } = context;
    const { allowDrawing = [], disableLineColors } = puzzle;
    const selectedColor = disableLineColors ? undefined : context.selectedColor;

    if (isGlobal) {
        return {
            gridStateHistory: gridStateHistoryAddState(context, clientId, actionId, (gridState) => {
                let { marks } = gridState;

                if (isClick && context.dragStartPoint) {
                    const { type, round } = context.dragStartPoint;

                    if (allowDrawing.includes(`${type}-mark`)) {
                        const xMark: CellMark = {
                            position: round,
                            color: selectedColor,
                            type: CellMarkType.X,
                            isCenter: type === "center",
                            regionIndex,
                        };
                        const circleMark: CellMark = {
                            position: round,
                            color: selectedColor,
                            type: CellMarkType.O,
                            isCenter: type === "center",
                            regionIndex,
                        };

                        if (type !== "center") {
                            marks = marks.toggle(xMark);
                        } else {
                            const allMarkOptions: (CellMark | undefined)[] = [undefined, circleMark, xMark];
                            const currentMark = marks.find(xMark)?.type;
                            const newMark = incrementArrayItem(
                                allMarkOptions,
                                (mark) => mark?.type === currentMark,
                                isRightButton ? -1 : 1,
                            );
                            marks = newMark ? marks.add(newMark) : marks.remove(xMark);
                        }
                    }
                }

                return {
                    ...gridState,
                    lines: gridState.lines.toggleAll(
                        context.currentMultiLine,
                        context.dragAction === DragAction.SetTrue,
                    ),
                    marks: marks.bulkAdd(puzzle.initialCellMarks ?? []),
                };
            }),
        };
    }

    return {
        currentMultiLine: [],
        currentMultiLineEnd: undefined,
        dragStartPoint: undefined,
    };
};

export const gameStateDeleteAllLines = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    actionId: string,
): PartialGameStateEx<T> => ({
    gridStateHistory: gridStateHistoryAddState(context, clientId, actionId, (gridState) => ({
        ...gridState,
        lines: gridState.lines.clear(),
        marks: gridState.marks.clear().bulkAdd(context.puzzle.initialCellMarks ?? []),
    })),
});

export const gameStateStartMultiLine = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    exactPosition: CellExactPosition,
): PartialGameStateEx<T> => {
    const {
        puzzle: { allowDrawing = [] },
    } = context;

    const { center, corner, type } = exactPosition;

    const isCenterLine: boolean | undefined = [type === "center", type !== "center"].filter((isCenter) =>
        allowDrawing.includes(isCenter ? "center-line" : "border-line"),
    )[0];

    return mergeGameStateUpdates(
        {
            currentMultiLine: [],
            currentMultiLineEnd: isCenterLine !== undefined ? (isCenterLine ? center : corner) : undefined,
            isCurrentMultiLineCenters: isCenterLine,
            dragStartPoint: exactPosition,
        },
        gameStateClearSelectedCells(context),
    );
};

export const gameStateContinueMultiLine = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { exact, regionIndex }: CellGestureExtraData,
): PartialGameStateEx<T> => {
    const { puzzle, puzzleIndex } = context;

    const result: PartialGameStateEx<T> = {
        dragStartPoint:
            context.dragStartPoint && JSON.stringify(context.dragStartPoint) === JSON.stringify(exact)
                ? context.dragStartPoint
                : undefined,
    };

    if (!context.currentMultiLineEnd) {
        return result;
    }

    if (exact.type === (context.isCurrentMultiLineCenters ? CellPart.corner : CellPart.center)) {
        return result;
    }

    const position = context.isCurrentMultiLineCenters ? exact.center : exact.corner;
    const newLines = puzzleIndex.getPath(
        { start: context.currentMultiLineEnd, end: position },
        puzzle.disableLineColors ? undefined : context.selectedColor,
    );

    if (!newLines.length) {
        return result;
    }

    return mergeGameStateUpdates(result, {
        currentMultiLine: [...context.currentMultiLine, ...newLines.map((line) => ({ ...line, regionIndex }))],
        currentMultiLineEnd: normalizePuzzlePosition(position, puzzle),
        dragAction:
            context.currentMultiLine.length === 0
                ? context.lines.contains(newLines[0])
                    ? DragAction.SetUndefined
                    : DragAction.SetTrue
                : context.dragAction,
    });
};

export const gameStateSetCellMark = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    isCenter: boolean,
    clientId: string,
    actionId: string,
    cellMarkType?: CellMarkType,
    color: CellColorValue = CellColor.black,
): PartialGameStateEx<T> => {
    return {
        gridStateHistory: gridStateHistoryAddState(context, clientId, actionId, (gridState) => {
            const { marks } = gridState;

            const mark: CellMark = {
                type: cellMarkType ?? CellMarkType.Any,
                position,
                color,
                isCenter,
            };

            return {
                ...gridState,
                marks: (cellMarkType ? marks.add(mark) : marks.remove(mark)).bulkAdd(
                    context.puzzle.initialCellMarks ?? [],
                ),
            };
        }),
    };
};

export const gameStateGetCellShading = <T extends AnyPTM>({ colors }: CellState<T>) =>
    colors.contains(CellColor.shaded)
        ? DragAction.SetTrue
        : colors.contains(CellColor.unshaded)
          ? DragAction.SetFalse
          : DragAction.SetUndefined;

export const gameStateIncrementShading = (currentState: DragAction, increment = 1) =>
    incrementArrayItem([DragAction.SetUndefined, DragAction.SetTrue, DragAction.SetFalse], currentState, increment);
export const gameStateApplyShading = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    action: DragAction,
    clientId: string,
    actionId: string,
): PartialGameStateEx<T> => {
    const { puzzle } = context;
    const { initialColors: initialColorsFunc, allowOverridingInitialColors } = puzzle;

    const initialColors = typeof initialColorsFunc === "function" ? initialColorsFunc(context) : initialColorsFunc;

    if (!allowOverridingInitialColors && initialColors?.[position.top]?.[position.left]?.length) {
        return {};
    }

    return {
        gridStateHistory: gridStateHistoryAddState(context, clientId, actionId, (gridState) =>
            processGridStateCells(gridState, [position], (cellState) => {
                return {
                    ...cellState,
                    colors: cellState.colors
                        .toggle(CellColor.shaded, action === DragAction.SetTrue)
                        .toggle(CellColor.unshaded, action === DragAction.SetFalse),
                };
            }),
        ),
    };
};
// endregion

// region Scale
export const defaultScaleStep = 1.4;
export const getScaleLog = (scale: number, step = defaultScaleStep) => Math.log(scale) / Math.log(step);
export const getAbsoluteScaleByLog = (scaleLog: number, step = defaultScaleStep) => Math.pow(step, scaleLog);

export const gameStateSetScaleLog =
    <T extends AnyPTM>(scaleLog: number, resetSelectedCells = true): GameStateActionCallback<T> =>
    ({
        puzzle: {
            typeManager: { scaleStep },
        },
        allSelectedCells,
    }) => ({
        scale: getAbsoluteScaleByLog(scaleLog, scaleStep),
        animating: true,
        ...(resetSelectedCells && { selectedCells: allSelectedCells.clear() }),
    });
// endregion

export const gameStateApplyGridDragGesture = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    startContext: PuzzleContext<T> | undefined,
    prevMetrics: GestureMetrics,
    currentMetrics: GestureMetrics,
    animate: boolean,
    resetSelection: boolean,
) => {
    const {
        puzzle: {
            loopHorizontally,
            loopVertically,
            typeManager: { allowMove, allowRotation, allowScale },
        },
    } = context;

    const filterMetrics = ({ x, y, rotation, scale }: GestureMetrics): GestureMetrics => ({
        x: loopHorizontally || allowMove ? x : 0,
        y: loopVertically || allowMove ? y : 0,
        rotation: allowRotation ? rotation : 0,
        scale: allowScale ? scale : 1,
    });
    currentMetrics = filterMetrics(currentMetrics);
    prevMetrics = filterMetrics(prevMetrics);
    context.onStateChange((context) => {
        const {
            loopOffset: { top, left },
            angle,
            scale,
        } = startContext ?? context;

        const {
            x,
            y,
            rotation,
            scale: newScale,
        } = applyMetricsDiff(
            {
                x: left,
                y: top,
                scale,
                rotation: angle,
            },
            prevMetrics,
            currentMetrics,
        );
        return {
            animating: animate,
            loopOffset: {
                left: loopHorizontally || allowMove ? x : left,
                top: loopVertically || allowMove ? y : top,
            },
            angle: rotation,
            scale: newScale,
            ...(resetSelection && { selectedCells: context.allSelectedCells.clear() }),
        };
    });
};

export const gameStateHandleZoomClick = <T extends AnyPTM>(context: PuzzleContext<T>, increment: boolean) => {
    const {
        puzzle: {
            typeManager: { scaleStep = defaultScaleStep },
        },
    } = context;

    return gameStateApplyGridDragGesture(
        context,
        undefined,
        emptyGestureMetrics,
        { ...emptyGestureMetrics, scale: increment ? scaleStep : 1 / scaleStep },
        true,
        true,
    );
};

export const gameStateFocusRect = <T extends AnyPTM>(context: PuzzleContext<T>, rect: Rect, gridRect: Rect) => {
    const {
        puzzle: {
            gridSize: { rowsCount, columnsCount },
        },
        cellSize,
    } = context;

    const center = getRectCenter(rect);

    gameStateApplyGridDragGesture(
        context,
        undefined,
        // Drag from the desired rect's corners
        {
            ...emptyGestureMetrics,
            ...transformPointCoordsMetricsBaseToAbsolute(
                {
                    x: center.left - columnsCount / 2,
                    y: center.top - rowsCount / 2,
                },
                {
                    x: context.loopOffset.left,
                    y: context.loopOffset.top,
                    scale: context.scale,
                    rotation: context.angle,
                },
            ),
            scale: (Math.max(rect.width, rect.height) * Math.SQRT2 + 1) * context.scale,
        },
        // Drag to the grid rect corners
        {
            ...emptyGestureMetrics,
            scale: Math.hypot(gridRect.width, gridRect.height) / cellSize,
        },
        true,
        true,
    );
};
