import {Rect} from "../layout/Rect";
import {Position} from "../layout/Position";

export interface GridRegion extends Rect {
    transformCoords?: (position: Position) => Position;
    cells?: Position[];
}
