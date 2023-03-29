import {useCallback, useEffect, useMemo, useState} from "react";
import {
    GameStateEx,
    getAllShareState,
    getEmptyGameState, mergeGameStateWithUpdates,
    ProcessedGameStateEx,
    saveGameState,
    setAllShareState
} from "../../types/sudoku/GameState";
import {getAllowedCellWriteModeInfos} from "../../types/sudoku/CellWriteMode";
import {getFinalCellWriteMode} from "./useFinalCellWriteMode";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {PositionSet} from "../../types/layout/Position";
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
import {SudokuCellsIndex, SudokuCellsIndexForState} from "../../types/sudoku/SudokuCellsIndex";

const emptyObject: any = {};

export const useGame = <CellType, ExType = {}, ProcessedExType = {}>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    cellSize: number,
    cellSizeForSidePanel: number,
    readOnly = false
): PuzzleContext<CellType, ExType, ProcessedExType> => {
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

    const mergeMyGameState = useCallback((myGameState: GameStateEx<CellType, ExType>, multiPlayer: UseMultiPlayerResult) => {
        const finalSetSharedState = puzzle.params?.share ? setAllShareState : setSharedState;

        if (multiPlayer.isHost || !multiPlayer.isEnabled || !multiPlayer.isLoaded || !multiPlayer.hostData || !finalSetSharedState) {
            return myGameState;
        }

        return mergeGameStateWithUpdates(
            myGameState,
            finalSetSharedState?.(puzzle, myGameState, multiPlayer.hostData) ?? {},
            {
                currentPlayer: multiPlayer.hostData.currentPlayer,
                playerObjects: multiPlayer.hostData.playerObjects,
            }
        )
    }, [puzzle, setSharedState]);

    const sharedGameState = usePureMemo(() => ({
        ...(isHost && (params.share ? getAllShareState(puzzle, myGameState) : getSharedState?.(puzzle, myGameState))),
        currentPlayer: myGameState.currentPlayer,
        playerObjects: myGameState.playerObjects,
    }), [isHost, params, getSharedState, myGameState]);

    const calculateProcessedGameState = useCallback(
        (
            multiPlayer: UseMultiPlayerResult,
            gameState: GameStateEx<CellType, ExType>,
            processedGameStateExtension: ProcessedExType,
            applyKeys = true
        ): ProcessedGameStateEx<CellType, ExType, ProcessedExType> => {
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
                processed: {
                    cellWriteMode,
                    cellWriteModeInfo,
                    isReady,
                    isMyTurn: !isEnabled || gameState.currentPlayer === myClientId || !!puzzle.params?.share,
                    lastPlayerObjects,
                },
                processedExtension: processedGameStateExtension ?? ({} as ProcessedExType),
            };
        },
        [puzzle, readOnly, keys]
    );

    const processMessages = useCallback((
        multiPlayer: UseMultiPlayerResult,
        state: GameStateEx<CellType, ExType>,
        messages: MessageWithClientId[]
    ) => {
        const allActionTypes: GameStateActionType<any, CellType, ExType, ProcessedExType>[] = [
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
                    color,
                    line,
                    lineEnd,
                    lineCenters,
                    dragStart,
                    dragAction,
                    ...otherState
                },
            } = message;

            const actionType = allActionTypes.find(({key}) => key === type)!;

            const processedGameState = calculateProcessedGameState(
                multiPlayer,
                mergeGameStateWithUpdates(
                    state,
                    {
                        persistentCellWriteMode: mode,
                        selectedCells: PositionSet.unserialize(selected),
                        selectedColor: color,
                        currentMultiLine: line,
                        currentMultiLineEnd: lineEnd,
                        isCurrentMultiLineCenters: lineCenters,
                        dragStartPoint: dragStart,
                        dragAction,
                    },
                    puzzle.typeManager.unserializeInternalState?.(puzzle, otherState) ?? {}
                ),
                emptyObject,
                false
            );

            const callback = actionType.callback(
                params,
                {
                    puzzle,
                    cellsIndex,
                    cellsIndexForState: new SudokuCellsIndexForState(cellsIndex, processedGameState, cellSize),
                    cellSize,
                    cellSizeForSidePanel,
                    multiPlayer,
                    state: processedGameState,
                    onStateChange: () => console.error("Unexpected state change inside of the messages loop!"),
                    isReadonlyContext: readOnly,
                },
                clientId
            );

            state = mergeGameStateWithUpdates(
                state,
                typeof callback === "function" ? callback(processedGameState) : callback,
            );
        }

        return state;
    }, [puzzle, cellsIndex, cellSize, cellSizeForSidePanel, calculateProcessedGameState, readOnly]);

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

    const processedGameStateExtension: ProcessedExType = useProcessedGameStateExtension(gameState);

    const processedGameState = useMemo(
        () => calculateProcessedGameState(multiPlayer, gameState, processedGameStateExtension),
        [calculateProcessedGameState, multiPlayer, gameState, processedGameStateExtension]
    );

    const cellsIndexForState = useMemo(
        () => new SudokuCellsIndexForState(cellsIndex, processedGameState, cellSize),
        [cellsIndex, processedGameState, cellSize]
    );

    const mergeGameState = useCallback(
        (
            actionsOrCallbacks: GameStateActionOrCallback<any, CellType, ExType, ProcessedExType>
                | GameStateActionOrCallback<any, CellType, ExType, ProcessedExType>[]
        ) => {
            return setGameState((myState) => {
                let state = mergeMyGameState(myState, multiPlayer);

                const {isEnabled, isHost, sendMessage} = multiPlayer;

                actionsOrCallbacks = actionsOrCallbacks instanceof Array ? actionsOrCallbacks : [actionsOrCallbacks];

                for (const actionOrCallback of actionsOrCallbacks) {
                    const processedGameState = calculateProcessedGameState(multiPlayer, state, processedGameStateExtension);
                    const context: PuzzleContext<CellType, ExType, ProcessedExType> = {
                        puzzle,
                        cellsIndex,
                        cellsIndexForState: new SudokuCellsIndexForState(cellsIndex, processedGameState, cellSize),
                        cellSize,
                        cellSizeForSidePanel,
                        multiPlayer,
                        state: {
                            ...processedGameState,
                            ...state,
                        },
                        onStateChange: () => {},
                        isReadonlyContext: readOnly,
                    };

                    const asAction = actionOrCallback as GameStateAction<any, CellType, ExType, ProcessedExType>;
                    const isAction = typeof asAction.type === "object";

                    if (!isAction || !isEnabled || isHost || (!puzzle.params?.share && !puzzle.typeManager.isGlobalAction?.(asAction, context))) {
                        const callback = isAction
                            ? asAction.type.callback(asAction.params, context, myClientId)
                            : actionOrCallback as GameStateActionCallback<CellType, ExType, ProcessedExType>;

                        const updates = typeof callback === "function" ? callback(processedGameState) : callback;
                        if (updates.selectedCells) {
                            updates.selectedCells = updates.selectedCells.filter((cell) => {
                                const cellTypeProps = puzzle.typeManager.getCellTypeProps?.(cell, puzzle);
                                return cellTypeProps?.isVisible !== false && cellTypeProps?.isSelectable !== false;
                            });
                        }
                        state = mergeGameStateWithUpdates(state, updates);
                    } else {
                        sendMessage({
                            type: asAction.type.key,
                            params: asAction.params,
                            state: {
                                mode: processedGameState.processed.cellWriteMode,
                                selected: state.selectedCells.serialize(),
                                color: state.selectedColor,
                                line: state.currentMultiLine,
                                lineEnd: state.currentMultiLineEnd,
                                lineCenters: state.isCurrentMultiLineCenters,
                                dragStart: state.dragStartPoint,
                                dragAction: state.dragAction,
                                ...puzzle.typeManager.getInternalState?.(puzzle, state),
                            },
                        });
                    }
                }

                return state;
            });
        },
        [puzzle, cellsIndex, setGameState, mergeMyGameState, calculateProcessedGameState, processedGameStateExtension, cellSize, cellSizeForSidePanel, multiPlayer, readOnly]
    );

    const context: PuzzleContext<CellType, ExType, ProcessedExType> = useMemo(
        () => ({
            puzzle,
            cellsIndex,
            cellsIndexForState,
            state: processedGameState,
            cellSize,
            cellSizeForSidePanel,
            multiPlayer,
            onStateChange: mergeGameState,
            isReadonlyContext: readOnly,
        }),
        [puzzle, cellsIndex, cellsIndexForState, processedGameState, cellSize, cellSizeForSidePanel, multiPlayer, mergeGameState, readOnly]
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
