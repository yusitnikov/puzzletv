import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { XMarkConstraint } from "../../components/puzzle/constraints/xv/XV";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import React from "react";
import { ThermometerConstraint } from "../../components/puzzle/constraints/thermometer/Thermometer";
import { ArrowConstraint } from "../../components/puzzle/constraints/arrow/Arrow";
import { WhispersConstraint } from "../../components/puzzle/constraints/whispers/Whispers";
import { KillerCageConstraint } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { RotatableDigitTypeManager } from "../../puzzleTypes/rotatable/types/RotatableDigitTypeManager";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { Chameleon } from "../authors";
import {
    antiKnightRulesApply,
    antiKnightRulesExplained,
    blackKropkiDotsExplained,
    conventionalNotationsApply,
    killerCagesTitle,
    killerCagesExplained,
    kropkiDotsTitle,
    noBifurcation,
    normalSudokuRulesApply,
    ruleWithTitle,
    thermometersExplained,
    thermometersTitle,
    xExplained,
    cannotRepeatInCage,
    arrowsExplained,
    arrowsTitle,
    germanWhispersTitle,
    germanWhispersExplained,
    antiKnight,
} from "../ruleSnippets";
import { rotatableSudokuRules } from "../../puzzleTypes/rotatable/data/ruleSnippets";
import { AntiKnightConstraint } from "../../types/puzzle/constraints/AntiKnight";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { RotatableDigitPTM } from "../../puzzleTypes/rotatable/types/RotatablePTM";
import { indexes } from "../../utils/indexes";
import { translate } from "../../utils/translate";

export const NorthOrSouth: PuzzleDefinition<RotatableDigitPTM> = {
    noIndex: true,
    extension: {},
    title: {
        [LanguageCode.en]: "North or South?",
        [LanguageCode.ru]: "Север или юг?",
    },
    slug: "north-or-south",
    author: Chameleon,
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(rotatableSudokuRules)}</RulesParagraph>
            <RulesParagraph>
                {ruleWithTitle(translate(antiKnightRulesApply), translate(antiKnightRulesExplained))}.
            </RulesParagraph>
            <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
            <RulesUnorderedList>
                <li>
                    {ruleWithTitle(
                        translate(killerCagesTitle),
                        translate(killerCagesExplained),
                        translate(cannotRepeatInCage),
                    )}
                    .
                </li>
                <li>{ruleWithTitle(translate(arrowsTitle), translate(arrowsExplained))}.</li>
                <li>{ruleWithTitle(translate(thermometersTitle), translate(thermometersExplained))}.</li>
                <li>{ruleWithTitle(translate(kropkiDotsTitle), translate(blackKropkiDotsExplained))}.</li>
                <li>{ruleWithTitle("XV", translate(xExplained))}.</li>
                <li>{ruleWithTitle(translate(germanWhispersTitle), translate(germanWhispersExplained()))}.</li>
            </RulesUnorderedList>
            <RulesParagraph>{translate(noBifurcation)}</RulesParagraph>
        </>
    ),
    typeManager: RotatableDigitTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    initialDigits: {
        0: {
            0: { digit: 6 },
        },
        4: {
            2: { digit: 6 },
        },
        5: {
            0: { digit: 9 },
        },
        8: {
            4: { digit: 5 },
            5: { digit: 2 },
        },
    },
    items: [
        AntiKnightConstraint(),
        ThermometerConstraint(["R2C8", "R3C7"]),
        ThermometerConstraint(["R1C2", "R2C2"]),
        ArrowConstraint("R5C9", ["R5C7", "R4C7"]),
        WhispersConstraint(["R2C6", "R3C5", "R3C8"]),
        KillerCageConstraint(["R5C1", "R5C2", "R6C1"], 12, true),
        KillerCageConstraint(["R8C6", "R8C7", "R9C5", "R9C6"], 22, true),
        XMarkConstraint("R8C7", "R8C8"),
        KropkiDotConstraint("R7C8", "R8C8", true),
        XMarkConstraint("R7C8", "R7C9"),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};

export const NorthOrSouth2: typeof NorthOrSouth = {
    ...NorthOrSouth,
    noIndex: false,
    title: {
        [LanguageCode.en]: "North or South? (v2)",
        [LanguageCode.ru]: "Север или юг? (v2)",
    },
    slug: "north-or-south2",
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(rotatableSudokuRules)}</RulesParagraph>
            <RulesParagraph>
                {ruleWithTitle(translate(antiKnightRulesApply), translate(antiKnightRulesExplained))}.
            </RulesParagraph>
            <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
            <RulesUnorderedList>
                <li>
                    {ruleWithTitle(
                        translate(killerCagesTitle),
                        translate(killerCagesExplained),
                        translate(cannotRepeatInCage),
                    )}
                    .
                </li>
                <li>{ruleWithTitle(translate(arrowsTitle), translate(arrowsExplained))}.</li>
                <li>{ruleWithTitle(translate(thermometersTitle), translate(thermometersExplained))}.</li>
                <li>{ruleWithTitle("XV", translate(xExplained))}.</li>
                <li>{ruleWithTitle(translate(germanWhispersTitle), translate(germanWhispersExplained()))}.</li>
            </RulesUnorderedList>
            <RulesParagraph>{translate(noBifurcation)}</RulesParagraph>
        </>
    ),
    initialDigits: {
        2: {
            4: { digit: 1 },
        },
        4: {
            2: { digit: 6 },
        },
        5: {
            0: { digit: 9 },
        },
        6: {
            3: { digit: 5 },
            4: { digit: 2 },
        },
        8: {
            8: { digit: 2 },
        },
    },
    items: [
        AntiKnightConstraint(),
        ThermometerConstraint(["R1C3", "R2C3", "R2C4", "R1C5", "R1C4"]),
        WhispersConstraint(["R3C7", "R3C6", "R2C6", "R1C7", "R2C8"]),
        ArrowConstraint("R5C9", ["R5C7", "R4C7"]),
        KillerCageConstraint(["R5C1", "R5C2", "R6C1"], 12, true),
        KillerCageConstraint(["R7C4", "R7C5", "R7C6", "R8C6"], 22, true),
        XMarkConstraint("R7C6", "R7C7"),
    ],
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000AJB",
    getLmdSolutionCode: (context) =>
        indexes(9)
            .map((left) => context.getCellDigit(8, left))
            .join(""),
};

export const NorthOrSouth2ShortRules: typeof NorthOrSouth = {
    ...NorthOrSouth2,
    noIndex: true,
    slug: "north-or-south2-sr",
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(rotatableSudokuRules)}</RulesParagraph>
            <RulesParagraph>
                {translate(antiKnight)}, {translate(killerCagesTitle).toLowerCase()},{" "}
                {translate(arrowsTitle).toLowerCase()}, {translate(thermometersTitle).toLowerCase()}, XV (no negative
                constraint), {translate(germanWhispersTitle).toLowerCase()}.
            </RulesParagraph>
            <RulesParagraph>Please note that killer cage clues also do rotate.</RulesParagraph>
        </>
    ),
};
