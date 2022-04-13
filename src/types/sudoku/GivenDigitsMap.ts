import {SudokuTypeManager} from "./SudokuTypeManager";

export type GivenDigitsMap<CellType> = Record<number, Record<number, CellType>>;

export const mergeGivenDigitsMaps = <CellType>(...maps: GivenDigitsMap<CellType>[]) => {
    const result: GivenDigitsMap<CellType> = {};

    for (const map of maps) {
        for (const [rowIndexStr, row] of Object.entries(map)) {
            const rowIndex = Number(rowIndexStr);
            for (const [columnIndexStr, cell] of Object.entries(row)) {
                const columnIndex = Number(columnIndexStr);
                result[rowIndex] = result[rowIndex] || {};
                result[rowIndex][columnIndex] = result[rowIndex][columnIndex] || cell;
            }
        }
    }

    return result;
};

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

            if (!areSameCellData(cell1, cell2)) {
                return false;
            }
        }
    }

    return true;
};
