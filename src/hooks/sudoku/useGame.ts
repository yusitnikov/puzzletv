import {createEmptyFieldState} from "../../types/sudoku/FieldState";
import {Dispatch, useCallback, useMemo, useState} from "react";
import {GameState, ProcessedGameState} from "../../types/sudoku/GameState";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
import {MergeStateAction} from "../../types/react/MergeStateAction";
import {useFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {LocalStorageKeys} from "../../data/LocalStorageKeys";
import {loadBoolFromLocalStorage} from "../../utils/localStorage";
import {emptyPosition} from "../../types/layout/Position";

export const useGame = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): [ProcessedGameState<CellType> & ProcessedGameStateExtensionType, Dispatch<MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>>] => {
    const {
        typeManager: {
            initialGameStateExtension,
            isReady: isReadyFn = () => true,
            useProcessedGameStateExtension = () => ({} as any)
        },
        allowDrawingBorders = false,
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
    } = puzzle;

    const [gameState, setGameState] = useState<GameState<CellType> & GameStateExtensionType>(() => ({
        fieldStateHistory: {
            states: [
                createEmptyFieldState(puzzle)
            ],
            currentIndex: 0,
        },
        persistentCellWriteMode: CellWriteMode.main,
        selectedCells: noSelectedCells,

        currentMultiLine: [],
        isAddingLine: false,

        loopOffset: emptyPosition,

        enableConflictChecker: loadBoolFromLocalStorage(LocalStorageKeys.enableConflictChecker, true),
        autoCheckOnFinish: loadBoolFromLocalStorage(LocalStorageKeys.autoCheckOnFinish, true),

        ...(initialGameStateExtension as any),
    }));

    const cellWriteMode = useFinalCellWriteMode(
        gameState.persistentCellWriteMode,
        allowDrawingBorders,
        loopHorizontally || loopVertically || enableDragMode
    );
    const isReady = isReadyFn(gameState);
    const processedGameStateExtension: Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType> = useProcessedGameStateExtension(gameState);
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
        if (gameState.fieldStateHistory.states.length > 1) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return [processedGameState, mergeGameState];
};
