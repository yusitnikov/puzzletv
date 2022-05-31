import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {ReactNode} from "react";

export const multiPlayerTurnsRules: Translatable = {
    [LanguageCode.en]: "Players take turns to first place a quad onto the grid then input a digit into a cell",
    [LanguageCode.ru]: "Игроки по очереди сначала помещают квадрант, а затем вводят цифру в клетку",
};

export const twoPhasesGame: Translatable = {
    [LanguageCode.en]: "The game is played in 2 phases",
    [LanguageCode.ru]: "Игра состоит из двух фаз",
};

export const phase: Translatable = {
    [LanguageCode.en]: "Phase",
    [LanguageCode.ru]: "Фаза",
};

export const placeQuadRules: Translatable = {
    [LanguageCode.en]: "Place a quad clue anywhere in the grid on an intersection between 4 cells and input 4 digits",
    [LanguageCode.ru]: "Поместите подсказку-квадрант в любом месте сетки на пересечении между 4 клетками и введите 4 цифры",
};

export const quadRedDigits: Translatable = {
    [LanguageCode.en]: "Digits that turn red are not found within the 4 cells",
    [LanguageCode.ru]: "Цифры, которые становятся красными, отсутствуют в 4 клетках",
};

export const quadBlackDigits: Translatable = {
    [LanguageCode.en]: "Digits that turn black must be found within the 4 cells",
    [LanguageCode.ru]: "Цифры, которые становятся черными, присутствуют в 4 клетках",
};

export const quadGreenDigits: Translatable = {
    [LanguageCode.en]: "Digits on a green background are present in the same exact position of the circle",
    [LanguageCode.ru]: "Цифры на зеленом фоне находятся на том же месте относительно круга",
};

export const quadYellowDigits: Translatable = {
    [LanguageCode.en]: "Digits on a yellow background must be found within the 4 cells, but not in the same exact position",
    [LanguageCode.ru]: "Цифры на желтом фоне присутствуют в 4 клетках, но не на той же позиции",
};

export const quadGreyDigits: Translatable = {
    [LanguageCode.en]: "Digits on a grey background are not found within the 4 cells",
    [LanguageCode.ru]: "Цифры на сером фоне отсутствуют в 4 клетках",
};

export const placeDigitRules: Translatable = {
    [LanguageCode.en]: "Guess a digit in any cell within the grid",
    [LanguageCode.ru]: "Угадайте цифру в любой ячейке сетки",
};

export const correctGuessRules: Translatable = {
    [LanguageCode.en]: "A correct guess allows you to guess again",
    [LanguageCode.ru]: "Правильное предположение позволяет вам угадывать снова",
};

export const incorrectGuessMultiPlayerRules: Translatable = {
    [LanguageCode.en]: "Making an incorrect guess ends your turn, and the next player starts placing a quad",
    [LanguageCode.ru]: "Неверное предположение заканчивает ваш ход, и следующий игрок начинает размещать квадрант.",
};

export const incorrectGuessSinglePlayerRules: Translatable = {
    [LanguageCode.en]: "Making an incorrect guess ends the round, and you begin again with phase 1 (placing a quad)",
    [LanguageCode.ru]: "Неверное предположение завершает раунд, и вы снова начинаете с фазы 1 (размещение квадранта).",
};

export const multiPlayerScoreRules: Translatable = {
    [LanguageCode.en]: "The player who gets the most digits within the grid wins",
    [LanguageCode.ru]: "Побеждает игрок, поместивший наибольшее количество верных цифр на поле",
};

export const singlePlayerScoreRules: Translatable = {
    [LanguageCode.en]: "1 point is added to your score for every incorrect guess of a digit. Try to achieve the lowest score possible",
    [LanguageCode.ru]: "За каждое неверное предположение цифры к вашему счету добавляется 1 очко. Постарайтесь набрать как можно меньше очков",
};

export const privatePencilmarksNote: Translatable<ReactNode> = {
    [LanguageCode.en]: <>Note: you can pencil mark the grid to make notes.<br/>Your opponents will only see the actual guesses</>,
    [LanguageCode.ru]: <>Примечание: Вы можете ставить метки на поле.<br/>Ваши противники не будут их видеть</>,
};
