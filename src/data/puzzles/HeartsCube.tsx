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
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

export const HeartsCube = (showRatio: boolean): PuzzleDefinition<NumberPTM> => ({
    noIndex: showRatio,
    title: {
        [LanguageCode.en]: "Rational Cube",
        [LanguageCode.ru]: "Рациональный куб",
    },
    author: Chameleon,
    slug: showRatio ? "rational-cube-show-ratio" : "rational-cube",
    typeManager: CubeTypeManager(true),
    fieldSize: createCubeFieldSize(3, 3, 3),
    digitsCount: 9,
    rules: translate => <>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Put digits from 1 to 9 into every cell of all cube faces",
            [LanguageCode.ru]: "Поместите цифры от 1 до 9 в каждую ячейку всех граней куба",
        })}.</RulesParagraph>
        <RulesParagraph>
            {translate({
                [LanguageCode.en]: "Digits cannot repeat in a row, column or 3x3 box (face of the cube)",
                [LanguageCode.ru]: "Цифры не могут повторяться в строках, столбцах и регионах 3х3 (гранях куба)",
            })}.{" "}
            {translate({
                [LanguageCode.en]: '"Rows" and "columns" are 6 cells long - they extend across the edge and take 2 faces of the cube',
                [LanguageCode.ru]: '"Строки" и "столбцы" имеют длину 6 клеток - они проходят через ребро и занимают 2 грани куба',
            })}.
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
        HeartConstraint("R1C3", "R2C3", showRatio),
        HeartConstraint("R6C2", "R6C3", showRatio),
        HeartConstraint("R6C3", "R6C4", showRatio),
        KropkiDotConstraint("R5C6", "R6C6", true, [1, 3], "#0d0", showRatio),
        KropkiDotConstraint("R3C1", "R4C1", true, [1, 2], undefined, showRatio),
        KropkiDotConstraint("R4C1", "R4C2", true, [1, 2], undefined, showRatio),
        NonRatioNeighborsConstraint([[1, 2], [1, 3], [2, 3]]),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000AJY",
    getLmdSolutionCode: (puzzle, state) => {
        const {cells} = gameStateGetCurrentFieldState(state);

        return [
            cells[3][0], cells[3][1], cells[3][2],
            cells[4][0], cells[4][1], cells[4][2],
            cells[5][0], cells[5][1], cells[5][2],
        ]
            .map(({usersDigit}) => usersDigit)
            .join("");
    },
});
