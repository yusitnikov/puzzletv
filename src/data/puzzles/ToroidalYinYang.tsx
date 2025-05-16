import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { createRegularGridSize } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { Chameleon } from "../authors";
import { CellColor } from "../../types/puzzle/CellColor";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    moveButtonTip,
    normalYinYangRulesApply,
    normalYinYangRulesExplained,
    toroidalRulesApply,
} from "../ruleSnippets";
import { CellsMap, processCellsMaps } from "../../types/puzzle/CellsMap";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { translate } from "../../utils/translate";
import { errorResultCheck, notFinishedResultCheck, successResultCheck } from "../../types/puzzle/PuzzleResultCheck";

const S = CellColor.shaded;
const U = CellColor.unshaded;

const givenColors: CellsMap<CellColor> = {
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
    extension: {},
    author: Chameleon,
    title: {
        [LanguageCode.en]: "No secret rules today",
        [LanguageCode.ru]: "Никаких скрытых правил сегодня",
    },
    slug: "toroidal-yin-yang",
    saveStateKey: "toroidal-yin-yang-v2",
    typeManager: DigitPuzzleTypeManager(),
    gridSize: createRegularGridSize(10),
    digitsCount: 0,
    loopHorizontally: true,
    loopVertically: true,
    gridMargin: 0.99,
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
    initialColors: processCellsMaps((values) => values, [givenColors]),
    allowOverridingInitialColors: false,
    enableShading: true,
    allowDrawing: ["center-line", "border-line", "border-mark"],
    resultChecker: (context) => {
        let finished = true;

        for (const [top, row] of correctAnswer.entries()) {
            for (const [left, answer] of row.entries()) {
                const actualColor = givenColors[top]?.[left] ?? context.getCellColors(top, left).first();
                if (actualColor === undefined) {
                    finished = false;
                    continue;
                }
                if (actualColor !== answer) {
                    return errorResultCheck();
                }
            }
        }

        return finished ? successResultCheck(context.puzzle) : notFinishedResultCheck();
    },
};
