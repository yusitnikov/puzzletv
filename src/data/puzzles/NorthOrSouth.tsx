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
    items: <>
        <Thermometer points={[
            [7.5, 1.5],
            [6.5, 2.5],
        ]}/>

        <Thermometer points={[
            [1.5, 0.5],
            [1.5, 1.5],
        ]}/>

        <Arrow points={[
            [8.5, 4.5],
            [6.5, 4.5],
            [6.5, 3.5],
        ]}/>

        <GermanWhispers points={[
            [5.5, 1.5],
            [4.5, 2.5],
            [7.5, 2.5],
        ]}/>

        <KillerCage
            sum={12}
            bottomSumPointIndex={2}
            points={[
                [0, 4],
                [0, 6],
                [1, 6],
                [1, 5],
                [2, 5],
                [2, 4],
            ]}
        />

        <KillerCage
            sum={22}
            bottomSumPointIndex={4}
            points={[
                [5, 7],
                [5, 8],
                [4, 8],
                [4, 9],
                [6, 9],
                [6, 8],
                [7, 8],
                [7, 7],
            ]}
        />

        <XMark left={7} top={7.5}/>

        <KropkiDot cx={7.5} cy={7} isFilled={true}/>

        <XMark left={8} top={6.5}/>
    </>,
};
