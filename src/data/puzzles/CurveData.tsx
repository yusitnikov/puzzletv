import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {XMark} from "../../components/sudoku/figures/x-mark/XMark";
import {KropkiDot} from "../../components/sudoku/figures/kropki-dot/KropkiDot";
import React from "react";
import {Thermometer} from "../../components/sudoku/figures/thermometer/Thermometer";
import {Arrow} from "../../components/sudoku/figures/arrow/Arrow";
import {GermanWhispers} from "../../components/sudoku/figures/german-whispers/GermanWhispers";
import {KillerCage} from "../../components/sudoku/figures/killer-cage/KillerCage";
import {RulesUnorderedList} from "../../components/sudoku/rules/RulesUnorderedList";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {RotatableDigit} from "../../sudokuTypes/rotatable/types/RotatableDigit";
import {RotatableDigitSudokuTypeManager} from "../../sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager";
import {RotatableGameState, RotatableProcessedGameState} from "../../sudokuTypes/rotatable/types/RotatableGameState";
import {FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {Chameleon} from "../authors";
import {
    antiKnightRulesApply,
    antiKnightRulesExplained,
    arrows,
    blackKropkiDotsExplained,
    conventionalNotationsApply,
    germanWhispers,
    killerCages,
    kropkiDotsTitle,
    noBifurcation,
    normalSudokuRulesApply,
    thermometers,
    xExplained
} from "../ruleSnippets";
import {rotatableSudokuRules} from "../../sudokuTypes/rotatable/data/ruleSnippets";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {CalculatorDigitComponentType} from "../../components/sudoku/digit/CalculatorDigit";

export const CurveData: PuzzleDefinition<number> = {
    title: {
        [LanguageCode.en]: "TBD",
    },
    slug: "curve-data",
    author: Chameleon,
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
    </>,
    typeManager: DigitSudokuTypeManager(CalculatorDigitComponentType),
    fieldSize: FieldSize9,
    initialDigits: {
        // 0: {
        //     0: 1,
        // },
    },
    // items: <>
    // </>,
};
