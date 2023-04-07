import {Position} from "../layout/Position";
import {CellExactPosition} from "./CellExactPosition";
import {CellWriteModeInfo} from "./CellWriteMode";
import {BasePointerStateExtraData} from "../../utils/gestures";
import {PuzzleContext} from "./PuzzleContext";

export const cellGestureExtraDataTag = "cell";

export interface CellGestureExtraData extends BasePointerStateExtraData {
    cell: Position;
    exact: CellExactPosition;
    skipEnter?: boolean;
}

export const isCellGestureExtraData = (
    extraData: BasePointerStateExtraData | undefined
): extraData is CellGestureExtraData => extraData?.tags.includes(cellGestureExtraDataTag) ?? false;

export const getCurrentCellWriteModeInfoByGestureExtraData = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    extraData: BasePointerStateExtraData | undefined,
): CellWriteModeInfo<CellType, ExType, ProcessedExType> => {
    if (isCellGestureExtraData(extraData)) {
        const forceCellWriteMode = context.puzzle.typeManager.getCellTypeProps?.(extraData.cell, context.puzzle)?.forceCellWriteMode;
        if (forceCellWriteMode) {
            return forceCellWriteMode;
        }
    }

    return context.state.processed.cellWriteModeInfo;
};
