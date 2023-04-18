import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "./FieldStateHistory";
import {CellWriteMode} from "./CellWriteMode";
import {CellWriteModeInfo, getAllowedCellWriteModeInfos} from "./CellWriteModeInfo";
import {CellState, CellStateEx} from "./CellState";
import {
    areAllFieldStateCells,
    createEmptyFieldState,
    isAnyFieldStateCell,
    processFieldStateCells,
    serializeFieldState,
    unserializeFieldState
} from "./FieldState";
import {indexes} from "../../utils/indexes";
import {emptyPosition, Position, PositionSet} from "../layout/Position";
import {defaultProcessArrowDirection} from "./SudokuTypeManager";
import {normalizePuzzlePosition, PuzzleDefinition} from "./PuzzleDefinition";
import {
    GivenDigitsMap,
    givenDigitsMapToArray,
    processGivenDigitsMaps,
    serializeGivenDigitsMap,
    unserializeGivenDigitsMap
} from "./GivenDigitsMap";
import {PuzzleContext} from "./PuzzleContext";
import {SetInterface} from "../struct/Set";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../utils/playerDataHash";
import {PlayerObjectInfo} from "./PlayerObjectInfo";
import {
    loadBoolFromLocalStorage,
    loadNumberFromLocalStorage,
    loadStringFromLocalStorage,
    serializeToLocalStorage,
    unserializeFromLocalStorage
} from "../../utils/localStorage";
import {LocalStorageKeys} from "../../data/LocalStorageKeys";
import {CellMark, CellMarkType} from "./CellMark";
import {CellExactPosition} from "./CellExactPosition";
import {CellDataSet} from "./CellDataSet";
import {getAllPuzzleConstraints, isValidUserDigit, prepareGivenDigitsMapForConstraints} from "./Constraint";
import {DragAction} from "./DragAction";
import {incrementArrayItem} from "../../utils/array";
import {CellColor, CellColorValue} from "./CellColor";
import {LineWithColor} from "./LineWithColor";
import {CellPart} from "./CellPart";
import {PencilmarksCheckerMode} from "./PencilmarksCheckerMode";
import {loop} from "../../utils/math";
import {AnimationSpeed} from "./AnimationSpeed";
import {applyMetricsDiff, emptyGestureMetrics, GestureMetrics} from "../../utils/gestures";
import {myClientId, UseMultiPlayerResult} from "../../hooks/useMultiPlayer";
import {getFinalCellWriteMode} from "../../hooks/sudoku/useFinalCellWriteMode";
import {ControlKeysState} from "../../hooks/useControlKeysState";
import {AnyPTM} from "./PuzzleTypeMap";
import {isSelectableCell} from "./CellTypeProps";

export interface GameState<T extends AnyPTM> {
    fieldStateHistory: FieldStateHistory<T>;
    persistentCellWriteMode: CellWriteMode;

    initialDigits: GivenDigitsMap<T["cell"]>;
    excludedDigits: GivenDigitsMap<SetInterface<T["cell"]>>;

    isMultiSelection: boolean;
    selectedCells: SetInterface<Position>;
    selectedColor: CellColor;

    currentMultiLine: LineWithColor[];
    currentMultiLineEnd?: Position;
    isCurrentMultiLineCenters?: boolean;
    dragStartPoint?: CellExactPosition;
    dragAction: DragAction;

    animationSpeed: AnimationSpeed;
    animating: boolean;
    loopOffset: Position;
    angle: number;
    scale: number;

    openedLmdOnce?: boolean;

    lives: number;

    fogDemoFieldStateHistory?: FieldStateHistory<T>;

    currentPlayer?: string;
    playerObjects: Record<string, PlayerObjectInfo>;

    isShowingSettings: boolean;
    enableConflictChecker: boolean;
    pencilmarksCheckerMode: PencilmarksCheckerMode;
    autoCheckOnFinish: boolean;
    backgroundOpacity: number;
    nickname: string;
    highlightSeenCells: boolean;
}

export interface GameStateEx<T extends AnyPTM> extends GameState<T> {
    extension: T["stateEx"];
}

export type PartialGameStateEx<T extends AnyPTM> = Partial<GameState<T>> & {
    extension?: Partial<T["stateEx"]>;
}

export type ProcessedGameStateAnimatedValues = Pick<GameState<AnyPTM>, "loopOffset" | "angle" | "scale">;

export interface ProcessedGameState<T extends AnyPTM> extends GameState<T> {
    processed: {
        cellWriteMode: CellWriteMode;
        cellWriteModeInfo: CellWriteModeInfo<T>;
        isReady: boolean;
        isMyTurn: boolean;
        lastPlayerObjects: Record<string, boolean>;
        scaleLog: number;
        animated: ProcessedGameStateAnimatedValues & {
            scaleLog: number;
        },
    },
}

export interface ProcessedGameStateEx<T extends AnyPTM> extends ProcessedGameState<T> {
    extension: T["stateEx"];
    processedExtension: T["processedStateEx"];
}

export const mergeGameStateUpdates = <T extends AnyPTM>(
    ...updatesArray: PartialGameStateEx<T>[]
) => updatesArray.reduce(
    ({extension: ex1, ...state1}, {extension: ex2, ...state2}) => ({
        ...state1,
        ...state2,
        extension: {...ex1, ...ex2} as typeof ex1
    })
);

export const mergeGameStateWithUpdates = <T extends AnyPTM>(
    state: GameStateEx<T>,
    ...updatesArray: PartialGameStateEx<T>[]
) => updatesArray.reduce<GameStateEx<T>>(
    (state, updates) => ({
        ...state,
        ...updates,
        extension: {
            ...state.extension,
            ...updates.extension,
        },
    }),
    state
);

export const mergeProcessedGameStateWithUpdates = <T extends AnyPTM>(
    {processed, processedExtension, ...state}: ProcessedGameStateEx<T>,
    ...updatesArray: PartialGameStateEx<T>[]
): ProcessedGameStateEx<T> => ({
    ...mergeGameStateWithUpdates(state, ...updatesArray),
    processed,
    processedExtension,
});

export const calculateProcessedGameState = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    multiPlayer: UseMultiPlayerResult,
    gameState: GameStateEx<T>,
    processedGameStateExtension: T["processedStateEx"],
    {loopOffset, angle, scale}: ProcessedGameStateAnimatedValues = gameState,
    readOnly: boolean,
    keys?: ControlKeysState,
): ProcessedGameStateEx<T> => {
    const {
        isReady: isReadyFn = () => true,
        scaleStep,
    } = puzzle.typeManager;

    const {isEnabled, isLoaded, isDoubledConnected, hostData} = multiPlayer;

    const allowedCellWriteModes = getAllowedCellWriteModeInfos(puzzle);
    const cellWriteMode = keys
        ? getFinalCellWriteMode(keys, gameState.persistentCellWriteMode, allowedCellWriteModes, readOnly)
        : gameState.persistentCellWriteMode;
    const cellWriteModeInfo = allowedCellWriteModes.find(({mode}) => mode === cellWriteMode)!;
    const isReady = !readOnly
        && !isDoubledConnected
        && !(isEnabled && (!isLoaded || !hostData))
        && isReadyFn(gameState);

    let lastPlayerObjects: Record<string, boolean> = {};
    if (isEnabled) {
        let sortedPlayerObjects = Object.entries(gameState.playerObjects)
            .sort(([, a], [, b]) => b.index - a.index);
        if (sortedPlayerObjects.length) {
            const [, {clientId: lastClientId}] = sortedPlayerObjects[0];
            const lastPrevClientIdIndex = sortedPlayerObjects.findIndex(([, {clientId}]) => clientId !== lastClientId);
            if (lastPrevClientIdIndex >= 0) {
                sortedPlayerObjects = sortedPlayerObjects.slice(0, lastPrevClientIdIndex);
            }
            lastPlayerObjects = Object.fromEntries(
                sortedPlayerObjects.map(([key]) => [key, true])
            )
        }
    }

    return {
        ...gameState,
        processed: {
            cellWriteMode,
            cellWriteModeInfo,
            isReady,
            isMyTurn: !isEnabled || gameState.currentPlayer === myClientId || !!puzzle.params?.share,
            lastPlayerObjects,
            scaleLog: getScaleLog(gameState.scale, scaleStep),
            animated: {loopOffset, angle, scale, scaleLog: getScaleLog(scale, scaleStep)},
        },
        processedExtension: processedGameStateExtension ?? ({} as T["processedStateEx"]),
    };
};

// region Serialization & empty state
type SavedGameStates = [
    key: string,
    field: any,
    state: any,
    initialDigits: any,
    excludedDigits: any,
    cellWriteMode: any,
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
const gameStateSerializerVersion = 3;
const maxSavedPuzzles = 10;

const getSavedGameStates = (): SavedGameStates => unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];

const getPuzzleFullSaveStateKey = <T extends AnyPTM>({slug, params = {}, saveStateKey = slug}: PuzzleDefinition<T>): string =>
    `${saveStateKey}-${params.host || ""}-${params.room || ""}`;

export const getEmptyGameState = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    useLocalStorage: boolean,
    readOnly = false
): GameStateEx<T> => {
    const {
        params = {},
        typeManager,
        saveState = true,
        initialLives = 1,
    } = puzzle;

    const {
        initialGameStateExtension,
        unserializeGameState,
        initialCellWriteMode,
        initialAngle = 0,
        initialScale = 1,
    } = typeManager;

    const fullSaveStateKey = getPuzzleFullSaveStateKey(puzzle);

    const savedGameState = (readOnly || !saveState || !useLocalStorage)
        ? undefined
        : getSavedGameStates().find(([key]) => key === fullSaveStateKey);

    return {
        fieldStateHistory: {
            states: [
                savedGameState
                    ? {...unserializeFieldState(savedGameState[1], puzzle), actionId: ""}
                    : createEmptyFieldState(puzzle)
            ],
            currentIndex: 0,
        },
        persistentCellWriteMode: savedGameState?.[5] ?? initialCellWriteMode ?? getAllowedCellWriteModeInfos(puzzle)[0].mode,
        selectedCells: new PositionSet(),
        isMultiSelection: loadBoolFromLocalStorage(LocalStorageKeys.enableMultiSelection, false),
        selectedColor: savedGameState?.[10] ?? CellColor.green,
        initialDigits: unserializeGivenDigitsMap(savedGameState?.[3] || {}, puzzle.typeManager.unserializeCellData),
        excludedDigits: savedGameState?.[4]
            ? unserializeGivenDigitsMap(savedGameState[4], (excludedDigits: any) => CellDataSet.unserialize(puzzle, excludedDigits))
            : indexes(puzzle.fieldSize.rowsCount).map(() => indexes(puzzle.fieldSize.columnsCount).map(() => new CellDataSet(puzzle))),

        currentMultiLine: [],
        currentMultiLineEnd: undefined,
        isCurrentMultiLineCenters: false,
        dragStartPoint: undefined,
        dragAction: DragAction.SetUndefined,

        // TODO: save animation speed in the global settings
        animationSpeed: AnimationSpeed.regular,
        animating: false,
        loopOffset: savedGameState?.[11] ?? emptyPosition,
        angle: savedGameState?.[12] ?? initialAngle,
        scale: savedGameState?.[13] ?? initialScale,

        lives: savedGameState?.[9] ?? initialLives,

        fogDemoFieldStateHistory: undefined,

        currentPlayer: savedGameState?.[6] || params.host,
        playerObjects: savedGameState?.[8] || {},

        isShowingSettings: false,
        enableConflictChecker: loadBoolFromLocalStorage(LocalStorageKeys.enableConflictChecker, true),
        pencilmarksCheckerMode: loadNumberFromLocalStorage(LocalStorageKeys.pencilmarksCheckerMode, PencilmarksCheckerMode.CheckObvious),
        autoCheckOnFinish: loadBoolFromLocalStorage(LocalStorageKeys.autoCheckOnFinish, true),
        backgroundOpacity: loadNumberFromLocalStorage(LocalStorageKeys.backgroundOpacity, 0.5),
        nickname: loadStringFromLocalStorage(LocalStorageKeys.nickname, ""),
        highlightSeenCells: loadBoolFromLocalStorage(LocalStorageKeys.highlightSeenCells, false),

        extension: {
            ...(
                typeof initialGameStateExtension === "function"
                    ? (initialGameStateExtension as (puz: typeof puzzle) => T["stateEx"])(puzzle)
                    : initialGameStateExtension
            ),
            ...(savedGameState && unserializeGameState(savedGameState[2]))
        } as T["stateEx"],
    };
};

export const saveGameState = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, state: GameStateEx<T>): void => {
    const {
        typeManager,
        saveState = true,
    } = puzzle;

    if (!saveState) {
        return;
    }

    const fullSaveStateKey = getPuzzleFullSaveStateKey(puzzle);

    serializeToLocalStorage(
        gameStateStorageKey,
        ([
            [
                fullSaveStateKey,
                serializeFieldState(gameStateGetCurrentFieldState(state, true), puzzle),
                typeManager.serializeGameState(state.extension),
                serializeGivenDigitsMap(state.initialDigits, typeManager.serializeCellData),
                serializeGivenDigitsMap(state.excludedDigits, (excludedDigits) => excludedDigits.serialize()),
                state.persistentCellWriteMode,
                state.currentPlayer || "",
                "",
                state.playerObjects,
                state.lives,
                state.selectedColor,
                state.loopOffset,
                state.angle,
                state.scale,
            ],
            ...getSavedGameStates().filter(([key]) => key !== fullSaveStateKey),
        ] as SavedGameStates).slice(0, maxSavedPuzzles),
        gameStateSerializerVersion
    );
};

export const getAllShareState = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, state: GameStateEx<T>): any => {
    const {typeManager} = puzzle;
    const {getSharedState, serializeCellData} = typeManager;
    const {initialDigits, excludedDigits, lives, extension} = state;

    return {
        field: serializeFieldState(gameStateGetCurrentFieldState(state), puzzle),
        extension: typeManager.serializeGameState(extension),
        initialDigits: serializeGivenDigitsMap(initialDigits, serializeCellData),
        excludedDigits: serializeGivenDigitsMap(excludedDigits, item => item.serialize()),
        lives,
        ...getSharedState?.(puzzle, state),
    };
}
export const setAllShareState = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    state: GameStateEx<T>,
    newState: any
): GameStateEx<T> => {
    const {typeManager} = puzzle;
    const {setSharedState, unserializeGameState, unserializeCellData} = typeManager;
    const {field, extension, initialDigits, excludedDigits, lives} = newState;
    const unserializedFieldState = unserializeFieldState(field, puzzle);

    const result: GameStateEx<T> = mergeGameStateWithUpdates(
        state,
        {
            fieldStateHistory: fieldStateHistoryAddState(
                puzzle,
                state.fieldStateHistory,
                unserializedFieldState.clientId,
                unserializedFieldState.actionId,
                unserializedFieldState,
            ),
            initialDigits: unserializeGivenDigitsMap(initialDigits, unserializeCellData),
            excludedDigits: unserializeGivenDigitsMap(excludedDigits, item => CellDataSet.unserialize(puzzle, item)),
            lives,
            extension: unserializeGameState(extension),
        }
    );

    return setSharedState?.(puzzle, result, newState) ?? result;
};
// endregion

// region History
export const gameStateGetCurrentFieldState = <T extends AnyPTM>(
    {fieldStateHistory, fogDemoFieldStateHistory}: GameState<T>,
    useFogDemoState = false
) => fieldStateHistoryGetCurrent(
    (useFogDemoState ? fogDemoFieldStateHistory : undefined) ?? fieldStateHistory
);

export const gameStateGetCurrentGivenDigitsByCells = <T extends AnyPTM>(cells: CellState<T>[][]) => {
    const result: GivenDigitsMap<T["cell"]> = {};

    cells.forEach(
        (row, rowIndex) => row.forEach(
            ({usersDigit}, columnIndex) => {
                if (usersDigit) {
                    result[rowIndex] = result[rowIndex] || {};
                    result[rowIndex][columnIndex] = usersDigit;
                }
            }
        )
    );

    return result;
};

export const gameStateGetCurrentGivenDigits = <T extends AnyPTM>(state: GameState<T>) =>
    gameStateGetCurrentGivenDigitsByCells(gameStateGetCurrentFieldState(state).cells);

export const gameStateUndo = <T extends AnyPTM>(
    {fieldStateHistory}: GameState<T>
): PartialGameStateEx<T> => ({
    fieldStateHistory: fieldStateHistoryUndo(fieldStateHistory),
});

export const gameStateRedo = <T extends AnyPTM>(
    {fieldStateHistory}: GameState<T>
): PartialGameStateEx<T> => ({
    fieldStateHistory: fieldStateHistoryRedo(fieldStateHistory),
});
// endregion

// region Selected cells
export const gameStateAreAllSelectedCells = <T extends AnyPTM>(
    state: GameState<T>,
    predicate: (cellState: CellState<T>, position: Position) => boolean
) => areAllFieldStateCells(
    gameStateGetCurrentFieldState(state),
    state.selectedCells.items,
    predicate
);

export const gameStateIsAnySelectedCell = <T extends AnyPTM>(
    state: GameState<T>,
    predicate: (cellState: CellState<T>, position: Position) => boolean
) => isAnyFieldStateCell(
    gameStateGetCurrentFieldState(state),
    state.selectedCells.items,
    predicate
);

export const gameStateAddSelectedCell = <T extends AnyPTM>(
    state: ProcessedGameState<T>,
    cellPosition: Position
): PartialGameStateEx<T> => ({
    selectedCells: state.processed.cellWriteModeInfo.isNoSelectionMode
        ? state.selectedCells
        : state.selectedCells.add(cellPosition),
});

export const gameStateSetSelectedCells = <T extends AnyPTM>(
    state: ProcessedGameState<T>,
    cellPositions: Position[]
): PartialGameStateEx<T> => ({
    selectedCells: state.processed.cellWriteModeInfo.isNoSelectionMode
        ? state.selectedCells
        : state.selectedCells.set(cellPositions),
});

export const gameStateToggleSelectedCells = <T extends AnyPTM>(
    state: ProcessedGameState<T>,
    cellPositions: Position[],
    forcedEnable?: boolean
): PartialGameStateEx<T> => ({
    selectedCells: state.processed.cellWriteModeInfo.isNoSelectionMode
        ? state.selectedCells
        : state.selectedCells.toggleAll(cellPositions, forcedEnable),
});

export const gameStateHandleCellDoubleClick = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    cellPosition: Position,
    isAnyKeyDown: boolean,
): Parameters<PuzzleContext<T>["onStateChange"]>[0] => {
    const {puzzle, state} = context;
    const {initialDigits: stateInitialDigits} = state;
    const {initialDigits, typeManager: {areSameCellData}} = puzzle;
    const {cells} = gameStateGetCurrentFieldState(state);

    const {usersDigit, colors, centerDigits, cornerDigits} = cells[cellPosition.top][cellPosition.left];
    const mainDigit = initialDigits?.[cellPosition.top]?.[cellPosition.left]
        || stateInitialDigits?.[cellPosition.top]?.[cellPosition.left]
        || usersDigit;

    let filter: (cell: CellState<T>, initialDigit?: T["cell"]) => boolean;
    if (mainDigit) {
        filter = ({usersDigit}, initialDigit) => {
            const otherMainDigit = initialDigit || usersDigit;
            return otherMainDigit !== undefined && areSameCellData(mainDigit, otherMainDigit, puzzle, undefined, false);
        };
    } else if (colors.size) {
        filter = ({colors: otherColors}) => otherColors.containsOneOf(colors.items);
    } else if (centerDigits.size) {
        filter = ({centerDigits: otherCenterDigits}) => otherCenterDigits.containsOneOf(centerDigits.items);
    } else if (cornerDigits.size) {
        filter = ({cornerDigits: otherCornerDigits}) => otherCornerDigits.containsOneOf(cornerDigits.items);
    } else {
        return {};
    }

    const matchingPositions: Position[] = cells
        .flatMap((row, top) => row.map((cellState, left) => ({
            position: {top, left},
            cellState,
            initialDigit: initialDigits?.[top]?.[left] || stateInitialDigits?.[top]?.[left],
        })))
        .filter(({cellState, initialDigit}) => filter(cellState, initialDigit))
        .map(({position}) => position);

    return (gameState) => isAnyKeyDown || gameState.isMultiSelection
            ? gameStateToggleSelectedCells(gameState, matchingPositions, true)
            : gameStateSetSelectedCells(gameState, matchingPositions)
    ;
};

export const gameStateSelectAllCells = <T extends AnyPTM>(
    {cellsIndex, puzzle: {fieldSize: {rowsCount, columnsCount}}, state}: PuzzleContext<T>
) => {
    return gameStateSetSelectedCells<T>(
        state,
        indexes(rowsCount)
            .flatMap(top => indexes(columnsCount).map(left => ({left, top})))
            .filter(cell => isSelectableCell(cellsIndex.getCellTypeProps(cell)))
    );
};

export const gameStateClearSelectedCells = <T extends AnyPTM>(state: GameState<T>): PartialGameStateEx<T> => ({
    selectedCells: state.selectedCells.clear(),
});

export const gameStateApplyArrowToSelectedCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    xDirection: number,
    yDirection: number,
    isMultiSelection: boolean,
    isMainKeyboard: boolean
): PartialGameStateEx<T> => {
    const {puzzle, state} = context;

    if (state.processed.cellWriteModeInfo.isNoSelectionMode) {
        return {};
    }

    const currentCell = state.selectedCells.last();
    // Nothing to do when there's no selection
    if (!currentCell) {
        return {};
    }

    const {
        typeManager: {processArrowDirection = defaultProcessArrowDirection},
        fieldSize,
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const {cell: newCell, state: newState = {}} = processArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard);
    if (!newCell) {
        return newState;
    }

    const result: PartialGameStateEx<T> = (isMultiSelection || state.isMultiSelection)
        ? gameStateAddSelectedCell(state, newCell)
        : gameStateSetSelectedCells(state, [newCell]);
    let loopOffset = state.loopOffset;

    // TODO: support moving and scaling for non-looping puzzles
    if (loopHorizontally) {
        const left = loop(newCell.left + loopOffset.left + 0.5, fieldSize.columnsCount) - 0.5;
        const min = 1;
        const max = fieldSize.columnsCount - 1 - min;
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
        const top = loop(newCell.top + loopOffset.top + 0.5, fieldSize.rowsCount) - 0.5;
        const min = 1;
        const max = fieldSize.rowsCount - 1 - min;
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
    fieldStateProcessor: (cellState: CellStateEx<T>, position: Position) => Partial<CellStateEx<T>>
): PartialGameStateEx<T> => {
    const {puzzle, state} = context;

    const currentState = gameStateGetCurrentFieldState(state);

    const selectedCells = state.selectedCells.items;
    let {fieldStateHistory, initialDigits = {}, excludedDigits = {}, playerObjects} = state;

    for (const position of selectedCells) {
        const {top, left} = position;

        const newState = fieldStateProcessor({
            ...currentState.cells[top][left],
            initialDigit: initialDigits?.[top]?.[left],
            excludedDigits: excludedDigits[top][left],
        }, position);

        if (newState.initialDigit && !initialDigits?.[top]?.[left]) {
            initialDigits = {
                ...initialDigits,
                [top]: {
                    ...initialDigits?.[top],
                    [left]: newState.initialDigit,
                }
            };

            playerObjects = {
                ...playerObjects,
                [getMainDigitDataHash({top, left})]: {
                    clientId,
                    isValid: !newState.isInvalid,
                    index: Object.keys(playerObjects).length,
                },
            };
        } else if ("initialDigit" in newState && initialDigits?.[top]?.[left]) {
            // The key is present, but the value is undefined - remove the value
            delete initialDigits[top][left];
        }

        if (newState.excludedDigits) {
            excludedDigits = {
                ...excludedDigits,
                [top]: {
                    ...excludedDigits[top],
                    [left]: newState.excludedDigits,
                }
            };

            const newDigits = newState.excludedDigits.bulkRemove(state.excludedDigits[top]?.[left]?.items || []);
            for (const digit of newDigits.items) {
                playerObjects = {
                    ...playerObjects,
                    [getExcludedDigitDataHash({top, left}, digit, context)]: {
                        clientId,
                        isValid: !newState.isInvalid,
                        index: Object.keys(playerObjects).length,
                    },
                };
            }
        }
    }

    if (!state.processed.cellWriteModeInfo.isNoSelectionMode) {
        fieldStateHistory = fieldStateHistoryAddState(
            puzzle,
            fieldStateHistory,
            clientId,
            actionId,
            state => processFieldStateCells(
                state,
                selectedCells,
                (cellState, position) => {
                    const {initialDigit, excludedDigits, ...cellStateUpdates} = fieldStateProcessor({
                        ...cellState,
                        initialDigit: context.state.initialDigits?.[position.top]?.[position.left],
                        excludedDigits: context.state.excludedDigits[position.top][position.left],
                    }, position);

                    return {
                        ...cellState,
                        ...cellStateUpdates,
                    };
                }
            ),
        );
    }

    return {
        fieldStateHistory,
        initialDigits,
        excludedDigits,
        playerObjects,
    };
};

const getDefaultDigitHandler = <T extends AnyPTM>(
    {
        puzzle: {
            typeManager,
            initialDigits,
        },
        state,
    }: PuzzleContext<T>,
    digit: number,
    isGlobal: boolean,
    cellData: (position: Position) => T["cell"]
): (cellState: CellStateEx<T>, position: Position) => Partial<CellStateEx<T>> => {
    if (isGlobal) {
        const isInitialDigit = ({top, left}: Position): boolean =>
            initialDigits?.[top]?.[left] !== undefined || state.initialDigits[top]?.[left] !== undefined;

        switch (state.processed.cellWriteMode) {
            case CellWriteMode.main:
                return ({centerDigits, cornerDigits}, position) => isInitialDigit(position) ? {} : {
                    usersDigit: cellData(position),
                    centerDigits: centerDigits.clear(),
                    cornerDigits: cornerDigits.clear(),
                };

            case CellWriteMode.center:
                const areAllCentersEnabled = gameStateAreAllSelectedCells(
                    state,
                    ({usersDigit, centerDigits}, position) =>
                        isInitialDigit(position) || usersDigit !== undefined || centerDigits.contains(cellData(position))
                );

                return ({usersDigit, centerDigits}, position) =>
                    isInitialDigit(position) || usersDigit !== undefined ? {} : {
                        centerDigits: centerDigits.toggle(cellData(position), !areAllCentersEnabled)
                    };

            case CellWriteMode.corner:
                const areAllCornersEnabled = gameStateAreAllSelectedCells(
                    state,
                    ({usersDigit, cornerDigits}, position) =>
                        isInitialDigit(position) || usersDigit !== undefined || cornerDigits.contains(cellData(position))
                );

                return ({usersDigit, cornerDigits}, position) =>
                    isInitialDigit(position) || usersDigit !== undefined ? {} : {
                        cornerDigits: cornerDigits.toggle(cellData(position), !areAllCornersEnabled)
                    };

            case CellWriteMode.color:
                const areAllColorsEnabled = gameStateAreAllSelectedCells(
                    state,
                    ({colors}) => colors.contains(digit - 1)
                );

                return ({colors}) => ({
                    colors: colors.toggle(digit - 1, !areAllColorsEnabled)
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
    const {puzzle, state} = context;
    const {typeManager, initialLives, decreaseOnlyOneLive} = puzzle;

    const cellData = (position?: Position) => typeManager.createCellDataByTypedDigit(digit, context, position);

    const {
        handleDigitGlobally,
        handleDigitInCell = (isGlobal, clientId, cellWriteMode, cell, data, position, context, defaultValue) => defaultValue,
        areSameCellData,
    } = typeManager;

    const defaultHandler = getDefaultDigitHandler(context, digit, isGlobal, cellData);

    const cache: any = {};
    let result = gameStateProcessSelectedCells(
        context,
        clientId,
        actionId,
        (cell, position) => handleDigitInCell(
            isGlobal, clientId, state.processed.cellWriteMode, cell, cellData(position), position, context, defaultHandler(cell, position), cache
        )
    );

    if (handleDigitGlobally) {
        result = handleDigitGlobally(isGlobal, clientId, context, cellData(undefined), result);
    }

    if (isGlobal && initialLives) {
        const newState = mergeProcessedGameStateWithUpdates(state, result);
        const digits = prepareGivenDigitsMapForConstraints(context, gameStateGetCurrentFieldState(state).cells);
        const newDigits = prepareGivenDigitsMapForConstraints(context, gameStateGetCurrentFieldState(newState).cells);
        const items = getAllPuzzleConstraints(context);

        const failedDigits = givenDigitsMapToArray(processGivenDigitsMaps(
            (digits, position) => {
                const digit = digits[digits.length - 2];
                const newDigit = digits[digits.length - 1];
                return newDigit !== undefined
                    && (digit === undefined || !areSameCellData(digit, newDigit, puzzle, newState, true))
                    && !isValidUserDigit(position, newDigits, items, context);
            },
            [digits, newDigits]
        )).filter(({data}) => data);

        if (failedDigits.length) {
            result = mergeGameStateUpdates(result, {
                lives: Math.max(0, newState.lives - (decreaseOnlyOneLive ? 1 : failedDigits.length)),
            });
            if (!result.lives) {
                result.selectedCells = newState.selectedCells.clear();
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
    const {puzzle, state} = context;
    const {typeManager, hideDeleteButton} = puzzle;

    if (hideDeleteButton) {
        return {};
    }

    const clearCenter = () => gameStateProcessSelectedCells(context, clientId, actionId, cell => ({
        centerDigits: cell.centerDigits.clear()
    }));
    const clearCorner = () => gameStateProcessSelectedCells(context, clientId, actionId, cell => ({
        cornerDigits: cell.cornerDigits.clear()
    }));
    const clearColor = () => gameStateProcessSelectedCells(context, clientId, actionId, cell => ({
        colors: cell.colors.clear()
    }));
    const clearLines = () => gameStateDeleteAllLines(puzzle, state, clientId, actionId);

    switch (state.processed.cellWriteMode) {
        case CellWriteMode.main:
            if (gameStateIsAnySelectedCell(state, cell => !!cell.usersDigit)) {
                return gameStateProcessSelectedCells(context, clientId, actionId, () => ({
                    usersDigit: undefined
                }));
            }

            if (gameStateIsAnySelectedCell(state, cell => !!cell.centerDigits.size)) {
                return clearCenter();
            }

            if (gameStateIsAnySelectedCell(state, cell => !!cell.cornerDigits.size)) {
                return clearCorner();
            }

            if (gameStateIsAnySelectedCell(state, cell => !!cell.colors.size)) {
                return clearColor();
            }

            return clearLines();

        case CellWriteMode.center:
            return clearCenter();

        case CellWriteMode.corner:
            return clearCorner()

        case CellWriteMode.color:
            return clearColor();

        case CellWriteMode.lines:
            return clearLines();
    }

    return typeManager.handleClearAction?.(context, clientId) || {};
};

// endregion

// region Drawing
export const gameStateNormalizeLoopOffset = <T extends AnyPTM>(
    {
        fieldSize: {rowsCount, columnsCount},
        fieldMargin = 0,
        loopHorizontally,
        loopVertically,
    }: PuzzleDefinition<T>,
    {left, top}: Position
): Position => ({
    left: loopHorizontally ? loop(left + fieldMargin, columnsCount) - fieldMargin : left,
    top: loopVertically ? loop(top + fieldMargin, rowsCount) - fieldMargin : top,
});

export const gameStateResetCurrentMultiLine = <T extends AnyPTM>(): PartialGameStateEx<T> => ({
    currentMultiLine: [],
    currentMultiLineEnd: undefined,
    dragStartPoint: undefined,
});

export const gameStateApplyCurrentMultiLine = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    isClick: boolean,
    isRightButton: boolean,
    isGlobal: boolean,
    actionId: string,
): PartialGameStateEx<T> => {
    // TODO: move all parameters from state to action params

    const {puzzle, state} = context;
    const {allowDrawing = [], disableLineColors} = puzzle;
    const selectedColor = disableLineColors ? undefined : state.selectedColor;

    if (isGlobal) {
        return {
            fieldStateHistory: fieldStateHistoryAddState(
                puzzle,
                state.fieldStateHistory,
                clientId,
                actionId,
                (fieldState) => {
                    let {marks} = fieldState;

                    if (isClick && state.dragStartPoint) {
                        const {type, round} = state.dragStartPoint;

                        if (allowDrawing.includes(`${type}-mark`)) {
                            const xMark: CellMark = {position: round, color: selectedColor, type: CellMarkType.X, isCenter: type === "center"};
                            const circleMark: CellMark = {position: round, color: selectedColor, type: CellMarkType.O, isCenter: type === "center"};

                            if (type !== "center") {
                                marks = marks.toggle(xMark);
                            } else {
                                const allMarkOptions: (CellMark | undefined)[] = [
                                    undefined,
                                    circleMark,
                                    xMark,
                                ];
                                const currentMark = marks.find(xMark)?.type;
                                const newMark = incrementArrayItem(
                                    allMarkOptions,
                                    (mark) => mark?.type === currentMark,
                                    isRightButton ? -1 : 1
                                )
                                marks = newMark ? marks.add(newMark) : marks.remove(xMark);
                            }
                        }
                    }

                    return {
                        ...fieldState,
                        lines: fieldState.lines.toggleAll(state.currentMultiLine, state.dragAction === DragAction.SetTrue),
                        marks: marks.bulkAdd(puzzle.initialCellMarks ?? []),
                    };
                }
            ),
        };
    }

    return {
        currentMultiLine: [],
        currentMultiLineEnd: undefined,
        dragStartPoint: undefined,
    };
};

export const gameStateDeleteAllLines = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    state: GameState<T>,
    clientId: string,
    actionId: string,
): PartialGameStateEx<T> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        puzzle,
        state.fieldStateHistory,
        clientId,
        actionId,
        (fieldState) => ({
            ...fieldState,
            lines: fieldState.lines.clear(),
            marks: fieldState.marks.clear().bulkAdd(puzzle.initialCellMarks ?? []),
        })
    ),
});

export const gameStateStartMultiLine = <T extends AnyPTM>(
    {puzzle: {allowDrawing = []}, state}: PuzzleContext<T>,
    exactPosition: CellExactPosition
): PartialGameStateEx<T> => {
    const {center, corner, type} = exactPosition;

    const isCenterLine: boolean | undefined = [
        type === "center",
        type !== "center",
    ]
        .filter(isCenter => allowDrawing.includes(isCenter ? "center-line" : "border-line"))
        [0];

    return mergeGameStateUpdates({
        currentMultiLine: [],
        currentMultiLineEnd: isCenterLine !== undefined
            ? (isCenterLine ? center : corner)
            : undefined,
        isCurrentMultiLineCenters: isCenterLine,
        dragStartPoint: exactPosition,
    }, gameStateClearSelectedCells(state));
};

export const gameStateContinueMultiLine = <T extends AnyPTM>(
    {
        puzzle,
        cellsIndex,
        state,
    }: PuzzleContext<T>,
    exactPosition: CellExactPosition
): PartialGameStateEx<T> => {
    const result: PartialGameStateEx<T> = {
        dragStartPoint: state.dragStartPoint && JSON.stringify(state.dragStartPoint) === JSON.stringify(exactPosition)
            ? state.dragStartPoint
            : undefined,
    };

    const currentMultiLineEnd = state.currentMultiLineEnd;
    if (!currentMultiLineEnd) {
        return result;
    }

    if (exactPosition.type === (state.isCurrentMultiLineCenters ? CellPart.corner : CellPart.center)) {
        return result;
    }

    const position = state.isCurrentMultiLineCenters ? exactPosition.center : exactPosition.corner;
    const newLines = cellsIndex.getPath(
        {start: currentMultiLineEnd, end: position},
        puzzle.disableLineColors ? undefined : state.selectedColor
    );

    if (!newLines.length) {
        return result;
    }

    return mergeGameStateUpdates(result, {
        currentMultiLine: [...state.currentMultiLine, ...newLines],
        currentMultiLineEnd: normalizePuzzlePosition(position, puzzle),
        dragAction: state.currentMultiLine.length === 0
            ? (gameStateGetCurrentFieldState(state).lines.contains(newLines[0]) ? DragAction.SetUndefined : DragAction.SetTrue)
            : state.dragAction,
    });
};

export const gameStateSetCellMark = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    isCenter: boolean,
    clientId: string,
    actionId: string,
    cellMarkType?: CellMarkType,
    color: CellColorValue = CellColor.black
): PartialGameStateEx<T> => {
    const {
        puzzle,
        state: {fieldStateHistory},
    } = context;

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            puzzle,
            fieldStateHistory,
            clientId,
            actionId,
            (fieldState) => {
                const {marks} = fieldState;

                const mark: CellMark = {
                    type: cellMarkType ?? CellMarkType.Any,
                    position,
                    color,
                    isCenter,
                };

                return {
                    ...fieldState,
                    marks: (cellMarkType ? marks.add(mark) : marks.remove(mark))
                        .bulkAdd(puzzle.initialCellMarks ?? []),
                };
            }
        ),
    };
};

export const gameStateGetCellShading = <T extends AnyPTM>({colors}: CellState<T>) =>
    colors.contains(CellColor.shaded)
        ? DragAction.SetTrue
        : colors.contains(CellColor.unshaded)
            ? DragAction.SetFalse
            : DragAction.SetUndefined;

export const gameStateIncrementShading = (currentState: DragAction, increment = 1) => incrementArrayItem(
    [DragAction.SetUndefined, DragAction.SetTrue, DragAction.SetFalse],
    currentState,
    increment
);
export const gameStateApplyShading = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    action: DragAction,
    clientId: string,
    actionId: string,
): PartialGameStateEx<T> => {
    const {puzzle, state: {fieldStateHistory}} = context;
    const {initialColors: initialColorsFunc, allowOverridingInitialColors} = puzzle;

    const initialColors = typeof initialColorsFunc === "function" ? initialColorsFunc(context) : initialColorsFunc;

    if (!allowOverridingInitialColors && initialColors?.[position.top]?.[position.left]?.length) {
        return {};
    }

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            puzzle,
            fieldStateHistory,
            clientId,
            actionId,
            fieldState => processFieldStateCells(
                fieldState,
                [position],
                (cellState) => {
                    return {
                        ...cellState,
                        colors: cellState.colors
                            .toggle(CellColor.shaded, action === DragAction.SetTrue)
                            .toggle(CellColor.unshaded, action === DragAction.SetFalse),
                    };
                }
            )
        ),
    };
};
// endregion

// region Scale
export const defaultScaleStep = 1.4;
export const getScaleLog = (scale: number, step = defaultScaleStep) => Math.log(scale) / Math.log(step);
export const getAbsoluteScaleByLog = (scaleLog: number, step = defaultScaleStep) => Math.pow(step, scaleLog);

export const gameStateSetScaleLog = <T extends AnyPTM>(
    {puzzle: {typeManager: {scaleStep}}, state: {selectedCells}, onStateChange}: PuzzleContext<T>,
    scaleLog: number,
    resetSelectedCells = true,
): PartialGameStateEx<T> => ({
    scale: getAbsoluteScaleByLog(scaleLog, scaleStep),
    animating: true,
    ...(resetSelectedCells && {selectedCells: selectedCells.clear()}),
});
// endregion

export const gameStateApplyFieldDragGesture = <T extends AnyPTM>(
    {
        puzzle: {
            loopHorizontally,
            loopVertically,
            typeManager: {allowMove, allowRotation, allowScale},
        },
        onStateChange,
    }: PuzzleContext<T>,
    prevMetrics: GestureMetrics,
    currentMetrics: GestureMetrics,
    animate: boolean,
    resetSelection: boolean,
) => {
    const filterMetrics = ({x, y, rotation, scale}: GestureMetrics): GestureMetrics => ({
        x: loopHorizontally || allowMove ? x : 0,
        y: loopVertically || allowMove ? y : 0,
        rotation: allowRotation ? rotation : 0,
        scale: allowScale ? scale : 1,
    });
    currentMetrics = filterMetrics(currentMetrics);
    prevMetrics = filterMetrics(prevMetrics);
    onStateChange(({loopOffset: {top, left}, angle, scale, selectedCells}) => {
        const {x, y, rotation, scale: newScale} = applyMetricsDiff(
            {
                x: left,
                y: top,
                scale,
                rotation: angle,
            },
            prevMetrics,
            currentMetrics
        );
        return {
            animating: animate,
            loopOffset: {
                left: loopHorizontally || allowMove ? x : left,
                top: loopVertically || allowMove ? y : top,
            },
            angle: rotation,
            scale: newScale,
            ...(resetSelection && {selectedCells: selectedCells.clear()})
        };
    });
};

export const gameStateHandleZoomClick = <T extends AnyPTM>(context: PuzzleContext<T>, increment: boolean) => {
    const {puzzle: {typeManager: {scaleStep = defaultScaleStep}}} = context;

    return gameStateApplyFieldDragGesture(
        context,
        emptyGestureMetrics,
        {...emptyGestureMetrics, scale: increment ? scaleStep : 1 / scaleStep},
        true,
        true,
    );
};
