import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";

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
    [LanguageCode.en]: "1 point is added to your score for every correct guess of a digit",
    [LanguageCode.ru]: "За каждое правильное предположение цифры к вашему счету добавляется 1 очко",
};

export const singlePlayerScoreRules: Translatable = {
    [LanguageCode.en]: "1 point is added to your score for every incorrect guess of a digit",
    [LanguageCode.ru]: "За каждое неверное предположение цифры к вашему счету добавляется 1 очко",
};

export const targetHighestScoreRules: Translatable = {
    [LanguageCode.en]: "Try to achieve the highest score possible",
    [LanguageCode.ru]: "Постарайтесь набрать как можно больше очков",
};

export const targetLowestScoreRules: Translatable = {
    [LanguageCode.en]: "Try to achieve the lowest score possible",
    [LanguageCode.ru]: "Постарайтесь набрать как можно меньше очков",
};
/*
The game is played in 2 phases
Phase 1
- Place a quad clue anywhere in the grid on an intersection between 4 cells and input 4 numbers.
- Numbers that turn red are not found within the 4 cells
- Numbers that turn back must be found within the 4 cells
Phase 2
- Guess a digit in any cell within the grid a correct guess allows you to guess again
- An incorrect guess will become a red central pencil mark to keep track of what has been guessed within each cell.
- 1 point is added to your score for every red pencil mark that is created within the grid.
- When an incorrect guess is made that ends the round and you begin again with phase 1 (placing a quad)
Try to achieve the lowest score possible.
 */
