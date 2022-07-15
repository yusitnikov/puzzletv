import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {createCubeFieldSize, CubeTypeManager} from "../../sudokuTypes/cube/types/CubeTypeManager";
import {Chameleon} from "../authors";
import {HeartConstraint, KropkiDotConstraint} from "../../components/sudoku/constraints/kropki-dot/KropkiDot";
import {
    NonRatioNeighborsConstraint
} from "../../components/sudoku/constraints/consecutive-neighbors/ConsecutiveNeighbors";
import {blackKropkiDotsExplained, ratioDotsExplained} from "../ruleSnippets";

export const HeartsCube: PuzzleDefinition<number> = {
    title: {
        [LanguageCode.en]: "Rational Cube",
        [LanguageCode.ru]: "Рациональный куб",
    },
    author: Chameleon,
    slug: "rational-cube",
    typeManager: CubeTypeManager(true),
    fieldSize: createCubeFieldSize(3, 3, 3),
    digitsCount: 9,
    fieldMargin: 1.2,
    rules: translate => <>
        <RulesParagraph>Put digits from 1 to 9 into every cell of all cube faces.</RulesParagraph>
        <RulesParagraph>
            Digits cannot repeat in a row, column or 3x3 box (face of the cube).{" "}
            "Rows" and "columns" are 6 cells long - they extend across the edge and take 2 faces of the cube.
        </RulesParagraph>
        <RulesParagraph>{translate(blackKropkiDotsExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(ratioDotsExplained({
            [LanguageCode.en]: "green",
            [LanguageCode.ru]: "зелёной",
        }, "1:3"))}.</RulesParagraph>
        <RulesParagraph>{translate(ratioDotsExplained({
            [LanguageCode.en]: "red",
            [LanguageCode.ru]: "красной",
        }, "2:3"))}.</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "All black, green and red dots are given",
            [LanguageCode.ru]: "Все чёрные, зелёные и красные точки даны",
        })}.</RulesParagraph>
    </>,
    initialDigits: {2: {2: 5}},
    items: [
        HeartConstraint("R1C3", "R2C3"),
        HeartConstraint("R6C2", "R6C3"),
        HeartConstraint("R6C3", "R6C4"),
        KropkiDotConstraint("R5C6", "R6C6", true, 3, "#0d0", false),
        KropkiDotConstraint("R3C1", "R4C1", true),
        KropkiDotConstraint("R4C1", "R4C2", true),
        NonRatioNeighborsConstraint([[1, 2], [1, 3], [2, 3]]),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};
