import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { PartiallyTranslatable } from "../../types/translations/Translatable";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import {
    createMonumentValleyGridSize,
    createMonumentValleyRegions,
    MonumentValleyTypeManager,
    parseMonumentValleyDigitsMap,
} from "../../puzzleTypes/monument-valley/types/MonumentValleyTypeManager";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import React from "react";
import { MonumentValleyGridBordersConstraint } from "../../puzzleTypes/monument-valley/components/MonumentValleyGridBorders";
import { MonumentValleyPTM } from "../../puzzleTypes/monument-valley/types/MonumentValleyPTM";
import { translate } from "../../utils/translate";

const author: PartiallyTranslatable = {
    [LanguageCode.en]: "TrevorTao",
};

const rules = (validDigits: string) =>
    translate({
        [LanguageCode.en]: `
        Fill cells with digits ${validDigits} so that each of the three subgrids forms a valid Sudoku.
        All non-zero digits can be rotated by 90 degrees.
    `,
    });

export const MonumentValley: PuzzleDefinition<MonumentValleyPTM> = {
    extension: {},
    title: {
        [LanguageCode.en]: "Monument Valley Sudoku",
    },
    author,
    slug: "monument-valley-sudoku",
    saveStateKey: "monument-valley-sudoku-v2",
    typeManager: MonumentValleyTypeManager,
    gridSize: createMonumentValleyGridSize(9, 3),
    regions: createMonumentValleyRegions(9, 3),
    maxDigit: 9,
    rules: () => <RulesParagraph>{rules("0 1 6 8 9")}</RulesParagraph>,
    items: [MonumentValleyGridBordersConstraint()],
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

export const MonumentValleyMini: PuzzleDefinition<MonumentValleyPTM> = {
    extension: {},
    title: {
        [LanguageCode.en]: "Monument Valley Mini",
    },
    author,
    slug: "monument-valley-mini",
    saveStateKey: "monument-valley-mini-v2",
    typeManager: MonumentValleyTypeManager,
    gridSize: createMonumentValleyGridSize(5, 1, 2),
    maxDigit: 5,
    rules: () => <RulesParagraph>{rules("0 1 8")}</RulesParagraph>,
    items: [MonumentValleyGridBordersConstraint()],
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
            8: 8.5,
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
