import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { GuessTypeManager } from "../../guess/types/GuessTypeManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import {
    GameStateEx,
    mergeGameStateUpdates,
    mergeGameStateWithUpdates,
    PartialGameStateEx,
} from "../../../types/puzzle/GameState";
import { QuadConstraintBySolution } from "../../../components/puzzle/constraints/quad/Quad";
import { enterDigitActionType } from "../../../types/puzzle/GameStateAction";
import { QuadsHintConstraint } from "../components/QuadsHint";
import { indexes } from "../../../utils/indexes";
import { getNextPlayerId } from "../../../hooks/useMultiPlayer";
import { QuadleConstraintBySolution } from "../../../components/puzzle/constraints/quad/Quadle";
import { QuadInputTypeManager } from "../../../components/puzzle/constraints/quad/QuadInput/QuadInputTypeManager";
import { QuadMastersPTM } from "./QuadMastersPTM";
import { IReactionDisposer, reaction } from "mobx";
import { addGameStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { QuadMastersGameState } from "./QuadMastersGameState";
import { QuadInputGameState } from "../../../components/puzzle/constraints/quad/QuadInput/QuadInputGameState";

export const QuadMastersTypeManager = (isQuadle: boolean): PuzzleTypeManager<QuadMastersPTM> => {
    const parent = QuadInputTypeManager<QuadMastersPTM>({
        parent: GuessTypeManager(),
        isQuadle,
        allowRepeat: isQuadle,
        allowOverflow: !isQuadle,
        getReadyQuadConstraint: (context, position, digits, isRecent) =>
            isQuadle
                ? QuadleConstraintBySolution(context, position, digits, isRecent)
                : QuadConstraintBySolution(context, position, digits, isRecent),
        isQuadAllowedFn: ({ inputMode, stateExtension: { isQuadTurn } }) =>
            isQuadTurn && inputMode === PuzzleInputMode.quads,
        onQuadFinish: (defaultResult) => mergeGameStateUpdates(defaultResult, { extension: { isQuadTurn: false } }),
    });

    // TODO: call parent in every method
    return {
        ...addGameStateExToPuzzleTypeManager<
            QuadMastersPTM,
            Omit<QuadMastersGameState, keyof QuadInputGameState<number>>
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
                inputMode,
                selectedCells,
                currentPlayer = "",
                multiPlayer: { allPlayerIds },
            } = context;

            const newState = mergeGameStateWithUpdates(context.state, defaultResult);

            if (inputMode === PuzzleInputMode.mainDigit && context.selectedCellsCount) {
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

        initialInputMode: PuzzleInputMode.quads,

        isGlobalAction(action, context): boolean {
            return (
                parent.isGlobalAction?.(action, context) ||
                (action.type.key === enterDigitActionType().key && context.inputMode === PuzzleInputMode.mainDigit)
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
                            context.onStateChange({ persistentInputMode: PuzzleInputMode.quads });
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
                                context.onStateChange({ persistentInputMode: PuzzleInputMode.quads });
                            }
                        } else {
                            if (context.isMyTurn && context.persistentInputMode === PuzzleInputMode.quads) {
                                context.onStateChange({ persistentInputMode: PuzzleInputMode.mainDigit });
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
