import {Position} from "../layout/Position";
import {CellExactPosition} from "./CellExactPosition";
import {CellWriteMode, CellWriteModeInfo} from "./CellWriteMode";

export interface CellGestureExtraData<CellType, ExType, ProcessedExType> {
    type: "cell";
    cell: Position;
    exact?: CellExactPosition;
    cellWriteModeInfo: CellWriteModeInfo<CellType, ExType, ProcessedExType>;
    skipEnter?: boolean;
}

export const isCellGestureExtraData = (extraData: any): extraData is CellGestureExtraData<any, any, any> =>
    (extraData as CellGestureExtraData<any, any, any>)?.type === "cell";

export const isCurrentModeByCellGestureExtraData = (extraData: any, expectedMode: CellWriteMode | number) =>
    isCellGestureExtraData(extraData) && extraData.cellWriteModeInfo.mode === expectedMode;
