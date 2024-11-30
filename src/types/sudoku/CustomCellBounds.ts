import { Position } from "../layout/Position";
import { Rect, TransformedRect } from "../layout/Rect";

export interface CustomCellBounds {
    borders: Position[][];
    userArea: Rect;
}

export interface TransformedCustomCellBounds {
    borders: Position[][];
    userArea: TransformedRect;
}
