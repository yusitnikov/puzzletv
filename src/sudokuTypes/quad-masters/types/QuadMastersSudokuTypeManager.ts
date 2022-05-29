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
import {Set} from "../../../types/struct/Set";
import {QuadMastersControls} from "../components/QuadMastersControls";
import {GameState, ProcessedGameState} from "../../../types/sudoku/GameState";
import {QuadConstraint, QuadConstraintBySolution} from "../../../components/sudoku/constraints/quad/Quad";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {QuadMastersQuad, serializeQuad, unserializeQuad} from "./QuadMastersQuad";
import {enterDigitActionType, GameStateAction, GameStateActionType} from "../../../types/sudoku/GameStateAction";
import {QuadsHintConstraint} from "../components/QuadsHint";

export const setQuadPositionActionType: GameStateActionType<Position, number, QuadMastersGameState, QuadMastersGameState> = ({
    key: "set-quad-position",
    callback: (position, {state: {currentPlayer}, multiPlayer: {isEnabled}}, clientId) =>
        ({isQuadTurn}) => (!isEnabled || currentPlayer === clientId) && isQuadTurn ? {currentQuad: {position, digits: new Set()}} : {},
});
export const setQuadPositionAction = (position: Position)
    : GameStateAction<Position, number, QuadMastersGameState, QuadMastersGameState> => ({
    type: setQuadPositionActionType,
    params: position,
});

const onCornerClick = ({onStateChange}: PuzzleContext<number, QuadMastersGameState, QuadMastersGameState>, position: Position) =>
    onStateChange(setQuadPositionAction(position));

export const QuadMastersSudokuTypeManager = (solution: GivenDigitsMap<number>): SudokuTypeManager<number, QuadMastersGameState, QuadMastersGameState> => {
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

        mainControlsComponent: QuadMastersControls,

        items: (context) => {
            const {state: {allQuads, currentQuad}} = context;

            return [
                QuadsHintConstraint,
                ...allQuads.map(({position, digits}) => QuadConstraintBySolution(context, position, digits.items, solution)),
                currentQuad && QuadConstraint(currentQuad.position, currentQuad.digits.items),
            ].filter(item => item).map(item => item!);
        },

        handleDigitGlobally(
            isGlobal,
            clientId,
            {state, multiPlayer: {isEnabled, allPlayerIds}},
            cellData,
            defaultResult
        ): Partial<ProcessedGameState<number> & QuadMastersGameState> {
            if (!isGlobal) {
                return defaultResult;
            }

            const {
                cellWriteMode,
                selectedCells,
                isQuadTurn,
                currentQuad,
                allQuads,
                currentPlayer = "",
            } = state;

            const isMyTurn = !isEnabled || currentPlayer === clientId;
            if (!isMyTurn) {
                return defaultResult;
            }

            const newState = {...state, ...defaultResult};

            switch (cellWriteMode) {
                case CellWriteMode.custom:
                    if (isQuadTurn && currentQuad) {
                        const newDigits = currentQuad.digits.toggle(cellData);

                        if (newDigits.size < 4) {
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
                                        digits: Set.merge(
                                            ...allQuads.filter(isSameQuadPosition).map(quad => quad.digits),
                                            newDigits
                                        ),
                                    }
                                ],
                            };
                        }
                    }
                    break;
                case CellWriteMode.main:
                    if (selectedCells.size && selectedCells.items.some(({top, left}) => !newState.initialDigits?.[top]?.[left])) {
                        return {
                            ...defaultResult,
                            isQuadTurn: true,
                            currentQuad: undefined,
                            currentPlayer: allPlayerIds.find(value => value > currentPlayer) || allPlayerIds[0],
                        };
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
                currentQuad: currentQuad && serializeQuad(currentQuad),
                allQuads: allQuads.map(serializeQuad),
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
                currentQuad: currentQuad && unserializeQuad(currentQuad),
                allQuads: (allQuads as any[]).map(unserializeQuad),
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
            const {onStateChange, multiPlayer: {isEnabled}} = context;

            if (isMyTurn && prevState?.isQuadTurn && !isQuadTurn && persistentCellWriteMode === CellWriteMode.custom) {
                onStateChange({persistentCellWriteMode: CellWriteMode.main});
            }

            if (isEnabled) {
                if (!prevState?.isMyTurn && isMyTurn && isQuadTurn) {
                    onStateChange({persistentCellWriteMode: CellWriteMode.custom});
                }
            } else {
                if (!prevState?.isQuadTurn && isQuadTurn) {
                    onStateChange({persistentCellWriteMode: CellWriteMode.custom});
                }
            }
        },
    });
};
