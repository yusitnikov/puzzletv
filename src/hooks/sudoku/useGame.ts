import {fillFieldStateInitialDigits} from "../../types/sudoku/FieldState";
import {Dispatch, useCallback, useMemo, useState} from "react";
import {GameState} from "../../types/sudoku/GameState";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
import {MergeStateAction} from "../../types/react/MergeStateAction";
import {AnimationSpeed} from "../../types/sudoku/AnimationSpeed";
import {useFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {isStartAngle} from "../../utils/rotation";
import {useEventListener} from "../useEventListener";

export interface ProcessedGameState extends GameState {
    cellWriteMode: CellWriteMode;
    isReady: boolean;
}

export const useGame = ({initialDigits = {}}: PuzzleDefinition): [ProcessedGameState, Dispatch<MergeStateAction<ProcessedGameState>>] => {
    const [gameState, setGameState] = useState<GameState>(() => ({
        fieldStateHistory: {
            states: [
                fillFieldStateInitialDigits(initialDigits)
            ],
            currentIndex: 0,
        },
        persistentCellWriteMode: CellWriteMode.main,
        selectedCells: noSelectedCells,

        angle: -90,
        isStickyMode: false,
        animationSpeed: AnimationSpeed.regular,
    }));

    const cellWriteMode = useFinalCellWriteMode(gameState.persistentCellWriteMode);
    const isReady = !isStartAngle(gameState.angle);

    const calculateProcessedGameState = useCallback((gameState: GameState): ProcessedGameState => ({
        ...gameState,
        cellWriteMode,
        isReady,
    }), [cellWriteMode, isReady]);

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

    useEventListener(window, "beforeunload", (ev: BeforeUnloadEvent) => {
        if (isReady) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return [processedGameState, mergeGameState];
};
