import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { createRegularGridSize, createRegularRegions } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { ThermometerConstraint } from "../../components/puzzle/constraints/thermometer/Thermometer";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { moveButtonTip, normalSudokuRulesApply, thermometersExplained, toroidalRulesApply } from "../ruleSnippets";
import { darkGreyColor } from "../../components/app/globals";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { Position } from "../../types/layout/Position";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { translate } from "../../utils/translate";

export const MeteorShower = (colorful: boolean): PuzzleDefinition<NumberPTM> => ({
    noIndex: true,
    slug: colorful ? "meteor-shower" : "meteor-shower-no-colors",
    extension: {},
    title: {
        [LanguageCode.en]: "Meteor Shower",
        [LanguageCode.ru]: "Метеоритный дождь",
    },
    author: {
        [LanguageCode.en]: "Scott Strosahl",
    },
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(thermometersExplained)}.</RulesParagraph>
            <RulesParagraph>
                {translate(toroidalRulesApply)}. {translate(moveButtonTip)}.
            </RulesParagraph>
        </>
    ),
    typeManager: DigitPuzzleTypeManager(),
    gridLineColor: darkGreyColor,
    gridSize: createRegularGridSize(8, 2),
    regions: createRegularRegions(8, 8, 2).map((region, index) =>
        (region as Position[]).map(({ left, top }) => ({
            left,
            top: top + [-1, -3, -2, -1, -1, -3, -2, -1][index],
        })),
    ),
    items: [
        ThermometerConstraint(["R7C7", "R1C1"], true, false, colorful ? "#edff6399" : undefined),
        ThermometerConstraint(["R2C4", "R5C7"], true, false, colorful ? "#4f8e9999" : undefined),
        ThermometerConstraint(["R4C-1", "R7C2"], true, false, colorful ? "#ff403d99" : undefined),
        ThermometerConstraint(["R4C1", "R2C-1"], true, false, colorful ? "#87c8cf99" : undefined),
        ThermometerConstraint(["R-1C3", "R1C5"], true, false, colorful ? "#a9c73199" : undefined),
        ThermometerConstraint(["R-1C-2", "R2C1"], true, false, colorful ? "#3facbb99" : undefined),
        ThermometerConstraint(["R-2C-1", "R1C2"], true, false, colorful ? "#b9cf9999" : undefined),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    loopHorizontally: true,
    loopVertically: true,
    gridMargin: 0.99,
});
