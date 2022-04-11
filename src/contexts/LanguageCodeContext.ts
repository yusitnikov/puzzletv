import {createContext, useContext} from "react";
import {LanguageCode} from "../types/translations/LanguageCode";
import {bindTranslate} from "../utils/translate";

export const LanguageCodeContext = createContext<LanguageCode>(LanguageCode.en);

export const useLanguageCode = () => useContext(LanguageCodeContext);

export const useTranslate = () => {
    const language = useLanguageCode();

    return bindTranslate(language);
};
