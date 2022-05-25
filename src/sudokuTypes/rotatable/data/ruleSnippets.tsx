import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import React, {ReactNode} from "react";

export const rotatableSudokuRules: Translatable<ReactNode> = {
    [LanguageCode.en]: <><strong>The sudoku field can be rotated clockwise.</strong> It's up to you to determine the correct orientation of the puzzle.</>,
    [LanguageCode.ru]: <><strong>Поле судоку можно поворачивать.</strong> Вам предстоит определить правильную ориентацию поля.</>,
};
