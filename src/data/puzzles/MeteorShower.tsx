import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {ThermometerConstraint} from "../../components/sudoku/constraints/thermometer/Thermometer";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {moveButtonTip, normalSudokuRulesApply, thermometersExplained, toroidalRulesApply} from "../ruleSnippets";
import {darkGreyColor} from "../../components/app/globals";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";

const regularFieldSize = createRegularFieldSize(8, 2);

export const MeteorShower = (colorful: boolean): PuzzleDefinition<number> => ({
    noIndex: true,
    slug: colorful ? "meteor-shower" : "meteor-shower-no-colors",
    title: {
        [LanguageCode.en]: "Meteor Shower",
        [LanguageCode.ru]: "Метеоритный дождь",
    },
    author: {
        [LanguageCode.en]: "Scott Strosahl",
    },
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(thermometersExplained)}.</RulesParagraph>
        <RulesParagraph>{translate(toroidalRulesApply)}. {translate(moveButtonTip)}.</RulesParagraph>
    </>,
    typeManager: DigitSudokuTypeManager(),
    borderColor: darkGreyColor,
    fieldSize: {
        ...regularFieldSize,
        regions: regularFieldSize.regions.map(
            (region, index) => region.map(({left, top}) => ({
                left,
                top: (top + [-1, -3, -2, -1, -1, -3, -2, -1][index]),
            }))
        )
    },
    items: [
        ThermometerConstraint(["R7C7", "R1C1"], colorful ? "#edff63" : undefined),
        ThermometerConstraint(["R2C4", "R5C7"], colorful ? "#4f8e99" : undefined),
        ThermometerConstraint(["R4C-1", "R7C2"], colorful ? "#ff403d" : undefined),
        ThermometerConstraint(["R4C1", "R2C-1"], colorful ? "#87c8cf" : undefined),
        ThermometerConstraint(["R-1C3", "R1C5"], colorful ? "#a9c731" : undefined),
        ThermometerConstraint(["R-1C-2", "R2C1"], colorful ? "#3facbb" : undefined),
        ThermometerConstraint(["R-2C-1", "R1C2"], colorful ? "#b9cf99" : undefined),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    loopHorizontally: true,
    loopVertically: true,
    fieldMargin: 0.99,
});
