import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {createCubedokuFieldSize, CubedokuTypeManager} from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import {
    areSameGivenDigitsMaps,
    createGivenDigitsMapFromArray,
    mergeGivenDigitsMaps
} from "../../types/sudoku/GivenDigitsMap";
import {gameStateGetCurrentGivenDigits} from "../../types/sudoku/GameState";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {
    cubedokuIndexingDetails,
    cubedokuIndexingRules,
    cubedokuNormalSudokuRules
} from "../../sudokuTypes/cubedoku/data/ruleSnippets";

const regularFieldSize4 = createCubedokuFieldSize(4, 2);

const Andrewsarchus = {
    [LanguageCode.en]: "Andrewsarchus",
};

export const IntroToCubedoku: PuzzleDefinition<number> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Intro to Cubedoku",
        [LanguageCode.ru]: "Введение в кубдоку",
    },
    author: Andrewsarchus,
    slug: "intro-to-cubedoku",
    typeManager: CubedokuTypeManager,
    fieldSize: {
        ...regularFieldSize4,
        regions: [
            ...regularFieldSize4.regions.slice(4),
            [
                [0, 0],
                [1, 0],
                [1, 4],
                [0, 4],
            ],
            [
                [1, 0],
                [3, 0],
                [3, 2],
                [1, 2],
            ],
            [
                [1, 2],
                [3, 2],
                [3, 4],
                [1, 4],
            ],
            [
                [3, 0],
                [4, 0],
                [4, 4],
                [3, 4],
            ],
        ],
    },
    digitsCount: 4,
    fieldMargin: 1,
    rules: translate => <>
        <RulesParagraph>{translate(cubedokuNormalSudokuRules(4))}.</RulesParagraph>
        <RulesParagraph>{translate(cubedokuIndexingRules)}.</RulesParagraph>
        <RulesParagraph>{translate(cubedokuIndexingDetails)}.</RulesParagraph>
    </>,
    initialDigits: {
        3: {
            3: 3,
        },
        5: {
            0: 4,
            4: 3,
        },
        7: {
            0: 1,
            7: 2,
        },
    },
    resultChecker: (gameState) => areSameGivenDigitsMaps(
        CubedokuTypeManager,
        mergeGivenDigitsMaps(gameStateGetCurrentGivenDigits(gameState), IntroToCubedoku.initialDigits!),
        createGivenDigitsMapFromArray([
            [2, 3, 4, 1],
            [3, 1, 2, 4],
            [1, 4, 3, 2],
            [4, 2, 1, 3],
            [2, 3, 1, 4, 2, 4, 3, 1],
            [4, 1, 3, 2, 3, 1, 2, 4],
            [3, 4, 2, 1, 1, 2, 4, 3],
            [1, 2, 4, 3, 4, 3, 1, 2],
        ]),
    ),
};
