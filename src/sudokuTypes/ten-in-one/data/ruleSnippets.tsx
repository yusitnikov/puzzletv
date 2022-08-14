import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export const tenInOneStage1Rules: Translatable = {
    [LanguageCode.en]: "Each 3x3 box is a separate little puzzle. " +
    "Place three different digits from 1-9 in each row and column of the 3x3 boxes in such way that all constraints within the box are fulfilled. " +
    "Those three digits can be different in each box",
    [LanguageCode.ru]: "Каждый квадрат 3х3 — это отдельный маленький судоку. " +
    "Поместите три различные цифры от 1 до 9 в каждую строку и столбец квадратов 3x3 таким образом, чтобы все ограничения в квадрате выполнялись. " +
    "Эти три цифры могут быть разными в каждом квадрате",
};
