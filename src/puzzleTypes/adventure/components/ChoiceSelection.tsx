import { observer } from "mobx-react-lite";
import { useState } from "react";
import { AboveRulesActionItem } from "../../../components/puzzle/rules/AboveRulesActionItem";
import { Modal } from "../../../components/layout/modal/Modal";
import { choicesMadeStateChangeAction } from "../types/AdventureGridState";
import { IntroModal } from "./IntroModal";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { AdventurePTM } from "../types/AdventurePTM";
import { getChoicesTaken } from "../types/helpers";
import { parsePositionLiterals } from "../../../types/layout/Position";

export const ChoiceSelection = observer(function ChoiceSelectionFc({ context }: PuzzleContextProps<AdventurePTM>) {
    const { cellSizeForSidePanel: cellSize } = context;
    const choices = getChoicesTaken(context);
    const currentChoice = choices[choices.length - 1];
    const isNext =
        choices.length - 1 === context.gridExtension.choicesMade.length &&
        currentChoice.choices !== undefined &&
        parsePositionLiterals(currentChoice.choices.solveCells).every(({ top, left }) => {
            const userDigit = context.getCellDigit(top, left);
            return userDigit !== undefined && userDigit === context.puzzle.solution![top][left];
        });
    const [showChoices, setShowChoices] = useState(false);
    const [choiceTakenMessage, setChoiceTakenMessage] = useState<string>();

    return (
        <>
            <AboveRulesActionItem
                context={context}
                visible={isNext}
                message={"You've fully explored this area!"}
                buttonText={"Make your next choice"}
                onClick={() => setShowChoices(true)}
            />

            {showChoices && currentChoice.choices !== undefined && (
                <Modal
                    cellSize={cellSize}
                    buttons={currentChoice.choices.options.map((option, index) => ({
                        label: option.choiceMessage,
                        onClick: () => {
                            context.onStateChange(choicesMadeStateChangeAction(index, option.solutionMessage));
                            setShowChoices(false);
                            setChoiceTakenMessage(option.takenMessage);
                        },
                    }))}
                    buttonsDirection={"column"}
                    autoFocusButtonIndex={false}
                >
                    <div>{currentChoice.choices.topMessage}</div>
                </Modal>
            )}

            {choiceTakenMessage !== undefined && (
                <Modal cellSize={cellSize} onClose={() => setChoiceTakenMessage(undefined)} buttons={["Continue"]}>
                    <div>{choiceTakenMessage}</div>
                </Modal>
            )}

            <IntroModal context={context} />
        </>
    );
});
