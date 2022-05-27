import {LanguageCode} from "../types/translations/LanguageCode";

export const addLanguageToLink = (href: string, language: LanguageCode) =>
    language === LanguageCode.en ? href : `${href}-${language}`;
