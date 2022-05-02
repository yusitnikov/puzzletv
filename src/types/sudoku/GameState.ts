import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "./FieldStateHistory";
import {CellWriteMode} from "./CellWriteMode";
import {SelectedCells} from "./SelectedCells";
import {CellState} from "./CellState";
import {areAllFieldStateCells, isAnyFieldStateCell, processFieldStateCells} from "./FieldState";
import {indexes} from "../../utils/indexes";
import {Position} from "../layout/Position";
import {defaultProcessArrowDirection, SudokuTypeManager} from "./SudokuTypeManager";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap} from "./GivenDigitsMap";

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;
    selectedCells: SelectedCells;

    enableConflictChecker: boolean;
    autoCheckOnFinish: boolean;
}

export interface ProcessedGameState<CellType> extends GameState<CellType> {
    cellWriteMode: CellWriteMode;
    isReady: boolean;
}

// region History
export const gameStateGetCurrentFieldState = <CellType>({fieldStateHistory}: ProcessedGameState<CellType>) =>
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
    selectedCells: gameState.selectedCells.add(cellPosition),
} as any);

export const gameStateSetSelectedCells = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPositions: Position[]
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: gameState.selectedCells.set(cellPositions),
} as any);

export const gameStateToggleSelectedCell = <CellType, ProcessedGameStateExtensionType = {}>(
    gameState: ProcessedGameState<CellType>,
    cellPosition: Position,
    forcedEnable?: boolean
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    selectedCells: gameState.selectedCells.toggle(cellPosition, forcedEnable),
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
    {
        typeManager: {processArrowDirection = defaultProcessArrowDirection},
        fieldSize,
    }: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    xDirection: number,
    yDirection: number,
    isMultiSelection: boolean,
    isMainKeyboard: boolean
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => {
    const currentCell = gameState.selectedCells.last();
    // Nothing to do when there's no selection
    if (!currentCell) {
        return gameState;
    }

    const newCell = processArrowDirection(currentCell, xDirection, yDirection, fieldSize, isMainKeyboard, gameState);
    if (!newCell) {
        return gameState;
    }

    return isMultiSelection
        ? gameStateAddSelectedCell(gameState, newCell)
        : gameStateSetSelectedCells(gameState, [newCell]);
};

export const gameStateProcessSelectedCells = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    fieldStateProcessor: (cellState: CellState<CellType>) => CellState<CellType>
): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        typeManager,
        gameState.fieldStateHistory,
        state => processFieldStateCells(state, gameState.selectedCells.items, fieldStateProcessor)
    ),
} as any);

export const gameStateHandleDigit = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    digit: number
) => {
    const cellData = typeManager.createCellDataByTypedDigit(digit, gameState);

    switch (gameState.cellWriteMode) {
        case CellWriteMode.main:
            return gameStateProcessSelectedCells(typeManager, gameState, cell => ({
                ...cell,
                usersDigit: cellData,
                centerDigits: cell.centerDigits.clear(),
                cornerDigits: cell.cornerDigits.clear(),
            }));

        case CellWriteMode.center:
            const areAllCentersEnabled = gameStateAreAllSelectedCells(
                gameState,
                cell => cell.centerDigits.contains(cellData)
            );
            return gameStateProcessSelectedCells(typeManager, gameState, cell => ({
                ...cell,
                centerDigits: cell.centerDigits.toggle(cellData, !areAllCentersEnabled)
            }));

        case CellWriteMode.corner:
            const areAllCornersEnabled = gameStateAreAllSelectedCells(
                gameState,
                cell => cell.cornerDigits.contains(cellData)
            );
            return gameStateProcessSelectedCells(typeManager, gameState, cell => ({
                ...cell,
                cornerDigits: cell.cornerDigits.toggle(cellData, !areAllCornersEnabled)
            }));

        case CellWriteMode.color:
            return gameStateProcessSelectedCells(typeManager, gameState, cell => ({
                ...cell,
                colors: cell.colors.toggle(digit - 1)
            }));
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

            return clearColor();

        case CellWriteMode.center:
            return clearCenter();

        case CellWriteMode.corner:
            return clearCorner()

        case CellWriteMode.color:
            return clearColor();
    }
};

// endregion
