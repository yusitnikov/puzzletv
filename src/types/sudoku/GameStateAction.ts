import {
    gameStateApplyCurrentMultiLine,
    gameStateApplyShading,
    gameStateClearSelectedCellsContent,
    gameStateGetCellShading,
    gameStateHandleDigit,
    gameStateIncrementShading,
    gameStateRedo,
    gameStateSetCellMark,
    gameStateUndo,
    PartialGameStateEx,
} from "./GameState";
import {PuzzleContext} from "./PuzzleContext";
import {myClientId} from "../../hooks/useMultiPlayer";
import {Position} from "../layout/Position";
import {DragAction} from "./DragAction";
import {CellMarkType} from "./CellMark";
import {CellColorValue} from "./CellColor";
import {AnyPTM} from "./PuzzleTypeMap";

export type GameStateActionCallback<T extends AnyPTM> = (context: PuzzleContext<T>) => PartialGameStateEx<T>;

export interface GameStateActionType<ParamsType, T extends AnyPTM> {
    key: string;
    callback: (
        params: ParamsType,
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
    callback: (_, clientId, actionId) =>
        (context) => gameStateClearSelectedCellsContent(context, clientId, actionId),
});
export const clearSelectionAction = <T extends AnyPTM>(actionId: string): GameStateAction<undefined, T> => ({
    type: clearSelectionActionType(),
    params: undefined,
    actionId,
});

export const enterDigitActionType = <T extends AnyPTM>(): GameStateActionType<number, T> => ({
    key: "enter-digit",
    callback: (digit, clientId, actionId) =>
        (context) => gameStateHandleDigit(context, digit, clientId, actionId, true),
});
export const enterDigitAction = <T extends AnyPTM>(
    digit: number,
    actionId: string,
): GameStateActionOrCallback<number, T>[] => [
    (context) => gameStateHandleDigit(context, digit, myClientId, actionId, false),
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
    callback: ({regionIndex, isClick = false, isRightButton = false} = {}, clientId, actionId) =>
        (context) => gameStateApplyCurrentMultiLine(context, clientId, regionIndex, isClick, isRightButton, true, actionId),
});
export const applyCurrentMultiLineAction = <T extends AnyPTM>(
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
    (context) => gameStateApplyCurrentMultiLine(context, myClientId, regionIndex, isClick, isRightButton, false, actionId),
];

export interface SetCellMarkActionParams extends Position {
    isCenter: boolean;
    cellMarkType?: CellMarkType;
    color?: CellColorValue;
}
export const setCellMarkActionType = <T extends AnyPTM>(): GameStateActionType<SetCellMarkActionParams, T> => ({
    key: "set-cell-mark",
    callback: ({isCenter, cellMarkType, color, ...position}, clientId, actionId) =>
        (context) => gameStateSetCellMark(context, position, isCenter, clientId, actionId, cellMarkType, color),
});

interface ShadingActionParams extends Position {
    action: DragAction;
}
export const shadingActionType = <T extends AnyPTM>(): GameStateActionType<ShadingActionParams, T> => ({
    key: "apply-shading",
    callback: ({action, ...position}, clientId, actionId) =>
        (context) => gameStateApplyShading(context, position, action, clientId, actionId),
});
export const shadingAction = <T extends AnyPTM>(
    position: Position,
    action: DragAction,
    actionId: string,
): GameStateAction<ShadingActionParams, T> => ({
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
    const action = gameStateIncrementShading(
        gameStateGetCellShading(context.getCell(position.top, position.left)),
        isRightButton ? -1 : 1
    );
    return [
        () => ({dragAction: action}),
        shadingAction(position, action, actionId),
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
