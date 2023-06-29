export enum LanguageCode {
    en = "en",
    ru = "ru",
    de = "de",
}

export const allLanguageCodes: LanguageCode[] = [
    LanguageCode.en,
    LanguageCode.de,
    LanguageCode.ru,
];

export const languageNames: Record<LanguageCode, string> = {
    [LanguageCode.en]: "English",
    [LanguageCode.ru]: "Русский",
    [LanguageCode.de]: "Deutsch",
};
