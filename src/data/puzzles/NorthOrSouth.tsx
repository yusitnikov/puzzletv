import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {XMarkConstraint} from "../../components/sudoku/constraints/x-mark/XMark";
import {KropkiDotConstraint} from "../../components/sudoku/constraints/kropki-dot/KropkiDot";
import React from "react";
import {ThermometerConstraint} from "../../components/sudoku/constraints/thermometer/Thermometer";
import {ArrowConstraint} from "../../components/sudoku/constraints/arrow/Arrow";
import {GermanWhispersConstraint} from "../../components/sudoku/constraints/german-whispers/GermanWhispers";
import {KillerCageConstraint} from "../../components/sudoku/constraints/killer-cage/KillerCage";
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
import {AntiKnightConstraint} from "../../types/sudoku/constraints/AntiKnight";

export const NorthOrSouth: PuzzleDefinition<RotatableDigit, RotatableGameState, RotatableProcessedGameState> = {
    title: {
        [LanguageCode.en]: "North or South?",
        [LanguageCode.ru]: "Север или юг?",
    },
    slug: "north-or-south",
    author: Chameleon,
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(rotatableSudokuRules)}</RulesParagraph>
        <RulesParagraph>{translate(antiKnightRulesApply)}: {translate(antiKnightRulesExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
        <RulesUnorderedList>
            <li>{translate(killerCages)}.</li>
            <li>{translate(arrows)}.</li>
            <li>{translate(thermometers)}.</li>
            <li>{translate(kropkiDotsTitle)}: {translate(blackKropkiDotsExplained)}.</li>
            <li>XV: {translate(xExplained)}.</li>
            <li>{translate(germanWhispers)}.</li>
        </RulesUnorderedList>
        <RulesParagraph>{translate(noBifurcation)}</RulesParagraph>
    </>,
    typeManager: RotatableDigitSudokuTypeManager,
    fieldSize: FieldSize9,
    initialDigits: {
        0: {
            0: {digit: 6},
        },
        4: {
            2: {digit: 6},
        },
        5: {
            0: {digit: 9},
        },
        8: {
            4: {digit: 5},
            5: {digit: 2},
        },
    },
    items: [
        AntiKnightConstraint,
        ThermometerConstraint("R2C8", "R3C7"),
        ThermometerConstraint("R1C2", "R2C2"),
        ArrowConstraint("R5C9", ["R5C7", "R4C7"]),
        GermanWhispersConstraint("R2C6", "R3C5", "R3C8"),
        KillerCageConstraint(["R5C1", "R5C2", "R6C1"], 12, true),
        KillerCageConstraint(["R8C6", "R8C7", "R9C5", "R9C6"], 22, true),
        XMarkConstraint("R8C7", "R8C8"),
        KropkiDotConstraint("R7C8", "R8C8", true),
        XMarkConstraint("R7C8", "R7C9"),
    ],
};
