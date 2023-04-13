import {indexes} from "../../utils/indexes";
import {Position} from "../layout/Position";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {Constraint} from "./Constraint";
import {RegionConstraint} from "../../components/sudoku/constraints/region/Region";
import {AnyPTM} from "./PuzzleTypeMap";

export interface FieldSize<T extends AnyPTM> {
    fieldSize: number;
    rowsCount: number;
    columnsCount: number;
    regionWidth?: number;
    regionHeight?: number;
    regions: (Position[] | Constraint<T, any>)[];
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

export const calculateDefaultRegionWidth = (fieldSize: number) => {
    let bestHeight = 1;

    for (let height = 2; height * height <= fieldSize; height++) {
        if (fieldSize % height === 0) {
            bestHeight = height;
        }
    }

    return fieldSize / bestHeight;
}

export const createRegularFieldSize = <T extends AnyPTM>(fieldSize: number, regionWidth?: number, regionHeight = regionWidth && fieldSize / regionWidth): FieldSize<T> => ({
    fieldSize,
    rowsCount: fieldSize,
    columnsCount: fieldSize,
    regionWidth,
    regionHeight,
    regions: regionWidth && regionHeight
        ? createRegularRegions(fieldSize, fieldSize, regionWidth, regionHeight)
        : []
});

export const getDefaultRegionsForRowsAndColumns = <T extends AnyPTM>(
    {customCellBounds, fieldSize}: PuzzleDefinition<T>
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

export const FieldSize8 = createRegularFieldSize(8, 4);
