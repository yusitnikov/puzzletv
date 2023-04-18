import {useCallback, useEffect, useMemo, useState} from "react";
import {
    calculateProcessedGameState,
    GameStateEx,
    getAllShareState,
    getEmptyGameState,
    mergeGameStateWithUpdates,
    ProcessedGameStateAnimatedValues,
    saveGameState,
    setAllShareState
} from "../../types/sudoku/GameState";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useEventListener} from "../useEventListener";
import {PositionSet} from "../../types/layout/Position";
import {MessageWithClientId, myClientId, useMultiPlayer, UseMultiPlayerResult} from "../useMultiPlayer";
import {usePureMemo} from "../usePureMemo";
import {
    coreGameStateActionTypes,
    GameStateAction,
    GameStateActionCallback,
    GameStateActionOrCallback,
} from "../../types/sudoku/GameStateAction";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useDiffEffect} from "../useDiffEffect";
import {useControlKeysState} from "../useControlKeysState";
import {SudokuCellsIndex, SudokuCellsIndexForState} from "../../types/sudoku/SudokuCellsIndex";
import {mixAnimatedValue, useAnimatedValue} from "../useAnimatedValue";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {isSelectableCell} from "../../types/sudoku/CellTypeProps";

const emptyObject: any = {};

export const useGame = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    cellSize: number,
    cellSizeForSidePanel: number,
    readOnly = false
): PuzzleContext<T> => {
    const {
        slug,
        params = emptyObject,
        typeManager,
        saveStateKey = slug,
    } = puzzle;

    const {
        useProcessedGameStateExtension = () => emptyObject as T["processedStateEx"],
        getSharedState,
        setSharedState,
        applyStateDiffEffect,
    } = typeManager;

    const cellsIndex = useMemo(() => new SudokuCellsIndex(puzzle), [puzzle]);

    const isHost = params.host === myClientId;

    const keys = useControlKeysState();

    const [myGameState, setGameState] = useState(() => getEmptyGameState(puzzle, true, readOnly));

    const mergeMyGameState = useCallback((myGameState: GameStateEx<T>, multiPlayer: UseMultiPlayerResult) => {
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

    const memoizedCalculateProcessedGameState = useCallback(
        (
            multiPlayer: UseMultiPlayerResult,
            gameState: GameStateEx<T>,
            processedGameStateExtension: T["processedStateEx"],
            animatedValues?: ProcessedGameStateAnimatedValues,
            applyKeys = true
        ) => calculateProcessedGameState(
            puzzle,
            multiPlayer,
            gameState,
            processedGameStateExtension,
            animatedValues,
            readOnly,
            applyKeys ? keys : undefined,
        ),
        [puzzle, readOnly, keys]
    );

    const processMessages = useCallback((
        multiPlayer: UseMultiPlayerResult,
        state: GameStateEx<T>,
        messages: MessageWithClientId[]
    ) => {
        const allActionTypes = [
            ...coreGameStateActionTypes<T>(),
            ...(puzzle.typeManager.supportedActionTypes || []),
        ];

        for (const {data: message, clientId} of messages) {
            const {
                type,
                actionId,
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
                    loopOffset,
                    angle,
                    scale,
                    ...otherState
                },
            } = message;

            const actionType = allActionTypes.find(({key}) => key === type)!;

            const processedGameState = memoizedCalculateProcessedGameState(
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
                        loopOffset,
                        angle,
                        scale,
                    },
                    puzzle.typeManager.unserializeInternalState?.(puzzle, otherState) ?? {}
                ),
                emptyObject,
                undefined,
                false
            );

            const contextNoIndex: Omit<PuzzleContext<T>, "cellsIndexForState"> = {
                puzzle,
                cellsIndex,
                cellSize,
                cellSizeForSidePanel,
                multiPlayer,
                state: processedGameState,
                onStateChange: () => console.error("Unexpected state change inside of the messages loop!"),
                isReadonlyContext: readOnly,
            };
            const callback = actionType.callback(
                params,
                {
                    ...contextNoIndex,
                    cellsIndexForState: new SudokuCellsIndexForState(cellsIndex, contextNoIndex),
                },
                clientId,
                actionId,
            );

            state = mergeGameStateWithUpdates(
                state,
                typeof callback === "function" ? callback(processedGameState) : callback,
            );
        }

        return state;
    }, [puzzle, cellsIndex, cellSize, cellSizeForSidePanel, memoizedCalculateProcessedGameState, readOnly]);

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

    const processedGameStateExtension = useProcessedGameStateExtension(gameState);

    const animated = useAnimatedValue<ProcessedGameStateAnimatedValues>(
        {
            loopOffset: gameState.loopOffset,
            angle: gameState.angle,
            scale: gameState.scale,
        },
        gameState.animating ? gameState.animationSpeed : 0,
        (a, b, coeff) => ({
            loopOffset: {
                top: mixAnimatedValue(a.loopOffset.top, b.loopOffset.top, coeff * 2),
                left: mixAnimatedValue(a.loopOffset.left, b.loopOffset.left, coeff * 2),
            },
            angle: mixAnimatedValue(a.angle, b.angle, coeff),
            scale: mixAnimatedValue(a.scale, b.scale, coeff * 2),
        })
    );

    const processedGameState = useMemo(
        () => memoizedCalculateProcessedGameState(multiPlayer, gameState, processedGameStateExtension, animated),
        [memoizedCalculateProcessedGameState, multiPlayer, gameState, processedGameStateExtension, animated]
    );

    const mergeGameState = useCallback(
        (
            actionsOrCallbacks: GameStateActionOrCallback<any, T>
                | GameStateActionOrCallback<any, T>[]
        ) => {
            return setGameState((myState) => {
                let state = mergeMyGameState(myState, multiPlayer);

                const {isEnabled, isHost, sendMessage} = multiPlayer;

                actionsOrCallbacks = actionsOrCallbacks instanceof Array ? actionsOrCallbacks : [actionsOrCallbacks];

                for (const actionOrCallback of actionsOrCallbacks) {
                    const processedGameState = memoizedCalculateProcessedGameState(multiPlayer, state, processedGameStateExtension);
                    const contextNoIndex: Omit<PuzzleContext<T>, "cellsIndexForState"> = {
                        puzzle,
                        cellsIndex,
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
                    const context = {
                        ...contextNoIndex,
                        cellsIndexForState: new SudokuCellsIndexForState(cellsIndex, contextNoIndex),
                    };

                    const asAction = actionOrCallback as GameStateAction<any, T>;
                    const isAction = typeof asAction.type === "object";

                    if (!isAction || !isEnabled || isHost || (!puzzle.params?.share && !puzzle.typeManager.isGlobalAction?.(asAction, context))) {
                        const callback = isAction
                            ? asAction.type.callback(asAction.params, context, myClientId, asAction.actionId)
                            : actionOrCallback as GameStateActionCallback<T>;

                        const updates = typeof callback === "function" ? callback(processedGameState) : callback;
                        if (updates.selectedCells) {
                            updates.selectedCells = updates.selectedCells.filter((cell) =>
                                isSelectableCell(cellsIndex.getCellTypeProps(cell)));
                        }
                        state = mergeGameStateWithUpdates(state, updates);
                    } else {
                        sendMessage({
                            type: asAction.type.key,
                            actionId: asAction.actionId,
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
                                loopOffset: state.loopOffset,
                                angle: state.angle,
                                scale: state.scale,
                                ...puzzle.typeManager.getInternalState?.(puzzle, state),
                            },
                        });
                    }
                }

                return state;
            });
        },
        [puzzle, cellsIndex, setGameState, mergeMyGameState, memoizedCalculateProcessedGameState, processedGameStateExtension, cellSize, cellSizeForSidePanel, multiPlayer, readOnly]
    );

    const context: PuzzleContext<T> = useMemo(
        () => {
            const contextNoIndex: Omit<PuzzleContext<T>, "cellsIndexForState"> = {
                puzzle,
                cellsIndex,
                state: processedGameState,
                cellSize,
                cellSizeForSidePanel,
                multiPlayer,
                onStateChange: mergeGameState,
                isReadonlyContext: readOnly,
            };
            return {
                ...contextNoIndex,
                cellsIndexForState: new SudokuCellsIndexForState(cellsIndex, contextNoIndex),
            }
        },
        [puzzle, cellsIndex, processedGameState, cellSize, cellSizeForSidePanel, multiPlayer, mergeGameState, readOnly]
    );

    useDiffEffect(
        ([prevState], [currentState]) => {
            if (currentState) {
                applyStateDiffEffect?.(currentState, prevState, context);
            }
        },
        [processedGameState]
    );

    useEventListener(window, "beforeunload", (ev) => {
        if (gameState.fieldStateHistory.states.length > 1) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return context;
};
