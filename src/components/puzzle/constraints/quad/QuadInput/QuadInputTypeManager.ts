import { isSamePosition, Position } from "../../../../../types/layout/Position";
import { PuzzleContext } from "../../../../../types/puzzle/PuzzleContext";
import {
    GameStateEx,
    mergeGameStateUpdates,
    mergeGameStateWithUpdates,
    PartialGameStateEx,
} from "../../../../../types/puzzle/GameState";
import { clearSelectionActionType, enterDigitActionType } from "../../../../../types/puzzle/GameStateAction";
import { PuzzleTypeManager } from "../../../../../types/puzzle/PuzzleTypeManager";
import { Constraint } from "../../../../../types/puzzle/Constraint";
import { QuadInputState } from "./QuadInputState";
import { QuadleConstraint, QuadleDigitType } from "../Quadle";
import { QuadConstraint } from "../Quad";
import { PuzzleInputMode } from "../../../../../types/puzzle/PuzzleInputMode";
import {
    setQuadPositionAction,
    setQuadPositionActionType,
    setQuadPositionActionTypeKey,
} from "./setQuadPositionAction";
import { QuadInputModeButton } from "./QuadInputModeButton";
import { AnyQuadInputPTM } from "./QuadInputPTM";
import { GestureOnContinueProps, GestureOnStartProps } from "../../../../../utils/gestures";
import { CellGestureExtraData } from "../../../../../types/puzzle/CellGestureExtraData";
import { addGameStateExToPuzzleTypeManager } from "../../../../../types/puzzle/PuzzleTypeManagerPlugin";
import { QuadInputGameState } from "./QuadInputGameState";

// TODO: support CellType operations!

export interface QuadInputTypeManagerOptions<T extends AnyQuadInputPTM> {
    parent: PuzzleTypeManager<T>;
    isQuadle?: boolean;
    allowRepeat: boolean;
    allowOverflow: boolean;
    getReadyQuadConstraint?: (
        context: PuzzleContext<T>,
        position: Position,
        digits: T["cell"][],
        isRecent: boolean,
    ) => Constraint<T, any>;
    isQuadAllowedFn?: (context: PuzzleContext<T>, position?: Position) => boolean;
    onQuadFinish?: (
        defaultResult: PartialGameStateEx<T>,
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<T>,
        cellData: T["cell"],
    ) => PartialGameStateEx<T>;
    radius?: number;
}

export const QuadInputTypeManager = <T extends AnyQuadInputPTM>(
    options: QuadInputTypeManagerOptions<T>,
): PuzzleTypeManager<T> => {
    const {
        parent,
        isQuadle = false,
        allowRepeat,
        allowOverflow,
        isQuadAllowedFn = () => true,
        onQuadFinish,
        radius = 0.3,
        // Note: default is not supported for quadle!
        getReadyQuadConstraint = (_context, position, digits, isRecent) =>
            QuadConstraint(position, digits, [], isRecent, radius),
    } = options;

    const onCornerClick = (
        { gesture: { id } }: GestureOnStartProps<PuzzleContext<T>> | GestureOnContinueProps<PuzzleContext<T>>,
        context: PuzzleContext<T>,
        { exact: { corner } }: CellGestureExtraData,
    ) => context.onStateChange(setQuadPositionAction(corner, options, `gesture-${id}`));

    return {
        ...(addGameStateExToPuzzleTypeManager<T, QuadInputGameState<T["cell"]>>(parent, {
            initialGameStateExtension: {
                currentQuad: undefined,
                allQuads: [],
            },
        }) as unknown as PuzzleTypeManager<T>),

        items: (context): Constraint<T, any>[] => {
            const {
                inputMode,
                stateExtension: { allQuads, currentQuad },
                multiPlayer: { isEnabled },
            } = context;

            return (
                [
                    ...((parent.items instanceof Array && parent.items) || []),
                    ...((typeof parent.items === "function" && parent.items(context)) || []),
                    ...allQuads.map(({ position, digits }, index) => {
                        const isRecent = isEnabled && index === allQuads.length - 1 && !currentQuad;

                        return getReadyQuadConstraint(context, position, digits, isRecent);
                    }),
                    currentQuad &&
                        (isQuadle
                            ? QuadleConstraint(
                                  currentQuad.position,
                                  currentQuad.digits.map((digit) => ({ digit, type: QuadleDigitType.unknown })),
                                  isEnabled || inputMode === PuzzleInputMode.quads,
                              )
                            : QuadConstraint(
                                  currentQuad.position,
                                  currentQuad.digits,
                                  [],
                                  isEnabled || inputMode === PuzzleInputMode.quads,
                                  radius,
                              )),
                ] as (Constraint<T, any> | undefined)[]
            )
                .filter((item) => item)
                .map((item) => item!);
        },

        handleDigitGlobally(isGlobal, clientId, context, cellData, defaultResult): PartialGameStateEx<T> {
            defaultResult =
                parent.handleDigitGlobally?.(isGlobal, clientId, context, cellData, defaultResult) || defaultResult;

            if (!isGlobal) {
                return defaultResult;
            }

            const {
                puzzle: { params = {} },
                inputMode,
                multiPlayer: { isEnabled },
                currentPlayer = "",
                stateExtension: { currentQuad, allQuads },
            } = context;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
            if (
                !isMyTurn ||
                !currentQuad ||
                inputMode !== PuzzleInputMode.quads ||
                !isQuadAllowedFn(context, currentQuad.position)
            ) {
                return defaultResult;
            }

            let newDigits: T["cell"][];

            if (!allowRepeat && currentQuad.digits.includes(cellData)) {
                newDigits = currentQuad.digits.filter((digit) => digit !== cellData);
            } else if (allowOverflow || currentQuad.digits.length < 4) {
                newDigits = [...currentQuad.digits, cellData];
            } else {
                return defaultResult;
            }

            if (newDigits.length < 4 || !onQuadFinish) {
                return mergeGameStateUpdates(defaultResult, {
                    extension: {
                        currentQuad: {
                            ...currentQuad,
                            digits: newDigits,
                        },
                    } as Partial<T["stateEx"]>,
                });
            } else {
                // Got enough digits
                const isSameQuadPosition = ({ position }: QuadInputState<T["cell"]>) =>
                    isSamePosition(position, currentQuad.position);

                defaultResult = mergeGameStateUpdates(defaultResult, {
                    extension: {
                        currentQuad: undefined,
                        allQuads: [
                            ...allQuads.filter((quad) => !isSameQuadPosition(quad)),
                            {
                                ...currentQuad,
                                digits: allowOverflow
                                    ? [
                                          ...new Set([
                                              ...allQuads.filter(isSameQuadPosition).flatMap((quad) => quad.digits),
                                              ...newDigits,
                                          ]),
                                      ]
                                    : newDigits,
                            },
                        ],
                    } as Partial<T["stateEx"]>,
                });

                return onQuadFinish(defaultResult, isGlobal, clientId, context, cellData);
            }
        },

        getSharedState(puzzle, state): any {
            const {
                extension: { currentQuad, allQuads },
            } = state;

            return {
                ...parent.getSharedState?.(puzzle, state),
                currentQuad,
                allQuads,
            };
        },

        setSharedState(context, { currentQuad, allQuads, ...newState }): GameStateEx<T> {
            return mergeGameStateWithUpdates(context.myGameState, parent.setSharedState?.(context, newState) ?? {}, {
                extension: {
                    currentQuad,
                    allQuads,
                } as Partial<T["stateEx"]>,
            });
        },

        extraInputModes: [
            ...(parent.extraInputModes || []),
            {
                mode: PuzzleInputMode.quads,
                mainButtonContent: QuadInputModeButton(options),
                isDigitMode: true,
                isNoSelectionMode: true,
                onCornerClick,
                onCornerEnter: onCornerClick,
            },
        ],

        supportedActionTypes: [...(parent.supportedActionTypes || []), setQuadPositionActionType(options)],

        isGlobalAction(action, context): boolean {
            return (
                parent.isGlobalAction?.(action, context) ||
                action.type.key === setQuadPositionActionTypeKey ||
                (context.inputMode === PuzzleInputMode.quads &&
                    [enterDigitActionType().key, clearSelectionActionType().key].includes(action.type.key))
            );
        },

        handleClearAction(context, clientId): PartialGameStateEx<T> {
            const {
                puzzle: { params },
                stateExtension: { currentQuad },
                inputMode,
                multiPlayer: { isEnabled },
                currentPlayer,
            } = context;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params?.share;

            if (
                !isMyTurn ||
                !currentQuad ||
                inputMode !== PuzzleInputMode.quads ||
                !isQuadAllowedFn(context, currentQuad.position)
            ) {
                return {};
            }

            return {
                extension: {
                    currentQuad: currentQuad.digits.length
                        ? {
                              ...currentQuad,
                              digits: currentQuad.digits.slice(0, currentQuad.digits.length - 1),
                          }
                        : undefined,
                } as Partial<T["stateEx"]>,
            };
        },
    };
};
