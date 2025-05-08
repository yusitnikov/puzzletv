import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { RegularDigitComponentType } from "../../../components/puzzle/digit/RegularDigit";
import { DigitCellDataComponentType } from "../components/DigitCellData";
import { DigitComponentType } from "../../../components/puzzle/digit/DigitComponentType";
import { AnyNumberPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const DigitPuzzleTypeManager = <T extends AnyNumberPTM>(
    digitComponentType: DigitComponentType<T> = RegularDigitComponentType(),
    cellSizeCoeff?: number,
): PuzzleTypeManager<T> => ({
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

    serializeCellData(digit: number): any {
        return digit;
    },

    unserializeCellData(digit: any): number {
        return digit as number;
    },

    createCellDataByDisplayDigit(digit: number): number {
        return digit;
    },

    createCellDataByTypedDigit(digit: number): number {
        return digit;
    },

    createCellDataByImportedDigit(digit: number): number {
        return digit;
    },

    getDigitByCellData(digit: number) {
        return digit;
    },

    digitComponentType,

    cellDataComponentType: DigitCellDataComponentType(cellSizeCoeff),
});
