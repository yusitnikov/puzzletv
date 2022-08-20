import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {Chameleon} from "../authors";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {
    antiKnightRulesExplained,
    cannotRepeatInCage,
    killerCagesExplained,
    normalSudokuRulesApply
} from "../ruleSnippets";
import React from "react";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {
    KillerCageConstraint,
    KillerCageConstraintByRect
} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {AntiKnightConstraint} from "../../types/sudoku/constraints/AntiKnight";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {PlainValueSet, SetInterface} from "../../types/struct/Set";
import {CellColor} from "../../types/sudoku/CellColor";
import {indexes} from "../../utils/indexes";

const correctAnswer: number[][] = [
    [9, 4, 5, 1, 8, 6, 7, 3, 2],
    [1, 6, 2, 5, 3, 7, 9, 8, 4],
    [3, 8, 7, 9, 4, 2, 1, 6, 5],
    [2, 5, 8, 7, 9, 4, 3, 1, 6],
    [4, 1, 3, 2, 6, 8, 5, 9, 7],
    [6, 7, 9, 3, 1, 5, 2, 4, 8],
    [7, 9, 4, 8, 5, 1, 6, 2, 3],
    [5, 3, 6, 4, 2, 9, 8, 7, 1],
    [8, 2, 1, 6, 7, 3, 4, 5, 9],
];

export const TheOnlyThingThatMatters: PuzzleDefinition<number> = {
    title: {
        [LanguageCode.en]: "The only thing that matters",
        [LanguageCode.ru]: "Важно лишь это",
    },
    author: Chameleon,
    slug: "the-only-thing-that-matters",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(killerCagesExplained)}. {translate(cannotRepeatInCage)}.</RulesParagraph>
        <RulesParagraph>{translate(antiKnightRulesExplained)}.</RulesParagraph>
    </>,
    initialDigits: {0: {2: 5, 6: 7}},
    items: [
        AntiKnightConstraint,
        KillerCageConstraintByRect("R2C1", 1, 3, 6),
        KillerCageConstraintByRect("R2C4", 3, 1, 15),
        KillerCageConstraintByRect("R2C9", 1, 3, 15),
        KillerCageConstraintByRect("R5C1", 3, 1, 8),
        KillerCageConstraintByRect("R5C5", 1, 2, 7),
        KillerCageConstraintByRect("R5C7", 3, 1, 21),
        KillerCageConstraintByRect("R7C5", 1, 2, 7),
        KillerCageConstraintByRect("R9C3", 2, 1, 7),
        KillerCageConstraintByRect("R9C6", 2, 1, 7),
        KillerCageConstraint(["R3C3", "R3C4", "R4C3"], 24),
        KillerCageConstraint(["R3C6", "R3C7", "R4C7"], 6),
        KillerCageConstraint(["R6C3", "R7C3", "R7C4"], 21),
        KillerCageConstraint(["R6C7", "R7C6", "R7C7"], 9),
        KillerCageConstraint(["R8C1", "R9C1", "R9C2"], 15),
        KillerCageConstraint(["R8C9", "R9C8", "R9C9"], 15),
    ],
    allowDrawing: ["center-mark"],
    resultChecker: context => {
        if (isValidFinishedPuzzleByConstraints(context)) {
            return true;
        }

        // Get current field colors
        const fieldColors = gameStateGetCurrentFieldState(context.state)
            .cells
            .map((row) => row.map(({colors}) => colors));

        // Check that cells with the same digit contain the same set of colors
        const groupsColors: SetInterface<CellColor>[] = indexes(9).map(() => new PlainValueSet<CellColor>());
        for (const [top, row] of fieldColors.entries()) {
            for (const [left, cellColors] of row.entries()) {
                // Check that all cells have a color
                if (cellColors.size === 0) {
                    return false;
                }

                const groupIndex = correctAnswer[top][left] - 1;

                if (groupsColors[groupIndex].size === 0) {
                    groupsColors[groupIndex] = cellColors;
                    continue;
                }

                if (!groupsColors[groupIndex].equals(cellColors)) {
                    return false;
                }
            }
        }

        for (const [groupIndex1, groupColors1] of groupsColors.entries()) {
            for (const [groupIndex2, groupColors2] of groupsColors.entries()) {
                if (groupIndex2 > groupIndex1 && Math.floor(groupIndex1 / 3) !== Math.floor(groupIndex2 / 3) && groupColors1.equals(groupColors2)) {
                    return false;
                }
            }
        }

        return {
            isCorrectResult: true,
            resultPhrase: {
                [LanguageCode.en]: [
                    "Congratulations, you solved the puzzle!",
                    "No-one cares about the digits.",
                    "Fully-colored grid is just enough.",
                    "In the end, it's the only thing that matters.",
                ].join("\n"),
                [LanguageCode.ru]: [
                    "Поздравляю, Вы решили судоку!",
                    "Никого не интересуют цифры.",
                    "Полностью разукрашенного поля вполне достаточно.",
                    "В конце концов, лишь это важно.",
                ].join("\n"),
            },
        };
    },
};
