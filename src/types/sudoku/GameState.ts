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
import {indexes08} from "../../utils/indexes";
import {Position} from "../layout/Position";
import {AnimationSpeed} from "./AnimationSpeed";
import {isUpsideDownAngle} from "../../utils/rotation";
import {ProcessedGameState} from "../../hooks/sudoku/useGame";
import {SudokuTypeManager} from "./SudokuTypeManager";

export interface GameState<CellType> {
    fieldStateHistory: FieldStateHistory<CellType>;
    persistentCellWriteMode: CellWriteMode;
    selectedCells: SelectedCells;

    angle: number;
    isStickyMode: boolean;
    animationSpeed: AnimationSpeed;
}

// region History
export const gameStateGetCurrentFieldState = <CellType>({fieldStateHistory}: GameState<CellType>) =>
    fieldStateHistoryGetCurrent(fieldStateHistory);

export const gameStateUndo = <CellType>({fieldStateHistory}: GameState<CellType>): Partial<GameState<CellType>> => ({
    fieldStateHistory: fieldStateHistoryUndo(fieldStateHistory),
});

export const gameStateRedo = <CellType>({fieldStateHistory}: GameState<CellType>): Partial<GameState<CellType>> => ({
    fieldStateHistory: fieldStateHistoryRedo(fieldStateHistory),
});
// endregion

// region Selected cells
export const gameStateAreAllSelectedCells = <CellType>(
    gameState: GameState<CellType>,
    predicate: (cellState: CellState<CellType>) => boolean
) =>
    areAllFieldStateCells(
        gameStateGetCurrentFieldState(gameState),
        gameState.selectedCells.items,
        predicate
    );

export const gameStateIsAnySelectedCell = <CellType>(
    gameState: GameState<CellType>,
    predicate: (cellState: CellState<CellType>) => boolean
) =>
    isAnyFieldStateCell(
        gameStateGetCurrentFieldState(gameState),
        gameState.selectedCells.items,
        predicate
    );

export const gameStateAddSelectedCell = <CellType>(
    gameState: GameState<CellType>,
    cellPosition: Position
): Partial<GameState<CellType>> => ({
    selectedCells: gameState.selectedCells.add(cellPosition),
});

export const gameStateSetSelectedCells = <CellType>(
    gameState: GameState<CellType>,
    cellPositions: Position[]
): Partial<GameState<CellType>> => ({
    selectedCells: gameState.selectedCells.set(cellPositions),
});

export const gameStateToggleSelectedCell = <CellType>(
    gameState: GameState<CellType>,
    cellPosition: Position,
    forcedEnable?: boolean
): Partial<GameState<CellType>> => ({
    selectedCells: gameState.selectedCells.toggle(cellPosition, forcedEnable),
});

export const gameStateSelectAllCells = <CellType>(gameState: GameState<CellType>) => gameStateSetSelectedCells(
    gameState,
    indexes08.flatMap(top => indexes08.map(left => ({left, top})))
);

export const gameStateClearSelectedCells = <CellType>(gameState: GameState<CellType>): Partial<GameState<CellType>> => ({
    selectedCells: gameState.selectedCells.clear(),
});

export const gameStateApplyArrowToSelectedCells = <CellType>(
    gameState: GameState<CellType>,
    xDirection: number,
    yDirection: number,
    isMultiSelection: boolean
) => {
    const currentCell = gameState.selectedCells.last();
    // Nothing to do when there's no selection
    if (!currentCell) {
        return gameState;
    }

    const coeff = isUpsideDownAngle(gameState.angle) ? -1 : 1;
    const newCell: Position = {
        left: (currentCell.left + coeff * xDirection + 9) % 9,
        top: (currentCell.top + coeff * yDirection + 9) % 9,
    }

    return isMultiSelection
        ? gameStateAddSelectedCell(gameState, newCell)
        : gameStateSetSelectedCells(gameState, [newCell]);
};

export const gameStateProcessSelectedCells = <CellType>(
    typeManager: SudokuTypeManager<CellType>,
    gameState: GameState<CellType>,
    fieldStateProcessor: (cellState: CellState<CellType>) => CellState<CellType>
): Partial<GameState<CellType>> => ({
    fieldStateHistory: fieldStateHistoryAddState(
        typeManager,
        gameState.fieldStateHistory,
        state => processFieldStateCells(state, gameState.selectedCells.items, fieldStateProcessor)
    ),
});

export const gameStateHandleDigit = <CellType>(
    typeManager: SudokuTypeManager<CellType>,
    gameState: ProcessedGameState<CellType>,
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

export const gameStateClearSelectedCellsContent = <CellType>(
    typeManager: SudokuTypeManager<CellType>,
    gameState: ProcessedGameState<CellType>
) => {
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
