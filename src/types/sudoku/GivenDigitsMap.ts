import { Position } from "../layout/Position";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";

export type GivenDigitsMap<CellType> = Record<number, Record<number, CellType>>;

export const processGivenDigitsMaps = <CellType, ResultType = CellType>(
    processor: (cells: CellType[], position: Position) => ResultType | undefined,
    maps: GivenDigitsMap<CellType>[],
) => {
    const arrayMap: GivenDigitsMap<CellType[]> = {};

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

    const result: GivenDigitsMap<ResultType> = {};

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

export const givenDigitsMapToArray = <CellType>(map: GivenDigitsMap<CellType>) =>
    Object.entries(map).flatMap(([top, rowMap]) =>
        Object.entries(rowMap).map(([left, data]) => ({
            data,
            position: {
                top: Number(top),
                left: Number(left),
            } as Position,
        })),
    );

export const mergeGivenDigitsMaps = <CellType>(...maps: GivenDigitsMap<CellType>[]) =>
    processGivenDigitsMaps(([first]) => first, maps);

export const areSameGivenDigitsMaps = <T>(
    map1: GivenDigitsMap<T>,
    map2: GivenDigitsMap<T>,
    isEqual: (a: T, b: T) => boolean,
) => {
    const mergedMap = mergeGivenDigitsMaps(map1, map2);

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

export const areSameGivenDigitsMapsByContext = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    map1: GivenDigitsMap<T["cell"]>,
    map2: GivenDigitsMap<T["cell"]>,
) => areSameGivenDigitsMaps(map1, map2, (a, b) => context.puzzle.typeManager.areSameCellData(a, b, context));

export const createGivenDigitsMapFromArray = <CellType>(
    array: (CellType | undefined)[][],
): GivenDigitsMap<CellType> => {
    const map: GivenDigitsMap<CellType> = {};

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

export const serializeGivenDigitsMap = <CellType>(
    map: GivenDigitsMap<CellType>,
    serializer: (item: CellType) => any,
): any => processGivenDigitsMaps(([cell]) => serializer(cell), [map]);

export const unserializeGivenDigitsMap = <CellType>(
    map: any,
    unserializer: (item: any) => CellType,
): GivenDigitsMap<CellType> => processGivenDigitsMaps(([cell]) => unserializer(cell), [map]);
