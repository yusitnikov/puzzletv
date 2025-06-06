import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    antiBishopFromCenterRulesExplained,
    antiKnightRulesExplained,
    cannotRepeatInCage,
    inequalitySignsExplained,
    moveButtonTip,
    normalSudokuRulesApply,
    toroidalRulesApply,
} from "../ruleSnippets";
import { AntiKnightConstraint } from "../../types/puzzle/constraints/AntiKnight";
import { AntiBishopFromCenterConstraint } from "../../types/puzzle/constraints/AntiBishopFromCenter";
import { GreaterConstraint } from "../../components/puzzle/constraints/greater/Greater";
import { KillerCageConstraintByRect } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { indexes } from "../../utils/indexes";
import { translate } from "../../utils/translate";

export const MultiColorMadness: PuzzleDefinition<NumberPTM> = {
    slug: "multi-color-madness",
    extension: {},
    title: {
        [LanguageCode.en]: "Multi-color Madness",
    },
    author: {
        [LanguageCode.en]: "Joseph",
    },
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(cannotRepeatInCage)}.</RulesParagraph>
            <RulesParagraph>{translate(inequalitySignsExplained)}.</RulesParagraph>
            <RulesParagraph>{translate(antiKnightRulesExplained)}.</RulesParagraph>
            <RulesParagraph>{translate(antiBishopFromCenterRulesExplained)}.</RulesParagraph>
            <RulesParagraph>
                {translate(toroidalRulesApply)}. {translate(moveButtonTip)}.
            </RulesParagraph>
        </>
    ),
    typeManager: DigitPuzzleTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    items: [
        AntiKnightConstraint(),
        AntiBishopFromCenterConstraint(3),
        GreaterConstraint("R2C5", "R1C5"),
        GreaterConstraint("R4C2", "R3C2"),
        GreaterConstraint("R4C5", "R3C5"),
        GreaterConstraint("R4C8", "R3C8"),
        GreaterConstraint("R7C2", "R6C2"),
        GreaterConstraint("R7C5", "R6C5"),
        GreaterConstraint("R7C8", "R6C8"),
        GreaterConstraint("R9C5", "R8C5"),
        KillerCageConstraintByRect("R3C3", 2, 2),
        KillerCageConstraintByRect("R3C6", 3, 2),
        KillerCageConstraintByRect("R6C2", 3, 2),
        KillerCageConstraintByRect("R6C6", 2, 2),
    ],
    loopHorizontally: true,
    loopVertically: true,
    gridMargin: 0.99,
    resultChecker: isValidFinishedPuzzleByConstraints,
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=0008A2",
    getLmdSolutionCode: (context) =>
        [0, 8].flatMap((top) => indexes(9).map((left) => context.getCellDigit(top, left))).join(""),
};
