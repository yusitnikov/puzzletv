import {createEmptyFieldState, fillFieldStateInitialDigits} from "../../types/sudoku/FieldState";
import {Dispatch, useCallback, useMemo, useState} from "react";
import {GameState, ProcessedGameState} from "../../types/sudoku/GameState";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
import {MergeStateAction} from "../../types/react/MergeStateAction";
import {useFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {SudokuTypeManager} from "../../types/sudoku/SudokuTypeManager";

export const useGame = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    {initialDigits = {}}: PuzzleDefinition<CellType>
): [ProcessedGameState<CellType> & ProcessedGameStateExtensionType, Dispatch<MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>>] => {
    const [gameState, setGameState] = useState<GameState<CellType> & GameStateExtensionType>(() => ({
        fieldStateHistory: {
            states: [
                fillFieldStateInitialDigits(initialDigits, createEmptyFieldState(typeManager))
            ],
            currentIndex: 0,
        },
        persistentCellWriteMode: CellWriteMode.main,
        selectedCells: noSelectedCells,

        ...(typeManager.initialGameStateExtension as any),
    }));

    const cellWriteMode = useFinalCellWriteMode(gameState.persistentCellWriteMode);
    const isReady = !typeManager.isReady || typeManager.isReady(gameState);
    const processedGameStateExtension: Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType> = typeManager.useProcessedGameStateExtension?.(gameState) || ({} as any);
    const processedGameStateExtensionDep = JSON.stringify(processedGameStateExtension);

    const calculateProcessedGameState = useCallback(
        (gameState: GameState<CellType> & GameStateExtensionType): ProcessedGameState<CellType> & ProcessedGameStateExtensionType => ({
            ...gameState,
            cellWriteMode,
            isReady,
            ...(processedGameStateExtension as any),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [cellWriteMode, isReady, processedGameStateExtensionDep]
    );

    const processedGameState = useMemo(() => calculateProcessedGameState(gameState), [gameState, calculateProcessedGameState]);

    const mergeGameState = useCallback(
        (gameStateAction: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => setGameState(gameState => {
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
