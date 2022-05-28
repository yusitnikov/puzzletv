import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellStateEx} from "../../../types/sudoku/CellState";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";

export const GuessSudokuTypeManager = <GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    solution: GivenDigitsMap<number>,
    serializeGameState?: SudokuTypeManager<number, GameStateExtensionType, any>["serializeGameState"],
    unserializeGameState?: SudokuTypeManager<number, GameStateExtensionType, any>["unserializeGameState"]
): SudokuTypeManager<number, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    ...DigitSudokuTypeManager<GameStateExtensionType, ProcessedGameStateExtensionType>(
        RegularDigitComponentType,
        serializeGameState,
        unserializeGameState
    ),

    // TODO: use the default behavior when it's not player's turn to enter the digit
    handleDigitInCell(
        cellWriteMode,
        cellState,
        cellData,
        {top, left},
        defaultResult
    ): Partial<CellStateEx<number>> {
        if (cellWriteMode !== CellWriteMode.main) {
            return defaultResult;
        }

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

    disableConflictChecker: true,
});
