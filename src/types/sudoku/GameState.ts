import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "./FieldStateHistory";
import {CellWriteMode, CellWriteModeInfo} from "./CellWriteMode";
import {noSelectedCells, SelectedCells} from "./SelectedCells";
import {CellState, CellStateEx, getCellDataComparer} from "./CellState";
import {
    areAllFieldStateCells, createEmptyFieldState,
    isAnyFieldStateCell,
    processFieldStateCells,
    serializeFieldState,
    unserializeFieldState
} from "./FieldState";
import {indexes} from "../../utils/indexes";
import {emptyPosition, Line, Position} from "../layout/Position";
import {defaultProcessArrowDirection, SudokuTypeManager} from "./SudokuTypeManager";
import {normalizePuzzlePosition, PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap, serializeGivenDigitsMap, unserializeGivenDigitsMap} from "./GivenDigitsMap";
import {PuzzleContext} from "./PuzzleContext";
import {ComparableSet, SetInterface} from "../struct/Set";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../utils/playerDataHash";
import {PlayerObjectInfo} from "./PlayerObjectInfo";
import {
    loadBoolFromLocalStorage,
    loadNumberFromLocalStorage, loadStringFromLocalStorage, serializeToLocalStorage,
    unserializeFromLocalStorage
} from "../../utils/localStorage";
import {LocalStorageKeys} from "../../data/LocalStorageKeys";
import {CellMark} from "./CellMark";
import {CellExactPosition} from "./CellExactPosition";

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;

    initialDigits: GivenDigitsMap<CellType>;
    excludedDigits: GivenDigitsMap<SetInterface<CellType>>;

    selectedCells: SelectedCells;

    currentMultiLine: Line[];
    currentMultiLineEnd?: Position;
    isCurrentMultiLineCenters?: boolean;
    dragStartPoint?: CellExactPosition;
    isAddingLine: boolean;

    loopOffset: Position;

    openedLmdOnce?: boolean;

    currentPlayer?: string;
    playerObjects: Record<string, PlayerObjectInfo>;

    isShowingSettings: boolean;
    enableConflictChecker: boolean;
    autoCheckOnFinish: boolean;
    backgroundOpacity: number;
    nickname: string;
}

export interface ProcessedGameState<CellType> extends GameState<CellType> {
    cellWriteMode: CellWriteMode;
    cellWriteModeInfo: CellWriteModeInfo<CellType, any, any>;
    isReady: boolean;
    isMyTurn: boolean;
    lastPlayerObjects: Record<string, boolean>;
}

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
][];
const gameStateStorageKey = "savedGameState";
const gameStateSerializerVersion = 2;
const maxSavedPuzzles = 10;

const getSavedGameStates = (): SavedGameStates => unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];

const getPuzzleFullSaveStateKey = ({slug, params = {}, saveStateKey = slug}: PuzzleDefinition<any, any, any>): string =>
    `${saveStateKey}-${params.host || ""}-${params.room || ""}`;

export const getEmptyGameState = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    useLocalStorage: boolean,
    readOnly = false
): GameState<CellType> & GameStateExtensionType => {
    const {
        params = {},
        typeManager,
        saveState = true,
    } = puzzle;

    const {
        initialGameStateExtension,
        unserializeGameState,
        initialCellWriteMode = CellWriteMode.main,
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
        persistentCellWriteMode: savedGameState?.[5] ?? initialCellWriteMode,
        selectedCells: noSelectedCells,
        initialDigits: unserializeGivenDigitsMap(savedGameState?.[3] || {}, puzzle.typeManager.unserializeCellData),
        excludedDigits: savedGameState?.[4]
            ? unserializeGivenDigitsMap(savedGameState[4], (excludedDigits: any) => ComparableSet.unserialize(
                excludedDigits,
                getCellDataComparer(puzzle.typeManager.areSameCellData),
                puzzle.typeManager.cloneCellData,
                puzzle.typeManager.serializeCellData,
                puzzle.typeManager.unserializeCellData,
            ))
            : indexes(puzzle.fieldSize.rowsCount).map(() => indexes(puzzle.fieldSize.columnsCount).map(() => new ComparableSet(
                [],
                getCellDataComparer(puzzle.typeManager.areSameCellData),
                puzzle.typeManager.cloneCellData,
                puzzle.typeManager.serializeCellData
            ))),

        currentMultiLine: [],
        currentMultiLineEnd: undefined,
        isCurrentMultiLineCenters: false,
        dragStartPoint: undefined,
        isAddingLine: false,

        loopOffset: emptyPosition,

        currentPlayer: savedGameState?.[6] || params.host,
        playerObjects: savedGameState?.[8] || {},

        isShowingSettings: false,
        enableConflictChecker: loadBoolFromLocalStorage(LocalStorageKeys.enableConflictChecker, true),
        autoCheckOnFinish: loadBoolFromLocalStorage(LocalStorageKeys.autoCheckOnFinish, true),
        backgroundOpacity: loadNumberFromLocalStorage(LocalStorageKeys.backgroundOpacity, 0.5),
        nickname: loadStringFromLocalStorage(LocalStorageKeys.nickname, ""),

        ...(initialGameStateExtension as any),
        ...(savedGameState && unserializeGameState(savedGameState[2]))
    };
};

export const saveGameState = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: GameState<CellType> & GameStateExtensionType
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
                serializeFieldState(gameStateGetCurrentFieldState(state), typeManager),
                typeManager.serializeGameState(state),
                serializeGivenDigitsMap(state.initialDigits, typeManager.serializeCellData),
                serializeGivenDigitsMap(state.excludedDigits, (excludedDigits) => excludedDigits.serialize()),
                state.persistentCellWriteMode,
                state.currentPlayer || "",
                "",
                state.playerObjects,
            ],
            ...getSavedGameStates().filter(([key]) => key !== fullSaveStateKey),
        ] as SavedGameStates).slice(0, maxSavedPuzzles),
        gameStateSerializerVersion
    );
};

export const getAllShareState = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: GameState<CellType> & GameStateExtensionType
): any => {
    const {typeManager} = puzzle;
    const {getSharedState, serializeCellData} = typeManager;
    const {initialDigits, excludedDigits} = state;

    return {
        field: serializeFieldState(gameStateGetCurrentFieldState(state), typeManager),
        extension: typeManager.serializeGameState(state),
        initialDigits: serializeGivenDigitsMap(initialDigits, serializeCellData),
        excludedDigits: serializeGivenDigitsMap(excludedDigits, item => item.serialize()),
        ...getSharedState?.(puzzle, state),
    };
}
export const setAllShareState = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: GameState<CellType> & GameStateExtensionType,
    newState: any
): GameState<CellType> & GameStateExtensionType => {
    const {typeManager} = puzzle;
    const {setSharedState, unserializeGameState, areSameCellData, cloneCellData, serializeCellData, unserializeCellData} = typeManager;
    const {field, extension, initialDigits, excludedDigits} = newState;

    const compareCellData = getCellDataComparer(areSameCellData);

    const result: GameState<CellType> & GameStateExtensionType = {
        ...state,
        fieldStateHistory: fieldStateHistoryAddState(typeManager, state.fieldStateHistory, unserializeFieldState(field, puzzle)),
        ...unserializeGameState(extension),
        initialDigits: unserializeGivenDigitsMap(initialDigits, unserializeCellData),
        excludedDigits: unserializeGivenDigitsMap(excludedDigits, item => ComparableSet.unserialize(
            item,
            compareCellData,
            cloneCellData,
            serializeCellData,
            unserializeCellData
        )),
    };

    return setSharedState?.(puzzle, result, newState) ?? result;
};
// endregion

// region History
export const gameStateGetCurrentFieldState = <CellType>({fieldStateHistory}: GameState<CellType>) =>
    fieldStateHistoryGetCurrent(fieldStateHistory);

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

export const gameStateGetCurrentGivenDigits = <CellType>(gameState: ProcessedGameState<CellType>) =>
    gameStateGetCurrentGivenDigitsByCells(gameStateGetCurrentFieldState(gameState).cells);

export const gameStateUndo = <CellType, ProcessedGameStateExtensionType = {}>(
    {fieldStateHistory}: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    fieldStateHistory: fieldStateHistoryUndo(fieldStateHistory),
} as any);

export const gameStateRedo = <CellType, ProcessedGameStateExtensionType = {}>(
    {fieldStateHistory}: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    fieldStateHistory: fieldStateHistoryRedo(fieldStateHistory),
} as any);
// endregion

// region Selected cells
export const gameStateAreAllSelectedCells = <CellType>(
    gameState: ProcessedGameState<CellType>,
    predicate: (cellState: CellState<CellType>) => boolean
) =>
    areAllFieldStateCells(
        gameStateGetCurrentFieldState(gameState),
        gameState.selectedCells.items,
        predicate
    );

export const gameStateIsAnySelectedCell = <CellType>(
    gameState: ProcessedGameState<CellType>,
    predicate: (cellState: CellState<CellType>) => boolean
) =>
    isAnyFieldStateCell(
        gameStateGetCurrentFieldState(gameState),
        gameState.selectedCells.items,
        predicate
    );

export const gameStateAddSelectedCell = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPosition: Position
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: gameState.cellWriteModeInfo.isNoSelectionMode
        ? gameState.selectedCells
        : gameState.selectedCells.add(cellPosition),
} as any);

export const gameStateSetSelectedCells = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPositions: Position[]
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: gameState.cellWriteModeInfo.isNoSelectionMode
        ? gameState.selectedCells
        : gameState.selectedCells.set(cellPositions),
} as any);

export const gameStateToggleSelectedCells = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPositions: Position[],
    forcedEnable?: boolean
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: gameState.cellWriteModeInfo.isNoSelectionMode
        ? gameState.selectedCells
        : gameState.selectedCells.toggleAll(cellPositions, forcedEnable),
} as any);

export const gameStateSelectAllCells = <CellType, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, any, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType>
) => {
    const {
        fieldSize: {rowsCount, columnsCount},
        typeManager: {
            isValidCell = () => true,
        },
    } = puzzle;

    return gameStateSetSelectedCells<CellType, ProcessedGameStateExtensionType>(
        gameState,
        indexes(rowsCount)
            .flatMap(top => indexes(columnsCount).map(left => ({left, top})))
            .filter(cell => isValidCell(cell, puzzle))
    );
};

export const gameStateClearSelectedCells = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: gameState.selectedCells.clear(),
} as any);

export const gameStateApplyArrowToSelectedCells = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    xDirection: number,
    yDirection: number,
    isMultiSelection: boolean,
    isMainKeyboard: boolean
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const {puzzle, state} = context;

    if (state.cellWriteModeInfo.isNoSelectionMode) {
        return state;
    }

    const currentCell = state.selectedCells.last();
    // Nothing to do when there's no selection
    if (!currentCell) {
        return state;
    }

    const {
        typeManager: {processArrowDirection = defaultProcessArrowDirection},
        fieldSize,
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const newCell = processArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard);
    if (!newCell) {
        return state;
    }

    const result: Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> = isMultiSelection
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

export const gameStateProcessSelectedCells = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    clientId: string,
    fieldStateProcessor: (cellState: CellStateEx<CellType>, position: Position) => Partial<CellStateEx<CellType>>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
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

    if (!state.cellWriteModeInfo.isNoSelectionMode) {
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
    } as Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;
};

const getDefaultDigitHandler = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    digit: number,
    isGlobal: boolean,
    cellData: CellType
): (cellState: CellStateEx<CellType>) => Partial<CellStateEx<CellType>> => {
    if (isGlobal) {
        switch (gameState.cellWriteMode) {
            case CellWriteMode.main:
                return ({centerDigits, cornerDigits}) => ({
                    usersDigit: cellData,
                    centerDigits: centerDigits.clear(),
                    cornerDigits: cornerDigits.clear(),
                });

            case CellWriteMode.center:
                const areAllCentersEnabled = gameStateAreAllSelectedCells(
                    gameState,
                    ({centerDigits}) => centerDigits.contains(cellData)
                );

                return ({centerDigits}) => ({
                    centerDigits: centerDigits.toggle(cellData, !areAllCentersEnabled)
                });

            case CellWriteMode.corner:
                const areAllCornersEnabled = gameStateAreAllSelectedCells(
                    gameState,
                    ({cornerDigits}) => cornerDigits.contains(cellData)
                );

                return ({cornerDigits}) => ({
                    cornerDigits: cornerDigits.toggle(cellData, !areAllCornersEnabled)
                });

            case CellWriteMode.color:
                return ({colors}) => ({
                    colors: colors.toggle(digit - 1)
                });
        }
    }

    return () => ({});
};

export const gameStateHandleDigit = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    digit: number,
    clientId: string,
    isGlobal: boolean
) => {
    const {puzzle: {typeManager}, state} = context;

    const cellData = typeManager.createCellDataByTypedDigit(digit, state);

    const {
        handleDigitGlobally,
        handleDigitInCell = (isGlobal, clientId, cellWriteMode, cell, data, position, context, defaultValue) => defaultValue,
    } = typeManager;

    const defaultHandler = getDefaultDigitHandler(typeManager, state, digit, isGlobal, cellData);

    const cache: any = {};
    let result = gameStateProcessSelectedCells(
        context,
        clientId,
        (cell, position) => handleDigitInCell(
            isGlobal, clientId, state.cellWriteMode, cell, cellData, position, context, defaultHandler(cell), cache
        )
    );

    if (handleDigitGlobally) {
        result = handleDigitGlobally(isGlobal, clientId, context, cellData, result);
    }

    return result;
};

export const gameStateClearSelectedCellsContent = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    clientId: string
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const {puzzle: {typeManager}, state} = context;

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

    switch (state.cellWriteMode) {
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
export const gameStateNormalizeLoopOffset = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {fieldSize: {rowsCount, columnsCount}, fieldMargin = 0}: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    {left, top}: Position
): Position => ({
    left: ((left + fieldMargin) % columnsCount + columnsCount) % columnsCount - fieldMargin,
    top: ((top + fieldMargin) % rowsCount + rowsCount) % rowsCount - fieldMargin,
});

export const gameStateResetCurrentMultiLine = <CellType, ProcessedGameStateExtensionType = {}>()
    : Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    currentMultiLine: [],
    currentMultiLineEnd: undefined,
    dragStartPoint: undefined,
} as Partial<ProcessedGameState<CellType>> as any);

export const gameStateApplyCurrentMultiLine = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const {puzzle: {typeManager, allowDrawing = []}, state: gameState} = context;

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            typeManager,
            gameState.fieldStateHistory,
            state => {
                let {marks} = state;

                if (gameState.dragStartPoint) {
                    const {type, round} = gameState.dragStartPoint;

                    if (allowDrawing.includes(`${type}-mark`)) {
                        const xMark: CellMark = {position: round, isCircle: false, isCenter: type === "center"};
                        const circleMark: CellMark = {position: round, isCircle: true, isCenter: type === "center"};

                        if (type !== "center") {
                            marks = marks.toggle(xMark);
                        } else if (marks.contains(circleMark)) {
                            marks = marks.remove(circleMark).add(xMark);
                        } else if (marks.contains(xMark)) {
                            marks = marks.remove(xMark);
                        } else {
                            marks = marks.add(circleMark);
                        }
                    }
                }

                return {
                    ...state,
                    lines: state.lines.toggleAll(gameState.currentMultiLine, gameState.isAddingLine),
                    marks,
                };
            }
        ),
        currentMultiLine: [],
        currentMultiLineEnd: undefined,
        dragStartPoint: undefined,
    } as Partial<ProcessedGameState<CellType>> as any;
};

export const gameStateDeleteAllLines = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        typeManager,
        gameState.fieldStateHistory,
        state => ({
            ...state,
            lines: state.lines.clear(),
            marks: state.marks.clear(),
        })
    ),
} as any);

export const gameStateStartMultiLine = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {puzzle: {allowDrawing = []}, state}: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    exactPosition: CellExactPosition
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const {center, corner, type} = exactPosition;

    const isCenterLine: boolean | undefined = [
        type === "center",
        type !== "center",
    ]
        .filter(isCenter => allowDrawing.includes(isCenter ? "center-line" : "border-line"))
        [0];

    return ({
        currentMultiLine: [],
        currentMultiLineEnd: isCenterLine !== undefined
            ? (isCenterLine ? center : corner)
            : undefined,
        isCurrentMultiLineCenters: isCenterLine,
        dragStartPoint: exactPosition,
        ...gameStateClearSelectedCells(state),
    });
};

export const gameStateContinueMultiLine = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        puzzle,
        cellsIndex,
        state,
    }: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    exactPosition: CellExactPosition
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const result = {
        dragStartPoint: state.dragStartPoint && JSON.stringify(state.dragStartPoint) === JSON.stringify(exactPosition)
            ? state.dragStartPoint
            : undefined,
    } as Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;

    const currentMultiLineEnd = state.currentMultiLineEnd;
    if (!currentMultiLineEnd) {
        return result;
    }

    const position = state.isCurrentMultiLineCenters ? exactPosition.center : exactPosition.corner;
    const newLines = cellsIndex.getPath({start: currentMultiLineEnd, end: position});

    if (!newLines.length) {
        return result;
    }

    return {
        ...result,
        currentMultiLine: [...state.currentMultiLine, ...newLines],
        currentMultiLineEnd: normalizePuzzlePosition(position, puzzle),
        isAddingLine: state.currentMultiLine.length === 0
            ? !gameStateGetCurrentFieldState(state).lines.contains(newLines[0])
            : state.isAddingLine,
    } as Partial<ProcessedGameState<CellType>> as any;
};
// endregion
