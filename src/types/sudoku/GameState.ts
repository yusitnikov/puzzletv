import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "./FieldStateHistory";
import {CellWriteMode, isNoSelectionWriteMode} from "./CellWriteMode";
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

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;

    initialDigits: GivenDigitsMap<CellType>;
    excludedDigits: GivenDigitsMap<Set<CellType>>;

    selectedCells: SelectedCells;

    currentMultiLine: Position[];
    isAddingLine: boolean;

    loopOffset: Position;

    enableConflictChecker: boolean;
    autoCheckOnFinish: boolean;
    backgroundOpacity: number;
}

export interface ProcessedGameState<CellType> extends GameState<CellType> {
    cellWriteMode: CellWriteMode;
    isReady: boolean;
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
    selectedCells: isNoSelectionWriteMode(gameState.cellWriteMode)
        ? gameState.selectedCells
        : gameState.selectedCells.add(cellPosition),
} as any);

export const gameStateSetSelectedCells = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPositions: Position[]
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: isNoSelectionWriteMode(gameState.cellWriteMode)
        ? gameState.selectedCells
        : gameState.selectedCells.set(cellPositions),
} as any);

export const gameStateToggleSelectedCells = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPositions: Position[],
    forcedEnable?: boolean
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: isNoSelectionWriteMode(gameState.cellWriteMode)
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

    if (isNoSelectionWriteMode(state.cellWriteMode)) {
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
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    fieldStateProcessor: (cellState: CellStateEx<CellType>, position: Position) => Partial<CellStateEx<CellType>>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const currentState = gameStateGetCurrentFieldState(gameState);

    const selectedCells = gameState.selectedCells.items;
    let {initialDigits = {}, excludedDigits = {}} = gameState;

    for (const position of selectedCells) {
        const {top, left} = position;

        const newState = fieldStateProcessor({
            ...currentState.cells[top][left],
            initialDigit: initialDigits?.[top]?.[left],
            excludedDigits: excludedDigits[top][left],
        }, position);

        if (newState.initialDigit) {
            initialDigits = {
                ...initialDigits,
                [top]: {
                    ...initialDigits?.[top],
                    [left]: newState.initialDigit,
                }
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
        }
    }

    return {
        fieldStateHistory: isNoSelectionWriteMode(gameState.cellWriteMode)
            ? gameState.fieldStateHistory
            : fieldStateHistoryAddState(
                typeManager,
                gameState.fieldStateHistory,
                state => processFieldStateCells(
                    state,
                    selectedCells,
                    (cellState, position) => {
                        const {initialDigit, excludedDigits, ...cellStateUpdates} = fieldStateProcessor({
                            ...cellState,
                            initialDigit: gameState.initialDigits?.[position.top]?.[position.left],
                            excludedDigits: gameState.excludedDigits[position.top][position.left],
                        }, position);

                        return {
                            ...cellState,
                            ...cellStateUpdates,
                        };
                    }
                )
            ),
        initialDigits,
        excludedDigits,
    } as Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;
};

const defaultHandleDigit = <CellType>(cell: CellStateEx<CellType>, data: CellType, position: Position, defaultValue: Partial<CellStateEx<CellType>>) => defaultValue;

export const gameStateHandleDigit = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    digit: number
) => {
    const cellData = typeManager.createCellDataByTypedDigit(digit, gameState);

    const {
        handleMainDigit = defaultHandleDigit,
        handleCenterDigit = defaultHandleDigit,
        handleCornerDigit = defaultHandleDigit,
        handleColor = defaultHandleDigit,
    } = typeManager;

    switch (gameState.cellWriteMode) {
        case CellWriteMode.main:
            return gameStateProcessSelectedCells(
                typeManager,
                gameState,
                (cell, position) => handleMainDigit(cell, cellData, position, {
                    usersDigit: cellData,
                    centerDigits: cell.centerDigits.clear(),
                    cornerDigits: cell.cornerDigits.clear(),
                })
            );

        case CellWriteMode.center:
            const areAllCentersEnabled = gameStateAreAllSelectedCells(
                gameState,
                cell => cell.centerDigits.contains(cellData)
            );

            return gameStateProcessSelectedCells(
                typeManager,
                gameState,
                (cell, position) => handleCenterDigit(cell, cellData, position, {
                    centerDigits: cell.centerDigits.toggle(cellData, !areAllCentersEnabled)
                })
            );

        case CellWriteMode.corner:
            const areAllCornersEnabled = gameStateAreAllSelectedCells(
                gameState,
                cell => cell.cornerDigits.contains(cellData)
            );

            return gameStateProcessSelectedCells(
                typeManager,
                gameState,
                (cell, position) => handleCornerDigit(cell, cellData, position, {
                    cornerDigits: cell.cornerDigits.toggle(cellData, !areAllCornersEnabled)
                })
            );

        case CellWriteMode.color:
            return gameStateProcessSelectedCells(
                typeManager,
                gameState,
                (cell, position) => handleColor(cell, cellData, position, {
                    colors: cell.colors.toggle(digit - 1)
                })
            );
    }

    return gameState;
}

export const gameStateClearSelectedCellsContent = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const clearCenter = () => gameStateProcessSelectedCells(typeManager, gameState, cell => ({
        ...cell,
        centerDigits: cell.centerDigits.clear()
    }));
    const clearCorner = () => gameStateProcessSelectedCells(typeManager, gameState, cell => ({
        ...cell,
        cornerDigits: cell.cornerDigits.clear()
    }));
    const clearColor = () => gameStateProcessSelectedCells(typeManager, gameState, cell => ({
        ...cell,
        colors: cell.colors.clear()
    }));
    const clearLines = () => gameStateDeleteAllLines(typeManager, gameState);

    switch (gameState.cellWriteMode) {
        case CellWriteMode.main:
            if (gameStateIsAnySelectedCell(gameState, cell => !!cell.usersDigit)) {
                return gameStateProcessSelectedCells(typeManager, gameState, cell => ({
                    ...cell,
                    usersDigit: undefined
                }));
            }

            if (gameStateIsAnySelectedCell(gameState, cell => !!cell.centerDigits.size)) {
                return clearCenter();
            }

            if (gameStateIsAnySelectedCell(gameState, cell => !!cell.cornerDigits.size)) {
                return clearCorner();
            }

            if (gameStateIsAnySelectedCell(gameState, cell => !!cell.colors.size)) {
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

export const gameStateApplyCurrentMultiLine = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    currentMultiLine: [],
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
