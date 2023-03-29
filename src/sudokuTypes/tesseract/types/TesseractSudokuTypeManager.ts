import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {getTesseractCellSelectionType} from "./TesseractSelection";
import {TesseractSettings} from "../components/TesseractSettings";

export const TesseractSudokuTypeManager = <CellType, ExType, ProcessedExType>(
    {getCellSelectionType, settingsComponents = [], ...baseTypeManager}: SudokuTypeManager<CellType, ExType, ProcessedExType>
): SudokuTypeManager<CellType, ExType, ProcessedExType> => ({
    ...baseTypeManager,
    getCellSelectionType: (...args) => getTesseractCellSelectionType?.(...args) ?? getCellSelectionType?.(...args),
    settingsComponents: [...settingsComponents, TesseractSettings],
});
