import {isSamePosition, Position} from "../../../../../types/layout/Position";
import {PuzzleContext} from "../../../../../types/sudoku/PuzzleContext";
import {GameState, ProcessedGameState} from "../../../../../types/sudoku/GameState";
import {clearSelectionActionType, enterDigitActionType} from "../../../../../types/sudoku/GameStateAction";
import {SudokuTypeManager} from "../../../../../types/sudoku/SudokuTypeManager";
import {Constraint} from "../../../../../types/sudoku/Constraint";
import {QuadInputState} from "./QuadInputState";
import {QuadInputGameState} from "./QuadInputGameState";
import {QuadleConstraint, QuadleDigitType} from "../Quadle";
import {QuadConstraint} from "../Quad";
import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {setQuadPositionAction, setQuadPositionActionType, setQuadPositionActionTypeKey} from "./setQuadPositionAction";
import {QuadInputControls} from "./QuadInputControls";
import {CellExactPosition} from "../../../../../types/sudoku/CellExactPosition";

// TODO: support CellType operations!

export interface QuadInputSudokuTypeManagerOptions<CellType, GameStateExtensionType extends QuadInputGameState<CellType>, ProcessedGameStateExtensionType extends QuadInputGameState<CellType>> {
    parent: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    isQuadle?: boolean;
    allowRepeat: boolean;
    allowOverflow: boolean;
    getReadyQuadConstraint?: (
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        position: Position,
        digits: CellType[],
        isRecent: boolean
    ) => Constraint<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>;
    isQuadAllowedFn?: (state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) => boolean;
    onQuadFinish?: (
        defaultResult: Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>,
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        cellData: CellType
    ) => Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;
    radius?: number;
}

export const QuadInputSudokuTypeManager = <CellType, GameStateExtensionType extends QuadInputGameState<CellType>, ProcessedGameStateExtensionType extends QuadInputGameState<CellType>>(
    options: QuadInputSudokuTypeManagerOptions<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => {
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

    const onCornerClick = ({onStateChange}: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>, {corner}: CellExactPosition) => {
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

        unserializeGameState(data): Partial<GameStateExtensionType> {
            return {
                ...parent.unserializeGameState?.(data),
                currentQuad: data.currentQuad,
                allQuads: data.allQuads,
            };
        },

        items: (context) => {
            const {state: {cellWriteMode, allQuads, currentQuad}, multiPlayer: {isEnabled}} = context;

            return [
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
            ].filter(item => item).map(item => item!);
        },

        handleDigitGlobally(
            isGlobal,
            clientId,
            context,
            cellData,
            defaultResult
        ): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> {
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
                cellWriteMode,
                currentQuad,
                allQuads,
                currentPlayer = "",
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
                return {
                    ...defaultResult,
                    currentQuad: {
                        ...currentQuad,
                        digits: newDigits,
                    },
                };
            } else {
                // Got enough digits
                const isSameQuadPosition = ({position}: QuadInputState<CellType>) => isSamePosition(position, currentQuad.position);

                defaultResult = {
                    ...defaultResult,
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
                };

                return onQuadFinish(defaultResult, isGlobal, clientId, context, cellData);
            }
        },

        getSharedState(puzzle, state): any {
            const {
                currentQuad,
                allQuads,
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
            newState
        ): GameState<CellType> & GameStateExtensionType {
            const {
                currentQuad,
                allQuads,
            } = newState;

            return {
                ...state,
                ...parent.setSharedState?.(puzzle, state, newState),
                currentQuad,
                allQuads,
            };
        },

        mainControlsComponent: QuadInputControls(options),

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
                || (context.state.cellWriteMode === CellWriteMode.quads && [enterDigitActionType().key, clearSelectionActionType().key].includes(action.type.key));
        },

        handleClearAction(
            {
                puzzle: {params},
                state,
                multiPlayer: {isEnabled},
            },
            clientId
        ): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> {
            const {cellWriteMode, currentQuad, currentPlayer} = state;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params?.share;

            if (!isMyTurn || !isQuadAllowedFn(state) || cellWriteMode !== CellWriteMode.quads || !currentQuad) {
                return {};
            }

            return {
                currentQuad: currentQuad.digits.length
                    ? {
                        ...currentQuad,
                        digits: currentQuad.digits.slice(0, currentQuad.digits.length - 1),
                    }
                    : undefined,
            } as Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;
        },
    };
};
