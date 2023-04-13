import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {CubedokuTypeManager} from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {
    cubedokuIndexingDetails,
    cubedokuIndexingRules,
    cubedokuNormalSudokuRules
} from "../../sudokuTypes/cubedoku/data/ruleSnippets";
import {ThermometerConstraint} from "../../components/sudoku/constraints/thermometer/Thermometer";
import {thermometersExplained} from "../ruleSnippets";
import {parsePositionLiterals2} from "../../types/layout/Position";
import {CubedokuIndexingConstraint} from "../../sudokuTypes/cubedoku/constraints/CubedokuIndexing";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {createCubeFieldSize, createCubeRegions} from "../../sudokuTypes/cube/types/CubeTypeManager";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

const Andrewsarchus = {
    [LanguageCode.en]: "Andrewsarchus",
};
const Chilly = {
    [LanguageCode.en]: "Chilly",
};

export const IntroToCubedoku: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Intro to Cubedoku",
        [LanguageCode.ru]: "Введение в кубдоку",
    },
    author: Andrewsarchus,
    slug: "intro-to-cubedoku",
    typeManager: CubedokuTypeManager,
    fieldSize: createCubeFieldSize(4),
    regions: [
        ...parsePositionLiterals2([
            ["R1C1", "R2C1", "R3C1", "R4C1"],
            ["R1C2", "R2C2", "R1C3", "R2C3"],
            ["R3C2", "R4C2", "R3C3", "R4C3"],
            ["R1C4", "R2C4", "R3C4", "R4C4"],
        ]),
        ...createCubeRegions(4, 2).slice(4),
    ],
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
    items: [
        CubedokuIndexingConstraint(),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};

export const CubeIt: PuzzleDefinition<NumberPTM> = {
    title: {
        [LanguageCode.en]: "Cube It",
    },
    author: Chilly,
    slug: "chilly-cbit",
    typeManager: CubedokuTypeManager,
    fieldSize: createCubeFieldSize(5),
    regions: parsePositionLiterals2([
        ["R1C1", "R1C2", "R1C3", "R1C4", "R2C4"],
        ["R1C5", "R2C5", "R3C5", "R4C4", "R4C5"],
        ["R2C1", "R2C2", "R3C1", "R4C1", "R5C1"],
        ["R2C3", "R3C2", "R3C3", "R3C4", "R4C3"],
        ["R4C2", "R5C2", "R5C3", "R5C4", "R5C5"],

        ["R6C1", "R6C2", "R6C3", "R6C4", "R7C3"],
        ["R6C5", "R7C5", "R8C5", "R9C4", "R9C5"],
        ["R7C1", "R7C2", "R8C1", "R9C1", "R10C1"],
        ["R7C4", "R8C2", "R8C3", "R8C4", "R9C2"],
        ["R9C3", "R10C2", "R10C3", "R10C4", "R10C5"],

        ["R6C6", "R7C6", "R8C6", "R8C7", "R9C6"],
        ["R6C7", "R6C8", "R6C9", "R6C10", "R7C7"],
        ["R7C8", "R8C8", "R8C9", "R9C7", "R9C8"],
        ["R7C9", "R7C10", "R8C10", "R9C10", "R10C10"],
        ["R9C9", "R10C6", "R10C7", "R10C8", "R10C9"],
    ]),
    digitsCount: 5,
    rules: translate => <>
        <RulesParagraph>{translate(cubedokuNormalSudokuRules(5))}.</RulesParagraph>
        <RulesParagraph>{translate(cubedokuIndexingRules)}.</RulesParagraph>
        <RulesParagraph>{translate(cubedokuIndexingDetails)}.</RulesParagraph>
        <RulesParagraph>{translate(thermometersExplained)}.</RulesParagraph>
    </>,
    items: [
        ThermometerConstraint(["R5C1", "R3C1"]),
        ThermometerConstraint(["R4C2", "R4C4"]),
        ThermometerConstraint(["R8C3", "R5C3"]),
        ThermometerConstraint(["R6C8", "R7C9"]),
        CubedokuIndexingConstraint(),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};
