import {useCallback, useEffect, useMemo, useState} from "react";
import {
    GameState, getAllShareState,
    getEmptyGameState,
    ProcessedGameState, saveGameState, setAllShareState
} from "../../types/sudoku/GameState";
import {getAllowedCellWriteModeInfos} from "../../types/sudoku/CellWriteMode";
import {getFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {stringifyPosition} from "../../types/layout/Position";
import {HashSet} from "../../types/struct/Set";
import {MessageWithClientId, myClientId, useMultiPlayer, UseMultiPlayerResult} from "../useMultiPlayer";
import {usePureMemo} from "../usePureMemo";
import {
    coreGameStateActionTypes,
    GameStateAction,
    GameStateActionCallback,
    GameStateActionOrCallback, GameStateActionType
} from "../../types/sudoku/GameStateAction";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useDiffEffect} from "../useDiffEffect";
import {useControlKeysState} from "../useControlKeysState";
import {SudokuCellsIndex} from "../../types/sudoku/SudokuCellsIndex";

const emptyObject: any = {};

export const useGame = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    cellSize: number,
    readOnly = false
): PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => {
    const {
        slug,
        params = emptyObject,
        typeManager,
        saveStateKey = slug,
    } = puzzle;

    const {
        useProcessedGameStateExtension = () => emptyObject,
        getSharedState,
        setSharedState,
        applyStateDiffEffect,
    } = typeManager;

    const cellsIndex = useMemo(() => new SudokuCellsIndex(puzzle), [puzzle]);

    const isHost = params.host === myClientId;

    const keys = useControlKeysState();

    const [myGameState, setGameState] = useState(() => getEmptyGameState(puzzle, true, readOnly));

    const mergeMyGameState = useCallback((myGameState: GameState<CellType> & GameStateExtensionType, multiPlayer: UseMultiPlayerResult) => {
        const finalSetSharedState = puzzle.params?.share ? setAllShareState : setSharedState;

        if (multiPlayer.isHost || !multiPlayer.isEnabled || !multiPlayer.isLoaded || !multiPlayer.hostData || !finalSetSharedState) {
            return myGameState;
        }

        return {
            ...myGameState,
            ...finalSetSharedState(puzzle, myGameState, multiPlayer.hostData),
            currentPlayer: multiPlayer.hostData.currentPlayer,
            playerObjects: multiPlayer.hostData.playerObjects,
        };
    }, [puzzle, setSharedState]);

    const sharedGameState = usePureMemo(() => ({
        ...(isHost && (params.share ? getAllShareState(puzzle, myGameState) : getSharedState?.(puzzle, myGameState))),
        currentPlayer: myGameState.currentPlayer,
        playerObjects: myGameState.playerObjects,
    }), [isHost, params, getSharedState, myGameState]);

    const calculateProcessedGameState = useCallback(
        (
            multiPlayer: UseMultiPlayerResult,
            gameState: GameState<CellType> & GameStateExtensionType,
            processedGameStateExtension: Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType>,
            applyKeys = true
        ): ProcessedGameState<CellType> & ProcessedGameStateExtensionType => {
            const {
                isReady: isReadyFn = () => true,
            } = puzzle.typeManager;

            const {isEnabled, isLoaded, isDoubledConnected, hostData} = multiPlayer;

            const allowedCellWriteModes = getAllowedCellWriteModeInfos(puzzle);
            const cellWriteMode = applyKeys
                ? getFinalCellWriteMode(keys, gameState.persistentCellWriteMode, allowedCellWriteModes, readOnly)
                : gameState.persistentCellWriteMode;
            const cellWriteModeInfo = allowedCellWriteModes.find(({mode}) => mode === cellWriteMode)!;
            const isReady = !readOnly
                && !isDoubledConnected
                && !(isEnabled && (!isLoaded || !hostData))
                && isReadyFn(gameState);

            let lastPlayerObjects: Record<string, boolean> = {};
            if (isEnabled) {
                let sortedPlayerObjects = Object.entries(gameState.playerObjects)
                    .sort(([, a], [, b]) => b.index - a.index);
                if (sortedPlayerObjects.length) {
                    const [, {clientId: lastClientId}] = sortedPlayerObjects[0];
                    const lastPrevClientIdIndex = sortedPlayerObjects.findIndex(([, {clientId}]) => clientId !== lastClientId);
                    if (lastPrevClientIdIndex >= 0) {
                        sortedPlayerObjects = sortedPlayerObjects.slice(0, lastPrevClientIdIndex);
                    }
                    lastPlayerObjects = Object.fromEntries(
                        sortedPlayerObjects.map(([key]) => [key, true])
                    )
                }
            }

            return {
                ...gameState,
                cellWriteMode,
                cellWriteModeInfo,
                isReady,
                isMyTurn: !isEnabled || gameState.currentPlayer === myClientId || !!puzzle.params?.share,
                lastPlayerObjects,
                ...(processedGameStateExtension as any),
            };
        },
        [puzzle, readOnly, keys]
    );

    const processMessages = useCallback((
        multiPlayer: UseMultiPlayerResult,
        state: GameState<CellType> & GameStateExtensionType,
        messages: MessageWithClientId[]
    ) => {
        const allActionTypes: GameStateActionType<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[] = [
            ...coreGameStateActionTypes,
            ...(puzzle.typeManager.supportedActionTypes || []),
        ];

        for (const {data: message, clientId} of messages) {
            const {
                type,
                params,
                state: {
                    mode,
                    selected,
                    line,
                    dragStart,
                    addingLine,
                    ...otherState
                },
            } = message;

            const actionType = allActionTypes.find(({key}) => key === type)!;

            const processedGameState = calculateProcessedGameState(
                multiPlayer,
                {
                    ...state,
                    persistentCellWriteMode: mode,
                    selectedCells: HashSet.unserialize(selected, stringifyPosition),
                    currentMultiLine: line,
                    dragStartPoint: dragStart,
                    isAddingLine: addingLine,
                    ...puzzle.typeManager.unserializeInternalState?.(puzzle, otherState)
                },
                emptyObject,
                false
            );

            const callback = actionType.callback(
                params,
                {
                    puzzle,
                    cellsIndex,
                    cellSize,
                    multiPlayer,
                    state: processedGameState,
                    onStateChange: () => console.error("Unexpected state change inside of the messages loop!"),
                },
                clientId
            );

            state = {
                ...state,
                ...(typeof callback === "function" ? callback(processedGameState) : callback),
            };
        }

        return state;
    }, [puzzle, cellsIndex, cellSize, calculateProcessedGameState]);

    const multiPlayer = useMultiPlayer(
        `puzzle:${saveStateKey}`,
        params.host,
        params.room,
        myGameState.nickname,
        sharedGameState,
        (messages) => setGameState((myState) => {
            return processMessages(multiPlayer, mergeMyGameState(myState, multiPlayer), messages);
        })
    );

    const gameState = useMemo(
        () => processMessages(
            multiPlayer,
            mergeMyGameState(myGameState, multiPlayer),
            multiPlayer.myPendingMessages.map(({data}) => ({
                data,
                clientId: myClientId,
            }))
        ),
        [processMessages, mergeMyGameState, myGameState, multiPlayer]
    );

    useEffect(
        () => {
            if (!readOnly) {
                saveGameState(puzzle, gameState);
            }
        },
        [readOnly, puzzle, gameState]
    );

    const processedGameStateExtension: Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType> = useProcessedGameStateExtension(gameState);

    const processedGameState = useMemo(
        () => calculateProcessedGameState(multiPlayer, gameState, processedGameStateExtension),
        [calculateProcessedGameState, multiPlayer, gameState, processedGameStateExtension]
    );

    const mergeGameState = useCallback(
        (
            actionsOrCallbacks: GameStateActionOrCallback<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
                | GameStateActionOrCallback<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        ) => {
            return setGameState(myState => {
                let state = mergeMyGameState(myState, multiPlayer);

                const {isEnabled, isHost, sendMessage} = multiPlayer;

                actionsOrCallbacks = actionsOrCallbacks instanceof Array ? actionsOrCallbacks : [actionsOrCallbacks];

                for (const actionOrCallback of actionsOrCallbacks) {
                    const processedGameState = calculateProcessedGameState(multiPlayer, state, processedGameStateExtension);
                    const context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = {
                        puzzle,
                        cellsIndex,
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

                    if (!isAction || !isEnabled || isHost || (!puzzle.params?.share && !puzzle.typeManager.isGlobalAction?.(asAction, context))) {
                        const callback = isAction
                            ? asAction.type.callback(asAction.params, context, myClientId)
                            : actionOrCallback as GameStateActionCallback<CellType, ProcessedGameStateExtensionType>;

                        state = {
                            ...state,
                            ...(typeof callback === "function" ? callback(processedGameState) : callback),
                        };
                    } else {
                        sendMessage({
                            type: asAction.type.key,
                            params: asAction.params,
                            state: {
                                mode: processedGameState.cellWriteMode,
                                selected: state.selectedCells.serialize(),
                                line: state.currentMultiLine,
                                dragStart: state.dragStartPoint,
                                addingLine: state.isAddingLine,
                                ...puzzle.typeManager.getInternalState?.(puzzle, state),
                            },
                        });
                    }
                }

                return state;
            });
        },
        [puzzle, cellsIndex, setGameState, mergeMyGameState, calculateProcessedGameState, processedGameStateExtension, cellSize, multiPlayer]
    );

    const context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = useMemo(
        () => ({
            puzzle,
            cellsIndex,
            state: processedGameState,
            cellSize,
            multiPlayer,
            onStateChange: mergeGameState,
        }),
        [puzzle, cellsIndex, processedGameState, cellSize, multiPlayer, mergeGameState]
    );

    useDiffEffect(([prevState]) => applyStateDiffEffect?.(processedGameState, prevState, context), [processedGameState]);

    useEventListener(window, "beforeunload", (ev: BeforeUnloadEvent) => {
        if (gameState.fieldStateHistory.states.length > 1) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return context;
};
