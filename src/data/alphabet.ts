import {TranslationItem} from "../types/translations/TranslationItem";
import {LanguageCode} from "../types/translations/LanguageCode";
import {processTranslations} from "../utils/translate";

export const alphabet: TranslationItem = {
    [LanguageCode.en]: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    [LanguageCode.ru]: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
    [LanguageCode.de]: "AÄBCDEFGHIJKLMNOÖPQRSßTUÜVWXYZ",
};

export interface ScrambleLetterInfo {
    letter: string;
    count: number;
    price: number;
}
export const scrambleLettersInfo: TranslationItem<ScrambleLetterInfo[]> = {
    [LanguageCode.en]: [
        {letter: 'A', count: 9, price: 1},
        {letter: 'B', count: 2, price: 3},
        {letter: 'C', count: 2, price: 3},
        {letter: 'D', count: 4, price: 2},
        {letter: 'E', count: 12, price: 1},
        {letter: 'F', count: 2, price: 4},
        {letter: 'G', count: 3, price: 2},
        {letter: 'H', count: 2, price: 4},
        {letter: 'I', count: 9, price: 1},
        {letter: 'J', count: 1, price: 8},
        {letter: 'K', count: 1, price: 5},
        {letter: 'L', count: 4, price: 1},
        {letter: 'M', count: 2, price: 3},
        {letter: 'N', count: 6, price: 1},
        {letter: 'O', count: 8, price: 1},
        {letter: 'P', count: 2, price: 3},
        {letter: 'Q', count: 1, price: 10},
        {letter: 'R', count: 6, price: 1},
        {letter: 'S', count: 4, price: 1},
        {letter: 'T', count: 6, price: 1},
        {letter: 'U', count: 4, price: 1},
        {letter: 'V', count: 2, price: 4},
        {letter: 'W', count: 2, price: 4},
        {letter: 'X', count: 1, price: 8},
        {letter: 'Y', count: 2, price: 4},
        {letter: 'Z', count: 1, price: 10},
    ],
    [LanguageCode.ru]: [
        {letter: 'А', count: 8, price: 1},
        {letter: 'Б', count: 2, price: 3},
        {letter: 'В', count: 4, price: 1},
        {letter: 'Г', count: 2, price: 3},
        {letter: 'Д', count: 4, price: 2},
        {letter: 'Е', count: 9, price: 1},
        {letter: 'Ж', count: 1, price: 5},
        {letter: 'З', count: 2, price: 5},
        {letter: 'И', count: 6, price: 1},
        {letter: 'Й', count: 1, price: 4},
        {letter: 'К', count: 4, price: 2},
        {letter: 'Л', count: 4, price: 2},
        {letter: 'М', count: 3, price: 2},
        {letter: 'Н', count: 5, price: 1},
        {letter: 'О', count: 10, price: 1},
        {letter: 'П', count: 4, price: 2},
        {letter: 'Р', count: 5, price: 1},
        {letter: 'С', count: 5, price: 1},
        {letter: 'Т', count: 5, price: 1},
        {letter: 'У', count: 4, price: 2},
        {letter: 'Ф', count: 1, price: 8},
        {letter: 'Х', count: 1, price: 5},
        {letter: 'Ц', count: 1, price: 5},
        {letter: 'Ч', count: 1, price: 5},
        {letter: 'Ш', count: 1, price: 8},
        {letter: 'Щ', count: 1, price: 10},
        {letter: 'Ъ', count: 1, price: 15},
        {letter: 'Ы', count: 2, price: 4},
        {letter: 'Ь', count: 2, price: 3},
        {letter: 'Э', count: 1, price: 8},
        {letter: 'Ю', count: 1, price: 8},
        {letter: 'Я', count: 2, price: 3},
    ],
    [LanguageCode.de]: [
        {letter: 'A', count: 5, price: 1},
        {letter: 'Ä', count: 1, price: 6},
        {letter: 'B', count: 2, price: 3},
        {letter: 'C', count: 2, price: 4},
        {letter: 'D', count: 4, price: 1},
        {letter: 'E', count: 15, price: 1},
        {letter: 'F', count: 2, price: 4},
        {letter: 'G', count: 3, price: 2},
        {letter: 'H', count: 4, price: 2},
        {letter: 'I', count: 6, price: 1},
        {letter: 'J', count: 1, price: 6},
        {letter: 'K', count: 2, price: 4},
        {letter: 'L', count: 3, price: 2},
        {letter: 'M', count: 4, price: 3},
        {letter: 'N', count: 9, price: 1},
        {letter: 'O', count: 3, price: 2},
        {letter: 'Ö', count: 1, price: 8},
        {letter: 'P', count: 1, price: 4},
        {letter: 'Q', count: 1, price: 10},
        {letter: 'R', count: 6, price: 1},
        {letter: 'S', count: 7, price: 1},
        {letter: 'T', count: 6, price: 1},
        {letter: 'U', count: 6, price: 1},
        {letter: 'Ü', count: 1, price: 6},
        {letter: 'V', count: 1, price: 6},
        {letter: 'W', count: 1, price: 3},
        {letter: 'X', count: 1, price: 8},
        {letter: 'Y', count: 1, price: 10},
        {letter: 'Z', count: 1, price: 3},
    ],
};

export const scrambleLetterForShuffling = processTranslations(
    (letters) => letters.map(({letter, count}) => letter.repeat(count)).join(""),
    scrambleLettersInfo
);
