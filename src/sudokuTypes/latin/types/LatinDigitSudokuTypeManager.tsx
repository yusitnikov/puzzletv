import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {LatinDigitComponentType} from "../../../components/sudoku/digit/LatinDigit";
import {DigitCellDataComponentType} from "../../default/components/DigitCellData";
import {areSameArrays} from "../../../utils/array";
import {NumberPTM} from "../../../types/sudoku/PuzzleTypeMap";

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

export const LatinDigitSudokuTypeManager: SudokuTypeManager<NumberPTM> = {
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

    cellDataDigitComponentType: LatinDigitComponentType(),

    cellDataComponentType: DigitCellDataComponentType(),

    getDigitByCellData(data) {
        return map[data] ?? data;
    },

    getNumberByDigits(digits: number[]) {
        digits = normalizeLatinDigits(digits);

        const num = naiveLatinDigitsToNumber(digits);
        const correctDigits = numberToLatinDigits(num);

        return (correctDigits !== undefined && areSameArrays(digits, correctDigits))
            ? num
            : undefined;
    },
};

const normalizeLatinDigits = (digits: number[]) => digits.flatMap(digit => {
    switch (digit) {
        case 3: return [1, 1, 1];
        case 2: return [1, 1];
        default: return [digit];
    }
});

const naiveLatinDigitsToNumber = (digits: number[]) => {
    let num = 0;
    for (let [index, digit] of digits.entries()) {
        const nextDigit = digits[index + 1];
        if (nextDigit !== undefined && digit < nextDigit) {
            num -= digit;
        } else {
            num += digit;
        }
    }
    return num;
};

const regularDigitToLatinDigit = (digit: number, coeff: number): number[] => [
    [],
    [coeff],
    [coeff, coeff],
    [coeff, coeff, coeff],
    [coeff, coeff * 5],
    [coeff * 5],
    [coeff * 5, coeff],
    [coeff * 5, coeff, coeff],
    [coeff * 5, coeff, coeff, coeff],
    [coeff, coeff * 10],
][digit];

const numberToLatinDigits = (num: number): number[] | undefined => {
    if (num <= 0 || num >= 4000) {
        return undefined;
    }

    const regularDigits = num
        .toString()
        .split("")
        .map(Number);

    return regularDigits.flatMap(
        (digit, index) => regularDigitToLatinDigit(
            digit,
            Math.pow(10, regularDigits.length - 1 - index)
        )
    );
};
