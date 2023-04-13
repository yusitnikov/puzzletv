import {CellWriteMode} from "../CellWriteMode";
import type {CellWriteModeInfo} from "../CellWriteModeInfo";
import {shadingAction, shadingStartAction} from "../GameStateAction";
import {AnyPTM} from "../PuzzleTypeMap";

export const ShadingCellWriteModeInfo: CellWriteModeInfo<AnyPTM> = {
    mode: CellWriteMode.shading,
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
