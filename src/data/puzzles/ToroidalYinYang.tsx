import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {Chameleon} from "../authors";
import {CellColor} from "../../types/sudoku/CellColor";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {moveButtonTip, normalYinYangRulesApply, normalYinYangRulesExplained, toroidalRulesApply} from "../ruleSnippets";

const S = [CellColor.shaded];
const U = [CellColor.unshaded];

export const ToroidalYinYang: PuzzleDefinition<number> = {
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
    rules: translate => <>
        <RulesParagraph>{translate(normalYinYangRulesApply)}. {translate(normalYinYangRulesExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(toroidalRulesApply)}. {translate(moveButtonTip)}.</RulesParagraph>
    </>,
    initialColors: {
        0: {4: S, 6: S, /*7: B, */8: S},
        1: {0: S, 3: S, 4: S, 8: S, 9: S},
        2: {0: S, 4: S, 6: S},
        3: {1: S, 7: S},
        4: {0: S, 1: S, 2: S, 4: S, 6: S, 7: S, 8: S},
        5: {1: S, 7: S},
        6: {0: U, 4: S, 8: U},
        7: {0: U, 1: S, 3: S, 4: S, 5: S},
        8: {0: U, 2: S, 5: S, 6: S, 7: S, 8: U},
        9: {2: S, 7: S},
    },
    allowOverridingInitialColors: false,
    enableShading: true,
    allowDrawing: ["center-line", "border-line", "border-mark"],
};
