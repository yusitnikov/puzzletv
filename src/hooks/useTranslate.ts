import {useRoute} from "./useRoute";
import {LanguageCode} from "../types/translations/LanguageCode";
import {bindTranslate} from "../utils/translate";

export const useLanguageCode = () => useRoute().params.lang as LanguageCode;

export const useTranslate = () => {
    const language = useLanguageCode();

    return bindTranslate(language);
};
