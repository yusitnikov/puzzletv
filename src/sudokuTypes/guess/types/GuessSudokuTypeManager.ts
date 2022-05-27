import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellStateEx} from "../../../types/sudoku/CellState";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";

export const GuessSudokuTypeManager = (solution: GivenDigitsMap<number>): SudokuTypeManager<number> => ({
    ...DigitSudokuTypeManager(),

    // TODO: use the default behavior when it's not player's turn to enter the digit
    handleMainDigit(cellState, cellData, {top, left}): Partial<CellStateEx<number>> {
        if (cellState.initialDigit) {
            return {};
        }

        if (solution[top][left] !== cellData) {
            return {
                excludedDigits: cellState.excludedDigits.add(cellData),
            };
        }

        return {
            initialDigit: cellData,
            usersDigit: undefined,
            centerDigits: cellState.centerDigits.clear(),
            cornerDigits: cellState.cornerDigits.clear(),
            excludedDigits: cellState.excludedDigits.clear(),
        }
    },
});
