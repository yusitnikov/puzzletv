import {createEmptyFieldState, serializeFieldState, unserializeFieldState} from "../../types/sudoku/FieldState";
import {Dispatch, useCallback, useEffect, useMemo, useState} from "react";
import {GameState, gameStateGetCurrentFieldState, ProcessedGameState} from "../../types/sudoku/GameState";
import {CellWriteMode, getAllowedCellWriteModeInfos} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
import {MergeStateAction} from "../../types/react/MergeStateAction";
import {useFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {LocalStorageKeys} from "../../data/LocalStorageKeys";
import {
    loadBoolFromLocalStorage,
    loadNumberFromLocalStorage,
    serializeToLocalStorage,
    unserializeFromLocalStorage
} from "../../utils/localStorage";
import {emptyPosition} from "../../types/layout/Position";
import {Set} from "../../types/struct/Set";
import {serializeGivenDigitsMap, unserializeGivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {getCellDataComparer} from "../../types/sudoku/CellState";
import {indexes} from "../../utils/indexes";

type SavedGameStates = [key: string, field: any, state: any, initialDigits: any, excludedDigits: any, cellWriteMode: any][];
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
        saveState = true,
        saveStateKey = slug,
    } = puzzle;

    const {
        initialGameStateExtension,
        isReady: isReadyFn = () => true,
        useProcessedGameStateExtension = () => ({} as any),
        serializeGameState,
        unserializeGameState,
        extraCellWriteModes = [],
        initialCellWriteMode = CellWriteMode.main,
    } = typeManager;

    const getSavedGameStates = (): SavedGameStates => unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];
    const [gameState, setGameState] = useState<GameState<CellType> & GameStateExtensionType>(() => {
        const savedGameState = (readOnly || !saveState)
            ? undefined
            : getSavedGameStates().find(([key]) => key === saveStateKey);

        return {
            fieldStateHistory: {
                states: [
                    savedGameState
                        ? unserializeFieldState(savedGameState[1], puzzle)
                        : createEmptyFieldState(puzzle)
                ],
                currentIndex: 0,
            },
            persistentCellWriteMode: savedGameState?.[5] ?? initialCellWriteMode,
            selectedCells: noSelectedCells,
            initialDigits: unserializeGivenDigitsMap(savedGameState?.[3] || {}, puzzle.typeManager.unserializeCellData),
            excludedDigits: savedGameState?.[4]
                ? unserializeGivenDigitsMap(savedGameState[4], (excludedDigits: any) => Set.unserialize(
                    excludedDigits,
                    getCellDataComparer(puzzle.typeManager.areSameCellData),
                    puzzle.typeManager.cloneCellData,
                    puzzle.typeManager.serializeCellData,
                    puzzle.typeManager.unserializeCellData,
                ))
                : indexes(puzzle.fieldSize.rowsCount).map(() => indexes(puzzle.fieldSize.columnsCount).map(() => new Set(
                    [],
                    getCellDataComparer(puzzle.typeManager.areSameCellData),
                    puzzle.typeManager.cloneCellData,
                    puzzle.typeManager.serializeCellData
                ))),

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
            if (!readOnly && saveState) {
                serializeToLocalStorage(
                    gameStateStorageKey,
                    ([
                        [
                            saveStateKey,
                            serializeFieldState(gameStateGetCurrentFieldState(gameState), typeManager),
                            serializeGameState(gameState),
                            serializeGivenDigitsMap(gameState.initialDigits, typeManager.serializeCellData),
                            serializeGivenDigitsMap(gameState.excludedDigits, (excludedDigits) => excludedDigits.serialize()),
                            gameState.persistentCellWriteMode,
                        ],
                        ...getSavedGameStates().filter(([key]) => key !== saveStateKey),
                    ] as SavedGameStates).slice(0, maxSavedPuzzles),
                    gameStateSerializerVersion
                );
            }
        },
        [readOnly, gameState]
    );

    const allowedCellWriteModes = [
        ...getAllowedCellWriteModeInfos(allowDrawingBorders, loopHorizontally || loopVertically || enableDragMode),
        ...extraCellWriteModes,
    ];
    const cellWriteMode = useFinalCellWriteMode(gameState.persistentCellWriteMode, allowedCellWriteModes, readOnly);
    const cellWriteModeInfo = allowedCellWriteModes.find(({mode}) => mode === cellWriteMode)!;
    const isReady = !readOnly && isReadyFn(gameState);
    const processedGameStateExtension: Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType> = useProcessedGameStateExtension(gameState);
    const processedGameStateExtensionDep = JSON.stringify(processedGameStateExtension);

    const calculateProcessedGameState = useCallback(
        (gameState: GameState<CellType> & GameStateExtensionType): ProcessedGameState<CellType> & ProcessedGameStateExtensionType => ({
            ...gameState,
            cellWriteMode,
            cellWriteModeInfo,
            isReady,
            ...(processedGameStateExtension as any),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [cellWriteMode, cellWriteModeInfo, isReady, processedGameStateExtensionDep]
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
