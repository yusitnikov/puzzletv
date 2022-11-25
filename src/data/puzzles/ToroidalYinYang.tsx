import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {Chameleon} from "../authors";
import {CellColor} from "../../types/sudoku/CellColor";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {moveButtonTip, normalYinYangRulesApply, normalYinYangRulesExplained, toroidalRulesApply} from "../ruleSnippets";

const B = [CellColor.black];
const G = [CellColor.green];

export const ToroidalYinYang: PuzzleDefinition<number> = {
    noIndex: true,
    author: Chameleon,
    title: {
        [LanguageCode.en]: "No secret rules today",
        [LanguageCode.ru]: "Никаких скрытых правил сегодня",
    },
    slug: "toroidal-yin-yang",
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
        0: {4: B, 6: B, /*7: B, */8: B},
        1: {0: B, 3: B, 4: B, 8: B, 9: B},
        2: {0: B, 4: B, 6: B},
        3: {1: B, 7: B},
        4: {0: B, 1: B, 2: B, 4: B, 6: B, 7: B, 8: B},
        5: {1: B, 7: B},
        6: {0: G, 4: B, 8: G},
        7: {0: G, 1: B, 3: B, 4: B, 5: B},
        8: {0: G, 2: B, 5: B, 6: B, 7: B, 8: G},
        9: {2: B, 7: B},
    },
    allowOverridingInitialColors: false,
    allowDrawing: ["center-line", "border-line", "border-mark"],
};
