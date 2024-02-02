import {indexes} from "../../utils/indexes";
import {Position} from "../layout/Position";
import {Constraint} from "./Constraint";
import {RegionConstraint} from "../../components/sudoku/constraints/region/Region";
import {AnyPTM} from "./PuzzleTypeMap";
import {PuzzleContext} from "./PuzzleContext";

export interface FieldSize {
    fieldSize: number;
    rowsCount: number;
    columnsCount: number;
    regionWidth?: number;
    regionHeight?: number;
}

export function createRegularRegions(fieldSize: Required<FieldSize>): Position[][];
export function createRegularRegions(
    rowsCount: number,
    columnsCount: number,
    regionWidth: number,
    regionHeight?: number
): Position[][];
export function createRegularRegions(
    rowsCountOrFieldSize: Required<FieldSize> | number,
    columnsCountArg?: number,
    regionWidthArg?: number,
    regionHeightArg?: number,
): Position[][] {
    let rowsCount: number, columnsCount: number, regionWidth: number, regionHeight: number;
    if (typeof rowsCountOrFieldSize === "object") {
        ({rowsCount, columnsCount, regionWidth, regionHeight} = rowsCountOrFieldSize);
    } else {
        rowsCount = rowsCountOrFieldSize;
        columnsCount = columnsCountArg!;
        regionWidth = regionWidthArg!;
        regionHeight = regionHeightArg ?? (columnsCount / regionWidth);
    }

    return indexes(rowsCount / regionHeight).flatMap(
        (regionTop) => indexes(columnsCount / regionWidth).map(
            (regionLeft) => indexes(regionHeight).flatMap(
                (cellTop) => indexes(regionWidth).map(
                    (cellLeft): Position => ({
                        left: regionLeft * regionWidth + cellLeft,
                        top: regionTop * regionHeight + cellTop,
                    })
                )
            )
        )
    );
}

export function createRegularFieldSize(
    fieldSize: number, regionWidth: number, regionHeight?: number
): Required<FieldSize>;
export function createRegularFieldSize(fieldSize: number): FieldSize;
export function createRegularFieldSize(
    fieldSize: number,
    regionWidth?: number,
    regionHeight = regionWidth && fieldSize / regionWidth
): FieldSize {
    return {
        fieldSize,
        rowsCount: fieldSize,
        columnsCount: fieldSize,
        regionWidth,
        regionHeight,
    };
}

export const getDefaultRegionsForRowsAndColumns = <T extends AnyPTM>(
    {puzzle: {customCellBounds, fieldSize}}: PuzzleContext<T>
): Constraint<T>[] => customCellBounds ? [] : [
    ...indexes(fieldSize.rowsCount).map(top => RegionConstraint<T>(
        indexes(fieldSize.columnsCount).map(left => ({left, top})),
        false,
        "row"
    )),
    ...indexes(fieldSize.columnsCount).map(left => RegionConstraint<T>(
        indexes(fieldSize.rowsCount).map(top => ({left, top})),
        false,
        "column"
    )),
];

export const FieldSize9 = createRegularFieldSize(9, 3);
export const Regions9 = createRegularRegions(FieldSize9);

export const FieldSize8 = createRegularFieldSize(8, 4);
export const Regions8 = createRegularRegions(FieldSize8);

export const FieldSize6 = createRegularFieldSize(6, 3);
export const Regions6 = createRegularRegions(FieldSize6);
