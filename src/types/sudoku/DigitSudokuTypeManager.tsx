import {SudokuTypeManager} from "./SudokuTypeManager";
import {RegularDigitComponentType} from "../../components/sudoku/digit/RegularDigit";
import {DigitCellDataComponentType} from "../../components/sudoku/cell/DigitCellData";

export const DigitSudokuTypeManager: SudokuTypeManager<number> = {
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

    digitComponentType: RegularDigitComponentType,

    cellDataComponentType: DigitCellDataComponentType,
};
