import { CellWriteMode } from "../../types/puzzle/CellWriteMode";
import { CellWriteModeInfo } from "../../types/puzzle/CellWriteModeInfo";
import { ControlKeysState } from "../useControlKeysState";
import { AnyPTM } from "../../types/puzzle/PuzzleTypeMap";

export const getFinalCellWriteMode = <T extends AnyPTM>(
    { keysStr }: ControlKeysState,
    persistentCellWriteMode: CellWriteMode,
    gestureCellWriteMode: CellWriteMode | undefined,
    allowedModes: CellWriteModeInfo<T>[],
    readOnly?: boolean,
) => {
    if (gestureCellWriteMode !== undefined) {
        return gestureCellWriteMode;
    }

    if (readOnly) {
        return persistentCellWriteMode;
    }

    for (const { mode, hotKeyStr } of allowedModes) {
        if (hotKeyStr?.includes(keysStr)) {
            return mode;
        }
    }

    return persistentCellWriteMode;
};
