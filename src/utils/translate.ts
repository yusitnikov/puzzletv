import {translations} from "../data/translations";
import {LanguageCode} from "../types/translations/LanguageCode";
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

export const processTranslations = <T = string>(processor: (...items: T[]) => T, ...items: TranslationItem<T>[]) =>
    Object.fromEntries(
        Object.keys(items[0])
            .map((language) => [
                language,
                processor(...items.map(item => item[language as LanguageCode]))
            ])
    ) as TranslationItem<T>;
