import {Position} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";

export interface JigsawPieceInfo {
    cells: Position[];
    boundingRect: Rect;
}
