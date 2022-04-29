import {indexes} from "../../utils/indexes";

export interface FieldSize {
    fieldSize: number;
    rowsCount: number;
    columnsCount: number;
    regions: [number, number][][];
}

export const createRegularRegions = (
    rowsCount: number,
    columnsCount: number,
    regionWidth: number,
    regionHeight = columnsCount / regionWidth
): FieldSize["regions"] => indexes(rowsCount / regionHeight).flatMap(
    (top) => indexes(columnsCount / regionWidth).map(
        (left): [number, number][] => [
            [left * regionWidth, top * regionHeight],
            [(left + 1) * regionWidth, top * regionHeight],
            [(left + 1) * regionWidth, (top + 1) * regionHeight],
            [left * regionWidth, (top + 1) * regionHeight],
        ]
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
