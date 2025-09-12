import { observer } from "mobx-react-lite";
import { useState } from "react";
import { AboveRulesActionItem } from "../../../components/puzzle/rules/AboveRulesActionItem";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { choicesMadeStateChangeAction } from "../types/AdventureGridState";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { IntroModal } from "./IntroModal";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { AdventurePTM } from "../types/AdventurePTM";
import { getChoicesTaken } from "../types/helpers";

export const ChoiceSelection = observer(function ChoiceSelectionFc({ context }: PuzzleContextProps<AdventurePTM>) {
    const { cellSizeForSidePanel: cellSize } = context;
    const choices = getChoicesTaken(context);
    const currentChoice = choices[choices.length - 1];
    const isNext =
        choices.length - 1 === context.gridExtension.choicesMade.length &&
        currentChoice.choices !== undefined &&
        currentChoice.choices.solveCells.every((cell) => {
            const userDigit = context.getCellDigit(cell[0], cell[1]);
            return userDigit !== undefined && userDigit === context.puzzle.solution![cell[0]][cell[1]];
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
                <Modal cellSize={cellSize}>
                    <div>{currentChoice.choices.topMessage}</div>

                    {currentChoice.choices.options.map((option, index) => (
                        <div key={index}>
                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={() => {
                                    context.onStateChange(choicesMadeStateChangeAction(index, option.solutionMessage));
                                    setShowChoices(false);
                                    setChoiceTakenMessage(option.takenMessage);
                                }}
                                style={{
                                    marginTop: cellSize * globalPaddingCoeff,
                                    padding: "0.5em 1em",
                                }}
                            >
                                {option.choiceMessage}
                            </Button>
                        </div>
                    ))}
                </Modal>
            )}

            {choiceTakenMessage !== undefined && (
                <Modal cellSize={cellSize}>
                    <div>{choiceTakenMessage}</div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={() => setChoiceTakenMessage(undefined)}
                            autoFocus={true}
                            style={{
                                marginTop: cellSize * globalPaddingCoeff,
                                padding: "0.5em 1em",
                            }}
                        >
                            Continue
                        </Button>
                    </div>
                </Modal>
            )}

            <IntroModal context={context} />
        </>
    );
});
