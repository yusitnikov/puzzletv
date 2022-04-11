import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import React, {ReactNode} from "react";

export const rotatableSudokuRules: Translatable<ReactNode> = {
    [LanguageCode.en]: <><strong>The sudoku field can be rotated clockwise.</strong> It's not known in advance in which orientation the puzzle is solvable.</>,
    [LanguageCode.ru]: <><strong>Поле судоку можно поворачивать.</strong> Заранее не известно, в какой ориентации судоку имеет решение.</>,
};
