import {LanguageCode} from "../../../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";

export const seeIllustration: PartiallyTranslatable = {
    [LanguageCode.en]: "See the illustration",
    [LanguageCode.ru]: "См. иллюстрацию",
    [LanguageCode.de]: "Siehe Abbildung",
};

export const seeExample: PartiallyTranslatable = {
    [LanguageCode.en]: "See example",
    [LanguageCode.ru]: "См. пример",
    [LanguageCode.de]: "Siehe Beispiel",
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

export const addEmbeddedSolution: PartiallyTranslatable = {
    [LanguageCode.en]: "Add embedded solution for digits as you do it for SudokuPad",
    [LanguageCode.ru]: "Добавьте встроенное решение для цифр, как вы это делаете для SudokuPad",
    [LanguageCode.de]: "Fügen Sie eine eingebettete Lösung für Ziffern hinzu, wie Sie es für SudokuPad tun",
};

export const addRegularFog: PartiallyTranslatable = {
    [LanguageCode.en]: "Add the fog lights as you do it for SudokuPad",
    [LanguageCode.ru]: "Добавьте освещение тумана, как вы это делаете для SudokuPad",
    [LanguageCode.de]: "Fügen Sie die Nebelscheinwerfer hinzu, wie Sie es für SudokuPad tun",
};
