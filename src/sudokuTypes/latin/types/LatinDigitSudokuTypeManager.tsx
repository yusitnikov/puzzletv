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

    getNumberByDigits(digits: number[]) {
        let num = 0;
        let skip = false;
        for (let [index, digit] of digits.entries()) {
            if (skip) {
                skip = false;
                continue;
            }

            // TODO: check for being a valid number
            // const digitsBefore = digits.slice(0, index);
            let nextDigit = digits[index + 1];
            if (nextDigit !== undefined && nextDigit.toString().length === digit.toString().length && (nextDigit === digit * 2 || digit === nextDigit * 3)) {
                digit += nextDigit;
                ++index;
                skip = true;
                nextDigit = digits[index + 1];
            }
            // const digitsAfter = digits.slice(index + 1);
            if (nextDigit !== undefined && digit < nextDigit) {
                num -= digit;
            } else {
                num += digit;
            }
        }
        return num;
    },
};
