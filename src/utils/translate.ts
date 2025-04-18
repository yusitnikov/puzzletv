import { translations } from "../data/translations";
import { allLanguageCodes } from "../types/translations/LanguageCode";
import { PartiallyTranslatable } from "../types/translations/Translatable";
import { TranslationItem } from "../types/translations/TranslationItem";
import { settings } from "../types/layout/Settings";

export const translate = <T = string>(phrase: PartiallyTranslatable<T>, languageCode = settings.languageCode): T => {
    if (typeof phrase === "string") {
        // phrase is a key of the dictionary item, T is string
        const result: string = translations[phrase][languageCode] || phrase;
        return result as any as T;
    } else {
        // phrase is a map of translations, T is any
        return phrase[languageCode] || phrase.en;
    }
};

export const processTranslations = <T = string, ResT = T>(
    processor: (...items: T[]) => ResT,
    ...items: PartiallyTranslatable<T>[]
) =>
    Object.fromEntries(
        allLanguageCodes.map((language) => [language, processor(...items.map((item) => translate(item, language)))]),
    ) as TranslationItem<ResT>;

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
