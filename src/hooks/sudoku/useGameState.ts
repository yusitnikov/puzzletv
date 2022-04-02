import {FieldState} from "../../types/sudoku/FieldState";
import {Dispatch, useCallback, useMemo, useState} from "react";
import {GameState} from "../../types/sudoku/GameState";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
import {MergeStateAction} from "../../types/react/MergeStateAction";
import {AnimationSpeed} from "../../types/sudoku/AnimationSpeed";
import {useFinalCellWriteMode} from "./useFinalCellWriteMode";

export interface ProcessedGameState extends GameState {
    cellWriteMode: CellWriteMode;
}

export const useGameState = (initialFieldState: FieldState | (() => FieldState)): [ProcessedGameState, Dispatch<MergeStateAction<ProcessedGameState>>] => {
    const [gameState, setGameState] = useState<GameState>(() => ({
        fieldStateHistory: {
            states: [typeof initialFieldState === "function" ? initialFieldState() : initialFieldState],
            currentIndex: 0,
        },
        persistentCellWriteMode: CellWriteMode.main,
        selectedCells: noSelectedCells,

        angle: -90,
        isStickyMode: false,
        animationSpeed: AnimationSpeed.regular,
    }));

    const cellWriteMode = useFinalCellWriteMode(gameState.persistentCellWriteMode);

    const calculateProcessedGameState = useCallback((gameState: GameState): ProcessedGameState => ({
        ...gameState,
        cellWriteMode,
    }), [cellWriteMode]);

    const processedGameState = useMemo(() => calculateProcessedGameState(gameState), [gameState, calculateProcessedGameState]);

    const mergeGameState = useCallback(
        (gameStateAction: MergeStateAction<ProcessedGameState>) => setGameState(gameState => {
            const processedGameState = calculateProcessedGameState(gameState);

            return {
                ...gameState,
                ...(typeof gameStateAction === "function" ? gameStateAction(processedGameState) : gameStateAction),
            };
        }),
        [setGameState, calculateProcessedGameState]
    );

    return [processedGameState, mergeGameState];
};
