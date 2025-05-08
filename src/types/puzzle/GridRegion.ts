import { Rect } from "../layout/Rect";
import { arrayContainsPosition, Position } from "../layout/Position";
import { PuzzleContext } from "./PuzzleContext";
import { AnyPTM } from "./PuzzleTypeMap";
import { indexesFromTo } from "../../utils/indexes";

export interface GridRegion extends Rect {
    transformCoords?: (position: Position) => Position;
    cells?: Position[];
    zIndex?: number;
    highlighted?: boolean;
    backgroundColor?: string;
    opacity?: number;
    noInteraction?: boolean;
    noBorders?: boolean;
    noClip?: boolean;
}

export const getGridRegionCells = (region: GridRegion): Position[] =>
    region.cells ??
    indexesFromTo(region.top, region.top + region.width).flatMap((top) =>
        indexesFromTo(region.left, region.left + region.height).map((left) => ({ top, left })),
    );

export const doesGridRegionContainCell = ({ cells, top, left, width, height }: GridRegion, cell: Position) =>
    cells
        ? arrayContainsPosition(cells, cell)
        : cell.top >= top && cell.left >= left && cell.top < top + height && cell.left < left + width;

export const transformCoordsByRegions = <T extends AnyPTM>(coords: Position, context: PuzzleContext<T>): Position => {
    const roundedCoords: Position = {
        top: Math.floor(coords.top),
        left: Math.floor(coords.left),
    };

    for (const region of context.regions ?? []) {
        if (region.transformCoords && doesGridRegionContainCell(region, roundedCoords)) {
            return region.transformCoords(coords);
        }
    }

    return coords;
};
