import {
    gameStateApplyCurrentMultiLine,
    gameStateApplyShading,
    gameStateClearSelectedCellsContent,
    gameStateGetCellShading,
    gameStateGetCurrentFieldState,
    gameStateHandleDigit,
    gameStateIncrementShading,
    gameStateRedo, gameStateSetCellMark,
    gameStateUndo,
    PartialGameStateEx,
    ProcessedGameStateEx
} from "./GameState";
import {PuzzleContext} from "./PuzzleContext";
import {myClientId} from "../../hooks/useMultiPlayer";
import {Position} from "../layout/Position";
import {DragAction} from "./DragAction";
import {CellMarkType} from "./CellMark";
import {CellColor} from "./CellColor";

export type GameStateActionCallback<CellType, ExType, ProcessedExType> =
    PartialGameStateEx<CellType, ExType> | ((prevState: ProcessedGameStateEx<CellType, ExType, ProcessedExType>) => PartialGameStateEx<CellType, ExType>);

export interface GameStateActionType<ParamsType, CellType, ExType, ProcessedExType> {
    key: string;
    callback: (
        params: ParamsType,
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        clientId: string
    ) => GameStateActionCallback<CellType, ExType, ProcessedExType>;
}

export interface GameStateAction<ParamsType, CellType, ExType, ProcessedExType> {
    type: GameStateActionType<ParamsType, CellType, ExType, ProcessedExType>;
    params: ParamsType;
}

export type GameStateActionOrCallback<ParamsType, CellType, ExType, ProcessedExType> =
    GameStateAction<ParamsType, CellType, ExType, ProcessedExType> |
    GameStateActionCallback<CellType, ExType, ProcessedExType>;

// region Specific actions
export const undoActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<undefined, CellType, ExType, ProcessedExType> => ({
    key: "undo",
    callback: () => gameStateUndo,
});
export const undoAction = <CellType, ExType, ProcessedExType>()
    : GameStateAction<undefined, CellType, ExType, ProcessedExType> => ({
    type: undoActionType(),
    params: undefined,
});

export const redoActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<undefined, CellType, ExType, ProcessedExType> => ({
    key: "redo",
    callback: () => gameStateRedo,
});
export const redoAction = <CellType, ExType, ProcessedExType>()
    : GameStateAction<undefined, CellType, ExType, ProcessedExType> => ({
    type: redoActionType(),
    params: undefined,
});

export const clearSelectionActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<undefined, CellType, ExType, ProcessedExType> => ({
    key: "clear-selection",
    callback: (_, context, clientId) =>
        state => gameStateClearSelectedCellsContent({...context, state}, clientId),
});
export const clearSelectionAction = <CellType, ExType, ProcessedExType>()
    : GameStateAction<undefined, CellType, ExType, ProcessedExType> => ({
    type: clearSelectionActionType(),
    params: undefined,
});

export const enterDigitActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<number, CellType, ExType, ProcessedExType> => ({
    key: "enter-digit",
    callback: (digit, context, clientId) =>
        state => gameStateHandleDigit({...context, state}, digit, clientId, true),
});
export const enterDigitAction = <CellType, ExType, ProcessedExType>(
    digit: number,
    context: PuzzleContext<CellType, ExType, ProcessedExType>
): GameStateActionOrCallback<number, CellType, ExType, ProcessedExType>[] => [
    state => gameStateHandleDigit({...context, state}, digit, myClientId, false),
    {
        type: enterDigitActionType(),
        params: digit,
    },
];

interface ApplyCurrentMultiLineActionParams {
    isRightButton?: boolean;
}
export const applyCurrentMultiLineActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<ApplyCurrentMultiLineActionParams, CellType, ExType, ProcessedExType> => ({
    key: "apply-current-multiline",
    callback: ({isRightButton = false} = {}, context, clientId) =>
        state => gameStateApplyCurrentMultiLine({...context, state}, clientId, isRightButton, true),
});
export const applyCurrentMultiLineAction = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    isRightButton = false
)
    : GameStateActionOrCallback<ApplyCurrentMultiLineActionParams, CellType, ExType, ProcessedExType>[] => [
    {
        type: applyCurrentMultiLineActionType(),
        params: {isRightButton},
    },
    state => gameStateApplyCurrentMultiLine({...context, state}, myClientId, isRightButton, false),
];

export interface SetCellMarkActionParams extends Position {
    isCenter: boolean;
    cellMarkType?: CellMarkType;
    color?: CellColor;
}
export const setCellMarkActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<SetCellMarkActionParams, CellType, ExType, ProcessedExType> => ({
    key: "set-cell-mark",
    callback: ({isCenter, cellMarkType, color, ...position}, context) =>
        state => gameStateSetCellMark({...context, state}, position, isCenter, cellMarkType, color),
});

interface ShadingActionParams extends Position {
    action: DragAction;
}
export const shadingActionType = <CellType, ExType, ProcessedExType>()
    : GameStateActionType<ShadingActionParams, CellType, ExType, ProcessedExType> => ({
    key: "apply-shading",
    callback: ({action, ...position}, context) =>
        state => gameStateApplyShading({...context, state}, position, action),
});
export const shadingAction = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    position: Position,
    action: DragAction
): GameStateActionOrCallback<ShadingActionParams, CellType, ExType, ProcessedExType> => ({
    type: shadingActionType(),
    params: {...position, action},
});
export const shadingStartAction = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    position: Position,
    isRightButton: boolean
): GameStateActionOrCallback<ShadingActionParams, CellType, ExType, ProcessedExType>[] => {
    const field = gameStateGetCurrentFieldState(context.state);
    const action = gameStateIncrementShading(
        gameStateGetCellShading(field.cells[position.top][position.left]),
        isRightButton ? -1 : 1
    );
    return [
        () => ({dragAction: action}),
        shadingAction(context, position, action),
    ];
}
// endregion

export const coreGameStateActionTypes: GameStateActionType<any, any, any, any>[] = [
    undoActionType(),
    redoActionType(),
    clearSelectionActionType(),
    enterDigitActionType(),
    applyCurrentMultiLineActionType(),
    setCellMarkActionType(),
    shadingActionType(),
];
