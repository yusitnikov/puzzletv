import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { getTesseractCellSelectionType } from "./TesseractSelection";
import { TesseractSettings } from "../components/TesseractSettings";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const TesseractTypeManager = <T extends AnyPTM>({
    getCellSelectionType,
    settingsComponents = [],
    ...baseTypeManager
}: PuzzleTypeManager<T>): PuzzleTypeManager<T> => ({
    ...baseTypeManager,
    getCellSelectionType: (...args) => getTesseractCellSelectionType?.(...args) ?? getCellSelectionType?.(...args),
    settingsComponents: [...settingsComponents, TesseractSettings],
});
