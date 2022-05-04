import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {useControlKeysState} from "../useControlKeysState";

export const useFinalCellWriteMode = (persistentCellWriteMode: CellWriteMode, allowDrawing?: boolean, allowDragging?: boolean) => {
    const {keysStr} = useControlKeysState();

    switch (keysStr) {
        case "Ctrl": return CellWriteMode.center;
        case "Ctrl+Shift": return CellWriteMode.color;
        case "Shift": return CellWriteMode.corner;
        case "Alt": return allowDrawing ? CellWriteMode.lines : persistentCellWriteMode;
        case "Alt+Shift": return allowDragging ? CellWriteMode.move : persistentCellWriteMode;
        default: return persistentCellWriteMode;
    }
};
