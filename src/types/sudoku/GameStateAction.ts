import {MergeStateAction} from "../react/MergeStateAction";
import {
    gameStateApplyCurrentMultiLineGlobally, gameStateApplyCurrentMultiLineLocally,
    gameStateClearSelectedCellsContent,
    gameStateHandleDigit,
    gameStateRedo,
    gameStateUndo,
    ProcessedGameState
} from "./GameState";
import {PuzzleContext} from "./PuzzleContext";
import {myClientId} from "../../hooks/useMultiPlayer";

export type GameStateActionCallback<CellType, ProcessedGameStateExtensionType> =
    MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;

export interface GameStateActionType<ParamsType, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    key: string;
    callback: (
        params: ParamsType,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        clientId: string
    ) => GameStateActionCallback<CellType, ProcessedGameStateExtensionType>;
}

export interface GameStateAction<ParamsType, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    type: GameStateActionType<ParamsType, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    params: ParamsType;
}

export type GameStateActionOrCallback<ParamsType, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> =
    GameStateAction<ParamsType, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> |
    GameStateActionCallback<CellType, ProcessedGameStateExtensionType>;

// region Specific actions
export const undoActionType = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateActionType<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    key: "undo",
    callback: () => gameStateUndo,
});
export const undoAction = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateAction<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    type: undoActionType(),
    params: undefined,
});

export const redoActionType = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateActionType<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    key: "redo",
    callback: () => gameStateRedo,
});
export const redoAction = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateAction<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    type: redoActionType(),
    params: undefined,
});

export const clearSelectionActionType = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateActionType<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    key: "clear-selection",
    callback: (_, {puzzle: {typeManager}}) =>
        state => gameStateClearSelectedCellsContent(typeManager, state),
});
export const clearSelectionAction = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateAction<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    type: clearSelectionActionType(),
    params: undefined,
});

export const enterDigitActionType = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateActionType<number, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    key: "enter-digit",
    callback: (digit, context, clientId) =>
        state => gameStateHandleDigit({...context, state}, digit, clientId, true),
});
export const enterDigitAction = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>(
    digit: number,
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): GameStateActionOrCallback<number, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[] => [
    state => gameStateHandleDigit({...context, state}, digit, myClientId, false),
    {
        type: enterDigitActionType(),
        params: digit,
    },
];

export const applyCurrentMultiLineActionType = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateActionType<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    key: "apply-current-multiline",
    callback: (_, {puzzle: {typeManager}}) =>
        state => gameStateApplyCurrentMultiLineGlobally(typeManager, state),
});
export const applyCurrentMultiLineAction = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>()
    : GameStateActionOrCallback<undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[] => [
    {
        type: applyCurrentMultiLineActionType(),
        params: undefined,
    },
    () => gameStateApplyCurrentMultiLineLocally(),
];
// endregion

export const coreGameStateActionTypes: GameStateActionType<any, any, any, any>[] = [
    undoActionType(),
    redoActionType(),
    clearSelectionActionType(),
    enterDigitActionType(),
    applyCurrentMultiLineActionType(),
];
