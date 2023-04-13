import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {FieldSize9, Regions9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {
    antiBishopFromCenterRulesExplained,
    antiKnightRulesExplained,
    cannotRepeatInCage,
    inequalitySignsExplained,
    moveButtonTip,
    normalSudokuRulesApply,
    toroidalRulesApply
} from "../ruleSnippets";
import {AntiKnightConstraint} from "../../types/sudoku/constraints/AntiKnight";
import {AntiBishopFromCenterConstraint} from "../../types/sudoku/constraints/AntiBishopFromCenter";
import {GreaterConstraint} from "../../components/sudoku/constraints/greater/Greater";
import {KillerCageConstraintByRect} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

export const MultiColorMadness: PuzzleDefinition<NumberPTM> = {
    slug: "multi-color-madness",
    title: {
        [LanguageCode.en]: "Multi-color Madness",
    },
    author: {
        [LanguageCode.en]: "Joseph",
    },
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(cannotRepeatInCage)}.</RulesParagraph>
        <RulesParagraph>{translate(inequalitySignsExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(antiKnightRulesExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(antiBishopFromCenterRulesExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(toroidalRulesApply)}. {translate(moveButtonTip)}.</RulesParagraph>
    </>,
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
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
    fieldMargin: 0.99,
    resultChecker: isValidFinishedPuzzleByConstraints,
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=0008A2",
    getLmdSolutionCode: (puzzle, state) => {
        const {cells} = gameStateGetCurrentFieldState(state);
        return cells[0].map(cell => cell.usersDigit).join("") + cells[8].map(cell => cell.usersDigit).join("");
    },
};
