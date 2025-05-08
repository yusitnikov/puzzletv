import { Translatable } from "../../../types/translations/Translatable";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { ReactNode } from "react";

export const multiPlayerTurnsRules: Translatable = {
    [LanguageCode.en]: "Players take turns to first place a quad onto the grid then input a digit into a cell",
    [LanguageCode.ru]: "Игроки по очереди сначала помещают квадрант, а затем вводят цифру в клетку",
    [LanguageCode.de]:
        "Die Spieler legen abwechselnd zuerst ein Quad auf das Gitter und geben dann eine Ziffer in ein Feld ein",
};

export const twoPhasesGame: Translatable = {
    [LanguageCode.en]: "The game is played in 2 phases",
    [LanguageCode.ru]: "Игра состоит из двух фаз",
    [LanguageCode.de]: "Das Spiel wird in 2 Phasen gespielt",
};

export const phase: Translatable = {
    [LanguageCode.en]: "Phase",
    [LanguageCode.ru]: "Фаза",
    [LanguageCode.de]: "Phase",
};

export const placeQuadRules: Translatable = {
    [LanguageCode.en]: "Place a quad clue anywhere in the grid on an intersection between 4 cells and input 4 digits",
    [LanguageCode.ru]:
        "Поместите подсказку-квадрант в любом месте сетки на пересечении между 4 клетками и введите 4 цифры",
    [LanguageCode.de]:
        "Platzieren Sie einen Quad-Hinweis an einer beliebigen Stelle im Raster an einem Schnittpunkt zwischen 4 Zellen und geben Sie 4 Ziffern ein",
};

export const quadRedDigits: Translatable = {
    [LanguageCode.en]: "Digits that turn red are not found within the 4 cells",
    [LanguageCode.ru]: "Цифры, которые становятся красными, отсутствуют в 4 клетках",
    [LanguageCode.de]: "Ziffern, die rot werden, werden in den 4 Zellen nicht gefunden",
};

export const quadBlackDigits: Translatable = {
    [LanguageCode.en]: "Digits that turn black must be found within the 4 cells",
    [LanguageCode.ru]: "Цифры, которые становятся черными, присутствуют в 4 клетках",
    [LanguageCode.de]: "Innerhalb der 4 Felder müssen Ziffern gefunden werden, die schwarz werden",
};

export const quadGreenDigits: Translatable = {
    [LanguageCode.en]: "Digits on a green background are present in the same exact position of the circle",
    [LanguageCode.ru]: "Цифры на зеленом фоне находятся на том же месте относительно круга",
    [LanguageCode.de]: "Ziffern auf grünem Hintergrund befinden sich genau an der gleichen Position im Kreis",
};

export const quadYellowDigits: Translatable = {
    [LanguageCode.en]:
        "Digits on a yellow background must be found within the 4 cells, but not in the same exact position",
    [LanguageCode.ru]: "Цифры на желтом фоне присутствуют в 4 клетках, но не на той же позиции",
    [LanguageCode.de]:
        "Ziffern auf gelbem Hintergrund müssen sich innerhalb der 4 Zellen befinden, jedoch nicht an der gleichen exakten Position",
};

export const quadGreyDigits: Translatable = {
    [LanguageCode.en]: "Digits on a grey background are not found within the 4 cells",
    [LanguageCode.ru]: "Цифры на сером фоне отсутствуют в 4 клетках",
    [LanguageCode.de]: "Ziffern auf grauem Hintergrund werden in den 4 Zellen nicht gefunden",
};

export const placeDigitRules: Translatable = {
    [LanguageCode.en]: "Guess a digit in any cell within the grid",
    [LanguageCode.ru]: "Угадайте цифру в любой ячейке сетки",
    [LanguageCode.de]: "Erraten Sie eine Ziffer in einer beliebigen Zelle im Raster",
};

export const correctGuessRules: Translatable = {
    [LanguageCode.en]: "A correct guess allows you to guess again",
    [LanguageCode.ru]: "Правильное предположение позволяет вам угадывать снова",
    [LanguageCode.de]: "Wenn Sie richtig geraten haben, können Sie noch einmal raten",
};

export const incorrectGuessMultiPlayerRules: Translatable = {
    [LanguageCode.en]: "Making an incorrect guess ends your turn, and the next player starts placing a quad",
    [LanguageCode.ru]: "Неверное предположение заканчивает ваш ход, и следующий игрок начинает размещать квадрант.",
    [LanguageCode.de]:
        "Wenn Sie falsch geraten haben, ist Ihr Zug beendet und der nächste Spieler beginnt mit dem Platzieren eines Quaders",
};

export const incorrectGuessSinglePlayerRules: Translatable = {
    [LanguageCode.en]: "Making an incorrect guess ends the round, and you begin again with phase 1 (placing a quad)",
    [LanguageCode.ru]: "Неверное предположение завершает раунд, и вы снова начинаете с фазы 1 (размещение квадранта).",
    [LanguageCode.de]:
        "Mit einer falschen Vermutung endet die Runde und Sie beginnen erneut mit Phase 1 (Platzieren eines Quads).",
};

export const multiPlayerScoreRules: Translatable = {
    [LanguageCode.en]: "The player who gets the most digits within the grid wins",
    [LanguageCode.ru]: "Побеждает игрок, поместивший наибольшее количество верных цифр на поле",
    [LanguageCode.de]: "Der Spieler, der die meisten Ziffern im Raster erhält, gewinnt",
};

export const singlePlayerScoreRules: Translatable = {
    [LanguageCode.en]:
        "1 point is added to your score for every incorrect guess of a digit. Try to achieve the lowest score possible",
    [LanguageCode.ru]:
        "За каждое неверное предположение цифры к вашему счету добавляется 1 очко. Постарайтесь набрать как можно меньше очков",
    [LanguageCode.de]:
        "Für jedes falsche Erraten einer Ziffer wird 1 Punkt zu Ihrer Punktzahl addiert. Versuchen Sie, die niedrigstmögliche Punktzahl zu erreichen",
};

export const privatePencilmarksNote: Translatable<ReactNode> = {
    [LanguageCode.en]: (
        <>
            Note: you can pencil mark the grid to make notes.
            <br />
            Your opponents will only see the actual guesses
        </>
    ),
    [LanguageCode.ru]: (
        <>
            Примечание: Вы можете ставить метки на поле.
            <br />
            Ваши противники не будут их видеть
        </>
    ),
    [LanguageCode.de]: (
        <>
            Hinweis: Sie können das Raster mit einem Bleistift markieren, um Notizen zu machen.
            <br />
            Ihre Gegner sehen nur die tatsächlichen Vermutungen
        </>
    ),
};
