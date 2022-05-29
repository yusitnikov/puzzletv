import {createEmptyFieldState, serializeFieldState, unserializeFieldState} from "../../types/sudoku/FieldState";
import {useCallback, useEffect, useMemo, useState} from "react";
import {GameState, gameStateGetCurrentFieldState, ProcessedGameState} from "../../types/sudoku/GameState";
import {CellWriteMode, getAllowedCellWriteModeInfos} from "../../types/sudoku/CellWriteMode";
import {noSelectedCells} from "../../types/sudoku/SelectedCells";
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
import {emptyPosition, isSamePosition} from "../../types/layout/Position";
import {Set} from "../../types/struct/Set";
import {serializeGivenDigitsMap, unserializeGivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {getCellDataComparer} from "../../types/sudoku/CellState";
import {indexes} from "../../utils/indexes";
import {myClientId, useMultiPlayer, UseMultiPlayerResult} from "../useMultiPlayer";
import {usePureMemo} from "../usePureMemo";
import {
    coreGameStateActionTypes,
    GameStateAction,
    GameStateActionCallback,
    GameStateActionOrCallback, GameStateActionType
} from "../../types/sudoku/GameStateAction";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";

type SavedGameStates = [
    key: string,
    field: any,
    state: any,
    initialDigits: any,
    excludedDigits: any,
    cellWriteMode: any,
    currentPlayer: any,
][];
const gameStateStorageKey = "savedGameState";
const gameStateSerializerVersion = 1;
const maxSavedPuzzles = 10;

export const useGame = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    cellSize: number,
    readOnly = false
): PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => {
    const {
        slug,
        params = {},
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
        getSharedState,
        setSharedState,
        unserializeInternalState,
        supportedActionTypes = [],
    } = typeManager;

    const isHost = params.host === myClientId;
    const fullSaveStateKey = `${saveStateKey}-${params.host || ""}-${params.room || ""}`;

    const getSavedGameStates = (): SavedGameStates => unserializeFromLocalStorage(gameStateStorageKey, gameStateSerializerVersion) || [];
    const [myGameState, setGameState] = useState<GameState<CellType> & GameStateExtensionType>(() => {
        const savedGameState = (readOnly || !saveState)
            ? undefined
            : getSavedGameStates().find(([key]) => key === fullSaveStateKey);

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

            currentPlayer: savedGameState?.[6] || params.host,

            enableConflictChecker: loadBoolFromLocalStorage(LocalStorageKeys.enableConflictChecker, true),
            autoCheckOnFinish: loadBoolFromLocalStorage(LocalStorageKeys.autoCheckOnFinish, true),
            backgroundOpacity: loadNumberFromLocalStorage(LocalStorageKeys.backgroundOpacity, 0.5),

            ...(initialGameStateExtension as any),
            ...(savedGameState && unserializeGameState(savedGameState[2]))
        };
    });

    const mergeMyGameState = useCallback((myGameState: GameState<CellType> & GameStateExtensionType, multiPlayer: UseMultiPlayerResult) => {
        if (multiPlayer.isHost || !multiPlayer.isEnabled || !multiPlayer.isLoaded || !multiPlayer.hostData || !setSharedState) {
            return myGameState;
        }

        return {
            ...myGameState,
            ...setSharedState(puzzle, myGameState, multiPlayer.hostData),
            currentPlayer: multiPlayer.hostData.currentPlayer,
        };
    }, [puzzle, setSharedState]);

    const sharedGameState = usePureMemo(() => ({
        ...(isHost && getSharedState?.(puzzle, myGameState)),
        currentPlayer: myGameState.currentPlayer,
    }), [isHost, getSharedState, myGameState]);

    const multiPlayer = useMultiPlayer(
        `puzzle:${saveStateKey}`,
        params.host,
        params.room,
        sharedGameState,
        (message, clientId) => {
            const {
                type,
                params,
                state: {
                    mode,
                    selected,
                    line,
                    addingLine,
                    ...otherState
                },
            } = message;

            const actionType: GameStateActionType<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = [
                ...coreGameStateActionTypes,
                ...supportedActionTypes,
            ].find(({key}) => key === type)!;

            setGameState(myState => {
                const state = mergeMyGameState(myState, multiPlayer);

                const processedGameState: typeof context.state = {
                    ...context.state,
                    persistentCellWriteMode: mode,
                    cellWriteMode: mode,
                    cellWriteModeInfo: allowedCellWriteModes.find((item) => item.mode === mode)!,
                    selectedCells: Set.unserialize(selected, isSamePosition),
                    currentMultiLine: line,
                    isAddingLine: addingLine,
                    ...unserializeInternalState?.(puzzle, otherState)
                };

                const callback = actionType.callback(
                    params,
                    {
                        ...context,
                        state: processedGameState,
                    },
                    clientId
                );

                return {
                    ...state,
                    ...(typeof callback === "function" ? callback(processedGameState) : callback),
                };
            });
        }
    );
    const {isEnabled, isLoaded, isDoubledConnected, hostData} = multiPlayer;

    const gameState = useMemo(() => mergeMyGameState(myGameState, multiPlayer), [mergeMyGameState, myGameState, multiPlayer]);

    useEffect(
        () => {
            if (!readOnly && saveState) {
                serializeToLocalStorage(
                    gameStateStorageKey,
                    ([
                        [
                            fullSaveStateKey,
                            serializeFieldState(gameStateGetCurrentFieldState(gameState), typeManager),
                            serializeGameState(gameState),
                            serializeGivenDigitsMap(gameState.initialDigits, typeManager.serializeCellData),
                            serializeGivenDigitsMap(gameState.excludedDigits, (excludedDigits) => excludedDigits.serialize()),
                            gameState.persistentCellWriteMode,
                            gameState.currentPlayer || "",
                        ],
                        ...getSavedGameStates().filter(([key]) => key !== fullSaveStateKey),
                    ] as SavedGameStates).slice(0, maxSavedPuzzles),
                    gameStateSerializerVersion
                );
            }
        },
        [readOnly, saveState, fullSaveStateKey, gameState, typeManager, serializeGameState]
    );

    const allowedCellWriteModes = [
        ...getAllowedCellWriteModeInfos(allowDrawingBorders, loopHorizontally || loopVertically || enableDragMode),
        ...extraCellWriteModes,
    ];
    const cellWriteMode = useFinalCellWriteMode(gameState.persistentCellWriteMode, allowedCellWriteModes, readOnly);
    const cellWriteModeInfo = allowedCellWriteModes.find(({mode}) => mode === cellWriteMode)!;
    const isReady = !readOnly
        && !isDoubledConnected
        && !(isEnabled && (!isLoaded || !hostData))
        && isReadyFn(gameState);
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
        (
            actionsOrCallbacks: GameStateActionOrCallback<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
                | GameStateActionOrCallback<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        ) => setGameState(myState => {
            let state = mergeMyGameState(myState, multiPlayer);

            const {isEnabled, isHost, sendMessage} = multiPlayer;

            actionsOrCallbacks = actionsOrCallbacks instanceof Array ? actionsOrCallbacks : [actionsOrCallbacks];

            for (const actionOrCallback of actionsOrCallbacks) {
                const processedGameState = calculateProcessedGameState(state);
                const context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = {
                    puzzle,
                    cellSize,
                    multiPlayer,
                    state: {
                        ...processedGameState,
                        ...state,
                    },
                    onStateChange: () => {},
                };

                const asAction = actionOrCallback as GameStateAction<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
                const isAction = typeof asAction.type === "object";

                if (!isAction || !isEnabled || isHost || !puzzle.typeManager.isGlobalAction?.(asAction, context)) {
                    const callback = isAction
                        ? asAction.type.callback(asAction.params, context, myClientId)
                        : actionOrCallback as GameStateActionCallback<CellType, ProcessedGameStateExtensionType>;

                    state = {
                        ...state,
                        ...(typeof callback === "function" ? callback(processedGameState) : callback),
                    };
                } else {
                    // TODO: understand which actions are local
                    sendMessage({
                        type: asAction.type.key,
                        params: asAction.params,
                        state: {
                            mode: processedGameState.cellWriteMode,
                            selected: state.selectedCells.serialize(),
                            line: state.currentMultiLine,
                            addingLine: state.isAddingLine,
                            ...puzzle.typeManager.getInternalState?.(puzzle, state),
                        },
                    });
                }
            }

            return state;
        }),
        [puzzle, setGameState, mergeMyGameState, calculateProcessedGameState, cellSize, multiPlayer]
    );

    const context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = useMemo(
        () => ({
            puzzle,
            state: processedGameState,
            cellSize,
            multiPlayer,
            onStateChange: mergeGameState,
        }),
        [puzzle, processedGameState, cellSize, multiPlayer, mergeGameState]
    );

    useEventListener(window, "beforeunload", (ev: BeforeUnloadEvent) => {
        if (gameState.fieldStateHistory.states.length > 1) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return context;
};
