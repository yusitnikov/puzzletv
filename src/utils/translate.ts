import {translations} from "../data/translations";
import {allLanguageCodes, LanguageCode} from "../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../types/translations/Translatable";
import {TranslationItem} from "../types/translations/TranslationItem";

export const translate = <T = string>(phrase: PartiallyTranslatable<T>, languageCode: LanguageCode): T => {
    if (typeof phrase === "string") {
        // phrase is a key of the dictionary item, T is string
        const result: string = (translations[phrase][languageCode] || phrase);
        return result as any as T;
    } else {
        // phrase is a map of translations, T is any
        return phrase[languageCode] || phrase.en;
    }
};

export const bindTranslate = (languageCode: LanguageCode) =>
    <T = string>(phrase: PartiallyTranslatable<T>) => translate(phrase, languageCode);

export const processTranslations = <T = string>(processor: (...items: T[]) => T, ...items: PartiallyTranslatable<T>[]) =>
    Object.fromEntries(
        allLanguageCodes
            .map((language) => [
                language,
                processor(...items.map(item => translate(item, language)))
            ])
    ) as TranslationItem<T>;

export const getRussianPluralForm = <T>(
    count: number,
    oneTranslation: T,
    twoThreeFourTranslation: T,
    otherTranslation: T,
) => {
    const ones = count % 10;
    const tens = Math.floor(count / 10) % 10;

    return tens === 1
        ? otherTranslation
        : ones === 1
            ? oneTranslation
            : [2, 3, 4].includes(ones)
                ? twoThreeFourTranslation
                : otherTranslation;
};
