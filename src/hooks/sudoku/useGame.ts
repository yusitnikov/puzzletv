import {createEmptyFieldState, serializeFieldState, unserializeFieldState} from "../../types/sudoku/FieldState";
import {Dispatch, useCallback, useEffect, useMemo, useState} from "react";
import {GameState, gameStateGetCurrentFieldState, ProcessedGameState} from "../../types/sudoku/GameState";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
import {MergeStateAction} from "../../types/react/MergeStateAction";
import {useFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {LocalStorageKeys} from "../../data/LocalStorageKeys";
import {
    loadBoolFromLocalStorage,
    loadNumberFromLocalStorage, serializeToLocalStorage,
    unserializeFromLocalStorage
} from "../../utils/localStorage";
import {emptyPosition} from "../../types/layout/Position";

type SavedGameStates = [slug: string, field: any, state: any][];
const gameStateStorageKey = "savedGameState";
const gameStateSerializerVersion = 1;
const maxSavedPuzzles = 10;

export const useGame = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    readOnly = false
): [ProcessedGameState<CellType> & ProcessedGameStateExtensionType, Dispatch<MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>>] => {
    const {
        slug,
        typeManager,
        allowDrawingBorders = false,
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
    } = puzzle;

    const {
        initialGameStateExtension,
        isReady: isReadyFn = () => true,
        useProcessedGameStateExtension = () => ({} as any),
        serializeGameState,
        unserializeGameState,
    } = typeManager;

    const getSavedGameStates = (): SavedGameStates => unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];
    const [gameState, setGameState] = useState<GameState<CellType> & GameStateExtensionType>(() => {
        const savedGameState = readOnly
            ? undefined
            : getSavedGameStates().find(([itemSlug]) => itemSlug === slug);

        return {
            fieldStateHistory: {
                states: [
                    savedGameState
                        ? unserializeFieldState(savedGameState[1], puzzle)
                        : createEmptyFieldState(puzzle)
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
            backgroundOpacity: loadNumberFromLocalStorage(LocalStorageKeys.backgroundOpacity, 0.5),

            ...(initialGameStateExtension as any),
            ...(savedGameState && unserializeGameState(savedGameState[2]))
        };
    });

    useEffect(
        () => {
            if (!readOnly) {
                serializeToLocalStorage(
                    gameStateStorageKey,
                    ([
                        [
                            slug,
                            serializeFieldState(gameStateGetCurrentFieldState(gameState), typeManager),
                            serializeGameState(gameState),
                        ],
                        ...getSavedGameStates().filter(([itemSlug]) => itemSlug !== slug),
                    ] as SavedGameStates).slice(0, maxSavedPuzzles),
                    gameStateSerializerVersion
                );
            }
        },
        [readOnly, gameState]
    );

    const cellWriteMode = useFinalCellWriteMode(
        gameState.persistentCellWriteMode,
        allowDrawingBorders,
        loopHorizontally || loopVertically || enableDragMode,
        readOnly
    );
    const isReady = !readOnly && isReadyFn(gameState);
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
