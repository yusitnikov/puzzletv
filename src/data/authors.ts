import {LanguageCode} from "../types/translations/LanguageCode";
import {PartiallyTranslatable, Translatable} from "../types/translations/Translatable";

export const Chameleon: Translatable = {
    [LanguageCode.en]: "Chameleon",
    [LanguageCode.ru]: "Хамелеона",
};

export const Raumplaner: PartiallyTranslatable = {
    [LanguageCode.en]: "Raumplaner",
};
