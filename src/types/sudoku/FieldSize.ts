import {indexes} from "../../utils/indexes";
import {Position} from "../layout/Position";

export interface FieldSize {
    fieldSize: number;
    rowsCount: number;
    columnsCount: number;
    regions: Position[][];
}

export const createRegularRegions = (
    rowsCount: number,
    columnsCount: number,
    regionWidth: number,
    regionHeight = columnsCount / regionWidth
): Position[][] => indexes(rowsCount / regionHeight).flatMap(
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

export const createRegularFieldSize = (fieldSize: number, regionWidth: number, regionHeight?: number): FieldSize => ({
    fieldSize,
    rowsCount: fieldSize,
    columnsCount: fieldSize,
    regions: createRegularRegions(fieldSize, fieldSize, regionWidth, regionHeight)
});

export const FieldSize9 = createRegularFieldSize(9, 3);

export const FieldSize8 = createRegularFieldSize(8, 4);
