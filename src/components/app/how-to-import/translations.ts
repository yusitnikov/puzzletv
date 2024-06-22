import {LanguageCode} from "../../../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";

export const seeIllustration: PartiallyTranslatable = {
    [LanguageCode.en]: "See the illustration",
    [LanguageCode.ru]: "См. иллюстрацию",
    [LanguageCode.de]: "Siehe Abbildung",
};

export const selectGridTypeTranslation = (type: string): PartiallyTranslatable => ({
    [LanguageCode.en]: `Select "${type}" in the "Grid type" field when importing the puzzle to Puzzle TV`,
    [LanguageCode.ru]: `Выберите «${type}» в поле «Grid type» при импорте головоломки в Puzzle TV`,
    [LanguageCode.de]: `Wählen Sie beim Importieren des Puzzles in Puzzle TV im Feld "Grid type" "${type}" aus`,
});

export const selectAdditionalConstraintTranslation = (type: string): PartiallyTranslatable => ({
    [LanguageCode.en]: `Turn on the "${type}" flag in the "Additional constraints" section`,
    [LanguageCode.ru]: `Включите флажок «${type}» в разделе «Additional constraints»`,
    [LanguageCode.de]: `Aktivieren Sie die Option "${type}" im Abschnitt "Additional constraints"`,
});
