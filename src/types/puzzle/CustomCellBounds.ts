import { Position } from "../layout/Position";
import { Rect, TransformedRect } from "../layout/Rect";

/**
 * Custom puzzle's cell shape.
 *
 * @see PuzzleDefinition.customCellBounds
 */
export interface CustomCellBounds {
    /**
     * A list of cell border polygons
     * (a cell might consist of multiple scattered polygons in edge cases).
     */
    borders: Position[][];
    /**
     * The area of a custom cell for writing digits, pencilmarks and pen tool's X/O marks.
     * Must be fully within the cell's polygon.
     */
    userArea: Rect;
}

/**
 * Custom puzzle's cell shape after applying distorted coordinate transformations from the type manager.
 */
export interface TransformedCustomCellBounds {
    /**
     * A list of cell border polygons after applying coordinate transformations to them.
     */
    borders: Position[][];
    /**
     * The user area of the cell after applying coordinate transformations to it.
     */
    userArea: TransformedRect;
}
