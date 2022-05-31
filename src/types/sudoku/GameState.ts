import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "./FieldStateHistory";
import {CellWriteMode, CellWriteModeInfo} from "./CellWriteMode";
import {SelectedCells} from "./SelectedCells";
import {CellState, CellStateEx} from "./CellState";
import {areAllFieldStateCells, isAnyFieldStateCell, processFieldStateCells, processFieldStateLines} from "./FieldState";
import {indexes} from "../../utils/indexes";
import {isSamePosition, Position} from "../layout/Position";
import {defaultProcessArrowDirection, SudokuTypeManager} from "./SudokuTypeManager";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap} from "./GivenDigitsMap";
import {PuzzleContext} from "./PuzzleContext";
import {Set} from "../struct/Set";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../utils/playerDataHash";
import {PlayerObjectInfo} from "./PlayerObjectInfo";

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;

    initialDigits: GivenDigitsMap<CellType>;
    excludedDigits: GivenDigitsMap<Set<CellType>>;

    selectedCells: SelectedCells;

    currentMultiLine: Position[];
    isAddingLine: boolean;

    loopOffset: Position;

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

    return {};
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
} as any);

export const gameStateApplyCurrentMultiLineGlobally = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        typeManager,
        gameState.fieldStateHistory,
        state => processFieldStateLines(state, (lines) => {
            gameState.currentMultiLine.forEach((start, index) => {
                const end = gameState.currentMultiLine[index + 1];
                if (!end) {
                    return;
                }

                lines = lines.toggle({start, end}, gameState.isAddingLine);
            });

            return lines;
        })
    ),
} as any);

export const gameStateApplyCurrentMultiLineLocally = () => ({
    currentMultiLine: [],
} as Partial<GameState<any>> as any);

export const gameStateDeleteAllLines = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        typeManager,
        gameState.fieldStateHistory,
        state => processFieldStateLines(state, lines => lines.clear())
    ),
} as any);

export const gameStateStartMultiLine = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    point: Position
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    currentMultiLine: [point],
    ...gameStateClearSelectedCells(gameState),
} as any);

export const gameStateContinueMultiLine = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {loopHorizontally, loopVertically, fieldSize: {rowsCount, columnsCount}}: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType>,
    point: Position
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const lastPoint = gameState.currentMultiLine[gameState.currentMultiLine.length - 1];
    if (!lastPoint) {
        return {};
    }

    if (isSamePosition(lastPoint, point)) {
        return {};
    }

    let {left, top} = lastPoint;
    let fullDx = point.left - lastPoint.left;
    if (loopHorizontally) {
        fullDx = ((fullDx % columnsCount) + columnsCount) % columnsCount;
        if (fullDx * 2 > columnsCount) {
            fullDx -= columnsCount;
        }
    }
    let fullDy = point.top - lastPoint.top;
    if (loopVertically) {
        fullDy = ((fullDy % rowsCount) + rowsCount) % rowsCount;
        if (fullDy * 2 > rowsCount) {
            fullDy -= rowsCount;
        }
    }
    const dx = Math.sign(fullDx);
    const dy = Math.sign(fullDy);
    const length = Math.max(Math.abs(fullDx), Math.abs(fullDy));

    if (length === 0) {
        return {};
    }

    const newPoints: Position[] = [];
    for (let i = 0; i < length; i++) {
        if ((left - point.left) % columnsCount !== 0) {
            left += dx;
            newPoints.push({left, top});
        }

        if ((top - point.top) % rowsCount !== 0) {
            top += dy;
            newPoints.push({left, top});
        }
    }

    return {
        currentMultiLine: [...gameState.currentMultiLine, ...newPoints],
        isAddingLine: gameState.currentMultiLine.length === 1
            ? !gameStateGetCurrentFieldState(gameState).lines.contains({start: lastPoint, end: newPoints[0]})
            : gameState.isAddingLine,
    } as any;
};
// endregion
