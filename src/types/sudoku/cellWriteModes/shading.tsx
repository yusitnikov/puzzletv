import type {CellWriteModeInfo} from "../CellWriteMode";
import {shadingAction, shadingStartAction} from "../GameStateAction";

export const ShadingCellWriteModeInfo: Omit<CellWriteModeInfo<any, any, any>, "mode"> = {
    isActiveForPuzzle: ({enableShading = false}) => enableShading,
    // color and shading are never together, so it's ok to have the same hotkey
    hotKeyStr: ["Ctrl+Shift", "Ctrl+Alt+Shift"],
    handlesRightMouseClick: true,
    isNoSelectionMode: true,
    onCornerClick: (context, position, isRightButton) => {
        context.onStateChange(shadingStartAction(
            context,
            {
                top: Math.floor(position.center.top),
                left: Math.floor(position.center.left),
            },
            isRightButton
        ));
    },
    onCornerEnter: (context, position) =>
        context.onStateChange(shadingAction(
            context,
            {
                top: Math.floor(position.center.top),
                left: Math.floor(position.center.left),
            },
            context.state.dragAction
        )),
};
