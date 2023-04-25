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
import {CellColorValue} from "./CellColor";
import {AnyPTM} from "./PuzzleTypeMap";

export type GameStateActionCallback<T extends AnyPTM> = (prevState: ProcessedGameStateEx<T>) => PartialGameStateEx<T>;

export interface GameStateActionType<ParamsType, T extends AnyPTM> {
    key: string;
    callback: (
        params: ParamsType,
        context: PuzzleContext<T>,
        clientId: string,
        actionId: string,
    ) => PartialGameStateEx<T> | GameStateActionCallback<T>;
}

export interface GameStateAction<ParamsType, T extends AnyPTM> {
    type: GameStateActionType<ParamsType, T>;
    params: ParamsType;
    actionId: string;
}

export type GameStateActionOrCallback<ParamsType, T extends AnyPTM> =
    GameStateAction<ParamsType, T> | PartialGameStateEx<T> | GameStateActionCallback<T>;

let autoIncrementActionId = 0;
export const getNextActionId = (prefix = "single") => `${prefix}-${++autoIncrementActionId}`;

// region Specific actions
export const undoActionType = <T extends AnyPTM>(): GameStateActionType<undefined, T> => ({
    key: "undo",
    callback: () => gameStateUndo,
});
export const undoAction = <T extends AnyPTM>(actionId: string): GameStateAction<undefined, T> => ({
    type: undoActionType(),
    params: undefined,
    actionId,
});

export const redoActionType = <T extends AnyPTM>(): GameStateActionType<undefined, T> => ({
    key: "redo",
    callback: () => gameStateRedo,
});
export const redoAction = <T extends AnyPTM>(actionId: string): GameStateAction<undefined, T> => ({
    type: redoActionType(),
    params: undefined,
    actionId,
});

export const clearSelectionActionType = <T extends AnyPTM>(): GameStateActionType<undefined, T> => ({
    key: "clear-selection",
    callback: (_, context, clientId, actionId) =>
        state => gameStateClearSelectedCellsContent({...context, state}, clientId, actionId),
});
export const clearSelectionAction = <T extends AnyPTM>(actionId: string): GameStateAction<undefined, T> => ({
    type: clearSelectionActionType(),
    params: undefined,
    actionId,
});

export const enterDigitActionType = <T extends AnyPTM>(): GameStateActionType<number, T> => ({
    key: "enter-digit",
    callback: (digit, context, clientId, actionId) =>
        state => gameStateHandleDigit({...context, state}, digit, clientId, actionId, true),
});
export const enterDigitAction = <T extends AnyPTM>(
    digit: number,
    context: PuzzleContext<T>,
    actionId: string,
): GameStateActionOrCallback<number, T>[] => [
    state => gameStateHandleDigit({...context, state}, digit, myClientId, actionId, false),
    {
        type: enterDigitActionType(),
        params: digit,
        actionId,
    },
];

interface ApplyCurrentMultiLineActionParams {
    regionIndex?: number;
    isClick?: boolean;
    isRightButton?: boolean;
}
export const applyCurrentMultiLineActionType = <T extends AnyPTM>()
    : GameStateActionType<ApplyCurrentMultiLineActionParams, T> => ({
    key: "apply-current-multiline",
    callback: ({regionIndex, isClick = false, isRightButton = false} = {}, context, clientId, actionId) =>
        state => gameStateApplyCurrentMultiLine({...context, state}, clientId, regionIndex, isClick, isRightButton, true, actionId),
});
export const applyCurrentMultiLineAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    actionId: string,
    regionIndex?: number,
    isClick = false,
    isRightButton = false
): GameStateActionOrCallback<ApplyCurrentMultiLineActionParams, T>[] => [
    {
        type: applyCurrentMultiLineActionType(),
        params: {regionIndex, isClick, isRightButton},
        actionId,
    },
    state => gameStateApplyCurrentMultiLine({...context, state}, myClientId, regionIndex, isClick, isRightButton, false, actionId),
];

export interface SetCellMarkActionParams extends Position {
    isCenter: boolean;
    cellMarkType?: CellMarkType;
    color?: CellColorValue;
}
export const setCellMarkActionType = <T extends AnyPTM>(): GameStateActionType<SetCellMarkActionParams, T> => ({
    key: "set-cell-mark",
    callback: ({isCenter, cellMarkType, color, ...position}, context, clientId, actionId) =>
        state => gameStateSetCellMark({...context, state}, position, isCenter, clientId, actionId, cellMarkType, color),
});

interface ShadingActionParams extends Position {
    action: DragAction;
}
export const shadingActionType = <T extends AnyPTM>(): GameStateActionType<ShadingActionParams, T> => ({
    key: "apply-shading",
    callback: ({action, ...position}, context, clientId, actionId) =>
        state => gameStateApplyShading({...context, state}, position, action, clientId, actionId),
});
export const shadingAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    action: DragAction,
    actionId: string,
): GameStateActionOrCallback<ShadingActionParams, T> => ({
    type: shadingActionType(),
    params: {...position, action},
    actionId,
});
export const shadingStartAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    isRightButton: boolean,
    actionId: string,
): GameStateActionOrCallback<ShadingActionParams, T>[] => {
    const field = gameStateGetCurrentFieldState(context.state);
    const action = gameStateIncrementShading(
        gameStateGetCellShading(field.cells[position.top][position.left]),
        isRightButton ? -1 : 1
    );
    return [
        () => ({dragAction: action}),
        shadingAction(context, position, action, actionId),
    ];
}
// endregion

export const coreGameStateActionTypes = <T extends AnyPTM>(): GameStateActionType<any, T>[] => [
    undoActionType(),
    redoActionType(),
    clearSelectionActionType(),
    enterDigitActionType(),
    applyCurrentMultiLineActionType(),
    setCellMarkActionType(),
    shadingActionType(),
];
