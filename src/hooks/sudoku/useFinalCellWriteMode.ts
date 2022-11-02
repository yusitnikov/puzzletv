import {CellWriteMode, CellWriteModeInfo} from "../../types/sudoku/CellWriteMode";
import {ControlKeysState, useControlKeysState} from "../useControlKeysState";

export const getFinalCellWriteMode = (
    {keysStr}: ControlKeysState,
    persistentCellWriteMode: CellWriteMode,
    allowedModes: CellWriteModeInfo<any, any, any>[],
    readOnly?: boolean
) => {
    if (readOnly) {
        return persistentCellWriteMode;
    }

    for (const {mode, hotKeyStr} of allowedModes) {
        if (hotKeyStr?.includes(keysStr)) {
            return mode;
        }
    }

    return persistentCellWriteMode;
};

export const useFinalCellWriteMode = (
    persistentCellWriteMode: CellWriteMode,
    allowedModes: CellWriteModeInfo<any, any, any>[],
    readOnly?: boolean
) => {
    const keys = useControlKeysState();

    return getFinalCellWriteMode(keys, persistentCellWriteMode, allowedModes, readOnly);
};
