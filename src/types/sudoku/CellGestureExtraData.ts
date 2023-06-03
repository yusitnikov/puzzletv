import {Position} from "../layout/Position";
import {CellExactPosition} from "./CellExactPosition";
import {CellWriteModeInfo} from "./CellWriteModeInfo";
import {BasePointerStateExtraData} from "../../utils/gestures";
import {PuzzleContext} from "./PuzzleContext";
import {AnyPTM} from "./PuzzleTypeMap";

export const cellGestureExtraDataTag = "cell";

export interface CellGestureExtraData extends BasePointerStateExtraData {
    cell: Position;
    exact: CellExactPosition;
    regionIndex?: number;
    skipEnter?: boolean;
}

export const isCellGestureExtraData = (
    extraData: BasePointerStateExtraData | undefined
): extraData is CellGestureExtraData => extraData?.tags.includes(cellGestureExtraDataTag) ?? false;

export const getCurrentCellWriteModeInfoByGestureExtraData = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    extraData: BasePointerStateExtraData | undefined,
): CellWriteModeInfo<T> => {
    if (isCellGestureExtraData(extraData)) {
        const forceCellWriteMode = context.puzzleIndex.getCellTypeProps(extraData.cell).forceCellWriteMode;
        if (forceCellWriteMode) {
            return forceCellWriteMode;
        }
    }

    return context.cellWriteModeInfo;
};
