import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../../types/translations/Translatable";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {
    createMonumentValleyFieldSize,
    MonumentValleyTypeManager,
    parseMonumentValleyDigitsMap
} from "../../sudokuTypes/monument-valley/types/MonumentValleyTypeManager";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import React from "react";

const author: PartiallyTranslatable = {
    [LanguageCode.en]: "TrevorTao",
};

const rules = (validDigits: string): PartiallyTranslatable => ({
    [LanguageCode.en]: `
        Fill cells with digits ${validDigits} so that each of the three subgrids forms a valid Sudoku.
        Use the panel or the keyboard shortcuts to enter rotated digits.
    `,
});

export const MonumentValley: PuzzleDefinition<number> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Monument Valley Sudoku",
    },
    author,
    slug: "monument-valley-sudoku",
    typeManager: MonumentValleyTypeManager,
    fieldSize: createMonumentValleyFieldSize(9, 3),
    digitsCount: 9,
    rules: (translate) => <RulesParagraph>{translate(rules("0 1 6 8 9"))}</RulesParagraph>,
    initialDigits: parseMonumentValleyDigitsMap({
        0: {
            4: 8.5,
            16: 9,
        },
        1: {
            0: 0,
            2: 8,
            3: 6.5,
            8: 9,
            16: 6.5,
            20: 9.5,
        },
        2: {
            1: 1.5,
            15: 8.5,
            20: 1.5,
        },
        3: {
            8: 8.5,
            15: 0,
            16: 9.5,
            18: 1.5,
            20: 9,
        },
        4: {
            0: 1,
            3: 9.5,
            5: 9,
            14: 6.5,
        },
        5: {
            0: 8,
            2: 9.5,
            5: 6.5,
            12: 1.5,
            17: 8,
            19: 6.5,
        },
        6: {
            1: 6.5,
            10: 0,
            16: 8.5,
            19: 1,
        },
        7: {
            5: 6,
            13: 8.5,
            16: 0,
            17: 9,
        },
        8: {
            2: 6,
            3: 0,
            4: 1.5,
            6: 6.5,
            17: 9.5,
            19: 8,
        },
        9: {
            12: 0,
        },
        10: {
            6: 9.5,
            7: 6,
            9: 9,
            12: 8.5,
            14: 1.5,
        },
        11: {
            6: 1.5,
            7: 8,
            9: 1,
            13: 6,
        },
        12: {
            11: 6.5,
            12: 1.5,
        },
        13: {
            6: 8,
            7: 9.5,
            9: 8.5,
        },
        14: {
            9: 6,
            13: 9.5,
            14: 1,
        },
    }),
    resultChecker: isValidFinishedPuzzleByConstraints,
};

export const MonumentValleyMini: PuzzleDefinition<number> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Monument Valley Mini",
    },
    author,
    slug: "monument-valley-mini",
    typeManager: MonumentValleyTypeManager,
    fieldSize: createMonumentValleyFieldSize(5, 1, 2),
    hideRegionBorders: true,
    digitsCount: 5,
    rules: (translate) => <RulesParagraph>{translate(rules("0 1 8"))}</RulesParagraph>,
    initialDigits: parseMonumentValleyDigitsMap({
        0: {
            2: 1,
            8: 1,
        },
        1: {
            1: 0,
            9: 0,
        },
        2: {
            0: 8,
            10: 8.5,
        },
        3: {
            1: 8,
            9: 1,
        },
        4: {
            2: 0,
            8: 8.5
        },
        5: {
            3: 1.5,
            7: 8,
        },
        6: {
            4: 0,
            6: 8,
        },
        7: {
            5: 1,
        },
    }),
    resultChecker: isValidFinishedPuzzleByConstraints,
};
