import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import React, {ReactNode} from "react";

export const chessSudokuRules: Translatable<ReactNode> = {
    [LanguageCode.en]: <>
        <strong>Normal chess rules apply</strong>:
        put chess pieces to the board so that they will form a valid chess position
        (that is result of some chess game)
    </>,
    [LanguageCode.ru]: <>
        <strong>Обычные правила шахмат</strong>:
        поставьте шахматные фигуры на доску так, чтоб они образовали позицию,
        которая может получиться в результате игры в шахматы
    </>,
};

export const normalSudokuRulesForChessPieces: Translatable = {
    [LanguageCode.en]: "chess pieces cannot repeat in rows, columns and boxes",
    [LanguageCode.ru]: "шахматные фигуры не могут повторяться на каждой линии и в каждом регионе, огражденном жирными линиями",
};

export const noPastPromotions: Translatable = {
    [LanguageCode.en]: "There were no pawn promotions in the game that led to the current position on the board",
    [LanguageCode.ru]: "В игре, результат которой мы видим на доске, не было превращений пешек",
};

export const mateInOne: Translatable = {
    [LanguageCode.en]: "Both white and black have a mate in 1 move in case it's their turn",
    [LanguageCode.ru]: "И белые, и черные могут поставить мат в 1 ход, если это их ход",
};
