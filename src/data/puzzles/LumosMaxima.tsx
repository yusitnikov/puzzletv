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
import {TextConstraint} from "../../components/sudoku/constraints/text/Text";
import {darkGreyColor} from "../../components/app/globals";
import {mainDigitCoeff} from "../../components/sudoku/cell/CellDigits";
import {FogConstraint} from "../../components/sudoku/constraints/fog/Fog";
import {FieldLayer} from "../../types/sudoku/FieldLayer";

const solution = [
    [2, 1, 7, 3, 6, 9, 8, 5, 4],
    [5, 8, 6, 1, 4, 2, 9, 7, 3],
    [4, 3, 9, 8, 7, 5, 1, 6, 2],
    [1, 7, 2, 5, 8, 6, 3, 4, 9],
    [6, 5, 8, 9, 3, 4, 7, 2, 1],
    [9, 4, 3, 2, 1, 7, 5, 8, 6],
    [7, 2, 1, 4, 9, 8, 6, 3, 5],
    [3, 6, 5, 7, 2, 1, 4, 9, 8],
    [8, 9, 4, 6, 5, 3, 2, 1, 7],
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
        KillerCageConstraint(["R1C1", "R1C2", "R2C1"], 8),
        KillerCageConstraint(["R3C1", "R3C2", "R4C1"], 8),
        KillerCageConstraint(["R1C3", "R2C3", "R2C4", "R3C3"], 23),
        KillerCageConstraint(["R4C3", "R4C4"], 7),
        KillerCageConstraint(["R1C5", "R2C5", "R3C5", "R3C6", "R4C5", "R5C4", "R5C5"]),
        KillerCageConstraint(["R2C7", "R2C8", "R2C9", "R1C9"], 23, false, 2),
        KillerCageConstraint(["R3C9", "R4C9"]),
        ArrowConstraint("R6C1", ["R6C2", "R5C2"]),
        ArrowConstraint("R8C3", ["R7C2", "R6C3"]),
        ArrowConstraint("R8C4", ["R6C4", "R6C5"]),
        ArrowConstraint("R5C7", ["R4C6", "R3C7"]),
        ArrowConstraint("R8C9", ["R6C7"]),
        ArrowConstraint("R8C8", ["R9C8", "R9C6", "R8C6", "R8C5"]),
        TextConstraint(["R2C9"], "3", darkGreyColor, mainDigitCoeff, 0, FieldLayer.regular),
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
