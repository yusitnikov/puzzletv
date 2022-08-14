import {LanguageCode} from "../types/translations/LanguageCode";
import {PartiallyTranslatable, Translatable} from "../types/translations/Translatable";
import {TranslationItem} from "../types/translations/TranslationItem";

export const Chameleon: Translatable = {
    [LanguageCode.en]: "Chameleon",
    [LanguageCode.ru]: "Хамелеона",
};

export const Raumplaner: PartiallyTranslatable = {
    [LanguageCode.en]: "Raumplaner",
};

export const AnalyticalNinja: TranslationItem = {
    [LanguageCode.en]: "AnalyticalNinja",
    [LanguageCode.ru]: "AnalyticalNinja",
};
