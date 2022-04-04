import {createEmptyFieldState, fillFieldStateInitialDigits} from "../../types/sudoku/FieldState";
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
import {useAnimatedValue} from "../useAnimatedValue";
import {SudokuTypeManager} from "../../types/sudoku/SudokuTypeManager";

export interface ProcessedGameState<CellType> extends GameState<CellType> {
    cellWriteMode: CellWriteMode;
    isReady: boolean;

    animatedAngle: number;
}

export const useGame = <CellType>(
    typeManager: SudokuTypeManager<CellType>,
    {initialDigits = {}}: PuzzleDefinition<CellType>
): [ProcessedGameState<CellType>, Dispatch<MergeStateAction<ProcessedGameState<CellType>>>] => {
    const [gameState, setGameState] = useState<GameState<CellType>>(() => ({
        fieldStateHistory: {
            states: [
                fillFieldStateInitialDigits(initialDigits, createEmptyFieldState(typeManager))
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
    const animatedAngle = useAnimatedValue(gameState.angle, gameState.animationSpeed);

    const calculateProcessedGameState = useCallback((gameState: GameState<CellType>): ProcessedGameState<CellType> => ({
        ...gameState,
        cellWriteMode,
        isReady,
        animatedAngle,
    }), [cellWriteMode, isReady, animatedAngle]);

    const processedGameState = useMemo(() => calculateProcessedGameState(gameState), [gameState, calculateProcessedGameState]);

    const mergeGameState = useCallback(
        (gameStateAction: MergeStateAction<ProcessedGameState<CellType>>) => setGameState(gameState => {
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
