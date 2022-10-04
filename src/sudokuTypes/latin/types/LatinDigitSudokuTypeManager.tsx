import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {LatinDigitComponentType} from "../../../components/sudoku/digit/LatinDigit";
import {DigitCellDataComponentType} from "../../default/components/DigitCellData";

const map: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 5,
    5: 10,
    6: 50,
    7: 100,
    8: 500,
    9: 1000,
}

export const LatinDigitSudokuTypeManager: SudokuTypeManager<number> = {
    ...DigitSudokuTypeManager(),

    disableCellModeLetterShortcuts: true,
    disableArrowLetterShortcuts: true,
    disableDigitShortcuts: true,
    digitShortcuts: [
        ["1", "I"],
        ["2"],
        ["3"],
        ["5", "V"],
        ["0", "X"],
        ["L"],
        ["C"],
        ["D"],
        ["M"],
    ],

    cellDataComponentType: DigitCellDataComponentType(LatinDigitComponentType.component, LatinDigitComponentType.widthCoeff),

    getDigitByCellData(data) {
        return map[data] ?? data;
    },
};
