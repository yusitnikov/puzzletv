import {LanguageCode} from "../types/translations/LanguageCode";
import {PartiallyTranslatable, Translatable} from "../types/translations/Translatable";

export const Chameleon: Translatable = {
    [LanguageCode.en]: "Chameleon",
    [LanguageCode.ru]: "Хамелеона",
    [LanguageCode.de]: "Chameleon",
};

export const Raumplaner: PartiallyTranslatable = {
    [LanguageCode.en]: "Raumplaner",
};

export const AnalyticalNinja: PartiallyTranslatable = {
    [LanguageCode.en]: "AnalyticalNinja",
};
