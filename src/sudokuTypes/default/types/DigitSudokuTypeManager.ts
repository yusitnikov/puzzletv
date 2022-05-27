import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {DigitCellDataComponentType} from "../components/DigitCellData";
import {DigitComponentType} from "../../../components/sudoku/digit/DigitComponentType";

export const DigitSudokuTypeManager = <GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    digitComponentType: DigitComponentType = RegularDigitComponentType,
    serializeGameState: SudokuTypeManager<number, GameStateExtensionType, any>["serializeGameState"] = () => {},
    unserializeGameState: SudokuTypeManager<number, GameStateExtensionType, any>["unserializeGameState"] = data => data as GameStateExtensionType
): SudokuTypeManager<number, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
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

    serializeGameState,
    unserializeGameState,

    createCellDataByDisplayDigit(digit: number): number {
        return digit;
    },

    createCellDataByTypedDigit(digit: number): number {
        return digit;
    },

    getDigitByCellData(digit: number) {
        return digit;
    },

    digitComponentType,

    cellDataComponentType: DigitCellDataComponentType(digitComponentType.component),
});
