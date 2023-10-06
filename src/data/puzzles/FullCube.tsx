import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {normalSudokuRulesApply} from "../ruleSnippets";
import {
    createFullCubeFieldSize,
    createFullCubeRegions,
    FullCubeTypeManager
} from "../../sudokuTypes/cube/types/FullCubeTypeManager";
import {FullCubePTM} from "../../sudokuTypes/cube/types/FullCubePTM";
import {FullCubeJssConstraint} from "../../sudokuTypes/cube/constraints/FullCubeJss";

const fieldSize = 6;

export const FullCube: PuzzleDefinition<FullCubePTM> = {
    noIndex: true,
    title: {[LanguageCode.en]: "Full cube test"},
    author: {[LanguageCode.en]: "Unknown"},
    slug: "full-cube-test",
    typeManager: FullCubeTypeManager(),
    fieldSize: createFullCubeFieldSize(fieldSize, true),
    regions: createFullCubeRegions(fieldSize, 3),
    digitsCount: fieldSize,
    fieldMargin: 4,
    // TODO: move the field to the type manager
    ignoreRowsColumnCountInTheWrapper: true,
    initialDigits: {
        0: {
            0: 1,
            [fieldSize]: 2,
            [fieldSize * 2]: 3,
        },
        [fieldSize]: {
            0: 4,
            [fieldSize]: 5,
            [fieldSize * 2]: 6,
        },
        // [fieldSize * 2]: {
        //     0: 7,
        //     [fieldSize]: 8,
        //     [fieldSize * 2]: 9,
        // },
    },
    rules: (translate) => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
    </>,
    items: [
        FullCubeJssConstraint(),
    ],
    // TODO: limit on the type manager side
    allowDrawing: ["center-mark"],
};
