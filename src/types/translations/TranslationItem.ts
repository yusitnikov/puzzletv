import { LanguageCode } from "./LanguageCode";

export type TranslationItem<T = string> = Record<LanguageCode, T>;

export interface TranslationItemNoEn<T = string> extends Omit<TranslationItem<T>, LanguageCode.en> {
    [LanguageCode.en]?: T;
}

export interface TranslationItemWithEn<T = string> extends Partial<Omit<TranslationItem<T>, LanguageCode.en>> {
    [LanguageCode.en]: T;
}
