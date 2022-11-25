// noinspection JSUnusedGlobalSymbols

import {Translatable} from "../types/translations/Translatable";
import {LanguageCode} from "../types/translations/LanguageCode";
import {ReactNode} from "react";
import {processTranslations} from "../utils/translate";
import {TranslationItem} from "../types/translations/TranslationItem";

export const ruleWithTitle = (title: ReactNode, ...explained: string[]) => <>{title}: {explained.map(s => s.toLowerCase()).join(", ")}</>;

export const normalSudokuRulesApply: Translatable = {
    [LanguageCode.en]: "Standard sudoku rules apply",
    [LanguageCode.ru]: "Стандартные правила судоку",
};

export const normalSudokuRulesDoNotApply: Translatable = {
    [LanguageCode.en]: "Standard sudoku rules do NOT apply",
    [LanguageCode.ru]: "Стандартные правила судоку НЕ в силе",
};

export const almostNormalSudokuRulesApply: Translatable = {
    [LanguageCode.en]: "Standard (almost) sudoku rules apply",
    [LanguageCode.ru]: "Стандартные (почти) правила судоку",
};

export const chaosConstructionRulesApply: Translatable = {
    [LanguageCode.en]: "Regions must be connected and determined by the solver (draw the region borders to complete the puzzle)",
    [LanguageCode.ru]: "Области должны быть связаны и определены Вами (нарисуйте границы регионов, чтобы завершить судоку)",
};

export const toroidalRulesApply: Translatable = {
    [LanguageCode.en]: "The grid is toroidal: the top connects to the bottom, the left connects to the right",
    [LanguageCode.ru]: "Поле имеет форму тора: верх соединяется с низом, левая часть соединяется с правой",
};

export const normalYinYangRulesApply: Translatable = {
    [LanguageCode.en]: "Standard Yin Yang rules apply",
    [LanguageCode.ru]: "Стандартные правила инь-янь",
};

export const normalYinYangRulesExplained: Translatable = {
    [LanguageCode.en]: "Shade some cells in the grid such that all shaded cells are connected and all unshaded cells are connected. No 2x2 box may be fully shaded or fully unshaded",
    [LanguageCode.ru]: "Заштрихуйте некоторые ячейки в сетке так, чтобы и все заштрихованные, и все незаштрихованные ячейки образовывали одну ортогонально связанную область, и не было полностью заштрихованного или незаштрихованного блока 2x2",
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
    [LanguageCode.en]: "Conventional notations for common constraints apply",
    [LanguageCode.ru]: "Традиционные знаки ограничений судоку",
};

export const killerCagesTitle: Translatable = {
    [LanguageCode.en]: "Killer cages",
    [LanguageCode.ru]: "Клетки",
};

export const killerCagesExplained: Translatable = {
    [LanguageCode.en]: "Cells in cages must sum to the total given in the corner of the cage",
    [LanguageCode.ru]: "Сумма цифр в клетках равняется числу в углу клетки",
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
    [LanguageCode.en]: "Digits along an arrow sum to the number in the circle",
    [LanguageCode.ru]: "Сумма цифр, расположенных вдоль стрелок, равняется цифре в кружке",
};

export const canRepeatOnArrows: Translatable = {
    [LanguageCode.en]: "Digits can repeat along arrows if allowed by other rules",
    [LanguageCode.ru]: "Цифры вдоль стрелок могут повторяться, если это разрешено остальными правилами",
};

export const twoDigitArrowCirclesExplained: Translatable = {
    [LanguageCode.en]: "Two-digit sums read from left to right or top to bottom",
    [LanguageCode.ru]: "Двузначные числа суммы читаются слева направо и сверху вниз",
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

export const whiteKropkiDotsExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by a white dot are consecutive",
    [LanguageCode.ru]: "Ячейки, разделенные белой точкой, содержат последовательные цифры",
};

export const ratioDotsExplained = (colorTranslation: TranslationItem, ratio: string): Translatable => processTranslations(
    (phrase, color) => phrase.replace("%1", color),
    {
        [LanguageCode.en]: `Cells separated by a %1 dot have a ratio of ${ratio}`,
        [LanguageCode.ru]: `Ячейки, разделенные %1 точкой, имеют соотношение ${ratio}`,
    },
    colorTranslation
);

export const blackKropkiDotsExplained: Translatable = ratioDotsExplained({
    [LanguageCode.en]: "black",
    [LanguageCode.ru]: "чёрной",
}, "1:2");

export const allDotsGiven: Translatable = {
    [LanguageCode.en]: "All dots are given",
    [LanguageCode.ru]: "Все точки даны",
};

export const notAllDotsGiven: Translatable = {
    [LanguageCode.en]: "Not all possible dots are necessarily given (no negative constraint)",
    [LanguageCode.ru]: "Не все возможные точки присутствуют на поле",
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

export const evenTitle: Translatable = {
    [LanguageCode.en]: "Even digits",
    [LanguageCode.ru]: "Четные цифры",
};

export const evenExplained: Translatable = {
    [LanguageCode.en]: "Grey squares are even digits",
    [LanguageCode.ru]: "Сумма цифр, расположенных вдоль стрелок, равняется цифре в кружке",
};

export const renbanTitle: Translatable = {
    [LanguageCode.en]: "Renban lines",
    [LanguageCode.ru]: 'Линии "Ренбан"',
};

export const renbanExplained: Translatable = {
    [LanguageCode.en]: "Digits along the purple line must form a set of consecutive digits in any order",
    [LanguageCode.ru]: "Цифры вдоль зеленой линии должны образовывать набор последовательных цифр в любом порядке",
};

export const inBetweenLineTitle: Translatable = {
    [LanguageCode.en]: "Between lines",
    [LanguageCode.ru]: "Серединные линии",
};

export const inBetweenLineExplained: Translatable = {
    [LanguageCode.en]: "Digits along the grey line must be strictly in between of digits on the circles",
    [LanguageCode.ru]: "Цифры на серой линии должны быть строго между цифрами на кружках",
};

export const littleKillerTitle: Translatable = {
    [LanguageCode.en]: "Little killer",
    [LanguageCode.ru]: "Диагонали",
};

export const littleKillerExplained: Translatable = {
    [LanguageCode.en]: "Digits along indicated diagonals must sum to the given total",
    [LanguageCode.ru]: "Цифры на указанных диагоналях должны иметь обозначенную сумму",
};

export const loopRulesApply: Translatable = {
    [LanguageCode.en]: "Draw a non-intersecting loop through the centers of some empty cells",
    [LanguageCode.ru]: "Нарисуйте непересекающуюся петлю через центры некоторых пустых ячеек",
};

export const tapCluesApply = (maxNeighborsCount = 8): Translatable => ({
    [LanguageCode.en]: `Clues represent the numbers of consecutive cells occupied by the loop each time it enters the (up to) ${maxNeighborsCount} cells surrounding the clue`,
    [LanguageCode.ru]: `Подсказки указывают на количество последовательных ячеек, занимаемых петлей каждый раз, когда она проходит через (до) ${maxNeighborsCount} ячеек, окружающих подсказку`,
});

export const livesRules = (initialLives: number): Translatable => ({
    [LanguageCode.en]: `You have ${initialLives} lives to solve the puzzle. It takes 1 life to enter a wrong digit`,
    [LanguageCode.ru]: `У Вас есть ${initialLives} жизней на решение этого судоку. Одна жизнь отнимается при вводе неправильной цифры`,
});

export const noGuessingRequired: Translatable = {
    [LanguageCode.en]: "Note: no guessing is required to finish the puzzle",
    [LanguageCode.ru]: "Примечание: чтобы решить головоломку, не требуется никаких угадываний",
};


export const noBifurcation: Translatable<ReactNode> = {
    [LanguageCode.en]: <>And the most important rule: <strong>try using bifurcation as little as possible</strong> ;)</>,
    [LanguageCode.ru]: <>И самое важное правило: <strong>старайтесь использовать технику раздвоения как можно меньше</strong> ;)</>,
};
