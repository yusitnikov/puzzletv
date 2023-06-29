import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export const tenInOneStage1Rules: Translatable = {
    [LanguageCode.en]: "Each 3x3 box is a separate little puzzle. " +
    "Place three different digits from 1-9 in each row and column of the 3x3 boxes in such way that all constraints within the box are fulfilled. " +
    "Those three digits can be different in each box",
    [LanguageCode.ru]: "Каждый квадрат 3х3 — это отдельный маленький судоку. " +
    "Поместите три различные цифры от 1 до 9 в каждую строку и столбец квадратов 3x3 таким образом, чтобы все ограничения в квадрате выполнялись. " +
    "Эти три цифры могут быть разными в каждом квадрате",
    [LanguageCode.de]: "Jede 3x3-Box ist ein separates kleines Puzzle. " +
    "Platzieren Sie in jeder Zeile und Spalte der 3x3-Boxen drei verschiedene Ziffern von 1 bis 9 so, dass alle Einschränkungen innerhalb der Box erfüllt sind. " +
    "Diese drei Ziffern können in jedem Feld unterschiedlich sein",
};

export const tenInOneMultiBoxLineRules: Translatable = {
    [LanguageCode.en]: "Additionally, when solving individual boxes as abstract 3x3's, ignore line segments between cells in different boxes",
    [LanguageCode.ru]: "Кроме того, при решении отдельных квадратов как абстрактных 3x3 игнорируйте сегменты линий между ячейками в разных квадратах",
    [LanguageCode.de]: "Wenn Sie einzelne Kästchen als abstrakte 3x3 auflösen, ignorieren Sie außerdem Liniensegmente zwischen Zellen in verschiedenen Kästchen",
};
