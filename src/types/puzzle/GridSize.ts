import { indexes } from "../../utils/indexes";
import { Position } from "../layout/Position";
import { Constraint } from "./Constraint";
import { RegionConstraint } from "../../components/puzzle/constraints/region/Region";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";

export interface GridSize {
    gridSize: number;
    rowsCount: number;
    columnsCount: number;
    regionWidth?: number;
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
