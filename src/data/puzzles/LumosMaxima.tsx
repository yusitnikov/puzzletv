import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {Chameleon} from "../authors";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {
    arrowsExplained,
    cannotRepeatInCage,
    canRepeatOnArrows,
    killerCagesExplained,
    normalSudokuRulesApply
} from "../ruleSnippets";
import React from "react";
import {KillerCageConstraint} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {ArrowConstraint} from "../../components/sudoku/constraints/arrow/Arrow";
import {FogConstraint} from "../../components/sudoku/constraints/fog/Fog";

const solution = [
    [3, 1, 9, 2, 4, 8, 7, 5, 6],
    [4, 8, 6, 1, 7, 5, 9, 3, 2],
    [5, 2, 7, 6, 3, 9, 4, 1, 8],
    [1, 7, 2, 3, 9, 6, 8, 4, 5],
    [6, 4, 3, 5, 8, 1, 2, 7, 9],
    [9, 5, 8, 7, 2, 4, 3, 6, 1],
    [8, 9, 5, 4, 6, 3, 1, 2, 7],
    [7, 6, 4, 8, 1, 2, 5, 9, 3],
    [2, 3, 1, 9, 5, 7, 6, 8, 4],
];

export const LumosMaxima: PuzzleDefinition<number> = {
    noIndex: true,
    title: {[LanguageCode.en]: "Lumos Maxima"},
    author: Chameleon,
    slug: "lumos-maxima",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    rules: (translate) => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(arrowsExplained)}. {translate(canRepeatOnArrows)}.</RulesParagraph>
        <RulesParagraph>{translate(killerCagesExplained)}. {translate(cannotRepeatInCage)}.</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "The grid is covered with fog",
            [LanguageCode.ru]: "Поле покрыто туманом",
        })}. {translate({
            [LanguageCode.en]: "There are two initial light sources that illuminate the darkness and clear the fog",
            [LanguageCode.ru]: "Есть два изначальных источника света, которые освещают темноту и рассеивают туман",
        })}. {translate({
            [LanguageCode.en]: "Put correct digits into the cells to get more light (it's ok to put a digit into a cell that is covered by fog)",
            [LanguageCode.ru]: "Поместите правильные цифры в ячейки, чтобы получить больше света (можно поместить цифру в ячейку, покрытую туманом)",
        })}.</RulesParagraph>
    </>,
    items: [
        ArrowConstraint("R6C1", ["R5C2", "R6C2"]),
        ArrowConstraint("R4C2", ["R4C3", "R5C4"]),
        ArrowConstraint("R6C4", ["R6C6", "R5C6"]),
        ArrowConstraint("R5C5", ["R4C6", "R5C7"]),
        ArrowConstraint("R3C6", ["R1C4"]),
        ArrowConstraint("R8C3", ["R7C4"]),
        ArrowConstraint("R8C8", ["R7C8", "R7C6", "R8C6", "R8C5"]),
        KillerCageConstraint(["R1C1", "R1C2", "R2C1"], 8),
        KillerCageConstraint(["R3C1", "R3C2", "R4C1"], 8),
        KillerCageConstraint(["R1C3", "R2C3", "R2C4", "R3C3"], 23),
        KillerCageConstraint(["R1C4", "R1C5", "R2C5", "R3C4", "R3C5", "R4C5", "R5C4", "R5C5", "R5C6"], 45),
        KillerCageConstraint(["R1C7", "R1C8", "R1C9", "R2C9", "R3C9"], 28),
        KillerCageConstraint(["R2C8", "R3C8", "R4C8", "R4C9"], 13),
        KillerCageConstraint(["R4C7", "R5C7"], 10),
        FogConstraint(solution, ["R2C2", "R8C7"]),
    ],
    resultChecker: ({puzzle, ...context}) => isValidFinishedPuzzleByConstraints({
        ...context,
        puzzle: {
            ...puzzle,
            initialDigits: {1: {8: 3}},
        },
    }),
    forceEnableConflictChecker: true,
    prioritizeSelection: true,
};
