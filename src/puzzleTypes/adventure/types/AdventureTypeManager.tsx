import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { AdventurePTM } from "./AdventurePTM";
import { observer } from "mobx-react-lite";
import { mergeCellsMaps } from "../../../types/puzzle/CellsMap";
import {
    addGameStateExToPuzzleTypeManager,
    addGridStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { IntroModal } from "../components/IntroModal";
import { ChoiceSelection } from "../components/ChoiceSelection";
import { getChoicesTaken } from "./helpers";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { RulesUnorderedList } from "../../../components/puzzle/rules/RulesUnorderedList";
import { RulesParagraph } from "../../../components/puzzle/rules/RulesParagraph";

export const AdventureTypeManager = (): PuzzleTypeManager<AdventurePTM> => {
    const baseTypeManager: PuzzleTypeManager<AdventurePTM> = addGridStateExToPuzzleTypeManager(
        addGameStateExToPuzzleTypeManager(DigitPuzzleTypeManager(), {
            initialGameStateExtension: {
                introViewed: false,
            },
        }),
        {
            initialGridStateExtension: {
                choicesMade: [],
                choicesMadeSolutionStrings: [],
            },
        },
    );

    return {
        ...baseTypeManager,

        getInitialDigits(context) {
            return mergeCellsMaps(...getChoicesTaken(context).map((choice) => choice.initialDigits));
        },

        aboveRulesComponent: observer(function AdventureAboveRules({ context }) {
            const BaseComponent = baseTypeManager.aboveRulesComponent;

            return (
                <>
                    {BaseComponent && <BaseComponent context={context} />}

                    <ChoiceSelection context={context} />

                    <IntroModal context={context} />
                </>
            );
        }),

        items: (context) => getChoicesTaken(context).flatMap((choice) => choice.constraints),

        postProcessPuzzle({ rules, ...puzzle }): PuzzleDefinition<AdventurePTM> {
            return {
                ...puzzle,
                rules: (context) => (
                    <>
                        {rules?.(context)}

                        <RulesParagraph>
                            <RulesUnorderedList>
                                {getChoicesTaken(context)
                                    .flatMap((choice) => choice.rules)
                                    .map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                            </RulesUnorderedList>
                        </RulesParagraph>
                    </>
                ),
            };
        },

        saveStateKeySuffix: "v2",
    };
};
