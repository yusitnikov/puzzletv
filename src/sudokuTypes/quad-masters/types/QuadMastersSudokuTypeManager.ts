import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {GuessSudokuTypeManager} from "../../guess/types/GuessSudokuTypeManager";
import {QuadMastersGameState} from "./QuadMastersGameState";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {GameState, ProcessedGameState} from "../../../types/sudoku/GameState";
import {QuadConstraintBySolution} from "../../../components/sudoku/constraints/quad/Quad";
import {enterDigitActionType} from "../../../types/sudoku/GameStateAction";
import {QuadsHintConstraint} from "../components/QuadsHint";
import {indexes} from "../../../utils/indexes";
import {getNextPlayerId} from "../../../hooks/useMultiPlayer";
import {QuadleConstraintBySolution} from "../../../components/sudoku/constraints/quad/Quadle";
import {QuadInputSudokuTypeManager} from "../../../components/sudoku/constraints/quad/QuadInput/QuadInputSudokuTypeManager";

export const QuadMastersSudokuTypeManager = (solution: GivenDigitsMap<number>, isQuadle: boolean): SudokuTypeManager<number, QuadMastersGameState, QuadMastersGameState> => {
    const parent = QuadInputSudokuTypeManager<number, QuadMastersGameState, QuadMastersGameState>({
        parent: GuessSudokuTypeManager<QuadMastersGameState, QuadMastersGameState>(solution),
        isQuadle,
        allowRepeat: isQuadle,
        allowOverflow: !isQuadle,
        getReadyQuadConstraint: (context, position, digits, isRecent) => isQuadle
            ? QuadleConstraintBySolution(context, position, digits, solution, isRecent)
            : QuadConstraintBySolution(context, position, digits, solution, isRecent),
        isQuadAllowedFn: ({isQuadTurn, cellWriteMode}) => isQuadTurn && cellWriteMode === CellWriteMode.quads,
        onQuadFinish: (defaultResult) => ({
            ...defaultResult,
            isQuadTurn: false,
        })
    });

    // TODO: call parent in every method
    return ({
        ...parent,

        initialGameStateExtension: {
            ...parent.initialGameStateExtension!,
            isQuadTurn: true,
        },

        serializeGameState(data): any {
            return {
                ...parent.serializeGameState?.(data),
                isQuadTurn: data.isQuadTurn,
            };
        },

        unserializeGameState(data): Partial<QuadMastersGameState> {
            return {
                ...parent.unserializeGameState?.(data),
                isQuadTurn: data.isQuadTurn,
            };
        },

        items: (context) => {
            return [
                QuadsHintConstraint,
                ...((parent.items instanceof Array && parent.items) || []),
                ...((typeof parent.items === "function" && parent.items(context)) || []),
            ];
        },

        handleDigitGlobally(
            isGlobal,
            clientId,
            context,
            cellData,
            defaultResult
        ): Partial<ProcessedGameState<number> & QuadMastersGameState> {
            defaultResult = parent.handleDigitGlobally?.(isGlobal, clientId, context, cellData, defaultResult) || defaultResult;

            if (!isGlobal) {
                return defaultResult;
            }

            const {
                puzzle: {
                    params = {},
                    fieldSize: {rowsCount, columnsCount},
                },
                state,
                multiPlayer: {isEnabled, allPlayerIds},
            } = context;

            const {
                cellWriteMode,
                selectedCells,
                currentPlayer = "",
            } = state;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
            if (!isMyTurn) {
                return defaultResult;
            }

            const newState = {...state, ...defaultResult};

            if (cellWriteMode === CellWriteMode.main && selectedCells.size) {
                if (selectedCells.items.some(({top, left}) => !newState.initialDigits?.[top]?.[left])) {
                    return {
                        ...defaultResult,
                        isQuadTurn: true,
                        currentQuad: undefined,
                        currentPlayer: getNextPlayerId(currentPlayer, allPlayerIds),
                    };
                } else if (indexes(rowsCount).every(top => indexes(columnsCount).every(
                    left => newState.initialDigits?.[top]?.[left] !== undefined
                ))) {
                    return {
                        ...defaultResult,
                        isQuadTurn: false,
                        currentQuad: undefined,
                    }
                }
            }

            return defaultResult;
        },

        getSharedState(puzzle, state): any {
            const {isQuadTurn} = state;

            return {
                ...parent.getSharedState?.(puzzle, state),
                isQuadTurn,
            };
        },

        setSharedState(
            puzzle,
            state,
            newState
        ): GameState<number> & QuadMastersGameState {
            const {isQuadTurn} = newState;

            return {
                ...state,
                ...parent.setSharedState?.(puzzle, state, newState),
                isQuadTurn,
            };
        },

        initialCellWriteMode: CellWriteMode.quads,

        isGlobalAction(
            action,
            context
        ): boolean {
            return parent.isGlobalAction?.(action, context)
                || (action.type.key === enterDigitActionType().key && context.state.cellWriteMode === CellWriteMode.main);
        },

        applyStateDiffEffect(
            state,
            prevState,
            context
        ) {
            parent.applyStateDiffEffect?.(state, prevState, context);

            const {persistentCellWriteMode, isQuadTurn, isMyTurn} = state;
            const {puzzle: {params = {}}, onStateChange, multiPlayer: {isEnabled}} = context;

            if (isMyTurn && prevState?.isQuadTurn && !isQuadTurn && persistentCellWriteMode === CellWriteMode.quads) {
                onStateChange({persistentCellWriteMode: CellWriteMode.main});
            }

            if (isEnabled && !params.share) {
                if (!prevState?.isMyTurn && isMyTurn && isQuadTurn) {
                    onStateChange({persistentCellWriteMode: CellWriteMode.quads});
                }
            } else {
                if (!prevState?.isQuadTurn && isQuadTurn) {
                    onStateChange({persistentCellWriteMode: CellWriteMode.quads});
                }
            }
        },
    });
};
