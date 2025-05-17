import { Position } from "../layout/Position";
import { CellExactPosition } from "./CellExactPosition";
import { PuzzleInputModeInfo } from "./PuzzleInputModeInfo";
import { BasePointerStateExtraData } from "../../utils/gestures";
import { PuzzleContext } from "./PuzzleContext";
import { AnyPTM } from "./PuzzleTypeMap";

export const cellGestureExtraDataTag = "cell";

export interface CellGestureExtraData extends BasePointerStateExtraData {
    cell: Position;
    exact: CellExactPosition;
    regionIndex?: number;
    skipEnter?: boolean;
}

export const isCellGestureExtraData = (
    extraData: BasePointerStateExtraData | undefined,
): extraData is CellGestureExtraData => extraData?.tags.includes(cellGestureExtraDataTag) ?? false;

export const getCurrentPuzzleInputModeInfoByGestureExtraData = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    extraData: BasePointerStateExtraData | undefined,
): PuzzleInputModeInfo<T> => {
    if (isCellGestureExtraData(extraData)) {
        const forcedMode = context.puzzleIndex.getCellTypeProps(extraData.cell).forcedPuzzleInputMode;
        if (forcedMode) {
            return forcedMode;
        }
    }

    return context.inputModeInfo;
};
