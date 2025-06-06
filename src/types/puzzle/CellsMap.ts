import { isSamePosition, Position } from "../layout/Position";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";
import { indexes } from "../../utils/indexes";

export type CellsMap<CellType> = Record<number, Record<number, CellType>>;

export const processCellsMaps = <CellType, ResultType = CellType>(
    processor: (cells: CellType[], position: Position) => ResultType | undefined,
    maps: CellsMap<CellType>[],
) => {
    const arrayMap: CellsMap<CellType[]> = {};

    for (const map of maps) {
        for (const [rowIndexStr, row] of Object.entries(map)) {
            const rowIndex = Number(rowIndexStr);
            for (const [columnIndexStr, cell] of Object.entries(row)) {
                const columnIndex = Number(columnIndexStr);
                arrayMap[rowIndex] = arrayMap[rowIndex] || {};
                arrayMap[rowIndex][columnIndex] = arrayMap[rowIndex][columnIndex] || [];
                arrayMap[rowIndex][columnIndex].push(cell);
            }
        }
    }

    const result: CellsMap<ResultType> = {};

    for (const [rowIndexStr, row] of Object.entries(arrayMap)) {
        const rowIndex = Number(rowIndexStr);
        for (const [columnIndexStr, cells] of Object.entries(row)) {
            const columnIndex = Number(columnIndexStr);
            const cellResult = processor(cells, { top: rowIndex, left: columnIndex });
            if (cellResult !== undefined) {
                result[rowIndex] = result[rowIndex] || {};
                result[rowIndex][columnIndex] = cellResult;
            }
        }
    }

    return result;
};

export const cellsMapToArray = <CellType>(map: CellsMap<CellType>) =>
    Object.entries(map).flatMap(([top, rowMap]) =>
        Object.entries(rowMap).map(([left, data]) => ({
            data,
            position: {
                top: Number(top),
                left: Number(left),
            } as Position,
        })),
    );

export const mergeCellsMaps = <CellType>(...maps: CellsMap<CellType>[]) => processCellsMaps(([first]) => first, maps);

export const areSameCellsMaps = <T>(map1: CellsMap<T>, map2: CellsMap<T>, isEqual: (a: T, b: T) => boolean) => {
    const mergedMap = mergeCellsMaps(map1, map2);

    for (const [rowIndexStr, mergedRow] of Object.entries(mergedMap)) {
        const rowIndex = Number(rowIndexStr);
        for (const columnIndexStr of Object.keys(mergedRow)) {
            const columnIndex = Number(columnIndexStr);
            const cell1 = map1[rowIndex]?.[columnIndex];
            const cell2 = map2[rowIndex]?.[columnIndex];

            if (!cell1 || !cell2) {
                if (cell1 !== cell2) {
                    return false;
                }

                continue;
            }

            if (!isEqual(cell1, cell2)) {
                return false;
            }
        }
    }

    return true;
};

export const areSameCellsMapsByContext = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    map1: CellsMap<T["cell"]>,
    map2: CellsMap<T["cell"]>,
) => areSameCellsMaps(map1, map2, (a, b) => context.puzzle.typeManager.areSameCellData(a, b, context));

export const createCellsMapFromArray = <CellType>(array: (CellType | undefined)[][]): CellsMap<CellType> => {
    const map: CellsMap<CellType> = {};

    array.forEach((row, rowIndex) => {
        map[rowIndex] = {};

        row.forEach((cell, columnIndex) => {
            if (cell !== undefined) {
                map[rowIndex][columnIndex] = cell;
            }
        });
    });

    return map;
};

export const serializeCellsMap = <CellType>(map: CellsMap<CellType>, serializer: (item: CellType) => any): any =>
    processCellsMaps(([cell]) => serializer(cell), [map]);

export const unserializeCellsMap = <CellType>(map: any, unserializer: (item: any) => CellType): CellsMap<CellType> =>
    processCellsMaps(([cell]) => unserializer(cell), [map]);

export const createRegionsByCellsMap = <CellType>(
    map: CellsMap<CellType>,
    width: number,
    height: number,
): Position[][] => {
    interface Region {
        value?: CellType;
        // The first cell's coordinates is the region's temporary ID
        id: Position;
        cells: Position[];
    }

    // Make each cell a separate region, initially
    const regions = indexes(height).map((top) =>
        indexes(width).map(
            (left): Region => ({
                id: { top, left },
                value: map[top]?.[left],
                cells: [{ top, left }],
            }),
        ),
    );

    // Merge all regions one by one
    const merge = (top1: number, left1: number, top2: number, left2: number) => {
        const region1 = regions[top1][left1];
        const region2 = regions[top2][left2];
        if (region1 === region2 || region1.value !== region2.value) {
            return;
        }

        // Merge region 2 to region 1
        region1.cells.push(...region2.cells);

        // Assign region 1 to the cells of region 2
        for (const { top, left } of region2.cells) {
            regions[top][left] = region1;
        }
    };
    for (let top = 0; top < height; top++) {
        for (let left = 0; left < width; left++) {
            if (top !== 0) {
                merge(top - 1, left, top, left);
            }
            if (left !== 0) {
                merge(top, left - 1, top, left);
            }
        }
    }

    // Filter unique regions
    const result: Position[][] = [];
    for (const [top, row] of regions.entries()) {
        for (const [left, { cells }] of row.entries()) {
            if (isSamePosition({ top, left }, cells[0])) {
                // Sort the cells in the reading order
                cells.sort((a, b) => Math.sign(a.top - b.top) || Math.sign(a.left - b.left));
                result.push(cells);
            }
        }
    }
    return result;
};
