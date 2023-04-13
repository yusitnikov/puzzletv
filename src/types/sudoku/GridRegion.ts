import {Rect} from "../layout/Rect";
import {isSamePosition, Position} from "../layout/Position";
import {PuzzleContext} from "./PuzzleContext";
import {AnyPTM} from "./PuzzleTypeMap";

export interface GridRegion extends Rect {
    transformCoords?: (position: Position) => Position;
    cells?: Position[];
    zIndex?: number;
}

export const doesGridRegionContainCell = ({cells, top, left, width, height}: GridRegion, cell: Position) =>
    cells
        ? cells.some((cell2) => isSamePosition(cell2, cell))
        : cell.top >= top && cell.left >= left && cell.top < top + height && cell.left < left + width;

export const transformCoordsByRegions = <T extends AnyPTM>(coords: Position, context: PuzzleContext<T>): Position => {
    const roundedCoords: Position = {
        top: Math.floor(coords.top),
        left: Math.floor(coords.left),
    };

    for (const region of context.puzzle.typeManager.getRegionsWithSameCoordsTransformation?.(context) ?? []) {
        if (region.transformCoords && doesGridRegionContainCell(region, roundedCoords)) {
            return region.transformCoords(coords);
        }
    }

    return coords;
};
