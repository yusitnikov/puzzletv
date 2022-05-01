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
import {Thermometer} from "../../components/sudoku/figures/thermometer/Thermometer";
import {thermometersExplained} from "../ruleSnippets";

const regularFieldSize4 = createCubedokuFieldSize(4, 2);
const regularFieldSize5 = createCubedokuFieldSize(5, 1);

const Andrewsarchus = {
    [LanguageCode.en]: "Andrewsarchus",
};
const Chilly = {
    [LanguageCode.en]: "Chilly",
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

export const CubeIt: PuzzleDefinition<number> = {
    title: {
        [LanguageCode.en]: "Cube It",
    },
    author: Chilly,
    slug: "chilly-cbit",
    typeManager: CubedokuTypeManager,
    fieldSize: {
        ...regularFieldSize5,
        regions: [
            [
                [0, 0],
                [4, 0],
                [4, 2],
                [3, 2],
                [3, 1],
                [0, 1],
            ],
            [
                [4, 0],
                [5, 0],
                [5, 4],
                [3, 4],
                [3, 3],
                [4, 3],
            ],
            [
                [0, 1],
                [2, 1],
                [2, 2],
                [1, 2],
                [1, 5],
                [0, 5],
            ],
            [
                [1, 3],
                [2, 3],
                [2, 4],
                [5, 4],
                [5, 5],
                [1, 5],
            ],
            [
                [2, 1],
                [3, 1],
                [3, 2],
                [4, 2],
                [4, 3],
                [3, 3],
                [3, 4],
                [2, 4],
                [2, 3],
                [1, 3],
                [1, 2],
                [2, 2],
            ],

            [
                [0, 5],
                [4, 5],
                [4, 6],
                [3, 6],
                [3, 7],
                [2, 7],
                [2, 6],
                [0, 6],
            ],
            [
                [4, 5],
                [5, 5],
                [5, 9],
                [3, 9],
                [3, 8],
                [4, 8],
            ],
            [
                [0, 6],
                [2, 6],
                [2, 7],
                [1, 7],
                [1, 10],
                [0, 10],
            ],
            [
                [2, 8],
                [3, 8],
                [3, 9],
                [5, 9],
                [5, 10],
                [1, 10],
                [1, 9],
                [2, 9],
            ],
            [
                [3, 6],
                [4, 6],
                [4, 8],
                [2, 8],
                [2, 9],
                [1, 9],
                [1, 7],
                [3, 7],
            ],

            [
                [5, 5],
                [6, 5],
                [6, 7],
                [7, 7],
                [7, 8],
                [6, 8],
                [6, 9],
                [5, 9],
            ],
            [
                [6, 5],
                [10, 5],
                [10, 6],
                [7, 6],
                [7, 7],
                [6, 7],
            ],
            [
                [8, 6],
                [10, 6],
                [10, 10],
                [9, 10],
                [9, 7],
                [8, 7],
            ],
            [
                [5, 9],
                [8, 9],
                [8, 8],
                [9, 8],
                [9, 10],
                [5, 10],
            ],
            [
                [7, 6],
                [8, 6],
                [8, 7],
                [9, 7],
                [9, 8],
                [8, 8],
                [8, 9],
                [6, 9],
                [6, 8],
                [7, 8],
            ],
        ],
    },
    digitsCount: 5,
    rules: translate => <>
        <RulesParagraph>{translate(cubedokuNormalSudokuRules(5))}.</RulesParagraph>
        <RulesParagraph>{translate(cubedokuIndexingRules)}.</RulesParagraph>
        <RulesParagraph>{translate(cubedokuIndexingDetails)}.</RulesParagraph>
        <RulesParagraph>{translate(thermometersExplained)}.</RulesParagraph>
    </>,
    items: <>
        <Thermometer points={[
            [1, 5],
            [1, 3],
        ]}/>

        <Thermometer points={[
            [2, 4],
            [4, 4],
        ]}/>

        <Thermometer points={[
            [3, 8],
            [3, 5],
        ]}/>

        <Thermometer points={[
            [8, 6],
            [9, 7],
        ]}/>
    </>,
    resultChecker: (gameState) => areSameGivenDigitsMaps(
        CubedokuTypeManager,
        mergeGivenDigitsMaps(gameStateGetCurrentGivenDigits(gameState), IntroToCubedoku.initialDigits!),
        createGivenDigitsMapFromArray([
            [5, 3, 4, 1, 2],
            [4, 5, 1, 2, 3],
            [3, 4, 2, 5, 1],
            [2, 1, 3, 4, 5],
            [1, 2, 5, 3, 4],
            [1, 2, 4, 5, 3, 5, 4, 1, 3, 2],
            [2, 1, 3, 4, 5, 4, 5, 3, 2, 1],
            [3, 5, 2, 1, 4, 2, 3, 5, 1, 4],
            [4, 3, 5, 2, 1, 1, 2, 4, 5, 3],
            [5, 4, 1, 3, 2, 3, 1, 2, 4, 5],
        ]),
    ),
};
