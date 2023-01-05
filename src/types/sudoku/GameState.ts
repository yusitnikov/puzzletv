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
import {defaultProcessArrowDirection, SudokuTypeManager} from "./SudokuTypeManager";
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
import {CellMark} from "./CellMark";
import {CellExactPosition} from "./CellExactPosition";
import {CellDataSet} from "./CellDataSet";
import {getAllPuzzleConstraints, isValidUserDigit, prepareGivenDigitsMapForConstraints} from "./Constraint";
import {DragAction} from "./DragAction";
import {incrementArrayItem} from "../../utils/array";
import {CellColor} from "./CellColor";
import {LineWithColor} from "./LineWithColor";
import {CellPart} from "./CellPart";

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;

    initialDigits: GivenDigitsMap<CellType>;
    excludedDigits: GivenDigitsMap<SetInterface<CellType>>;

    selectedCells: SetInterface<Position>;
    selectedColor: CellColor;

    currentMultiLine: LineWithColor[];
    currentMultiLineEnd?: Position;
    isCurrentMultiLineCenters?: boolean;
    dragStartPoint?: CellExactPosition;
    dragAction: DragAction;

    loopOffset: Position;

    openedLmdOnce?: boolean;

    lives: number;

    fogDemoFieldStateHistory?: FieldStateHistory<CellType>;

    currentPlayer?: string;
    playerObjects: Record<string, PlayerObjectInfo>;

    isShowingSettings: boolean;
    enableConflictChecker: boolean;
    autoCheckOnFinish: boolean;
    backgroundOpacity: number;
    nickname: string;
}

export interface GameStateEx<CellType, ExType> extends GameState<CellType> {
    extension: ExType;
}

export type PartialGameStateEx<CellType, ExType> = Partial<GameState<CellType>> & {
    extension?: Partial<ExType>;
}

export interface ProcessedGameState<CellType> extends GameState<CellType> {
    processed: {
        cellWriteMode: CellWriteMode;
        cellWriteModeInfo: CellWriteModeInfo<CellType, any, any>;
        isReady: boolean;
        isMyTurn: boolean;
        lastPlayerObjects: Record<string, boolean>;
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

        loopOffset: emptyPosition,

        lives: savedGameState?.[9] ?? initialLives,

        fogDemoFieldStateHistory: undefined,

        currentPlayer: savedGameState?.[6] || params.host,
        playerObjects: savedGameState?.[8] || {},

        isShowingSettings: false,
        enableConflictChecker: loadBoolFromLocalStorage(LocalStorageKeys.enableConflictChecker, true),
        autoCheckOnFinish: loadBoolFromLocalStorage(LocalStorageKeys.autoCheckOnFinish, true),
        backgroundOpacity: loadNumberFromLocalStorage(LocalStorageKeys.backgroundOpacity, 0.5),
        nickname: loadStringFromLocalStorage(LocalStorageKeys.nickname, ""),

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
                serializeFieldState(gameStateGetCurrentFieldState(state, true), typeManager),
                typeManager.serializeGameState(state.extension),
                serializeGivenDigitsMap(state.initialDigits, typeManager.serializeCellData),
                serializeGivenDigitsMap(state.excludedDigits, (excludedDigits) => excludedDigits.serialize()),
                state.persistentCellWriteMode,
                state.currentPlayer || "",
                "",
                state.playerObjects,
                state.lives,
                state.selectedColor,
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
        field: serializeFieldState(gameStateGetCurrentFieldState(state), typeManager),
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

export const gameStateSelectAllCells = <CellType, ExType, ProcessedExType>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: ProcessedGameState<CellType>
) => {
    const {
        fieldSize: {rowsCount, columnsCount},
        typeManager: {
            isValidCell = () => true,
        },
    } = puzzle;

    return gameStateSetSelectedCells<CellType, ExType>(
        state,
        indexes(rowsCount)
            .flatMap(top => indexes(columnsCount).map(left => ({left, top})))
            .filter(cell => isValidCell(cell, puzzle))
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

    const newCell = processArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard);
    if (!newCell) {
        return {};
    }

    const result: PartialGameStateEx<CellType, ExType> = isMultiSelection
        ? gameStateAddSelectedCell(state, newCell)
        : gameStateSetSelectedCells(state, [newCell]);
    let {loopOffset} = state;

    if (loopHorizontally) {
        const left = (newCell.left + loopOffset.left) % fieldSize.columnsCount;
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
        const top = (newCell.top + loopOffset.top) % fieldSize.rowsCount;
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
                top: loopOffset.top + fieldSize.rowsCount - (top - max),
            };
        }
    }

    return {
        ...result,
        loopOffset: gameStateNormalizeLoopOffset(puzzle, loopOffset),
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

            const newDigits = newState.excludedDigits.toggleAll(state.excludedDigits[top]?.[left]?.items || [], false);
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
    const {puzzle: {typeManager, hideDeleteButton}, state} = context;

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
    const clearLines = () => gameStateDeleteAllLines(typeManager, state);

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
    left: ((left + fieldMargin) % columnsCount + columnsCount) % columnsCount - fieldMargin,
    top: ((top + fieldMargin) % rowsCount + rowsCount) % rowsCount - fieldMargin,
});

export const gameStateResetCurrentMultiLine = <CellType, ExType>(): PartialGameStateEx<CellType, ExType> => ({
    currentMultiLine: [],
    currentMultiLineEnd: undefined,
    dragStartPoint: undefined,
});

export const gameStateApplyCurrentMultiLine = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    clientId: string,
    isRightButton: boolean,
    isGlobal: boolean
): PartialGameStateEx<CellType, ExType> => {
    const {puzzle: {typeManager, allowDrawing = [], disableLineColors}, state} = context;
    const selectedColor = disableLineColors ? undefined : state.selectedColor;

    if (isGlobal) {
        return {
            fieldStateHistory: fieldStateHistoryAddState(
                typeManager,
                state.fieldStateHistory,
                (fieldState) => {
                    let {marks} = fieldState;

                    if (state.dragStartPoint) {
                        const {type, round} = state.dragStartPoint;

                        if (allowDrawing.includes(`${type}-mark`)) {
                            const xMark: CellMark = {position: round, color: selectedColor, isCircle: false, isCenter: type === "center"};
                            const circleMark: CellMark = {position: round, color: selectedColor, isCircle: true, isCenter: type === "center"};

                            if (type !== "center") {
                                marks = marks.toggle(xMark);
                            } else {
                                const allMarkOptions = [
                                    {x: false, o: false},
                                    {x: false, o: true},
                                    {x: true, o: false},
                                ];
                                const currentMark = {
                                    x: marks.contains(xMark),
                                    o: marks.contains(circleMark),
                                };
                                const newMark = incrementArrayItem(
                                    allMarkOptions,
                                    ({x, o}) => x === currentMark.x && o === currentMark.o,
                                    isRightButton ? -1 : 1
                                )
                                marks = marks
                                    .toggle(xMark, newMark.x)
                                    .toggle(circleMark, newMark.o);
                            }
                        }
                    }

                    return {
                        ...fieldState,
                        lines: fieldState.lines.toggleAll(state.currentMultiLine, state.dragAction === DragAction.SetTrue),
                        marks,
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
    typeManager: SudokuTypeManager<CellType, ExType, ProcessedExType>,
    state: GameState<CellType>
): PartialGameStateEx<CellType, ExType> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        typeManager,
        state.fieldStateHistory,
        (fieldState) => ({
            ...fieldState,
            lines: fieldState.lines.clear(),
            marks: fieldState.marks.clear(),
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
