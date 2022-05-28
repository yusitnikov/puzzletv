import {CellWriteMode, CellWriteModeInfo} from "../../types/sudoku/CellWriteMode";
import {useControlKeysState} from "../useControlKeysState";

export const useFinalCellWriteMode = (
    persistentCellWriteMode: CellWriteMode,
    allowedModes: CellWriteModeInfo<any, any, any>[],
    readOnly?: boolean
) => {
    const {keysStr} = useControlKeysState();

    if (readOnly) {
        return persistentCellWriteMode;
    }

    for (const {mode, hotKeyStr} of allowedModes) {
        if (keysStr === hotKeyStr) {
            return mode;
        }
    }

    return persistentCellWriteMode;
};
