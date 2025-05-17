import { PuzzleInputMode } from "../PuzzleInputMode";
import type { PuzzleInputModeInfo } from "../PuzzleInputModeInfo";
import { shadingAction, shadingStartAction } from "../GameStateAction";
import { AnyPTM } from "../PuzzleTypeMap";
import { ShadingDigitModeButton } from "../../../components/puzzle/controls/ShadingDigitModeButton";

export const ShadingPuzzleInputModeInfo = <T extends AnyPTM>(): PuzzleInputModeInfo<T> => ({
    mode: PuzzleInputMode.shading,
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
