import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {DigitCellDataComponentType} from "../components/DigitCellData";
import {DigitComponentType} from "../../../components/sudoku/digit/DigitComponentType";

export const DigitSudokuTypeManager = (digitComponentType: DigitComponentType = RegularDigitComponentType): SudokuTypeManager<number> => ({
    areSameCellData(digit1: number, digit2: number): boolean {
        return digit1 === digit2;
    },

    compareCellData(digit1: number, digit2: number): number {
        return digit1 - digit2;
    },

    getCellDataHash(digit: number): string {
        return digit.toString();
    },

    cloneCellData(digit: number): number {
        return digit;
    },

    createCellDataByDisplayDigit(digit: number): number {
        return digit;
    },

    createCellDataByTypedDigit(digit: number): number {
        return digit;
    },

    digitComponentType,

    cellDataComponentType: DigitCellDataComponentType(digitComponentType.component),
});
