import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "./FieldStateHistory";
import {CellWriteMode, CellWriteModeInfo, getAllowedCellWriteModeInfos} from "./CellWriteMode";
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

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;

    initialDigits: GivenDigitsMap<CellType>;
    excludedDigits: GivenDigitsMap<SetInterface<CellType>>;

    isMultiSelection: boolean;
    selectedCells: SetInterface<Position>;
    selectedColor: CellColor;

    currentMultiLine: LineWithColor[];
    currentMultiLineEnd?: Position;
    isCurrentMultiLineCenters?: boolean;
    dragStartPoint?: CellExactPosition;
    dragAction: DragAction;

    animationSpeed: AnimationSpeed;
    loopOffset: Position;
    animatingLoopOffset: boolean;
    angle: number;
    animatingAngle: boolean;
    scale: number;
    animatingScale: boolean;

    openedLmdOnce?: boolean;

    lives: number;

    fogDemoFieldStateHistory?: FieldStateHistory<CellType>;

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

export interface GameStateEx<CellType, ExType> extends GameState<CellType> {
    extension: ExType;
}

export type PartialGameStateEx<CellType, ExType> = Partial<GameState<CellType>> & {
    extension?: Partial<ExType>;
}

export type ProcessedGameStateAnimatedValues = Pick<GameState<any>, "loopOffset" | "angle" | "scale">;

export interface ProcessedGameState<CellType> extends GameState<CellType> {
    processed: {
        cellWriteMode: CellWriteMode;
        cellWriteModeInfo: CellWriteModeInfo<CellType, any, any>;
        isReady: boolean;
        isMyTurn: boolean;
        lastPlayerObjects: Record<string, boolean>;
        scaleLog: number;
        animated: ProcessedGameStateAnimatedValues & {
            scaleLog: number;
        },
    },
}

export interface ProcessedGameStateEx<CellType, ExType, ProcessedExType> extends ProcessedGameState<CellType> {
    extension: ExType;
    processedExtension: ProcessedExType;
}

export const mergeGameStateUpdates = <CellType, ExType>(
    ...updatesArray: PartialGameStateEx<CellType, ExType>[]
) => updatesArray.reduce(
    ({extension: ex1, ...state1}, {extension: ex2, ...state2}) => ({
        ...state1,
        ...state2,
        extension: {...ex1, ...ex2}
    })
);

export const mergeGameStateWithUpdates = <CellType, ExType>(
    state: GameStateEx<CellType, ExType>,
    ...updatesArray: PartialGameStateEx<CellType, ExType>[]
) => updatesArray.reduce<GameStateEx<CellType, ExType>>(
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

export const mergeProcessedGameStateWithUpdates = <CellType, ExType, ProcessedExType>(
    {processed, processedExtension, ...state}: ProcessedGameStateEx<CellType, ExType, ProcessedExType>,
    ...updatesArray: PartialGameStateEx<CellType, ExType>[]
): ProcessedGameStateEx<CellType, ExType, ProcessedExType> => ({
    ...mergeGameStateWithUpdates(state, ...updatesArray),
    processed,
    processedExtension,
});

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
const gameStateSerializerVersion = 2;
const maxSavedPuzzles = 10;

const getSavedGameStates = (): SavedGameStates => unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];

const getPuzzleFullSaveStateKey = ({slug, params = {}, saveStateKey = slug}: PuzzleDefinition<any, any, any>): string =>
    `${saveStateKey}-${params.host || ""}-${params.room || ""}`;

export const getEmptyGameState = <CellType, ExType = {}, ProcessedExType = {}>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    useLocalStorage: boolean,
    readOnly = false
): GameStateEx<CellType, ExType> => {
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
                    ? unserializeFieldState(savedGameState[1], puzzle)
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
        loopOffset: savedGameState?.[11] ?? emptyPosition,
        animatingLoopOffset: false,
        angle: savedGameState?.[12] ?? initialAngle,
        animatingAngle: false,
        scale: savedGameState?.[13] ?? initialScale,
        animatingScale: false,

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
            ...initialGameStateExtension,
            ...(savedGameState && unserializeGameState(savedGameState[2]))
        } as ExType,
    };
};

export const saveGameState = <CellType, ExType = {}, ProcessedExType = {}>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: GameStateEx<CellType, ExType>
): void => {
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

export const getAllShareState = <CellType, ExType = {}, ProcessedExType = {}>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: GameStateEx<CellType, ExType>
): any => {
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
export const setAllShareState = <CellType, ExType = {}, ProcessedExType = {}>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: GameStateEx<CellType, ExType>,
    newState: any
): GameStateEx<CellType, ExType> => {
    const {typeManager} = puzzle;
    const {setSharedState, unserializeGameState, unserializeCellData} = typeManager;
    const {field, extension, initialDigits, excludedDigits, lives} = newState;

    const result: GameStateEx<CellType, ExType> = mergeGameStateWithUpdates(
        state,
        {
            fieldStateHistory: fieldStateHistoryAddState(typeManager, state.fieldStateHistory, unserializeFieldState(field, puzzle)),
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
export const gameStateGetCurrentFieldState = <CellType>(
    {fieldStateHistory, fogDemoFieldStateHistory}: GameState<CellType>,
    useFogDemoState = false
) => fieldStateHistoryGetCurrent(
    (useFogDemoState ? fogDemoFieldStateHistory : undefined) ?? fieldStateHistory
);

export const gameStateGetCurrentGivenDigitsByCells = <CellType>(cells: CellState<CellType>[][]) => {
    const result: GivenDigitsMap<CellType> = {};

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

export const gameStateGetCurrentGivenDigits = <CellType>(state: GameState<CellType>) =>
    gameStateGetCurrentGivenDigitsByCells(gameStateGetCurrentFieldState(state).cells);

export const gameStateUndo = <CellType, ExType>(
    {fieldStateHistory}: GameState<CellType>
): PartialGameStateEx<CellType, ExType> => ({
    fieldStateHistory: fieldStateHistoryUndo(fieldStateHistory),
});

export const gameStateRedo = <CellType, ExType>(
    {fieldStateHistory}: GameState<CellType>
): PartialGameStateEx<CellType, ExType> => ({
    fieldStateHistory: fieldStateHistoryRedo(fieldStateHistory),
});
// endregion

// region Selected cells
export const gameStateAreAllSelectedCells = <CellType>(
    state: GameState<CellType>,
    predicate: (cellState: CellState<CellType>, position: Position) => boolean
) => areAllFieldStateCells(
    gameStateGetCurrentFieldState(state),
    state.selectedCells.items,
    predicate
);

export const gameStateIsAnySelectedCell = <CellType>(
    state: GameState<CellType>,
    predicate: (cellState: CellState<CellType>, position: Position) => boolean
) => isAnyFieldStateCell(
    gameStateGetCurrentFieldState(state),
    state.selectedCells.items,
    predicate
);

export const gameStateAddSelectedCell = <CellType, ExType>(
    state: ProcessedGameState<CellType>,
    cellPosition: Position
): PartialGameStateEx<CellType, ExType> => ({
    selectedCells: state.processed.cellWriteModeInfo.isNoSelectionMode
        ? state.selectedCells
        : state.selectedCells.add(cellPosition),
});

export const gameStateSetSelectedCells = <CellType, ExType>(
    state: ProcessedGameState<CellType>,
    cellPositions: Position[]
): PartialGameStateEx<CellType, ExType> => ({
    selectedCells: state.processed.cellWriteModeInfo.isNoSelectionMode
        ? state.selectedCells
        : state.selectedCells.set(cellPositions),
});

export const gameStateToggleSelectedCells = <CellType, ExType>(
    state: ProcessedGameState<CellType>,
    cellPositions: Position[],
    forcedEnable?: boolean
): PartialGameStateEx<CellType, ExType> => ({
    selectedCells: state.processed.cellWriteModeInfo.isNoSelectionMode
        ? state.selectedCells
        : state.selectedCells.toggleAll(cellPositions, forcedEnable),
});

export const gameStateHandleCellDoubleClick = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    cellPosition: Position,
    isAnyKeyDown: boolean,
): Parameters<typeof context["onStateChange"]>[0] => {
    const {puzzle, state} = context;
    const {initialDigits: stateInitialDigits} = state;
    const {initialDigits, typeManager: {areSameCellData}} = puzzle;
    const {cells} = gameStateGetCurrentFieldState(state);

    const {usersDigit, colors, centerDigits, cornerDigits} = cells[cellPosition.top][cellPosition.left];
    const mainDigit = initialDigits?.[cellPosition.top]?.[cellPosition.left]
        || stateInitialDigits?.[cellPosition.top]?.[cellPosition.left]
        || usersDigit;

    let filter: (cell: CellState<CellType>, initialDigit?: CellType) => boolean;
    if (mainDigit) {
        filter = ({usersDigit}, initialDigit) => {
            const otherMainDigit = initialDigit || usersDigit;
            return otherMainDigit !== undefined && areSameCellData(mainDigit, otherMainDigit, undefined, false);
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

export const gameStateSelectAllCells = <CellType, ExType, ProcessedExType>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: ProcessedGameState<CellType>
) => {
    const {
        fieldSize: {rowsCount, columnsCount},
        typeManager: {getCellTypeProps},
    } = puzzle;

    return gameStateSetSelectedCells<CellType, ExType>(
        state,
        indexes(rowsCount)
            .flatMap(top => indexes(columnsCount).map(left => ({left, top})))
            .filter(cell => {
                const cellTypeProps = getCellTypeProps?.(cell, puzzle);
                return cellTypeProps?.isVisible !== false && cellTypeProps?.isSelectable !== false;
            })
    );
};

export const gameStateClearSelectedCells = <CellType, ExType>(
    state: GameState<CellType>
): PartialGameStateEx<CellType, ExType> => ({
    selectedCells: state.selectedCells.clear(),
});

export const gameStateApplyArrowToSelectedCells = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    xDirection: number,
    yDirection: number,
    isMultiSelection: boolean,
    isMainKeyboard: boolean
): PartialGameStateEx<CellType, ExType> => {
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

    const result: PartialGameStateEx<CellType, ExType> = (isMultiSelection || state.isMultiSelection)
        ? gameStateAddSelectedCell(state, newCell)
        : gameStateSetSelectedCells(state, [newCell]);
    let loopOffset = state.loopOffset;

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
        animatingLoopOffset: true,
    };
};

export const gameStateProcessSelectedCells = <CellType, ExType = {}, ProcessedExType = {}>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    clientId: string,
    fieldStateProcessor: (cellState: CellStateEx<CellType>, position: Position) => Partial<CellStateEx<CellType>>
): PartialGameStateEx<CellType, ExType> => {
    const {puzzle: {typeManager}, state} = context;

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
            typeManager,
            fieldStateHistory,
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
            )
        );
    }

    return {
        fieldStateHistory,
        initialDigits,
        excludedDigits,
        playerObjects,
    };
};

const getDefaultDigitHandler = <CellType, ExType = {}, ProcessedExType = {}>(
    {
        puzzle: {
            typeManager,
            initialDigits,
        },
        state,
    }: PuzzleContext<CellType, ExType, ProcessedExType>,
    digit: number,
    isGlobal: boolean,
    cellData: (position: Position) => CellType
): (cellState: CellStateEx<CellType>, position: Position) => Partial<CellStateEx<CellType>> => {
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

export const gameStateHandleDigit = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    digit: number,
    clientId: string,
    isGlobal: boolean
) => {
    const {puzzle: {typeManager, initialLives, decreaseOnlyOneLive}, state} = context;

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
                    && (digit === undefined || !areSameCellData(digit, newDigit, newState, true))
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

export const gameStateClearSelectedCellsContent = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    clientId: string
): PartialGameStateEx<CellType, ExType> => {
    const {puzzle, state} = context;
    const {typeManager, hideDeleteButton} = puzzle;

    if (hideDeleteButton) {
        return {};
    }

    const clearCenter = () => gameStateProcessSelectedCells(context, clientId, cell => ({
        centerDigits: cell.centerDigits.clear()
    }));
    const clearCorner = () => gameStateProcessSelectedCells(context, clientId, cell => ({
        cornerDigits: cell.cornerDigits.clear()
    }));
    const clearColor = () => gameStateProcessSelectedCells(context, clientId, cell => ({
        colors: cell.colors.clear()
    }));
    const clearLines = () => gameStateDeleteAllLines(puzzle, state);

    switch (state.processed.cellWriteMode) {
        case CellWriteMode.main:
            if (gameStateIsAnySelectedCell(state, cell => !!cell.usersDigit)) {
                return gameStateProcessSelectedCells(context, clientId, () => ({
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
export const gameStateNormalizeLoopOffset = <CellType, ExType = {}, ProcessedExType = {}>(
    {fieldSize: {rowsCount, columnsCount}, fieldMargin = 0}: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    {left, top}: Position
): Position => ({
    left: loop(left + fieldMargin, columnsCount) - fieldMargin,
    top: loop(top + fieldMargin, rowsCount) - fieldMargin,
});

export const gameStateResetCurrentMultiLine = <CellType, ExType>(): PartialGameStateEx<CellType, ExType> => ({
    currentMultiLine: [],
    currentMultiLineEnd: undefined,
    dragStartPoint: undefined,
});

export const gameStateApplyCurrentMultiLine = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    clientId: string,
    isClick: boolean,
    isRightButton: boolean,
    isGlobal: boolean
): PartialGameStateEx<CellType, ExType> => {
    // TODO: move all parameters from state to action params

    const {puzzle, state} = context;
    const {typeManager, allowDrawing = [], disableLineColors} = puzzle;
    const selectedColor = disableLineColors ? undefined : state.selectedColor;

    if (isGlobal) {
        return {
            fieldStateHistory: fieldStateHistoryAddState(
                typeManager,
                state.fieldStateHistory,
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

export const gameStateDeleteAllLines = <CellType, ExType, ProcessedExType>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: GameState<CellType>
): PartialGameStateEx<CellType, ExType> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        puzzle.typeManager,
        state.fieldStateHistory,
        (fieldState) => ({
            ...fieldState,
            lines: fieldState.lines.clear(),
            marks: fieldState.marks.clear().bulkAdd(puzzle.initialCellMarks ?? []),
        })
    ),
});

export const gameStateStartMultiLine = <CellType, ExType, ProcessedExType>(
    {puzzle: {allowDrawing = []}, state}: PuzzleContext<CellType, ExType, ProcessedExType>,
    exactPosition: CellExactPosition
): PartialGameStateEx<CellType, ExType> => {
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

export const gameStateContinueMultiLine = <CellType, ExType, ProcessedExType>(
    {
        puzzle,
        cellsIndex,
        state,
    }: PuzzleContext<CellType, ExType, ProcessedExType>,
    exactPosition: CellExactPosition
): PartialGameStateEx<CellType, ExType> => {
    const result: PartialGameStateEx<CellType, ExType> = {
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

export const gameStateSetCellMark = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    position: Position,
    isCenter: boolean,
    cellMarkType?: CellMarkType,
    color: CellColorValue = CellColor.black
): PartialGameStateEx<CellType, ExType> => {
    const {
        puzzle,
        state: {fieldStateHistory},
    } = context;

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            puzzle.typeManager,
            fieldStateHistory,
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

export const gameStateGetCellShading = <CellType>({colors}: CellState<CellType>) =>
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
export const gameStateApplyShading = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    position: Position,
    action: DragAction,
): PartialGameStateEx<CellType, ExType> => {
    const {
        puzzle: {typeManager, initialColors: initialColorsFunc, allowOverridingInitialColors},
        state: {fieldStateHistory},
    } = context;

    const initialColors = typeof initialColorsFunc === "function" ? initialColorsFunc(context) : initialColorsFunc;

    if (!allowOverridingInitialColors && initialColors?.[position.top]?.[position.left]?.length) {
        return {};
    }

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            typeManager,
            fieldStateHistory,
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

export const defaultScaleStep = 2;
export const getScaleLog = (scale: number, step = defaultScaleStep) => Math.log(scale) / Math.log(step);
export const getAbsoluteScaleByLog = (scaleLog: number, step = defaultScaleStep) => Math.pow(step, scaleLog);
