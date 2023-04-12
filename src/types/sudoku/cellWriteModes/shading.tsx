import type {CellWriteModeInfo} from "../CellWriteMode";
import {shadingAction, shadingStartAction} from "../GameStateAction";

export const ShadingCellWriteModeInfo: Omit<CellWriteModeInfo<any, any, any>, "mode"> = {
    isActiveForPuzzle: ({enableShading = false}) => enableShading,
    // color and shading are never together, so it's ok to have the same hotkey
    hotKeyStr: ["Ctrl+Shift", "Ctrl+Alt+Shift"],
    handlesRightMouseClick: true,
    isNoSelectionMode: true,
    onCornerClick: (context, cellPosition, exactPosition, isRightButton) =>
        context.onStateChange(shadingStartAction(context, cellPosition, isRightButton)),
    onCornerEnter: (context, cellPosition) =>
        context.onStateChange(shadingAction(context, cellPosition, context.state.dragAction)),
};
