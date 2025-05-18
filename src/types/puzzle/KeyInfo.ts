import { PartiallyTranslatable } from "../translations/Translatable";
import { processTranslations } from "../../utils/translate";
import { LanguageCode } from "../translations/LanguageCode";

export interface KeyInfo {
    title: string | PartiallyTranslatable;
    codes: string[];
}

export const createSimpleKeyInfo = (
    key: string | PartiallyTranslatable,
    tip: PartiallyTranslatable = { [LanguageCode.en]: "" },
): KeyInfo => ({
    title: processTranslations(
        (key, tip) => key + (tip ? ` (${tip})` : ""),
        typeof key === "string" ? { [LanguageCode.en]: key } : key,
        tip,
    ),
    codes: [`Key${key}`, `Digit${key}`, `Numpad${key}`],
});
