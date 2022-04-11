import {translations} from "../data/translations";
import {LanguageCode} from "../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../types/translations/Translatable";

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
