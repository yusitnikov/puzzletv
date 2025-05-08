import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { GuessSudokuTypeManager } from "../../guess/types/GuessSudokuTypeManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import {
    GameStateEx,
    mergeGameStateUpdates,
    mergeGameStateWithUpdates,
    PartialGameStateEx,
} from "../../../types/sudoku/GameState";
import { QuadConstraintBySolution } from "../../../components/sudoku/constraints/quad/Quad";
import { enterDigitActionType } from "../../../types/sudoku/GameStateAction";
import { QuadsHintConstraint } from "../components/QuadsHint";
import { indexes } from "../../../utils/indexes";
import { getNextPlayerId } from "../../../hooks/useMultiPlayer";
import { QuadleConstraintBySolution } from "../../../components/sudoku/constraints/quad/Quadle";
import { QuadInputSudokuTypeManager } from "../../../components/sudoku/constraints/quad/QuadInput/QuadInputSudokuTypeManager";
import { QuadMastersPTM } from "./QuadMastersPTM";
import { IReactionDisposer, reaction } from "mobx";
import { addGameStateExToSudokuManager } from "../../../types/sudoku/SudokuTypeManagerPlugin";
import { QuadMastersGameState } from "./QuadMastersGameState";
import { QuadInputGameState } from "../../../components/sudoku/constraints/quad/QuadInput/QuadInputGameState";

export const QuadMastersSudokuTypeManager = (isQuadle: boolean): SudokuTypeManager<QuadMastersPTM> => {
    const parent = QuadInputSudokuTypeManager<QuadMastersPTM>({
        parent: GuessSudokuTypeManager(),
        isQuadle,
        allowRepeat: isQuadle,
        allowOverflow: !isQuadle,
        getReadyQuadConstraint: (context, position, digits, isRecent) =>
            isQuadle
                ? QuadleConstraintBySolution(context, position, digits, isRecent)
                : QuadConstraintBySolution(context, position, digits, isRecent),
        isQuadAllowedFn: ({ cellWriteMode, stateExtension: { isQuadTurn } }) =>
            isQuadTurn && cellWriteMode === CellWriteMode.quads,
        onQuadFinish: (defaultResult) => mergeGameStateUpdates(defaultResult, { extension: { isQuadTurn: false } }),
    });

    // TODO: call parent in every method
    return {
        ...addGameStateExToSudokuManager<
            QuadMastersPTM,
            Omit<QuadMastersGameState, keyof QuadInputGameState<number>>,
            {}
        >(parent, {
            initialGameStateExtension: { isQuadTurn: true },
        }),

        items: (context) => {
            return [
                QuadsHintConstraint,
                ...((parent.items instanceof Array && parent.items) || []),
                ...((typeof parent.items === "function" && parent.items(context)) || []),
            ];
        },

        handleDigitGlobally(isGlobal, clientId, context, cellData, defaultResult): PartialGameStateEx<QuadMastersPTM> {
            defaultResult =
                parent.handleDigitGlobally?.(isGlobal, clientId, context, cellData, defaultResult) || defaultResult;

            if (!isGlobal || !context.isMyTurn) {
                return defaultResult;
            }

            const {
                puzzle: {
                    gridSize: { rowsCount, columnsCount },
                },
                cellWriteMode,
                selectedCells,
                currentPlayer = "",
                multiPlayer: { allPlayerIds },
            } = context;

            const newState = mergeGameStateWithUpdates(context.state, defaultResult);

            if (cellWriteMode === CellWriteMode.main && context.selectedCellsCount) {
                if (selectedCells.items.some(({ top, left }) => !newState.initialDigits?.[top]?.[left])) {
                    return mergeGameStateUpdates(defaultResult, {
                        currentPlayer: getNextPlayerId(currentPlayer, allPlayerIds),
                        extension: {
                            isQuadTurn: true,
                            currentQuad: undefined,
                        },
                    });
                } else if (
                    indexes(rowsCount).every((top) =>
                        indexes(columnsCount).every((left) => newState.initialDigits?.[top]?.[left] !== undefined),
                    )
                ) {
                    return mergeGameStateUpdates(defaultResult, {
                        extension: {
                            isQuadTurn: false,
                            currentQuad: undefined,
                        },
                    });
                }
            }

            return defaultResult;
        },

        getSharedState(puzzle, state): any {
            const {
                extension: { isQuadTurn },
            } = state;

            return {
                ...parent.getSharedState?.(puzzle, state),
                isQuadTurn,
            };
        },

        setSharedState(context, newState): GameStateEx<QuadMastersPTM> {
            const { isQuadTurn } = newState;

            return mergeGameStateWithUpdates(context.myGameState, parent.setSharedState?.(context, newState) ?? {}, {
                extension: { isQuadTurn },
            });
        },

        initialCellWriteMode: CellWriteMode.quads,

        isGlobalAction(action, context): boolean {
            return (
                parent.isGlobalAction?.(action, context) ||
                (action.type.key === enterDigitActionType().key && context.cellWriteMode === CellWriteMode.main)
            );
        },

        getReactions(context): IReactionDisposer[] {
            return [
                ...(parent.getReactions?.(context) ?? []),
                reaction(
                    () => context.isMyTurn,
                    (isMyTurn, prevIsMyTurn = false) => {
                        if (
                            isMyTurn &&
                            !prevIsMyTurn &&
                            context.stateExtension.isQuadTurn &&
                            context.multiPlayer.isEnabled &&
                            !context.puzzle.params?.share
                        ) {
                            context.onStateChange({ persistentCellWriteMode: CellWriteMode.quads });
                        }
                    },
                    {
                        name: "quad masters - isMyTurn",
                        fireImmediately: true,
                    },
                ),
                reaction(
                    () => context.stateExtension.isQuadTurn,
                    (isQuadTurn, prevIsQuadTurn = false) => {
                        if (isQuadTurn === prevIsQuadTurn) {
                            return;
                        }

                        if (isQuadTurn) {
                            if (!context.multiPlayer.isEnabled || context.puzzle.params?.share) {
                                context.onStateChange({ persistentCellWriteMode: CellWriteMode.quads });
                            }
                        } else {
                            if (context.isMyTurn && context.persistentCellWriteMode === CellWriteMode.quads) {
                                context.onStateChange({ persistentCellWriteMode: CellWriteMode.main });
                            }
                        }
                    },
                    {
                        name: "quad masters - isQuadTurn",
                        fireImmediately: true,
                    },
                ),
            ];
        },
    };
};
