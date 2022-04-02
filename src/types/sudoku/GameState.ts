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
import {ProcessedGameState} from "../../hooks/sudoku/useGameState";
import {RotatableDigit} from "./RotatableDigit";

export interface GameState {
    fieldStateHistory: FieldStateHistory;
    persistentCellWriteMode: CellWriteMode;
    selectedCells: SelectedCells;

    angle: number;
    isStickyMode: boolean;
    animationSpeed: AnimationSpeed;
}

// region History
export const gameStateGetCurrentFieldState = ({fieldStateHistory}: GameState) => fieldStateHistoryGetCurrent(fieldStateHistory);

export const gameStateUndo = (gameState: GameState) => ({
    fieldStateHistory: fieldStateHistoryUndo(gameState.fieldStateHistory),
});

export const gameStateRedo = (gameState: GameState) => ({
    fieldStateHistory: fieldStateHistoryRedo(gameState.fieldStateHistory),
});
// endregion

// region Selected cells
export const gameStateAreAllSelectedCells = (gameState: GameState, predicate: (cellState: CellState) => boolean) =>
    areAllFieldStateCells(
        gameStateGetCurrentFieldState(gameState),
        gameState.selectedCells.items,
        predicate
    );

export const gameStateIsAnySelectedCell = (gameState: GameState, predicate: (cellState: CellState) => boolean) =>
    isAnyFieldStateCell(
        gameStateGetCurrentFieldState(gameState),
        gameState.selectedCells.items,
        predicate
    );

export const gameStateAddSelectedCell = (gameState: GameState, cellPosition: Position) => ({
    selectedCells: gameState.selectedCells.add(cellPosition),
});

export const gameStateSetSelectedCells = (gameState: GameState, cellPositions: Position[]) => ({
    selectedCells: gameState.selectedCells.set(cellPositions),
});

export const gameStateToggleSelectedCell = (gameState: GameState, cellPosition: Position, forcedEnable?: boolean) => ({
    selectedCells: gameState.selectedCells.toggle(cellPosition, forcedEnable),
});

export const gameStateSelectAllCells = (gameState: GameState) => gameStateSetSelectedCells(
    gameState,
    indexes08.flatMap(top => indexes08.map(left => ({left, top})))
);

export const gameStateClearSelectedCells = (gameState: GameState) => ({
    selectedCells: gameState.selectedCells.clear(),
});

export const gameStateApplyArrowToSelectedCells = (gameState: GameState, xDirection: number, yDirection: number, isMultiSelection: boolean) => {
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

export const gameStateProcessSelectedCells = (gameState: GameState, fieldStateProcessor: (cellState: CellState) => CellState) => ({
    fieldStateHistory: fieldStateHistoryAddState(
        gameState.fieldStateHistory,
        state => processFieldStateCells(state, gameState.selectedCells.items, fieldStateProcessor)
    ),
});

export const gameStateHandleDigit = (gameState: ProcessedGameState, digit: number) => {
    const {cellWriteMode, isStickyMode, angle} = gameState;

    if (cellWriteMode !== CellWriteMode.color && !isStickyMode && isUpsideDownAngle(angle) && [6, 9].includes(digit)) {
        digit = 15 - digit;
    }

    const rotatableDigit: RotatableDigit = {
        digit,
        sticky: isStickyMode,
    };

    switch (cellWriteMode) {
        case CellWriteMode.main:
            return gameStateProcessSelectedCells(gameState, cell => ({
                ...cell,
                usersDigit: rotatableDigit,
                centerDigits: cell.centerDigits.clear(),
                cornerDigits: cell.cornerDigits.clear(),
            }));

        case CellWriteMode.center:
            const areAllCentersEnabled = gameStateAreAllSelectedCells(
                gameState,
                cell => cell.centerDigits.contains(rotatableDigit)
            );
            return gameStateProcessSelectedCells(gameState, cell => ({
                ...cell,
                centerDigits: cell.centerDigits.toggle(rotatableDigit, !areAllCentersEnabled)
            }));

        case CellWriteMode.corner:
            const areAllCornersEnabled = gameStateAreAllSelectedCells(
                gameState,
                cell => cell.cornerDigits.contains(rotatableDigit)
            );
            return gameStateProcessSelectedCells(gameState, cell => ({
                ...cell,
                cornerDigits: cell.cornerDigits.toggle(rotatableDigit, !areAllCornersEnabled)
            }));

        case CellWriteMode.color:
            return gameStateProcessSelectedCells(gameState, cell => ({
                ...cell,
                colors: cell.colors.toggle(digit - 1)
            }));
    }

    return gameState;
}

export const gameStateClearSelectedCellsContent = (gameState: ProcessedGameState) => {
    const clearCenter = () => gameStateProcessSelectedCells(gameState, cell => ({...cell, centerDigits: cell.centerDigits.clear()}));
    const clearCorner = () => gameStateProcessSelectedCells(gameState, cell => ({...cell, cornerDigits: cell.cornerDigits.clear()}));
    const clearColor = () => gameStateProcessSelectedCells(gameState, cell => ({...cell, colors: cell.colors.clear()}));

    switch (gameState.cellWriteMode) {
        case CellWriteMode.main:
            if (gameStateIsAnySelectedCell(gameState, cell => !!cell.usersDigit)) {
                return gameStateProcessSelectedCells(gameState, cell => ({...cell, usersDigit: undefined}));
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
