import {Translatable} from "../types/translations/Translatable";
import {LanguageCode} from "../types/translations/LanguageCode";
import React, {ReactNode} from "react";

export const ruleWithTitle = (title: ReactNode, explained: string) => <>{title}: {(explained as string).toLowerCase()}</>;

export const normalSudokuRulesApply: Translatable = {
    [LanguageCode.en]: "Standard sudoku rules apply",
    [LanguageCode.ru]: "Стандартные правила судоку",
};

export const almostNormalSudokuRulesApply: Translatable = {
    [LanguageCode.en]: "Standard (almost) sudoku rules apply",
    [LanguageCode.ru]: "Стандартные (почти) правила судоку",
};

export const chaosConstructionRulesApply: Translatable = {
    [LanguageCode.en]: "Regions must be connected and determined by the solver",
    [LanguageCode.ru]: "Области должны быть связаны и определены Вами",
};

export const toroidalRulesApply: Translatable = {
    [LanguageCode.en]: "The grid is toroidal: the top connects to the bottom, the left connects to the right",
    [LanguageCode.ru]: "Поле имеет форму тора: верх соединяется с низом, левая часть соединяется с правой",
};

export const moveButtonTip: Translatable = {
    [LanguageCode.en]: "Use the \"move\" button or the arrow keys to move the grid",
    [LanguageCode.ru]: "Используйте кнопку «двигать» или стрелки, чтобы двигать поле",
};

export const antiKnightRulesApply: Translatable = {
    [LanguageCode.en]: "Anti-knight sudoku rules apply",
    [LanguageCode.ru]: "Правила судоку \"анти-конь\"",
};

export const antiKnightRulesExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by a chess knight's move cannot contain the same digit",
    [LanguageCode.ru]: "Клетки, разделенные ходом коня, не могут содержать одну и ту же цифру",
};

export const conventionalNotationsApply: Translatable = {
    [LanguageCode.en]: "Conventional notations for common sudoku constraints apply",
    [LanguageCode.ru]: "Традиционные знаки ограничений судоку",
};

export const killerCages: Translatable = {
    [LanguageCode.en]: "Killer cages: cells in cages must sum to the total given in the corner of each cage, digits cannot repeat within a cage",
    [LanguageCode.ru]: "Клетки: сумма цифр в клетках равняется числу в углу каждой клетки, цифры не могут повторяться внутри клетки",
};

export const arrows: Translatable = {
    [LanguageCode.en]: "Arrows: digits along arrows sum to the numbers in the circles",
    [LanguageCode.ru]: "Стрелки: сумма цифр, расположенных вдоль стрелок, равняется цифре в кружке",
};

export const thermometersTitle: Translatable = {
    [LanguageCode.en]: "Thermometers",
    [LanguageCode.ru]: "Термометры",
};

export const thermometersExplained: Translatable = {
    [LanguageCode.en]: "Along thermometers, digits must increase from the bulb end",
    [LanguageCode.ru]: "Цифры возрастают вдоль термометров, начиная с \"колбы\"",
};

export const kropkiDotsTitle: Translatable = {
    [LanguageCode.en]: "Kropki dots",
    [LanguageCode.ru]: "Точки Кропки",
};

export const blackKropkiDotsExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by a black dot have a ratio of 1:2",
    [LanguageCode.ru]: "Ячейки, разделенные чёрной точкой, имеют соотношение 1:2",
};

export const notAllDotsGiven: Translatable = {
    [LanguageCode.en]: "Not all dots are given",
    [LanguageCode.ru]: "Не все точки даны",
};

export const xExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by X must sum to 10",
    [LanguageCode.ru]: "Сумма цифр, разделённых знаком X, равна 10",
};

export const vExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by V must sum to 5",
    [LanguageCode.ru]: "Сумма цифр, разделённых знаком V, равна 5",
};

export const germanWhispers: Translatable = {
    [LanguageCode.en]: "German whispers: consecutive digits along the green line must have difference of 5 or more",
    [LanguageCode.ru]: "\"Немецкий шёпот\": последовательные цифры вдоль зеленой линии должны различаться на 5 или более",
};

export const noBifurcation: Translatable<ReactNode> = {
    [LanguageCode.en]: <>And the most important rule: <strong>try using bifurcation as little as possible</strong> ;)</>,
    [LanguageCode.ru]: <>И самое важное правило: <strong>старайтесь использовать технику раздвоения как можно меньше</strong> ;)</>,
};
