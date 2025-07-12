import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { getTesseractCellHighlight } from "./TesseractHighlight";
import { TesseractSettings } from "../components/TesseractSettings";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const TesseractTypeManager = <T extends AnyPTM>({
    getCellHighlight,
    settingsComponents = [],
    ...baseTypeManager
}: PuzzleTypeManager<T>): PuzzleTypeManager<T> => ({
    ...baseTypeManager,
    getCellHighlight: (...args) => getTesseractCellHighlight(...args) ?? getCellHighlight?.(...args),
    settingsComponents: [...settingsComponents, TesseractSettings],
});
