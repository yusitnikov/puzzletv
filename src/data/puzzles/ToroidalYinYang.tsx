import { PuzzleDefinition } from "../../types/sudoku/PuzzleDefinition";
import { createRegularFieldSize } from "../../types/sudoku/FieldSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitSudokuTypeManager } from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import { Chameleon } from "../authors";
import { CellColor } from "../../types/sudoku/CellColor";
import { RulesParagraph } from "../../components/sudoku/rules/RulesParagraph";
import {
    moveButtonTip,
    normalYinYangRulesApply,
    normalYinYangRulesExplained,
    toroidalRulesApply,
} from "../ruleSnippets";
import { GivenDigitsMap, processGivenDigitsMaps } from "../../types/sudoku/GivenDigitsMap";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { translate } from "../../utils/translate";

const S = CellColor.shaded;
const U = CellColor.unshaded;

const givenColors: GivenDigitsMap<CellColor> = {
    0: { 4: S, 6: S, 8: S },
    1: { 0: S, 3: S, 4: S, 8: S, 9: S },
    2: { 0: S, 4: S, 6: S },
    3: { 1: S, 7: S },
    4: { 0: S, 1: S, 2: S, 4: S, 6: S, 7: S, 8: S },
    5: { 1: S, 7: S },
    6: { 0: U, 4: S, 8: U },
    7: { 0: U, 1: S, 3: S, 4: S, 5: S },
    8: { 0: U, 2: S, 5: S, 6: S, 7: S, 8: U },
    9: { 2: S, 7: S },
};
const correctAnswer = [
    [S, U, U, U, S, U, S, S, S, U],
    [S, U, S, S, S, U, U, U, S, S],
    [S, S, S, U, S, U, S, S, S, U],
    [U, S, U, U, U, U, U, S, U, U],
    [S, S, S, U, S, U, S, S, S, U],
    [U, S, U, S, S, S, U, S, U, U],
    [U, U, U, U, S, U, U, U, U, S],
    [U, S, U, S, S, S, U, S, S, S],
    [U, S, S, S, U, S, S, S, U, S],
    [U, U, S, U, U, U, U, S, U, U],
];

export const ToroidalYinYang: PuzzleDefinition<NumberPTM> = {
    author: Chameleon,
    title: {
        [LanguageCode.en]: "No secret rules today",
        [LanguageCode.ru]: "Никаких скрытых правил сегодня",
    },
    slug: "toroidal-yin-yang",
    saveStateKey: "toroidal-yin-yang-v2",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: createRegularFieldSize(10),
    digitsCount: 0,
    loopHorizontally: true,
    loopVertically: true,
    fieldMargin: 0.99,
    rules: () => (
        <>
            <RulesParagraph>
                {translate(normalYinYangRulesApply)}. {translate(normalYinYangRulesExplained)}.
            </RulesParagraph>
            <RulesParagraph>
                {translate(toroidalRulesApply)}. {translate(moveButtonTip)}.
            </RulesParagraph>
        </>
    ),
    initialColors: processGivenDigitsMaps((values) => values, [givenColors]),
    allowOverridingInitialColors: false,
    enableShading: true,
    allowDrawing: ["center-line", "border-line", "border-mark"],
    resultChecker: (context) => {
        return correctAnswer.every((row, top) =>
            row.every(
                (answer, left) => (givenColors[top]?.[left] ?? context.getCellColors(top, left).first()) === answer,
            ),
        );
    },
};
