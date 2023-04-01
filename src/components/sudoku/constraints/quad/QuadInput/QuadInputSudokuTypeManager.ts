import {isSamePosition, Position} from "../../../../../types/layout/Position";
import {PuzzleContext} from "../../../../../types/sudoku/PuzzleContext";
import {
    GameStateEx,
    mergeGameStateUpdates,
    mergeGameStateWithUpdates,
    PartialGameStateEx,
    ProcessedGameStateEx
} from "../../../../../types/sudoku/GameState";
import {clearSelectionActionType, enterDigitActionType} from "../../../../../types/sudoku/GameStateAction";
import {SudokuTypeManager} from "../../../../../types/sudoku/SudokuTypeManager";
import {Constraint} from "../../../../../types/sudoku/Constraint";
import {QuadInputState} from "./QuadInputState";
import {QuadInputGameState} from "./QuadInputGameState";
import {QuadleConstraint, QuadleDigitType} from "../Quadle";
import {QuadConstraint} from "../Quad";
import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {setQuadPositionAction, setQuadPositionActionType, setQuadPositionActionTypeKey} from "./setQuadPositionAction";
import {QuadInputModeButton} from "./QuadInputModeButton";
import {CellExactPosition} from "../../../../../types/sudoku/CellExactPosition";
import {ControlButtonRegion} from "../../../controls/ControlButtonsManager";

// TODO: support CellType operations!

export interface QuadInputSudokuTypeManagerOptions<CellType, ExType extends QuadInputGameState<CellType>, ProcessedExType = {}> {
    parent: SudokuTypeManager<CellType, ExType, ProcessedExType>,
    isQuadle?: boolean;
    allowRepeat: boolean;
    allowOverflow: boolean;
    getReadyQuadConstraint?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        position: Position,
        digits: CellType[],
        isRecent: boolean
    ) => Constraint<CellType, any, ExType, ProcessedExType>;
    isQuadAllowedFn?: (state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>) => boolean;
    onQuadFinish?: (
        defaultResult: PartialGameStateEx<CellType, ExType>,
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        cellData: CellType
    ) => PartialGameStateEx<CellType, ExType>;
    radius?: number;
}

export const QuadInputSudokuTypeManager = <CellType, ExType extends QuadInputGameState<CellType>, ProcessedExType = {}>(
    options: QuadInputSudokuTypeManagerOptions<CellType, ExType, ProcessedExType>
): SudokuTypeManager<CellType, ExType, ProcessedExType> => {
    const {
        parent,
        isQuadle = false,
        allowRepeat,
        allowOverflow,
        isQuadAllowedFn = () => true,
        onQuadFinish,
        radius = 0.3,
        // Note: default is not supported for quadle!
        getReadyQuadConstraint = (context, position, digits, isRecent) =>
            QuadConstraint(position, digits, [], isRecent, radius),
    } = options;

    const onCornerClick = ({onStateChange}: PuzzleContext<CellType, ExType, ProcessedExType>, {corner}: CellExactPosition) => {
        onStateChange(setQuadPositionAction(corner, options));
    };

    return {
        ...parent,

        initialGameStateExtension: {
            ...parent.initialGameStateExtension!,
            currentQuad: undefined,
            allQuads: [],
        },

        serializeGameState(data): any {
            return {
                ...parent.serializeGameState?.(data),
                currentQuad: data.currentQuad,
                allQuads: data.allQuads,
            };
        },

        unserializeGameState(data): Partial<ExType> {
            return {
                ...parent.unserializeGameState?.(data),
                currentQuad: data.currentQuad,
                allQuads: data.allQuads,
            };
        },

        items: (context): Constraint<CellType, any, ExType, ProcessedExType>[] => {
            const {
                state: {
                    processed: {cellWriteMode},
                    extension: {allQuads, currentQuad},
                },
                multiPlayer: {isEnabled},
            } = context;

            return ([
                ...((parent.items instanceof Array && parent.items) || []),
                ...((typeof parent.items === "function" && parent.items(context)) || []),
                ...allQuads.map(
                    ({position, digits}, index) => {
                        const isRecent = isEnabled && index === allQuads.length - 1 && !currentQuad;

                        return getReadyQuadConstraint(context, position, digits, isRecent);
                    }
                ),
                currentQuad && (
                    isQuadle
                        ? QuadleConstraint(
                            currentQuad.position,
                            currentQuad.digits.map((digit) => ({digit, type: QuadleDigitType.unknown})),
                            isEnabled || cellWriteMode === CellWriteMode.quads
                        )
                        : QuadConstraint(
                            currentQuad.position,
                            currentQuad.digits,
                            [],
                            isEnabled || cellWriteMode === CellWriteMode.quads,
                            radius
                        )
                ),
            ] as (Constraint<CellType, any, ExType, ProcessedExType> | undefined)[])
                .filter(item => item)
                .map(item => item!);
        },

        handleDigitGlobally(
            isGlobal,
            clientId,
            context,
            cellData,
            defaultResult
        ): PartialGameStateEx<CellType, ExType> {
            defaultResult = parent.handleDigitGlobally?.(isGlobal, clientId, context, cellData, defaultResult) || defaultResult;

            if (!isGlobal) {
                return defaultResult;
            }

            const {
                puzzle: {
                    params = {},
                },
                state,
                multiPlayer: {isEnabled},
            } = context;

            const {
                currentPlayer = "",
                processed: {cellWriteMode},
                extension: {
                    currentQuad,
                    allQuads,
                },
            } = state;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
            if (!isMyTurn || !currentQuad || !isQuadAllowedFn(state) || cellWriteMode !== CellWriteMode.quads) {
                return defaultResult;
            }

            let newDigits: CellType[];

            if (!allowRepeat && currentQuad.digits.includes(cellData)) {
                newDigits = currentQuad.digits.filter(digit => digit !== cellData);
            } else if (allowOverflow || currentQuad.digits.length < 4) {
                newDigits = [...currentQuad.digits, cellData];
            } else {
                return defaultResult;
            }

            if (newDigits.length < 4 || !onQuadFinish) {
                return mergeGameStateUpdates(
                    defaultResult,
                    {
                        extension: {
                            currentQuad: {
                                ...currentQuad,
                                digits: newDigits,
                            },
                        } as Partial<ExType>,
                    }
                );
            } else {
                // Got enough digits
                const isSameQuadPosition = ({position}: QuadInputState<CellType>) => isSamePosition(position, currentQuad.position);

                defaultResult = mergeGameStateUpdates(
                    defaultResult,
                    {
                        extension: {
                            currentQuad: undefined,
                            allQuads: [
                                ...allQuads.filter(quad => !isSameQuadPosition(quad)),
                                {
                                    ...currentQuad,
                                    digits: allowOverflow
                                        ? [...new Set([
                                            ...allQuads.filter(isSameQuadPosition).flatMap(quad => quad.digits),
                                            ...newDigits,
                                        ])]
                                        : newDigits,
                                }
                            ],
                        } as Partial<ExType>,
                    }
                );

                return onQuadFinish(defaultResult, isGlobal, clientId, context, cellData);
            }
        },

        getSharedState(puzzle, state): any {
            const {
                extension: {
                    currentQuad,
                    allQuads,
                },
            } = state;

            return {
                ...parent.getSharedState?.(puzzle, state),
                currentQuad,
                allQuads,
            };
        },

        setSharedState(
            puzzle,
            state,
            {currentQuad, allQuads, ...newState}
        ): GameStateEx<CellType, ExType> {
            return mergeGameStateWithUpdates(
                state,
                parent.setSharedState?.(puzzle, state, newState) ?? {},
                {
                    extension: {
                        currentQuad,
                        allQuads,
                    } as Partial<ExType>,
                },
            );
        },

        controlButtons: [
            {
                key: "mode-quads",
                region: ControlButtonRegion.modes,
                Component: QuadInputModeButton(options),
            }
        ],

        extraCellWriteModes: [
            ...(parent.extraCellWriteModes || []),
            {
                mode: CellWriteMode.quads,
                isDigitMode: true,
                isNoSelectionMode: true,
                onCornerClick,
                onCornerEnter: onCornerClick,
            },
        ],

        supportedActionTypes: [
            ...(parent.supportedActionTypes || []),
            setQuadPositionActionType(options),
        ],

        isGlobalAction(
            action,
            context
        ): boolean {
            return parent.isGlobalAction?.(action, context)
                || action.type.key === setQuadPositionActionTypeKey
                || (context.state.processed.cellWriteMode === CellWriteMode.quads && [enterDigitActionType().key, clearSelectionActionType().key].includes(action.type.key));
        },

        handleClearAction(
            {
                puzzle: {params},
                state,
                multiPlayer: {isEnabled},
            },
            clientId
        ): PartialGameStateEx<CellType, ExType> {
            const {currentPlayer, processed: {cellWriteMode}, extension: {currentQuad}} = state;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params?.share;

            if (!isMyTurn || !isQuadAllowedFn(state) || cellWriteMode !== CellWriteMode.quads || !currentQuad) {
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
                } as Partial<ExType>,
            };
        },
    };
};
