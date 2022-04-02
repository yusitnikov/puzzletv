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

export default {
    title: "North or South?",
    author: "Chameleon",
    rules: <>
        <RulesParagraph>Normal sudoku rules apply.</RulesParagraph>
        <RulesParagraph><strong>The sudoku field can be rotated clockwise.</strong> It's not known in advance in which orientation the puzzle is solvable.</RulesParagraph>
        <RulesParagraph>Anti-knight sudoku rules apply: cells separated by a chess knight's move cannot contain the same digit.</RulesParagraph>
        <RulesParagraph>Conventional notations for common sudoku objects apply:</RulesParagraph>
        <RulesUnorderedList>
            <li>Killer cages: cells in cages must sum to the total given in the corner of each cage, digits cannot repeat within a cage.</li>
            <li>Arrows: digits along arrows sum to the numbers in the circles.</li>
            <li>Thermometers: along thermometers, digits must increase from the bulb end.</li>
            <li>Kropki dots: cells separated by a black dot have a ratio of 1:2.</li>
            <li>XV: cells separated by X must sum to 10.</li>
            <li>German whispers: consecutive digits along the green line must have difference of 5 or more.</li>
        </RulesUnorderedList>
        <RulesParagraph>And the most important rule: <strong>try using bifurcation as little as possible</strong> ;)</RulesParagraph>
    </>,
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
    backgroundItems: <>
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
    </>,
    topItems: <>
        <XMark left={7} top={7.5}/>

        <KropkiDot cx={7.5} cy={7} isFilled={true}/>

        <XMark left={8} top={6.5}/>
    </>,
} as PuzzleDefinition;
