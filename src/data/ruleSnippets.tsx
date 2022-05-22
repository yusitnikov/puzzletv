import {Translatable} from "../types/translations/Translatable";
import {LanguageCode} from "../types/translations/LanguageCode";
import React, {ReactNode} from "react";

export const ruleWithTitle = (title: ReactNode, ...explained: string[]) => <>{title}: {explained.map(s => s.toLowerCase()).join(", ")}</>;

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

export const antiKnight: Translatable = {
    [LanguageCode.en]: "Anti-knight",
    [LanguageCode.ru]: '"Анти-конь"',
};

export const antiKnightRulesApply: Translatable = {
    [LanguageCode.en]: "Anti-knight sudoku rules apply",
    [LanguageCode.ru]: 'Правила судоку "анти-конь"',
};

export const antiKnightRulesExplained: Translatable = {
    [LanguageCode.en]: "Cells a knight's move apart cannot contain the same digit",
    [LanguageCode.ru]: "Клетки, разделенные ходом коня, не могут содержать одну и ту же цифру",
};

export const antiBishopFromCenterRulesExplained: Translatable = {
    [LanguageCode.en]: "Cells a bishop's move from a box's center cell cannot contain that center cell's digit",
    [LanguageCode.ru]: "Клетки, находящиеся в ходе слона от центра региона, не могут содержать цифру из центра",
};

export const conventionalNotationsApply: Translatable = {
    [LanguageCode.en]: "Conventional notations for common sudoku constraints apply",
    [LanguageCode.ru]: "Традиционные знаки ограничений судоку",
};

export const killerCagesTitle: Translatable = {
    [LanguageCode.en]: "Killer cages",
    [LanguageCode.ru]: "Клетки",
};

export const killerCagesExplained: Translatable = {
    [LanguageCode.en]: "Cells in cages must sum to the total given in the corner of each cage",
    [LanguageCode.ru]: "Сумма цифр в клетках равняется числу в углу каждой клетки",
};

export const cannotRepeatInCage: Translatable = {
    [LanguageCode.en]: "Digits cannot repeat within a cage",
    [LanguageCode.ru]: "Цифры не могут повторяться внутри клетки",
};

export const arrowsTitle: Translatable = {
    [LanguageCode.en]: "Arrows",
    [LanguageCode.ru]: "Стрелки",
};

export const arrowsExplained: Translatable = {
    [LanguageCode.en]: "Digits along arrows sum to the numbers in the circles",
    [LanguageCode.ru]: "Сумма цифр, расположенных вдоль стрелок, равняется цифре в кружке",
};

export const thermometersTitle: Translatable = {
    [LanguageCode.en]: "Thermometers",
    [LanguageCode.ru]: "Термометры",
};

export const thermometersExplained: Translatable = {
    [LanguageCode.en]: "Along thermometers, digits must increase from the bulb end",
    [LanguageCode.ru]: "Цифры возрастают вдоль термометров, начиная с \"колбы\"",
};

export const inequalitySignsExplained: Translatable = {
    [LanguageCode.en]: "Inequality signs point to the smaller digit",
    [LanguageCode.ru]: "Знаки неравенства указывают на меньшую цифру",
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

export const germanWhispersTitle: Translatable = {
    [LanguageCode.en]: "German whispers",
    [LanguageCode.ru]: '"Немецкий шёпот"',
};

export const germanWhispersExplained: Translatable = {
    [LanguageCode.en]: "Consecutive digits along the green line must have difference of 5 or more",
    [LanguageCode.ru]: "Последовательные цифры вдоль зеленой линии должны различаться на 5 или более",
};

export const noBifurcation: Translatable<ReactNode> = {
    [LanguageCode.en]: <>And the most important rule: <strong>try using bifurcation as little as possible</strong> ;)</>,
    [LanguageCode.ru]: <>И самое важное правило: <strong>старайтесь использовать технику раздвоения как можно меньше</strong> ;)</>,
};
