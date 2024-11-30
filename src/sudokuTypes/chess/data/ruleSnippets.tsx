import { Translatable } from "../../../types/translations/Translatable";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import React, { ReactNode } from "react";

export const chessSudokuRules: Translatable<ReactNode> = {
    [LanguageCode.en]: (
        <>
            <strong>Standard chess rules apply</strong>: place chess pieces on the board to create a position that could
            be reached in a standard game of chess
        </>
    ),
    [LanguageCode.ru]: (
        <>
            <strong>Стандартные правила шахмат</strong>: поставьте шахматные фигуры на доску так, чтоб они образовали
            позицию, которая может получиться в результате игры в шахматы
        </>
    ),
    [LanguageCode.de]: (
        <>
            <strong>Es gelten die normalen Schach-Regeln</strong>: Platziere zusätzliche Figuren um Positionen zu
            erreichen, die auch in einem normalen Schachspiel vorkommen könnten
        </>
    ),
};

export const optionalChessPiecesRules: Translatable = {
    [LanguageCode.en]:
        "It's not mandatory to use all possible chess pieces (if placing a piece doesn't affect puzzle correctness, don't place it)",
    [LanguageCode.ru]:
        "Не обязательно использовать все возможные фигуры (если размещение фигуры не влияет на корректность решения, не ставьте её на доску)",
    [LanguageCode.de]:
        "Es ist nicht zwingend erforderlich, alle möglichen Schachfiguren zu verwenden (wenn das Platzieren einer Figur keinen Einfluss auf die Richtigkeit des Puzzles hat, platzieren Sie sie nicht)",
};

export const normalSudokuRulesForChessPieces: Translatable = {
    [LanguageCode.en]: "chess pieces cannot repeat in rows, columns and boxes",
    [LanguageCode.ru]:
        "шахматные фигуры не могут повторяться на каждой линии и в каждом регионе, огражденном жирными линиями",
    [LanguageCode.de]:
        "Schachfiguren dürfen sich in der gleichen Zeile, Spalte oder umrandeter Region nicht wiederholen",
};

export const emptyCells: Translatable = {
    [LanguageCode.en]:
        "However, unlike in sudoku, you are not required to fill every cell (there will be blank spaces)",
    [LanguageCode.ru]: "Однако, в отличие от обычного судоку, не обязательно заполнять каждую клетку",
    [LanguageCode.de]:
        "Im Gegensatz zu Sudoku muss aber nicht jedes Feld besetzt sein (es gibt also Felder, die frei bleiben)",
};

export const noPastPromotions: Translatable = {
    [LanguageCode.en]: "There were no pawn promotions in the game that led to the current position on the board",
    [LanguageCode.ru]: "В игре, результат которой мы видим на доске, не было превращений пешек",
    [LanguageCode.de]: "In der Partie, die zu der gegebenen Position geführt hat, gab es keine Umwandlung von Bauern",
};

export const mateInOne: Translatable = {
    [LanguageCode.en]: "Both white and black have a mate in 1 move in case it's their turn",
    [LanguageCode.ru]: "И белые, и черные могут поставить мат в 1 ход, если это их ход",
    [LanguageCode.de]:
        "Gesucht wird eine Stellung, in der sowohl Weiß als auch Schwarz mit nur einem Zug das Spiel durch ein Matt gewinnen können (Matt in einem Zug)",
};
