import { translationsExactType } from "../../data/translations";
import { TranslationItem, TranslationItemWithEn } from "./TranslationItem";

export type TranslatableFromDictionary<T = string> = T extends string ? keyof typeof translationsExactType : never;

export type PartiallyTranslatable<T = string> = TranslatableFromDictionary<T> | TranslationItemWithEn<T>;

export type Translatable<T = string> = TranslatableFromDictionary<T> | TranslationItem<T>;
