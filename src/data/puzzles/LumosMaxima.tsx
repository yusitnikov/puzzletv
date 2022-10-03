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
    [5, 1, 6, 7, 3, 8, 9, 4, 2],
    [2, 8, 9, 1, 5, 4, 7, 3, 6],
    [4, 3, 7, 2, 6, 9, 5, 8, 1],
    [1, 6, 2, 3, 8, 7, 4, 5, 9],
    [7, 5, 8, 4, 9, 1, 2, 6, 3],
    [9, 4, 3, 6, 2, 5, 8, 1, 7],
    [6, 9, 4, 5, 7, 3, 1, 2, 8],
    [3, 7, 5, 8, 1, 2, 6, 9, 4],
    [8, 2, 1, 9, 4, 6, 3, 7, 5],
];

export const LumosMaxima: PuzzleDefinition<number> = {
    noIndex: true,
    title: {[LanguageCode.en]: "Lumos Maxima"},
    author: Chameleon,
    slug: "lumos-maxima",
    saveStateKey: "lumos-maxima-v3",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    rules: (translate) => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(arrowsExplained)} ({translate({
            [LanguageCode.en]: "there are only 1-cell circles in this puzzle",
            [LanguageCode.ru]: "в этом судоку нет кругов, состоящих из нескольких клеток",
        })}). {translate(canRepeatOnArrows)}.</RulesParagraph>
        <RulesParagraph>{translate(killerCagesExplained)}. {translate(cannotRepeatInCage)}.</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Cage clues don't intersect with other cage clues, but they can intersect with other arrow clues",
            [LanguageCode.ru]: "Клетки не пересекаются с другими клетками, но они могут пересекаться с другими стрелками",
        })}.</RulesParagraph>
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
        ArrowConstraint("R6C7", ["R6C5", "R5C6"]),
        ArrowConstraint("R5C5", ["R4C6", "R5C7"]),
        ArrowConstraint("R3C6", ["R4C7", "R4C8"]),
        ArrowConstraint("R8C3", ["R7C4"]),
        ArrowConstraint("R8C8", ["R7C8", "R7C6", "R8C6", "R8C5"]),
        KillerCageConstraint(["R1C1", "R1C2", "R2C1"], 8),
        KillerCageConstraint(["R3C1", "R3C2", "R4C1"], 8),
        KillerCageConstraint(["R1C3", "R2C3", "R2C4", "R3C3"], 23),
        KillerCageConstraint(["R1C4", "R1C5", "R2C5", "R3C4", "R3C5", "R4C5", "R5C4", "R5C5", "R5C6"], 45),
        KillerCageConstraint(["R1C7", "R1C8", "R1C9", "R2C9"], 21),
        KillerCageConstraint(["R2C8", "R3C8", "R4C7", "R4C8"], 20),
        FogConstraint(solution, ["R2C2", "R8C7"]),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    allowDrawing: ["center-line", "border-mark", "corner-mark", "center-mark"],
    forceEnableConflictChecker: true,
    prioritizeSelection: true,
};
