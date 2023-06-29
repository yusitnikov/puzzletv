import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {FieldSize9, Regions9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {Chameleon} from "../authors";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {
    arrowsExplained,
    cannotRepeatInCage,
    canRepeatOnArrows,
    killerCagesExplained,
    noGuessingRequired,
    normalSudokuRulesApply
} from "../ruleSnippets";
import React from "react";
import {KillerCageConstraint} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {ArrowConstraint} from "../../components/sudoku/constraints/arrow/Arrow";
import {FogConstraint} from "../../components/sudoku/constraints/fog/Fog";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";
import {createGivenDigitsMapFromArray} from "../../types/sudoku/GivenDigitsMap";
import {indexes} from "../../utils/indexes";

export const LumosMaximaNoFog: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title: {[LanguageCode.en]: "Lumos Maxima"},
    author: Chameleon,
    slug: "lumos-maxima-no-fog",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    regions: Regions9,
    rules: (translate) => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(arrowsExplained)} ({translate({
            [LanguageCode.en]: "there are only 1-cell circles in this puzzle",
            [LanguageCode.ru]: "в этом судоку нет кругов, состоящих из нескольких клеток",
            [LanguageCode.de]: "in diesem Puzzle gibt es nur Kreise mit einer Zelle",
        })}). {translate(canRepeatOnArrows)}.</RulesParagraph>
        <RulesParagraph>{translate(killerCagesExplained)}. {translate(cannotRepeatInCage)}.</RulesParagraph>
    </>,
    items: [
        ArrowConstraint("R6C1", ["R5C2", "R6C2"]),
        ArrowConstraint("R4C2", ["R4C3", "R4C4"]),
        ArrowConstraint("R6C7", ["R6C5", "R5C6"]),
        ArrowConstraint("R3C6", ["R4C6", "R4C7"]),
        ArrowConstraint("R8C3", ["R7C4"]),
        ArrowConstraint("R8C8", ["R7C8", "R7C6", "R8C6", "R8C5"]),
        ArrowConstraint("R4C9", ["R3C9", "R2C8"]),
        KillerCageConstraint(["R1C1", "R1C2", "R2C1"], 8),
        KillerCageConstraint(["R3C1", "R3C2", "R4C1"], 8),
        KillerCageConstraint(["R1C3", "R2C3", "R2C4", "R3C3"], 23),
        KillerCageConstraint(["R1C4", "R1C5", "R2C5", "R3C4", "R3C5", "R4C5", "R5C4", "R5C5", "R5C6"], 45),
        KillerCageConstraint(["R1C6", "R1C7", "R1C8", "R1C9", "R2C9", "R3C9"], 38),
        KillerCageConstraint(["R2C8", "R3C8", "R4C7", "R4C8", "R4C9"]),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    allowDrawing: ["center-line", "border-mark", "corner-mark", "center-mark"],
};

export const LumosMaxima: PuzzleDefinition<NumberPTM> = {
    ...LumosMaximaNoFog,
    noIndex: false,
    slug: "lumos-maxima",
    saveStateKey: "lumos-maxima-v5",
    solution: createGivenDigitsMapFromArray([
        [2, 1, 7, 6, 4, 8, 9, 3, 5],
        [5, 8, 9, 1, 3, 7, 4, 2, 6],
        [4, 3, 6, 2, 5, 9, 1, 8, 7],
        [1, 7, 2, 5, 8, 6, 3, 4, 9],
        [6, 4, 3, 9, 7, 1, 8, 5, 2],
        [9, 5, 8, 3, 2, 4, 7, 6, 1],
        [7, 9, 5, 4, 6, 3, 2, 1, 8],
        [8, 6, 4, 7, 1, 2, 5, 9, 3],
        [3, 2, 1, 8, 9, 5, 6, 7, 4],
    ]),
    items: [
        ...(LumosMaximaNoFog.items as Constraint<NumberPTM, any>[]),
        FogConstraint(["R2C2", "R8C7"]),
    ],
    rules: (translate, context) => <>
        {LumosMaximaNoFog.rules!(translate, context)}
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Cages don't intersect with other cages, but they can intersect with other arrows",
            [LanguageCode.ru]: "Клетки не пересекаются с другими клетками, но они могут пересекаться с другими стрелками",
            [LanguageCode.de]: "Käfige überschneiden sich nicht mit anderen Käfigen, sie können sich jedoch mit anderen Pfeilen überschneiden",
        })}.</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "The grid is covered with fog",
            [LanguageCode.ru]: "Поле покрыто туманом",
            [LanguageCode.de]: "Das Gitter ist mit Nebel bedeckt",
        })}. {translate({
            [LanguageCode.en]: "There are two initial light sources that illuminate the darkness and clear the fog",
            [LanguageCode.ru]: "Есть два изначальных источника света, которые освещают темноту и рассеивают туман",
            [LanguageCode.de]: "Es gibt zunächst zwei Lichtquellen, die die Dunkelheit erhellen und den Nebel vertreiben",
        })}. {translate({
            [LanguageCode.en]: "Put correct digits into the cells to get more light (it's ok to put a digit into a cell that is covered by fog)",
            [LanguageCode.ru]: "Поместите правильные цифры в ячейки, чтобы получить больше света (можно поместить цифру в ячейку, покрытую туманом)",
            [LanguageCode.de]: "Geben Sie die richtigen Ziffern in die Zellen ein, um mehr Licht zu erhalten (es ist in Ordnung, eine Ziffer in eine Zelle einzutragen, die von Nebel bedeckt ist)",
        })}.</RulesParagraph>
        <RulesParagraph>{translate(noGuessingRequired)}.</RulesParagraph>
    </>,
    prioritizeSelection: true,
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000BIU",
    getLmdSolutionCode: ({puzzle: {solution}}) => indexes(9).map(index => solution![8][index]).join(""),
};
