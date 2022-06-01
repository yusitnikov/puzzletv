import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {GuessSudokuTypeManager} from "../../guess/types/GuessSudokuTypeManager";
import {
    initialQuadMastersGameState,
    QuadMastersGameState,
    serializeQuadMastersGameState,
    unserializeQuadMastersGameState
} from "./QuadMastersGameState";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {QuadMastersControls} from "../components/QuadMastersControls";
import {GameState, ProcessedGameState} from "../../../types/sudoku/GameState";
import {QuadConstraint, QuadConstraintBySolution} from "../../../components/sudoku/constraints/quad/Quad";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {QuadMastersQuad} from "./QuadMastersQuad";
import {enterDigitActionType, GameStateAction, GameStateActionType} from "../../../types/sudoku/GameStateAction";
import {QuadsHintConstraint} from "../components/QuadsHint";
import {indexes} from "../../../utils/indexes";
import {getNextPlayerId} from "../../../hooks/useMultiPlayer";
import {
    QuadleConstraint,
    QuadleConstraintBySolution,
    QuadleDigitType
} from "../../../components/sudoku/constraints/quadle/Quadle";

export const setQuadPositionActionType: GameStateActionType<Position | undefined, number, QuadMastersGameState, QuadMastersGameState> = ({
    key: "set-quad-position",
    callback: (position, {puzzle: {params = {}}, state: {currentPlayer}, multiPlayer: {isEnabled}}, clientId) =>
        ({isQuadTurn}) => (!isEnabled || currentPlayer === clientId || !!params.share) && isQuadTurn ? {currentQuad: position && {position, digits: []}} : {},
});
export const setQuadPositionAction = (position: Position | undefined)
    : GameStateAction<Position | undefined, number, QuadMastersGameState, QuadMastersGameState> => ({
    type: setQuadPositionActionType,
    params: position,
});

const onCornerClick = ({puzzle: {fieldSize: {rowsCount, columnsCount}}, onStateChange}: PuzzleContext<number, QuadMastersGameState, QuadMastersGameState>, position: Position) => {
    if (position.top > 0 && position.top < rowsCount && position.left > 0 && position.left < columnsCount) {
        onStateChange(setQuadPositionAction(position));
    }
};

export const QuadMastersSudokuTypeManager = (solution: GivenDigitsMap<number>, isQuadle: boolean): SudokuTypeManager<number, QuadMastersGameState, QuadMastersGameState> => {
    const parent = GuessSudokuTypeManager<QuadMastersGameState, QuadMastersGameState>(
        solution,
        serializeQuadMastersGameState,
        unserializeQuadMastersGameState
    );

    // TODO: call parent in every method
    return ({
        ...parent,

        initialGameStateExtension: initialQuadMastersGameState,

        extraCellWriteModes: [
            {
                mode: CellWriteMode.custom,
                isDigitMode: true,
                isNoSelectionMode: true,
                onCornerClick,
                onCornerEnter: onCornerClick,
            },
        ],

        initialCellWriteMode: CellWriteMode.custom,

        mainControlsComponent: QuadMastersControls(isQuadle),

        items: (context) => {
            const {state: {allQuads, currentQuad}, multiPlayer: {isEnabled}} = context;

            return [
                ...((parent.items instanceof Array && parent.items) || []),
                ...((typeof parent.items === "function" && parent.items(context)) || []),
                QuadsHintConstraint,
                ...allQuads.map(
                    ({position, digits}, index) => {
                        const isRecent = isEnabled && index === allQuads.length - 1 && !currentQuad;

                        return isQuadle
                            ? QuadleConstraintBySolution(context, position, digits, solution, isRecent)
                            : QuadConstraintBySolution(context, position, digits, solution, isRecent);
                    }
                ),
                currentQuad && isQuadle && QuadleConstraint(
                    currentQuad.position,
                    currentQuad.digits.map((digit) => ({digit, type: QuadleDigitType.unknown})),
                    isEnabled
                ),
                currentQuad && !isQuadle && QuadConstraint(
                    currentQuad.position,
                    currentQuad.digits,
                    [],
                    isEnabled
                ),
            ].filter(item => item).map(item => item!);
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
                isQuadTurn,
                currentQuad,
                allQuads,
                currentPlayer = "",
            } = state;

            const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
            if (!isMyTurn) {
                return defaultResult;
            }

            const newState = {...state, ...defaultResult};

            switch (cellWriteMode) {
                case CellWriteMode.custom:
                    if (isQuadTurn && currentQuad) {
                        const newDigits = isQuadle || !currentQuad.digits.includes(cellData)
                            ? [...currentQuad.digits, cellData]
                            : currentQuad.digits.filter(digit => digit !== cellData);

                        if (newDigits.length < 4) {
                            return {
                                currentQuad: {
                                    ...currentQuad,
                                    digits: newDigits,
                                },
                            };
                        } else {
                            // Got enough digits - merging the new quad to the existing quad and finalizing the quad entering step.
                            const isSameQuadPosition = ({position}: QuadMastersQuad) => isSamePosition(position, currentQuad.position);

                            return {
                                isQuadTurn: false,
                                currentQuad: undefined,
                                allQuads: [
                                    ...allQuads.filter(quad => !isSameQuadPosition(quad)),
                                    {
                                        ...currentQuad,
                                        digits: isQuadle
                                            ? newDigits
                                            : [...new Set([
                                                ...allQuads.filter(isSameQuadPosition).flatMap(quad => quad.digits),
                                                ...newDigits,
                                            ])],
                                    }
                                ],
                            };
                        }
                    }
                    break;
                case CellWriteMode.main:
                    if (selectedCells.size) {
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
                    break;
            }

            return defaultResult;
        },

        getSharedState(puzzle, state): any {
            const {
                isQuadTurn,
                currentQuad,
                allQuads,
            } = state;

            return {
                ...parent.getSharedState?.(puzzle, state),
                isQuadTurn,
                currentQuad,
                allQuads,
            };
        },

        setSharedState(
            puzzle,
            state,
            newState
        ): GameState<number> & QuadMastersGameState {
            const {
                isQuadTurn,
                currentQuad,
                allQuads,
            } = newState;

            return {
                ...state,
                ...parent.setSharedState?.(puzzle, state, newState),
                isQuadTurn,
                currentQuad,
                allQuads,
            };
        },

        supportedActionTypes: [setQuadPositionActionType],

        isGlobalAction(
            {type: {key}},
            {state: {cellWriteMode}}
        ): boolean {
            return key === setQuadPositionActionType.key
                || (key === enterDigitActionType().key && [CellWriteMode.main, CellWriteMode.custom].includes(cellWriteMode));
        },

        applyStateDiffEffect(
            state,
            prevState,
            context
        ) {
            parent.applyStateDiffEffect?.(state, prevState, context);

            const {persistentCellWriteMode, isQuadTurn, isMyTurn} = state;
            const {puzzle: {params = {}}, onStateChange, multiPlayer: {isEnabled}} = context;

            if (isMyTurn && prevState?.isQuadTurn && !isQuadTurn && persistentCellWriteMode === CellWriteMode.custom) {
                onStateChange({persistentCellWriteMode: CellWriteMode.main});
            }

            if (isEnabled && !params.share) {
                if (!prevState?.isMyTurn && isMyTurn && isQuadTurn) {
                    onStateChange({persistentCellWriteMode: CellWriteMode.custom});
                }
            } else {
                if (!prevState?.isQuadTurn && isQuadTurn) {
                    onStateChange({persistentCellWriteMode: CellWriteMode.custom});
                }
            }
        },

        handleClearAction({state: {cellWriteMode, isMyTurn, isQuadTurn, currentQuad}}): Partial<ProcessedGameState<number> & QuadMastersGameState> {
            if (cellWriteMode === CellWriteMode.custom && isMyTurn && isQuadTurn && currentQuad?.digits?.length) {
                return {
                    currentQuad: {
                        ...currentQuad,
                        digits: currentQuad.digits.slice(0, currentQuad.digits.length - 1),
                    },
                };
            }

            return {};
        },
    });
};
