import { indexes } from "../../utils/indexes";
import { Position } from "../layout/Position";
import { Constraint } from "./Constraint";
import { RegionConstraint } from "../../components/puzzle/constraints/region/Region";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";

/**
 * Puzzle grid size - defines both the size of virtual cells array and of the rendered grid.
 *
 * Internally, the cells of the puzzle are always represented as a 2-dimensional array:
 * rows first, then columns, e.g. `cells[rowsCount][columnsCount]`.
 *
 * But the actual puzzle's grid that is rendered on the page could be anything:
 * custom cells bounds, coordinate transformations, scattered cells, custom grid wrappers...
 * So the `gridSize` property defines what is the size of the rendered grid on the page.
 *
 * The puzzle type manager is responsible for drawing the cells in the correct place and with the correct shape.
 * @see PuzzleTypeManager
 */
export interface GridSize {
    /**
     * The number of rows in the virtual cells array.
     */
    rowsCount: number;
    /**
     * The number of columns in the virtual cells array.
     */
    columnsCount: number;
    /**
     * The size of the rendered puzzle grid's square.
     *
     * For a regular rectangular grid that consists of square cells,
     * the grid size is supposed to be the maximum of `rowsCount` and `columnsCount`
     * (to fully cover the puzzle's grid).
     *
     * For an irregular grid (custom cell bounds, coordinate transformations, custom grid wrappers),
     * it must be the size of the square that fully covers the rendered custom grid.
     */
    gridSize: number;
    /**
     * Sudoku box width, if relevant.
     */
    regionWidth?: number;
    /**
     * Sudoku box height, if relevant.
     */
    regionHeight?: number;
}

export function createRegularRegions(gridSize: Required<GridSize>): Position[][];
export function createRegularRegions(
    rowsCount: number,
    columnsCount: number,
    regionWidth: number,
    regionHeight?: number,
): Position[][];
export function createRegularRegions(
    rowsCountOrGridSize: Required<GridSize> | number,
    columnsCountArg?: number,
    regionWidthArg?: number,
    regionHeightArg?: number,
): Position[][] {
    let rowsCount: number, columnsCount: number, regionWidth: number, regionHeight: number;
    if (typeof rowsCountOrGridSize === "object") {
        ({ rowsCount, columnsCount, regionWidth, regionHeight } = rowsCountOrGridSize);
    } else {
        rowsCount = rowsCountOrGridSize;
        columnsCount = columnsCountArg!;
        regionWidth = regionWidthArg!;
        regionHeight = regionHeightArg ?? columnsCount / regionWidth;
    }

    return indexes(rowsCount / regionHeight).flatMap((regionTop) =>
        indexes(columnsCount / regionWidth).map((regionLeft) =>
            indexes(regionHeight).flatMap((cellTop) =>
                indexes(regionWidth).map(
                    (cellLeft): Position => ({
                        left: regionLeft * regionWidth + cellLeft,
                        top: regionTop * regionHeight + cellTop,
                    }),
                ),
            ),
        ),
    );
}

export function createRegularGridSize(gridSize: number, regionWidth: number, regionHeight?: number): Required<GridSize>;
export function createRegularGridSize(gridSize: number): GridSize;
export function createRegularGridSize(
    gridSize: number,
    regionWidth?: number,
    regionHeight = regionWidth && gridSize / regionWidth,
): GridSize {
    return {
        gridSize,
        rowsCount: gridSize,
        columnsCount: gridSize,
        regionWidth,
        regionHeight,
    };
}

export const getDefaultRegionsForRowsAndColumns = <T extends AnyPTM>({
    puzzle: { customCellBounds, gridSize },
}: PuzzleContext<T>): Constraint<T>[] =>
    customCellBounds
        ? []
        : [
              ...indexes(gridSize.rowsCount).map((top) =>
                  RegionConstraint<T>(
                      indexes(gridSize.columnsCount).map((left) => ({ left, top })),
                      false,
                      "row",
                  ),
              ),
              ...indexes(gridSize.columnsCount).map((left) =>
                  RegionConstraint<T>(
                      indexes(gridSize.rowsCount).map((top) => ({ left, top })),
                      false,
                      "column",
                  ),
              ),
          ];

export const GridSize9 = createRegularGridSize(9, 3);
export const Regions9 = createRegularRegions(GridSize9);

export const GridSize8 = createRegularGridSize(8, 4);
export const Regions8 = createRegularRegions(GridSize8);

export const GridSize6 = createRegularGridSize(6, 3);
export const Regions6 = createRegularRegions(GridSize6);
