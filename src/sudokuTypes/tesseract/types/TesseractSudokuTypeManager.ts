import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {getTesseractCellSelectionType} from "./TesseractSelection";
import {TesseractSettings} from "../components/TesseractSettings";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const TesseractSudokuTypeManager = <T extends AnyPTM>(
    {getCellSelectionType, settingsComponents = [], ...baseTypeManager}: SudokuTypeManager<T>
): SudokuTypeManager<T> => ({
    ...baseTypeManager,
    getCellSelectionType: (...args) => getTesseractCellSelectionType?.(...args) ?? getCellSelectionType?.(...args),
    settingsComponents: [...settingsComponents, TesseractSettings],
});
