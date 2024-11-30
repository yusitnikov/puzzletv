// noinspection JSUnusedGlobalSymbols

import { Translatable } from "../types/translations/Translatable";
import { LanguageCode } from "../types/translations/LanguageCode";
import { ReactNode } from "react";
import { processTranslations } from "../utils/translate";
import { TranslationItem } from "../types/translations/TranslationItem";

export const ruleWithTitle = (title: ReactNode, ...explained: string[]) => (
    <>
        {title}: {explained.map((s) => s.toLowerCase()).join(", ")}
    </>
);

export const normalSudokuRulesApply: Translatable = {
    [LanguageCode.en]: "Standard sudoku rules apply",
    [LanguageCode.ru]: "Стандартные правила судоку",
    [LanguageCode.de]: "Es gelten die üblichen Sudoku-Regeln",
};

export const normalSudokuRulesDoNotApply: Translatable = {
    [LanguageCode.en]: "Standard sudoku rules do NOT apply",
    [LanguageCode.ru]: "Стандартные правила судоку НЕ в силе",
    [LanguageCode.de]: "Die üblichen Sudoku-Regeln gelten NICHT",
};

export const almostNormalSudokuRulesApply: Translatable = {
    [LanguageCode.en]: "Standard (almost) sudoku rules apply",
    [LanguageCode.ru]: "Стандартные (почти) правила судоку",
    [LanguageCode.de]: "Es gelten (fast) normale Sudoku-Regeln",
};

export const chaosConstructionRulesApply: Translatable = {
    [LanguageCode.en]:
        "Regions must be connected and determined by the solver (draw the region borders to complete the puzzle)",
    [LanguageCode.ru]:
        "Области должны быть связаны и определены Вами (нарисуйте границы регионов, чтобы завершить судоку)",
    [LanguageCode.de]: "Es müssen zusätzlich zu den Ziffern auch neun zusammenhängende Regionen gefunden werden",
};

export const toroidalRulesApply: Translatable = {
    [LanguageCode.en]: "The grid is toroidal: the top connects to the bottom, the left connects to the right",
    [LanguageCode.ru]: "Поле имеет форму тора: верх соединяется с низом, левая часть соединяется с правой",
    [LanguageCode.de]:
        "Das Rätselgitter ist ein Torus-Gitter: Die Oberseite ist mit der Unterseite verbunden, die Linke ist mit der Rechten verbunden",
};

export const normalYinYangRulesApply: Translatable = {
    [LanguageCode.en]: "Standard Yin Yang rules apply",
    [LanguageCode.ru]: "Стандартные правила инь-янь",
    [LanguageCode.de]: "Es gelten die üblichen Yin-Yang-Regeln",
};

export const normalYinYangRulesExplained: Translatable = {
    [LanguageCode.en]:
        "Shade some cells in the grid such that all shaded cells are connected and all unshaded cells are connected. No 2x2 box may be fully shaded or fully unshaded",
    [LanguageCode.ru]:
        "Заштрихуйте некоторые ячейки в сетке так, чтобы и все заштрихованные, и все незаштрихованные ячейки образовывали одну ортогонально связанную область, и не было полностью заштрихованного или незаштрихованного блока 2x2",
    [LanguageCode.de]:
        "Schattieren Sie einige Zellen im Raster, sodass alle schattierten Zellen verbunden und alle nicht schattierten Zellen verbunden sind. Keine 2x2-Box darf vollständig beschattet oder vollständig unverschattet sein",
};

export const moveButtonTip: Translatable = {
    [LanguageCode.en]: 'Use the "move" button or the arrow keys to move the grid',
    [LanguageCode.ru]: "Используйте кнопку «двигать» или стрелки, чтобы двигать поле",
    [LanguageCode.de]:
        'Verwenden Sie die Schaltfläche "Verschieben" oder die Pfeiltasten, um das Raster zu verschieben',
};

export const antiKnight: Translatable = {
    [LanguageCode.en]: "Anti-knight",
    [LanguageCode.ru]: '"Анти-конь"',
    [LanguageCode.de]: "Anti-Ritter",
};

export const antiKnightRulesApply: Translatable = {
    [LanguageCode.en]: "Anti-knight sudoku rules apply",
    [LanguageCode.ru]: 'Правила судоку "анти-конь"',
    [LanguageCode.de]: "Es gelten die Anti-Ritter-Sudoku-Regeln",
};

export const antiKnightRulesExplained: Translatable = {
    [LanguageCode.en]: "Cells a knight's move apart cannot contain the same digit",
    [LanguageCode.ru]: "Клетки, разделенные ходом коня, не могут содержать одну и ту же цифру",
    [LanguageCode.de]: "Zellen, die einen Ritterzug voneinander entfernt sind, dürfen nicht dieselbe Ziffer enthalten",
};

export const antiBishopFromCenterRulesExplained: Translatable = {
    [LanguageCode.en]: "Cells a bishop's move from a box's center cell cannot contain that center cell's digit",
    [LanguageCode.ru]: "Клетки, находящиеся в ходе слона от центра региона, не могут содержать цифру из центра",
    [LanguageCode.de]:
        "Zellen, die ein Läufer von der Mittelzelle einer Box aus bewegt, dürfen die Ziffer dieser Mittelzelle nicht enthalten",
};

export const conventionalNotationsApply: Translatable = {
    [LanguageCode.en]: "Conventional notations for common constraints apply",
    [LanguageCode.ru]: "Традиционные знаки ограничений судоку",
    [LanguageCode.de]: "Es gelten die herkömmlichen Notationen für allgemeine Einschränkungen",
};

export const killerCagesTitle: Translatable = {
    [LanguageCode.en]: "Killer cages",
    [LanguageCode.ru]: "Клетки",
    [LanguageCode.de]: "Killerkäfige",
};

export const killerCagesExplained: Translatable = {
    [LanguageCode.en]: "Cells in cages must sum to the total given in the corner of the cage",
    [LanguageCode.ru]: "Сумма цифр в клетках равняется числу в углу клетки",
    [LanguageCode.de]: "Die Summe der Zellen in Käfigen muss die in der Ecke des Käfigs angegebene Summe ergeben",
};

export const cannotRepeatInCage: Translatable = {
    [LanguageCode.en]: "Digits cannot repeat within a cage",
    [LanguageCode.ru]: "Цифры не могут повторяться внутри клетки",
    [LanguageCode.de]: "Ziffern können sich innerhalb eines Käfigs nicht wiederholen",
};

export const arrowsTitle: Translatable = {
    [LanguageCode.en]: "Arrows",
    [LanguageCode.ru]: "Стрелки",
    [LanguageCode.de]: "Pfeile",
};

export const arrowsExplained: Translatable = {
    [LanguageCode.en]: "Digits along an arrow sum to the number in the circle",
    [LanguageCode.ru]: "Сумма цифр, расположенных вдоль стрелок, равняется цифре в кружке",
    [LanguageCode.de]: "Die Summe der Ziffern entlang eines Pfeils ergibt die Zahl im Kreis",
};

export const canRepeatOnArrows: Translatable = {
    [LanguageCode.en]: "Digits can repeat along arrows if allowed by other rules",
    [LanguageCode.ru]: "Цифры вдоль стрелок могут повторяться, если это разрешено остальными правилами",
    [LanguageCode.de]: "Ziffern können sich entlang von Pfeilen wiederholen, sofern andere Regeln dies zulassen",
};

export const twoDigitArrowCirclesExplained: Translatable = {
    [LanguageCode.en]: "Two-digit sums read from left to right or top to bottom",
    [LanguageCode.ru]: "Двузначные числа суммы читаются слева направо и сверху вниз",
    [LanguageCode.de]: "Zweistellige Summen werden von links nach rechts oder von oben nach unten gelesen",
};

export const thermometersTitle: Translatable = {
    [LanguageCode.en]: "Thermometers",
    [LanguageCode.ru]: "Термометры",
    [LanguageCode.de]: "Thermometer",
};

export const thermometersExplained: Translatable = {
    [LanguageCode.en]: "Along thermometers, digits must increase from the bulb end",
    [LanguageCode.ru]: 'Цифры возрастают вдоль термометров, начиная с "колбы"',
    [LanguageCode.de]: "Ziffern entlang eines Thermometers steigen vom Kolben aus an",
};

export const inequalitySignsExplained: Translatable = {
    [LanguageCode.en]: "Inequality signs point to the smaller digit",
    [LanguageCode.ru]: "Знаки неравенства указывают на меньшую цифру",
    [LanguageCode.de]: "Ungleichheitszeichen zeigen auf die kleinere Ziffer",
};

export const kropkiDotsTitle: Translatable = {
    [LanguageCode.en]: "Kropki dots",
    [LanguageCode.ru]: "Точки Кропки",
    [LanguageCode.de]: "Kropki-Punkte",
};

export const whiteKropkiDotsExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by a white dot are consecutive",
    [LanguageCode.ru]: "Ячейки, разделенные белой точкой, содержат последовательные цифры",
    [LanguageCode.de]: "Durch einen weißen Punkt getrennte Zellen sind aufeinanderfolgend",
};

export const ratioDotsExplained = (colorTranslation: TranslationItem, ratio: string): Translatable =>
    processTranslations(
        (phrase, color) => phrase.replace("%1", color),
        {
            [LanguageCode.en]: `Cells separated by a %1 dot have a ratio of ${ratio}`,
            [LanguageCode.ru]: `Ячейки, разделенные %1 точкой, имеют соотношение ${ratio}`,
            [LanguageCode.de]: `Ziffern, die durch einen %1 Punkt verbunden sind, haben eine Relation von ${ratio}`,
        },
        colorTranslation,
    );

export const blackKropkiDotsExplained: Translatable = ratioDotsExplained(
    {
        [LanguageCode.en]: "black",
        [LanguageCode.ru]: "чёрной",
        [LanguageCode.de]: "schwarzen",
    },
    "1:2",
);

export const allDotsGiven: Translatable = {
    [LanguageCode.en]: "All dots are given",
    [LanguageCode.ru]: "Все точки даны",
    [LanguageCode.de]: "Alle Punkte sind vergeben",
};

export const notAllDotsGiven: Translatable = {
    [LanguageCode.en]: "Not all possible dots are necessarily given (no negative constraint)",
    [LanguageCode.ru]: "Не все возможные точки присутствуют на поле",
    [LanguageCode.de]: "Nicht alle möglichen Punkte sind gegeben (keine negative Einschränkung)",
};

export const xExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by X must sum to 10",
    [LanguageCode.ru]: "Сумма цифр, разделённых знаком X, равна 10",
    [LanguageCode.de]: "Durch X getrennte Zellen müssen in der Summe 10 ergeben",
};

export const vExplained: Translatable = {
    [LanguageCode.en]: "Cells separated by V must sum to 5",
    [LanguageCode.ru]: "Сумма цифр, разделённых знаком V, равна 5",
    [LanguageCode.de]: "Durch V getrennte Zellen müssen in der Summe 5 ergeben",
};

export const germanWhispersTitle: Translatable = {
    [LanguageCode.en]: "German whispers",
    [LanguageCode.ru]: '"Немецкий шёпот"',
    [LanguageCode.de]: "Deutsches Flüstern",
};

export const germanWhispersExplained = (noColor = false): Translatable => ({
    [LanguageCode.en]: `Consecutive digits along the ${noColor ? "" : "green"} line must have difference of 5 or more`,
    [LanguageCode.ru]: `Последовательные цифры вдоль ${noColor ? "" : "зеленой"} линии должны различаться на 5 или более`,
    [LanguageCode.de]: `Aufeinanderfolgende Ziffern entlang der ${noColor ? "" : "grünen"} Linie müssen einen Unterschied von 5 oder mehr aufweisen`,
});

export const evenTitle: Translatable = {
    [LanguageCode.en]: "Even digits",
    [LanguageCode.ru]: "Четные цифры",
    [LanguageCode.de]: "Gerade Ziffern",
};

export const evenExplained: Translatable = {
    [LanguageCode.en]: "Grey squares are even digits",
    [LanguageCode.ru]: "В серых квадратах находятся чётные цифры",
    [LanguageCode.de]: "Graue Quadrate sind gerade Ziffern",
};

export const oddTitle: Translatable = {
    [LanguageCode.en]: "Odd digits",
    [LanguageCode.ru]: "Нечетные цифры",
    [LanguageCode.de]: "Ungerade Ziffern",
};

export const oddExplained: Translatable = {
    [LanguageCode.en]: "Grey circles are odd digits",
    [LanguageCode.ru]: "В серых кругах находятся нечётные цифры",
    [LanguageCode.de]: "Graue Kreise sind ungerade Ziffern",
};

export const renbanTitle: Translatable = {
    [LanguageCode.en]: "Renban lines",
    [LanguageCode.ru]: 'Линии "Ренбан"',
    [LanguageCode.de]: "Renban-Linien",
};

export const renbanExplained = (noColor = false): Translatable => ({
    [LanguageCode.en]: `Digits along the ${noColor ? "" : "purple"} line must form a set of consecutive digits in any order`,
    [LanguageCode.ru]: `Цифры вдоль ${noColor ? "" : "фиолетовой"} линии должны образовывать набор последовательных цифр в любом порядке`,
    [LanguageCode.de]: `Die Ziffern entlang der ${noColor ? "" : "violetten"} Linie müssen in beliebiger Reihenfolge eine Reihe aufeinanderfolgender Ziffern bilden`,
});

export const tenLineTitle: Translatable = {
    [LanguageCode.en]: "Ten lines",
    [LanguageCode.ru]: "Линии-десятки",
    [LanguageCode.de]: "10-Linien",
};

export const tenLineExplained = (
    color: TranslationItem | false = {
        [LanguageCode.en]: "grey",
        [LanguageCode.ru]: "Серая",
        [LanguageCode.de]: "graue",
    },
): Translatable => {
    color = color || {
        [LanguageCode.en]: "",
        [LanguageCode.ru]: "",
        [LanguageCode.de]: "",
    };
    return {
        [LanguageCode.en]: `The ${color[LanguageCode.en]} line must be entirely divided into non-overlapping groups of cells along the line that sum to 10`,
        [LanguageCode.ru]: `${color[LanguageCode.ru]} линия должна быть полностью разделена на непересекающиеся группы ячеек вдоль линии, сумма которых равна 10`,
        [LanguageCode.de]: `Die ${color[LanguageCode.de]} Linie muss entlang der Linie vollständig in nicht überlappende Gruppen von Zellen unterteilt sein, die insgesamt 10 ergeben`,
    };
};

export const inBetweenLineTitle: Translatable = {
    [LanguageCode.en]: "Between lines",
    [LanguageCode.ru]: "Серединные линии",
    [LanguageCode.de]: "Zwischenzeilen",
};

export const inBetweenLineExplained: Translatable = {
    [LanguageCode.en]: "Digits along the grey line must be strictly in between of digits on the circles",
    [LanguageCode.ru]: "Цифры на серой линии должны быть строго между цифрами на кружках",
    [LanguageCode.de]: "Die Ziffern entlang der grauen Linie müssen genau zwischen den Ziffern der Kreise liegen",
};

export const parityLineTitle: Translatable = {
    [LanguageCode.en]: "Parity line",
    [LanguageCode.ru]: "Линия чётности",
    [LanguageCode.de]: "Paritätslinie",
};

export const sameParityLineExplained = (noColor = false): Translatable => ({
    [LanguageCode.en]: `Digits along the ${noColor ? "" : "peach"} line must be either all even or all odd`,
    [LanguageCode.ru]: `Цифры вдоль ${noColor ? "" : "персиковой"} линии должны быть либо все чётные, либо все нечётные`,
    [LanguageCode.de]: `Die Ziffern entlang der ${noColor ? "Linie" : "Pfirsichlinie"} müssen entweder alle gerade oder alle ungerade sein`,
});

export const littleKillerTitle: Translatable = {
    [LanguageCode.en]: "Little killer",
    [LanguageCode.ru]: "Диагонали",
    [LanguageCode.de]: "Kleiner Killer",
};

export const littleKillerExplained: Translatable = {
    [LanguageCode.en]: "Digits along indicated diagonals must sum to the given total",
    [LanguageCode.ru]: "Цифры на указанных диагоналях должны иметь обозначенную сумму",
    [LanguageCode.de]: "Die Summe der Ziffern entlang der angegebenen Diagonalen muss die angegebene Summe ergeben",
};

export const loopRulesApply: Translatable = {
    [LanguageCode.en]: "Draw a non-intersecting loop through the centers of some empty cells",
    [LanguageCode.ru]: "Нарисуйте непересекающуюся петлю через центры некоторых пустых ячеек",
    [LanguageCode.de]:
        "Zeichnen Sie eine sich nicht überschneidende Schleife durch die Mittelpunkte einiger leerer Zellen",
};

export const tapCluesApply = (maxNeighborsCount = 8): Translatable => ({
    [LanguageCode.en]: `Clues represent the numbers of consecutive cells occupied by the loop each time it enters the (up to) ${maxNeighborsCount} cells surrounding the clue`,
    [LanguageCode.ru]: `Подсказки указывают на количество последовательных ячеек, занимаемых петлей каждый раз, когда она проходит через (до) ${maxNeighborsCount} ячеек, окружающих подсказку`,
    [LanguageCode.de]: `Hinweise stellen die Anzahl aufeinanderfolgender Zellen dar, die von der Schleife jedes Mal belegt werden, wenn sie in die (bis zu) ${maxNeighborsCount} Zellen rund um den Hinweis eintritt`,
});

export const livesRules = (initialLives: number): Translatable => ({
    [LanguageCode.en]: `You have ${initialLives} lives to solve the puzzle. It takes 1 life to enter a wrong digit`,
    [LanguageCode.ru]: `У Вас есть ${initialLives} жизней на решение этого судоку. Одна жизнь отнимается при вводе неправильной цифры`,
    [LanguageCode.de]: `Sie haben ${initialLives} Leben, um das Rätsel zu lösen. Es dauert 1 Leben, eine falsche Ziffer einzugeben`,
});

export const noGuessingRequired: Translatable = {
    [LanguageCode.en]: "Note: no guessing is required to finish the puzzle",
    [LanguageCode.ru]: "Примечание: чтобы решить головоломку, не требуется никаких угадываний",
    [LanguageCode.de]: "Hinweis: Zum Lösen des Rätsels ist kein Raten erforderlich",
};

export const noBifurcation: Translatable<ReactNode> = {
    [LanguageCode.en]: (
        <>
            And the most important rule: <strong>try using bifurcation as little as possible</strong> ;)
        </>
    ),
    [LanguageCode.ru]: (
        <>
            И самое важное правило: <strong>старайтесь использовать технику раздвоения как можно меньше</strong> ;)
        </>
    ),
    [LanguageCode.de]: (
        <>
            Und die wichtigste Regel: <strong>Versuchen Sie, die Bifurkation so selten wie möglich einzusetzen</strong>{" "}
            ;)
        </>
    ),
};
