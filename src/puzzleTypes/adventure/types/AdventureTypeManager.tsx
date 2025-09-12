import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AdventurePTM } from "./AdventurePTM";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { getNextActionId } from "../../../types/puzzle/GameStateAction";
import { choicesMadeStateChangeAction, choiceTaken, choiceDefinitions } from "./AdventureGridState";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { CellsMap, mergeCellsMaps } from "../../../types/puzzle/CellsMap";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { AboveRulesActionItem } from "../../../components/puzzle/rules/AboveRulesActionItem";

export const AdventureTypeManager = <T extends AdventurePTM>(
    baseTypeManager: PuzzleTypeManager<any> = DigitPuzzleTypeManager(),
): PuzzleTypeManager<T> => ({
    ...addGridStateExToPuzzleTypeManager(baseTypeManager, {
        initialGridStateExtension: {
            choicesMade: [],
            choicesMadeSolutionStrings: [],
        },
    }),
    ...addGameStateExToPuzzleTypeManager(baseTypeManager, {
        initialGameStateExtension: {
            introViewed: false,
        },
    }),

    getInitialDigits(context) {
        let digits: CellsMap<number> = {};
        let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
        let depth = 0;
        while (currentChoice !== undefined) {
            digits = mergeCellsMaps(digits, currentChoice.initialDigits);
            if (currentChoice.choices !== undefined && context.gridExtension.choicesMade.length > depth) {
                currentChoice =
                    context.gridExtension.choicesMade[depth] === 1
                        ? currentChoice.choices.option1
                        : currentChoice.choices.option2;
            } else {
                currentChoice = undefined;
            }
            depth++;
        }
        return digits;
    },

    aboveRulesComponent: observer(function AdventureAboveRules({ context }) {
        const { cellSizeForSidePanel: cellSize } = context;
        const [stage, currentChoice, previousChoice] = getStage(context);
        const isNext = stage > context.gridExtension.choicesMade.length;
        const [showChoices, setShowChoices] = useState(false);
        const [showChoice1Message, setShowChoice1Message] = useState(false);
        const [showChoice2Message, setShowChoice2Message] = useState(false);

        const handleOption1 = () => {
            context.onStateChange(
                choicesMadeStateChangeAction(
                    myClientId,
                    getNextActionId(),
                    [...context.gridExtension.choicesMade, 1],
                    [...context.gridExtension.choicesMadeSolutionStrings, currentChoice!.option1SolutionMessage],
                ),
            );
            setShowChoices(false);
            setShowChoice1Message(true);
        };

        const handleOption2 = () => {
            context.onStateChange(
                choicesMadeStateChangeAction(
                    myClientId,
                    getNextActionId(),
                    [...context.gridExtension.choicesMade, 2],
                    [...context.gridExtension.choicesMadeSolutionStrings, currentChoice!.option2SolutionMessage],
                ),
            );
            setShowChoices(false);
            setShowChoice2Message(true);
        };

        const handleNextStage = () => {
            let currentChoice: choiceTaken = context.puzzle.extension.rootChoiceTaken;
            let depth = 0;
            while (depth <= context.gridExtension.choicesMade.length) {
                if (context.gridExtension.choicesMade.length > depth) {
                    currentChoice =
                        context.gridExtension.choicesMade[depth] === 1
                            ? currentChoice.choices!.option1
                            : currentChoice.choices!.option2;
                }
                depth++;
            }
            setShowChoices(true);
        };

        const BaseComponent = baseTypeManager.aboveRulesComponent;

        return (
            <>
                {BaseComponent && <BaseComponent context={context} />}

                <AboveRulesActionItem
                    context={context}
                    visible={isNext}
                    message={"You've fully explored this area!"}
                    buttonText={"Make your next choice"}
                    onClick={handleNextStage}
                />

                {showChoices && (
                    <Modal cellSize={cellSize}>
                        <div>
                            <>
                                <div>{currentChoice?.topMessage}</div>
                            </>
                        </div>

                        <div>
                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={handleOption1}
                                style={{
                                    marginTop: cellSize * globalPaddingCoeff,
                                    padding: "0.5em 1em",
                                }}
                            >
                                {currentChoice?.option1ChoiceMessage}
                            </Button>
                        </div>

                        <div>
                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={handleOption2}
                                style={{
                                    marginTop: cellSize * globalPaddingCoeff,
                                    padding: "0.5em 1em",
                                }}
                            >
                                {currentChoice?.option2ChoiceMessage}
                            </Button>
                        </div>
                    </Modal>
                )}

                {showChoice1Message && (
                    <Modal cellSize={cellSize}>
                        <div>
                            <>
                                <div>{previousChoice?.option1TakenMessage}</div>
                            </>
                        </div>

                        <div>
                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={() => setShowChoice1Message(false)}
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

                {showChoice2Message && (
                    <Modal cellSize={cellSize}>
                        <div>
                            <>
                                <div>{previousChoice?.option2TakenMessage}</div>
                            </>
                        </div>

                        <div>
                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={() => setShowChoice2Message(false)}
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
                            <>
                                <div>
                                    While plenty of 12-year-olds love adventure, most don't have bedrooms like yours:
                                    filled with fossil replicas, antique maps, and hiking gear. With heroes like Jane
                                    Goodall, John Muir, and Jacques Cousteau, you have wanted to go on an adventure of
                                    your own for years. Your parents, ever-cautious, have decided you are old enough and
                                    have gotten permission from some neighbors to explore their land. With your compass,
                                    specimen jars, and your map (this puzzle) ready to be filled in, you set off!
                                </div>
                            </>
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
});

const checkSolved = <T extends AnyPTM>(context: PuzzleContext<T>, solveCells: [number, number][]): boolean => {
    for (const cell of solveCells) {
        const userDigit = context.getCell(cell[0], cell[1])?.usersDigit;
        if (userDigit === undefined || userDigit !== context.puzzle.solution![cell[0]][cell[1]]) {
            return false;
        }
    }
    return true;
};

const getStage = <T extends AnyPTM>(
    context: PuzzleContext<T>,
): [number, choiceDefinitions | undefined, choiceDefinitions | undefined] => {
    let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
    let previousChoice: choiceTaken | undefined = undefined;
    let depth = 0;
    while (currentChoice !== undefined) {
        if (currentChoice.choices !== undefined && context.gridExtension.choicesMade.length === depth) {
            const solved = checkSolved(context, currentChoice.choices.solveCells);
            if (context.gridExtension.choicesMade.length === depth && solved) {
                return [depth + 1, currentChoice.choices, previousChoice?.choices];
            } else {
                currentChoice = undefined;
            }
        } else if (currentChoice.choices !== undefined) {
            previousChoice = currentChoice;
            currentChoice =
                context.gridExtension.choicesMade[depth] === 1
                    ? currentChoice.choices.option1
                    : currentChoice.choices.option2;
        } else {
            currentChoice = undefined;
        }
        depth++;
    }
    return [depth - 1, undefined, previousChoice?.choices];
};
