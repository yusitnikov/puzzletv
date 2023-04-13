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

export type GameStateActionCallback<T extends AnyPTM> =
    PartialGameStateEx<T> | ((prevState: ProcessedGameStateEx<T>) => PartialGameStateEx<T>);

export interface GameStateActionType<ParamsType, T extends AnyPTM> {
    key: string;
    callback: (
        params: ParamsType,
        context: PuzzleContext<T>,
        clientId: string
    ) => GameStateActionCallback<T>;
}

export interface GameStateAction<ParamsType, T extends AnyPTM> {
    type: GameStateActionType<ParamsType, T>;
    params: ParamsType;
}

export type GameStateActionOrCallback<ParamsType, T extends AnyPTM> =
    GameStateAction<ParamsType, T> | GameStateActionCallback<T>;

// region Specific actions
export const undoActionType = <T extends AnyPTM>(): GameStateActionType<undefined, T> => ({
    key: "undo",
    callback: () => gameStateUndo,
});
export const undoAction = <T extends AnyPTM>(): GameStateAction<undefined, T> => ({
    type: undoActionType(),
    params: undefined,
});

export const redoActionType = <T extends AnyPTM>(): GameStateActionType<undefined, T> => ({
    key: "redo",
    callback: () => gameStateRedo,
});
export const redoAction = <T extends AnyPTM>(): GameStateAction<undefined, T> => ({
    type: redoActionType(),
    params: undefined,
});

export const clearSelectionActionType = <T extends AnyPTM>(): GameStateActionType<undefined, T> => ({
    key: "clear-selection",
    callback: (_, context, clientId) =>
        state => gameStateClearSelectedCellsContent({...context, state}, clientId),
});
export const clearSelectionAction = <T extends AnyPTM>(): GameStateAction<undefined, T> => ({
    type: clearSelectionActionType(),
    params: undefined,
});

export const enterDigitActionType = <T extends AnyPTM>(): GameStateActionType<number, T> => ({
    key: "enter-digit",
    callback: (digit, context, clientId) =>
        state => gameStateHandleDigit({...context, state}, digit, clientId, true),
});
export const enterDigitAction = <T extends AnyPTM>(
    digit: number,
    context: PuzzleContext<T>
): GameStateActionOrCallback<number, T>[] => [
    state => gameStateHandleDigit({...context, state}, digit, myClientId, false),
    {
        type: enterDigitActionType(),
        params: digit,
    },
];

interface ApplyCurrentMultiLineActionParams {
    isClick?: boolean;
    isRightButton?: boolean;
}
export const applyCurrentMultiLineActionType = <T extends AnyPTM>()
    : GameStateActionType<ApplyCurrentMultiLineActionParams, T> => ({
    key: "apply-current-multiline",
    callback: ({isClick = false, isRightButton = false} = {}, context, clientId) =>
        state => gameStateApplyCurrentMultiLine({...context, state}, clientId, isClick, isRightButton, true),
});
export const applyCurrentMultiLineAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    isClick = false,
    isRightButton = false
): GameStateActionOrCallback<ApplyCurrentMultiLineActionParams, T>[] => [
    {
        type: applyCurrentMultiLineActionType(),
        params: {isClick, isRightButton},
    },
    state => gameStateApplyCurrentMultiLine({...context, state}, myClientId, isClick, isRightButton, false),
];

export interface SetCellMarkActionParams extends Position {
    isCenter: boolean;
    cellMarkType?: CellMarkType;
    color?: CellColorValue;
}
export const setCellMarkActionType = <T extends AnyPTM>(): GameStateActionType<SetCellMarkActionParams, T> => ({
    key: "set-cell-mark",
    callback: ({isCenter, cellMarkType, color, ...position}, context) =>
        state => gameStateSetCellMark({...context, state}, position, isCenter, cellMarkType, color),
});

interface ShadingActionParams extends Position {
    action: DragAction;
}
export const shadingActionType = <T extends AnyPTM>(): GameStateActionType<ShadingActionParams, T> => ({
    key: "apply-shading",
    callback: ({action, ...position}, context) =>
        state => gameStateApplyShading({...context, state}, position, action),
});
export const shadingAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    action: DragAction
): GameStateActionOrCallback<ShadingActionParams, T> => ({
    type: shadingActionType(),
    params: {...position, action},
});
export const shadingStartAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    isRightButton: boolean
): GameStateActionOrCallback<ShadingActionParams, T>[] => {
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

export const coreGameStateActionTypes: GameStateActionType<any, AnyPTM>[] = [
    undoActionType(),
    redoActionType(),
    clearSelectionActionType(),
    enterDigitActionType(),
    applyCurrentMultiLineActionType(),
    setCellMarkActionType(),
    shadingActionType(),
];
