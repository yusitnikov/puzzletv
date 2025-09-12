import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { AdventurePTM } from "./AdventurePTM";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { choicesMadeStateChangeAction, choiceTaken } from "./AdventureGridState";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { mergeCellsMaps } from "../../../types/puzzle/CellsMap";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { AboveRulesActionItem } from "../../../components/puzzle/rules/AboveRulesActionItem";

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
            const { cellSizeForSidePanel: cellSize } = context;
            const choices = getChoicesTaken(context);
            const currentChoice = choices[choices.length - 1];
            const isNext =
                choices.length - 1 === context.gridExtension.choicesMade.length &&
                currentChoice.choices !== undefined &&
                checkSolved(context, currentChoice.choices.solveCells);
            const [showChoices, setShowChoices] = useState(false);
            const [choiceTakenMessage, setChoiceTakenMessage] = useState<string>();

            const BaseComponent = baseTypeManager.aboveRulesComponent;

            return (
                <>
                    {BaseComponent && <BaseComponent context={context} />}

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
                                            context.onStateChange(
                                                choicesMadeStateChangeAction(index, option.solutionMessage),
                                            );
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

                    {context.stateExtension.introViewed === false && (
                        <Modal cellSize={cellSize}>
                            <div>
                                While plenty of 12-year-olds love adventure, most don't have bedrooms like yours: filled
                                with fossil replicas, antique maps, and hiking gear. With heroes like Jane Goodall, John
                                Muir, and Jacques Cousteau, you have wanted to go on an adventure of your own for years.
                                Your parents, ever-cautious, have decided you are old enough and have gotten permission
                                from some neighbors to explore their land. With your compass, specimen jars, and your
                                map (this puzzle) ready to be filled in, you set off!
                            </div>

                            <div>
                                <Button
                                    type={"button"}
                                    cellSize={cellSize}
                                    onClick={() => context.onStateChange({ extension: { introViewed: true } })}
                                    autoFocus={true}
                                    style={{
                                        marginTop: cellSize * globalPaddingCoeff,
                                        padding: "0.5em 1em",
                                    }}
                                >
                                    Your adventure begins!
                                </Button>
                            </div>
                        </Modal>
                    )}
                </>
            );
        }),

        saveStateKeySuffix: "v2",
    };
};

const checkSolved = <T extends AnyPTM>(context: PuzzleContext<T>, solveCells: [number, number][]): boolean => {
    for (const cell of solveCells) {
        const userDigit = context.getCell(cell[0], cell[1])?.usersDigit;
        if (userDigit === undefined || userDigit !== context.puzzle.solution![cell[0]][cell[1]]) {
            return false;
        }
    }
    return true;
};

export const getChoicesTaken = ({
    gridExtension: { choicesMade },
    puzzle: {
        extension: { rootChoiceTaken },
    },
}: PuzzleContext<AdventurePTM>): choiceTaken[] => {
    let currentChoice = rootChoiceTaken;
    const result = [currentChoice];
    for (const choiceIndex of choicesMade) {
        currentChoice = currentChoice.choices!.options[choiceIndex].consequences;
        result.push(currentChoice);
    }
    return result;
};
