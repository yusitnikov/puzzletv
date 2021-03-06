import {SudokuTypeManager} from "./SudokuTypeManager";
import {Position} from "../layout/Position";

export type GivenDigitsMap<CellType> = Record<number, Record<number, CellType>>;

export const processGivenDigitsMaps = <CellType, ResultType = CellType>(processor: (cells: CellType[], position: Position) => ResultType, maps: GivenDigitsMap<CellType>[]) => {
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
            result[rowIndex] = result[rowIndex] || {};
            result[rowIndex][columnIndex] = processor(cells, {top: rowIndex, left: columnIndex});
        }
    }

    return result;
};

export const mergeGivenDigitsMaps = <CellType>(...maps: GivenDigitsMap<CellType>[]) =>
    processGivenDigitsMaps(([first]) => first, maps);

export const areSameGivenDigitsMaps = <CellType>({areSameCellData}: SudokuTypeManager<CellType, any, any>, map1: GivenDigitsMap<CellType>, map2: GivenDigitsMap<CellType>) => {
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

            if (!areSameCellData(cell1, cell2, undefined, false)) {
                return false;
            }
        }
    }

    return true;
};

export const createGivenDigitsMapFromArray = <CellType>(array: CellType[][]): GivenDigitsMap<CellType> => {
    const map: GivenDigitsMap<CellType> = {};

    array.forEach((row, rowIndex) => {
        map[rowIndex] = {};

        row.forEach((cell, columnIndex) => {
            map[rowIndex][columnIndex] = cell;
        });
    });

    return map;
};

export const serializeGivenDigitsMap = <CellType>(map: GivenDigitsMap<CellType>, serializer: (item: CellType) => any): any =>
    processGivenDigitsMaps(([cell]) => serializer(cell), [map]);

export const unserializeGivenDigitsMap = <CellType>(map: any, unserializer: (item: any) => CellType): GivenDigitsMap<CellType> =>
    processGivenDigitsMaps(([cell]) => unserializer(cell), [map]);
