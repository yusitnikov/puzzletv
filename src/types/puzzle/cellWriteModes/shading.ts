import { CellWriteMode } from "../CellWriteMode";
import type { CellWriteModeInfo } from "../CellWriteModeInfo";
import { shadingAction, shadingStartAction } from "../GameStateAction";
import { AnyPTM } from "../PuzzleTypeMap";
import { ShadingDigitModeButton } from "../../../components/puzzle/controls/ShadingDigitModeButton";

export const ShadingCellWriteModeInfo = <T extends AnyPTM>(): CellWriteModeInfo<T> => ({
    mode: CellWriteMode.shading,
    mainButtonContent: ShadingDigitModeButton,
    isActiveForPuzzle: ({ enableShading = false }) => enableShading,
    // color and shading are never together, so it's ok to have the same hotkey
    hotKeyStr: ["Ctrl+Shift", "Ctrl+Alt+Shift"],
    handlesRightMouseClick: true,
    isNoSelectionMode: true,
    onCornerClick: ({ gesture: { id } }, context, { cell }, isRightButton) =>
        context.onStateChange(shadingStartAction(context, cell, isRightButton, `gesture-${id}`)),
    onCornerEnter: ({ gesture: { id } }, context, { cell }) =>
        context.onStateChange(shadingAction(cell, context.dragAction, `gesture-${id}`)),
});
