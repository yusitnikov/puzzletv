import {Rect} from "../layout/Rect";
import {isSamePosition, Position} from "../layout/Position";

export interface GridRegion extends Rect {
    transformCoords?: (position: Position) => Position;
    cells?: Position[];
}

export const doesGridRegionContainCell = ({cells, top, left, width, height}: GridRegion, cell: Position) =>
    cells
        ? cells.some((cell2) => isSamePosition(cell2, cell))
        : cell.top >= top && cell.left >= left && cell.top < top + height && cell.left < left + width;
