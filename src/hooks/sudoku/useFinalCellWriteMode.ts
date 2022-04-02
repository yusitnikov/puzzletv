import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {useControlKeysState} from "../useControlKeysState";

export const useFinalCellWriteMode = (persistentCellWriteMode: CellWriteMode) => {
    const {isCtrlDown, isShiftDown} = useControlKeysState();

    return isCtrlDown
        ? (isShiftDown ? CellWriteMode.color : CellWriteMode.center)
        : (isShiftDown ? CellWriteMode.corner : persistentCellWriteMode);
};
